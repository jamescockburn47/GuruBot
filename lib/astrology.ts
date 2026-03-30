// Approximate moon phase via synodic cycle from a known new moon
const KNOWN_NEW_MOON_MS = 947182440000 // 2000-01-06 18:14 UTC
const SYNODIC_MONTH_MS = 29.53059 * 24 * 60 * 60 * 1000

export interface MoonPhase {
  name: string
  symbol: string
  fraction: number // 0 = new moon, 0.5 = full moon
}

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const elapsed = date.getTime() - KNOWN_NEW_MOON_MS
  const fraction = ((elapsed % SYNODIC_MONTH_MS) / SYNODIC_MONTH_MS + 1) % 1

  if (fraction < 0.025 || fraction >= 0.975) return { name: 'New Moon',        symbol: '●', fraction }
  if (fraction < 0.25)                        return { name: 'Waxing Crescent', symbol: '◑', fraction }
  if (fraction < 0.275)                       return { name: 'First Quarter',   symbol: '◑', fraction }
  if (fraction < 0.5)                         return { name: 'Waxing Gibbous',  symbol: '◕', fraction }
  if (fraction < 0.525)                       return { name: 'Full Moon',       symbol: '○', fraction }
  if (fraction < 0.75)                        return { name: 'Waning Gibbous',  symbol: '◔', fraction }
  if (fraction < 0.775)                       return { name: 'Last Quarter',    symbol: '◐', fraction }
  return                                             { name: 'Waning Crescent', symbol: '◐', fraction }
}

export function getCurrentSunSign(date: Date = new Date()): string {
  const m = date.getMonth() + 1
  const d = date.getDate()
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19))  return 'Aries'
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20))  return 'Taurus'
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20))  return 'Gemini'
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22))  return 'Cancer'
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22))  return 'Leo'
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22))  return 'Virgo'
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'Libra'
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'Scorpio'
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'Sagittarius'
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19))  return 'Capricorn'
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18))   return 'Aquarius'
  return 'Pisces'
}
