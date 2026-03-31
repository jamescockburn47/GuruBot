'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { getProfile, hasProfile } from '@/lib/profile'
import { saveVisionReading, getVisionReadings } from '@/lib/sessions'
import { Streamdown } from 'streamdown'
import { stripThinking } from '@/lib/stripThinking'
import type { OracleProfile, VisionReadingType, VisionReading } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { InAppTarot } from './InAppTarot'

interface VisionGalleryProps {
  userId: string
}

const VISION_TYPES: { id: VisionReadingType; title: string; icon: string; description: string }[] = [
  { id: 'tarot', title: 'Tarot Spread', icon: '🎴', description: 'Cards of the arcana' },
  { id: 'palm', title: 'Palmistry', icon: '✋', description: 'Lines of fate' },
  { id: 'tasseography', title: 'Tea Leaves', icon: '☕', description: 'Grounds in the cup' },
  { id: 'astrology', title: 'Star Chart', icon: '🌌', description: 'Natal or transit' },
  { id: 'scrying', title: 'Scrying', icon: '🔮', description: 'Crystals and patterns' },
  { id: 'general', title: 'Let the Oracle See', icon: '👁️', description: 'Any visual impression' },
]

const WAITING_MESSAGES = [
  'The Oracle gazes upon your offering… visions are forming in the ether…',
  'The veil parts slowly… shapes emerge from the mist…',
  'Ancient energies converge upon the image… patience, seeker…',
  'The Oracle\u2019s eye turns inward\u2026 reading the hidden patterns\u2026',
]

export function VisionGallery({ userId }: VisionGalleryProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<OracleProfile | null>(null)
  const [isReady, setIsReady] = useState(false)

  const [selectedType, setSelectedType] = useState<VisionReadingType | null>(null)
  const [compressedBase64, setCompressedBase64] = useState<string | null>(null)

  const [isReading, setIsReading] = useState(false)
  const [resultText, setResultText] = useState('')
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedTypeRef = useRef<VisionReadingType | null>(null)
  const resultEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const exists = await hasProfile(userId)
      if (!exists) { window.location.href = '/onboarding'; return }
      const p = await getProfile(userId)
      if (!p) { window.location.href = '/onboarding'; return }
      setProfile(p)
      setIsReady(true)
    }
    init()
  }, [userId])

  useEffect(() => {
    if (isReading) {
      resultEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [resultText, isReading])

  // Called synchronously from the button click handler — no setTimeout.
  // This preserves the user-gesture trust chain so mobile Safari opens the file picker.
  function handleTypeSelect(type: VisionReadingType) {
    if (type === 'tarot') {
      setSelectedType(type)
      return
    }

    // Store the type in ref so handleFileChange can read it synchronously
    // (state won't have updated yet when the file picker closes)
    selectedTypeRef.current = type
    setSelectedType(type)

    // Open file picker synchronously inside the click handler
    fileInputRef.current?.click()
  }

  function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 1024
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(dataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Use the ref for type — state may not have updated yet
    const type = selectedTypeRef.current
    if (!file || !profile || !type) return

    setIsReading(true)
    setResultText('')
    setErrorStatus(null)

    try {
      const base64Url = await resizeImage(file)
      setCompressedBase64(base64Url)

      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Url,
          readingType: type,
          profile: profile
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error('Vision API response:', res.status, errBody)
        throw new Error(`The Oracle's sight was obscured. (${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream available')

      const decoder = new TextDecoder()
      let completeText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        completeText += chunk
        setResultText(completeText)
      }

      if (!completeText.trim()) {
        throw new Error('The Oracle returned silence — the vision yielded nothing.')
      }

      await saveVisionReading(userId, {
        id: uuidv4(),
        type: type,
        imageBase64: base64Url,
        resultText: completeText,
        createdAt: new Date().toISOString()
      })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Vision reading failed:', msg)
      setErrorStatus(msg)
    } finally {
      setIsReading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleReset() {
    setSelectedType(null)
    setCompressedBase64(null)
    setResultText('')
    setErrorStatus(null)
    selectedTypeRef.current = null
  }

  const waitingMessage = WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)]

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gold text-2xl animate-pulse select-none">◯</span>
      </div>
    )
  }

  // Determine which view to show
  const showTypeGrid = !selectedType || (selectedType !== 'tarot' && !compressedBase64 && !isReading)
  const showTarot = selectedType === 'tarot' && profile
  const showReading = !showTypeGrid && !showTarot

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <span className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
          Vision Readings
        </span>
        <span className="text-gold opacity-40 text-lg select-none">👁️</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => router.push('/oracle')}
            className="text-muted hover:text-gold transition-colors text-xs font-sans tracking-widest uppercase"
          >
            Chat
          </button>
        </div>
      </div>

      {/* Hidden file input — no capture attribute so mobile gives camera + library choice */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="flex-1 overflow-y-auto">
        {showTarot ? (
          <InAppTarot userId={userId} profile={profile!} onClose={handleReset} />

        ) : showTypeGrid ? (
          <div className="p-6 max-w-2xl mx-auto py-12">
            <h1 className="font-serif text-3xl text-foreground text-center mb-4">
              Offer a Vision
            </h1>
            <p className="font-sans text-sm text-muted text-center max-w-sm mx-auto mb-12">
              Select the nature of your reading. The Oracle requires no words—only an image.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VISION_TYPES.map(vt => (
                <button
                  key={vt.id}
                  onClick={() => handleTypeSelect(vt.id)}
                  className="group flex items-start gap-4 p-5 border border-border hover:border-gold hover:bg-gold/5 transition-all text-left"
                >
                  <span className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {vt.icon}
                  </span>
                  <div>
                    <h3 className="font-sans text-sm tracking-widest uppercase text-foreground mb-1">
                      {vt.title}
                    </h3>
                    <p className="font-serif text-xs text-muted">
                      {vt.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        ) : showReading ? (
          <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
            {/* The Image */}
            {compressedBase64 && (
              <div className="relative w-full max-w-sm mx-auto border border-border overflow-hidden">
                <img src={compressedBase64} alt="Uploaded Vision" className="w-full h-auto object-cover opacity-80" />
                {isReading && (
                  <div className="absolute inset-0 bg-gold/10 mix-blend-overlay">
                    <div className="absolute inset-x-0 h-1 bg-gold shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0" />
                  </div>
                )}
              </div>
            )}

            {/* Waiting / Reading / Error */}
            {errorStatus ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-red-400 font-sans text-sm">{errorStatus}</p>
                <button
                  onClick={handleReset}
                  className="font-sans text-xs tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors border border-border hover:border-gold px-6 py-2"
                >
                  Try Again
                </button>
              </div>
            ) : isReading && !resultText ? (
              <div className="border-l-2 border-oracle-border pl-4 bg-oracle-bg px-5 py-6">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans mb-4 flex items-center gap-3">
                  Oracle
                  <span className="animate-pulse">◯</span>
                </div>
                <p className="font-serif text-[15px] text-muted italic animate-pulse leading-relaxed">
                  {waitingMessage}
                </p>
              </div>
            ) : resultText ? (
              <div className="border-l-2 border-oracle-border pl-4 bg-oracle-bg px-5 py-6">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans mb-4 flex items-center gap-3">
                  Oracle
                  {isReading && <span className="animate-pulse">◯</span>}
                </div>
                <div className="font-serif text-[15px] text-foreground leading-relaxed space-y-4">
                  <Streamdown>{stripThinking(resultText)}</Streamdown>
                </div>
              </div>
            ) : null}

            {!isReading && (resultText || errorStatus) && !errorStatus && (
              <div className="flex justify-center pt-8 pb-12">
                <button
                  onClick={handleReset}
                  className="font-sans text-xs tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors border border-border hover:border-gold px-8 py-3"
                >
                  Seek Another Vision
                </button>
              </div>
            )}

            <div ref={resultEndRef} className="h-4" />
          </div>
        ) : null}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(300px); opacity: 1; }
        }
      `}} />
    </div>
  )
}
