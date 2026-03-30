// lib/lifePathNumber.ts
function sumDigits(n: number): number {
  return String(n).split('').reduce((acc, d) => acc + parseInt(d), 0)
}

function reduce(n: number): number {
  if (n === 11 || n === 22) return n
  if (n < 10) return n
  return reduce(sumDigits(n))
}

export function calcLifePathNumber(dob: string): number {
  // dob: "YYYY-MM-DD"
  const digits = dob.replace(/-/g, '').split('').map(Number)
  const total = digits.reduce((acc, d) => acc + d, 0)
  return reduce(total)
}
