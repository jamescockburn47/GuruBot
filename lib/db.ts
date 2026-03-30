// lib/db.ts
import { openDB, type IDBPDatabase } from 'idb'
import type { OracleProfile, OracleSession } from './types'

interface OracleDB {
  profile: {
    key: string
    value: OracleProfile
  }
  sessions: {
    key: string
    value: OracleSession
    indexes: { by_started: string }
  }
}

let dbInstance: IDBPDatabase<OracleDB> | null = null

export async function getDB(userId: string): Promise<IDBPDatabase<OracleDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<OracleDB>(`oracle-${userId}`, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'userId' })
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('by_started', 'startedAt')
      }
    },
  })
  return dbInstance
}

export function resetDB() {
  dbInstance = null
}
