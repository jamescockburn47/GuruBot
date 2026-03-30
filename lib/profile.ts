// lib/profile.ts
import { getDB } from './db'
import type { OracleProfile } from './types'

export async function hasProfile(userId: string): Promise<boolean> {
  const db = await getDB(userId)
  const profile = await db.get('profile', userId)
  return !!profile
}

export async function getProfile(userId: string): Promise<OracleProfile | undefined> {
  const db = await getDB(userId)
  return db.get('profile', userId)
}

export async function saveProfile(profile: OracleProfile): Promise<void> {
  const db = await getDB(profile.userId)
  await db.put('profile', profile)
}
