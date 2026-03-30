import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../systemPrompt'
import type { OracleProfile } from '../types'

const profile: OracleProfile = {
  userId: 'user_123',
  name: 'James',
  dob: '1981-01-01',
  starSign: 'Capricorn',
  lifePathNumber: 4,
  focus: 'Career & Purpose',
  energyState: 'Grounded & Curious',
  modalities: ['Astrology', 'Crystals'],
  createdAt: '2026-01-01T00:00:00Z',
}

const profileFull: OracleProfile = {
  ...profile,
  placeOfBirth: 'London, UK',
  timeOfBirth: '14:30',
}

describe('buildSystemPrompt', () => {
  it('includes the seeker name', () => {
    expect(buildSystemPrompt(profile)).toContain('James')
  })
  it('includes the star sign', () => {
    expect(buildSystemPrompt(profile)).toContain('Capricorn')
  })
  it('includes the life path number', () => {
    expect(buildSystemPrompt(profile)).toContain('4')
  })
  it('includes the focus area', () => {
    expect(buildSystemPrompt(profile)).toContain('Career & Purpose')
  })
  it('includes modalities', () => {
    expect(buildSystemPrompt(profile)).toContain('Astrology')
    expect(buildSystemPrompt(profile)).toContain('Crystals')
  })
  it('includes the oracle persona instructions', () => {
    expect(buildSystemPrompt(profile)).toContain('unnamed oracle')
  })
  it('includes place of birth when provided', () => {
    expect(buildSystemPrompt(profileFull)).toContain('London, UK')
  })
  it('includes time of birth and rising sign note when provided', () => {
    expect(buildSystemPrompt(profileFull)).toContain('14:30')
    expect(buildSystemPrompt(profileFull)).toContain('rising sign')
  })
  it('omits birth detail lines when place and time absent', () => {
    const prompt = buildSystemPrompt(profile)
    expect(prompt).not.toContain('rising sign')
    expect(prompt).not.toContain('entered this world')
  })
})
