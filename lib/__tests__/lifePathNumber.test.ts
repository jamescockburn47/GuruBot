import { describe, it, expect } from 'vitest'
import { calcLifePathNumber } from '../lifePathNumber'

describe('calcLifePathNumber', () => {
  it('reduces DOB digit sum to single digit', () => {
    // 1990-06-15: 1+9+9+0+0+6+1+5 = 31 → 3+1 = 4
    expect(calcLifePathNumber('1990-06-15')).toBe(4)
  })
  it('preserves master number 11', () => {
    // 1989-02-09: 1+9+8+9+0+2+0+9 = 38 → 3+8 = 11
    expect(calcLifePathNumber('1989-02-09')).toBe(11)
  })
  it('preserves master number 22', () => {
    // 1990-01-02: 1+9+9+0+0+1+0+2 = 22
    expect(calcLifePathNumber('1990-01-02')).toBe(22)
  })
  it('handles simple single-digit result', () => {
    // 2000-01-01: 2+0+0+0+0+1+0+1 = 4
    expect(calcLifePathNumber('2000-01-01')).toBe(4)
  })
  it('preserves master number 33', () => {
    // 1994-11-08: 1+9+9+4+1+1+0+8 = 33
    expect(calcLifePathNumber('1994-11-08')).toBe(33)
  })
})
