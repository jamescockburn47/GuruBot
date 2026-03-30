'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MessageList } from './MessageList'
import { InputBar } from './InputBar'
import { PastReadingsPanel } from './PastReadingsPanel'
import { getProfile, hasProfile } from '@/lib/profile'
import { createSession, getSessions, updateSession, appendMessage } from '@/lib/sessions'
import type { OracleProfile } from '@/lib/types'
import type { OracleSession } from '@/lib/types'
import type { CompressedImage } from '@/lib/compressImage'
import type { FileUIPart } from 'ai'

interface Props {
  userId: string
}

export function ChatInterface({ userId }: Props) {
  const router = useRouter()
  const { signOut } = useClerk()
  const [profile, setProfile] = useState<OracleProfile | null>(null)
  const [currentSession, setCurrentSession] = useState<OracleSession | null>(null)
  const [sessions, setSessions] = useState<OracleSession[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const lastPersistedMsgIdRef = useRef<string | null>(null)

  useEffect(() => {
    async function init() {
      const profileExists = await hasProfile(userId)
      if (!profileExists) { router.push('/onboarding'); return }

      const p = await getProfile(userId)
      setProfile(p!)

      const allSessions = await getSessions(userId)
      setSessions(allSessions)

      const session = allSessions[0] ?? await createSession(userId)
      setCurrentSession(session)
      setReady(true)
    }
    init()
  }, [userId, router])

  // Use a ref so the transport always sends the current profile
  const profileRef = useRef<OracleProfile | null>(null)
  profileRef.current = profile

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (url, init) => {
        if (init?.body && typeof init.body === 'string') {
          const parsed = JSON.parse(init.body)
          parsed.profile = profileRef.current
          return fetch(url, { ...init, body: JSON.stringify(parsed) })
        }
        return fetch(url, init)
      },
    }),
    [] // created once — profile injected via ref on every request
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  })

  // Load messages when session changes
  useEffect(() => {
    if (!currentSession) return
    setMessages(
      currentSession.messages.map(m => ({
        id: crypto.randomUUID(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        parts: [{ type: 'text' as const, text: m.content }],
      }))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id])

  // Persist messages to IndexedDB after each completed assistant turn
  useEffect(() => {
    if (!currentSession || messages.length === 0) return
    if (status === 'streaming' || status === 'submitted') return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== 'assistant') return
    if (lastMsg.id === lastPersistedMsgIdRef.current) return

    const text = lastMsg.parts
      ?.filter(p => p.type === 'text')
      .map(p => (p as { type: 'text'; text: string }).text)
      .join('') ?? ''
    if (!text) return

    lastPersistedMsgIdRef.current = lastMsg.id
    const updated = appendMessage(currentSession, { role: 'assistant', content: text, timestamp: new Date().toISOString() })
    setCurrentSession(updated)
    updateSession(userId, updated)
    getSessions(userId).then(setSessions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, status])

  async function handleSend(text: string, image?: CompressedImage) {
    if (!currentSession || !profile) return

    const persistedContent = image ? `${text}\n[Image attached]`.trim() : text
    const updated = appendMessage(currentSession, { role: 'user', content: persistedContent, timestamp: new Date().toISOString() })
    setCurrentSession(updated)
    updateSession(userId, updated)

    if (image) {
      const filePart: FileUIPart = {
        type: 'file',
        mediaType: image.mimeType,
        url: `data:${image.mimeType};base64,${image.base64}`,
      }
      sendMessage({ text, files: [filePart] })
    } else {
      sendMessage({ text })
    }
  }

  async function handleNewReading() {
    const session = await createSession(userId)
    setCurrentSession(session)
    setMessages([])
    getSessions(userId).then(setSessions)
  }

  function handleSelectSession(session: OracleSession) {
    setCurrentSession(session)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gold text-2xl animate-pulse select-none">◯</span>
      </div>
    )
  }

  const isStreaming = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <span className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
          The Oracle
        </span>
        <span className="text-gold opacity-40 text-lg select-none">◯</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setPanelOpen(true)}
            className="text-muted hover:text-gold transition-colors text-xs font-sans tracking-widest uppercase"
          >
            Readings
          </button>
          <button
            onClick={handleNewReading}
            className="text-muted hover:text-gold transition-colors text-xs font-sans tracking-widest uppercase"
          >
            + New
          </button>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="text-muted hover:text-gold transition-colors text-xs font-sans tracking-widest uppercase"
          >
            Sign out
          </button>
        </div>
      </div>

      <MessageList messages={messages} isStreaming={isStreaming} />

      <InputBar onSend={handleSend} disabled={isStreaming} />

      <PastReadingsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        sessions={sessions}
        currentSessionId={currentSession?.id ?? null}
        onSelectSession={handleSelectSession}
      />
    </div>
  )
}
