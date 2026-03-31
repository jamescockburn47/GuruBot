// lib/profile.ts
// Profile is stored in localStorage (small object, must survive browser sessions reliably).
// IndexedDB is too aggressively evicted on mobile — localStorage is the right tool here.
import type { OracleProfile } from './types'

function storageKey(userId: string) {
  return `oracle-profile-${userId}`
}

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* storage blocked */ }
}

export function hasProfile(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  return Promise.resolve(!!lsGet(storageKey(userId)))
}

export function getProfile(userId: string): Promise<OracleProfile | undefined> {
  if (typeof window === 'undefined') return Promise.resolve(undefined)
  const raw = lsGet(storageKey(userId))
  if (!raw) return Promise.resolve(undefined)
  try {
    const parsed = JSON.parse(raw) as OracleProfile
    // Validate required fields explicitly to prevent crashes from outdated/corrupted schema
    if (!parsed.name || !parsed.dob || !parsed.starSign || !parsed.focus || !parsed.energyState || !Array.isArray(parsed.modalities)) {
      console.warn('Profile in storage is missing required fields. Prompting onboarding.')
      localStorage.removeItem(storageKey(userId))
      return Promise.resolve(undefined)
    }
    return Promise.resolve(parsed)
  } catch {
    localStorage.removeItem(storageKey(userId))
    return Promise.resolve(undefined)
  }
}

export function saveProfile(profile: OracleProfile): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  lsSet(storageKey(profile.userId), JSON.stringify(profile))
  return Promise.resolve()
}
