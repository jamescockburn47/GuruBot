// lib/db.ts
import { openDB } from 'idb'
import type { IDBPDatabase, DBSchema } from 'idb'
import type { OracleSession, VisionReading } from './types'

export interface OracleDB extends DBSchema {
  sessions: {
    key: string
    value: OracleSession
    indexes: { 'by_started': string }
  }
  visions: {
    key: string
    value: VisionReading
    indexes: { 'by_created': string }
  }
}

let dbPromise: Promise<IDBPDatabase<OracleDB>> | null = null
let dbUserId: string | null = null

export async function getDB(userId: string): Promise<IDBPDatabase<OracleDB>> {
  // Return the existing promise if it matches the userId
  if (dbPromise && dbUserId === userId) return dbPromise
  
  // If there's an existing promise for a different user, wait for it and close it
  if (dbPromise) {
    const oldDb = await dbPromise.catch(() => null)
    if (oldDb) oldDb.close()
    dbPromise = null
  }
  
  dbUserId = userId
  // Assign the promise directly so concurrent calls wait on the same promise
  dbPromise = openDB<OracleDB>(`oracle-${userId}`, 3, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('by_started', 'startedAt')
      }
      if (!db.objectStoreNames.contains('visions')) {
        const store = db.createObjectStore('visions', { keyPath: 'id' })
        store.createIndex('by_created', 'createdAt')
      }
    },
    blocking() {
      // Automatically close the connection if another tab wants to upgrade
      dbPromise?.then(db => db.close())
      dbPromise = null
    },
  })
  
  return dbPromise
}

export function resetDB() {
  if (dbPromise) {
    dbPromise.then(db => db.close()).catch(() => {})
    dbPromise = null
  }
  dbUserId = null
}
