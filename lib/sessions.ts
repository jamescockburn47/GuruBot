import { getDB } from './db'
import { v4 as uuidv4 } from 'uuid'
import { stripThinking } from './stripThinking'
import type { OracleSession, SessionMessage, VisionReading } from './types'

export async function createSession(userId: string): Promise<OracleSession> {
  const db = await getDB(userId)
  const session: OracleSession = {
    id: uuidv4(),
    startedAt: new Date().toISOString(),
    title: 'New Reading',
    messages: [],
  }
  await db.put('sessions', session)
  return session
}

export async function getSessions(userId: string): Promise<OracleSession[]> {
  const db = await getDB(userId)
  const all = await db.getAll('sessions')
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export async function getSession(userId: string, sessionId: string): Promise<OracleSession | undefined> {
  const db = await getDB(userId)
  return db.get('sessions', sessionId)
}

export async function updateSession(userId: string, session: OracleSession): Promise<void> {
  const db = await getDB(userId)
  await db.put('sessions', session)
}

export function appendMessage(session: OracleSession, message: SessionMessage): OracleSession {
  const updated = { ...session, messages: [...session.messages, message] }
  if (updated.title === 'New Reading' && message.role === 'assistant') {
    updated.title = stripThinking(message.content).slice(0, 60).replace(/[*#]/g, '').trim()
  }
  return updated
}

export async function saveVisionReading(userId: string, reading: VisionReading): Promise<void> {
  const db = await getDB(userId)
  await db.put('visions', reading)
}

export async function getVisionReadings(userId: string): Promise<VisionReading[]> {
  const db = await getDB(userId)
  const all = await db.getAll('visions')
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
