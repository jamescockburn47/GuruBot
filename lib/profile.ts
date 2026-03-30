// lib/profile.ts
// Profile is stored in localStorage (small object, must survive browser sessions reliably).
// IndexedDB is too aggressively evicted on mobile — localStorage is the right tool here.
import type { OracleProfile } from './types'

function storageKey(userId: string) {
  return `oracle-profile-${userId}`
}

export function hasProfile(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  return Promise.resolve(!!localStorage.getItem(storageKey(userId)))
}

export function getProfile(userId: string): Promise<OracleProfile | undefined> {
  if (typeof window === 'undefined') return Promise.resolve(undefined)
  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) return Promise.resolve(undefined)
  try {
    return Promise.resolve(JSON.parse(raw) as OracleProfile)
  } catch {
    return Promise.resolve(undefined)
  }
}

export function saveProfile(profile: OracleProfile): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  localStorage.setItem(storageKey(profile.userId), JSON.stringify(profile))
  return Promise.resolve()
}
