// lib/starSign.ts
const SIGNS: Array<{ name: string; month: number; day: number }> = [
  { name: 'Capricorn',   month: 1,  day: 19 },
  { name: 'Aquarius',    month: 2,  day: 18 },
  { name: 'Pisces',      month: 3,  day: 20 },
  { name: 'Aries',       month: 4,  day: 19 },
  { name: 'Taurus',      month: 5,  day: 20 },
  { name: 'Gemini',      month: 6,  day: 20 },
  { name: 'Cancer',      month: 7,  day: 22 },
  { name: 'Leo',         month: 8,  day: 22 },
  { name: 'Virgo',       month: 9,  day: 22 },
  { name: 'Libra',       month: 10, day: 22 },
  { name: 'Scorpio',     month: 11, day: 21 },
  { name: 'Sagittarius', month: 12, day: 21 },
]

export function getStarSign(dob: string): string {
  const [, mm, dd] = dob.split('-').map(Number)
  const match = SIGNS.find(s => s.month === mm && dd <= s.day)
    ?? SIGNS.find(s => s.month === mm + 1)
    ?? { name: 'Capricorn' } // December 22+
  return match.name
}
