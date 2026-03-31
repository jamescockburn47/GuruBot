// lib/types.ts
export interface OracleProfile {
  userId: string
  name: string
  dob: string              // ISO date e.g. "1990-06-15"
  placeOfBirth?: string    // e.g. "London, UK" — optional
  timeOfBirth?: string     // HH:MM 24h — optional; unlocks rising sign context
  starSign: string
  lifePathNumber: number
  focus: string
  energyState: string
  modalities: string[]
  createdAt: string
}

export interface SessionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface OracleSession {
  id: string
  startedAt: string
  title: string          // first 60 chars of oracle's opening message
  messages: SessionMessage[]
}

export type VisionReadingType = 'tarot' | 'palm' | 'tasseography' | 'astrology' | 'scrying' | 'general'

export interface VisionReading {
  id: string
  type: VisionReadingType
  imageBase64: string    // base64 encoded image
  resultText: string
  createdAt: string
}
