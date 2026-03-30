import { describe, it, expect } from 'vitest'
import { getStarSign } from '../starSign'

describe('getStarSign', () => {
  it('returns Gemini for June 15', () => {
    expect(getStarSign('1990-06-15')).toBe('Gemini')
  })
  it('returns Scorpio for November 1', () => {
    expect(getStarSign('1990-11-01')).toBe('Scorpio')
  })
  it('returns Capricorn for January 5', () => {
    expect(getStarSign('1990-01-05')).toBe('Capricorn')
  })
  it('returns Capricorn for December 25', () => {
    expect(getStarSign('1990-12-25')).toBe('Capricorn')
  })
  it('returns Aries for March 21', () => {
    expect(getStarSign('1990-03-21')).toBe('Aries')
  })
  it('returns Pisces for March 20', () => {
    expect(getStarSign('1990-03-20')).toBe('Pisces')
  })
})
