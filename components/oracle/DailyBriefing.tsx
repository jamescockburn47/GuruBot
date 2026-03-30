'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { OracleProfile } from '@/lib/types'
import type { MoonPhase } from '@/lib/astrology'

interface Props {
  profile: OracleProfile
  moon: MoonPhase
  currentSunSign: string
  dateStr: string
}

export function DailyBriefing({ profile, moon, currentSunSign, dateStr }: Props) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        })
        if (!res.ok || !res.body) { setDone(true); return }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done: rdone, value } = await reader.read()
          if (cancelled) break
          if (rdone) { setDone(true); break }
          setText(prev => prev + decoder.decode(value, { stream: true }))
        }
      } catch {
        setDone(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <span className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
          The Oracle
        </span>
        <span className="text-gold opacity-40 text-lg select-none">◯</span>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-lg mx-auto space-y-8">

          {/* Identity */}
          <div className="text-center space-y-1">
            <p className="text-muted font-sans text-[10px] tracking-[0.2em] uppercase">{dateStr}</p>
            <h1 className="font-serif text-2xl text-foreground mt-2">{profile.name}</h1>
            <p className="text-muted font-sans text-xs tracking-wide">
              {profile.starSign} · Life Path {profile.lifePathNumber}
            </p>
          </div>

          {/* Current sky stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border px-4 py-4 text-center">
              <p className="text-muted font-sans text-[10px] tracking-[0.2em] uppercase mb-2">Sun</p>
              <p className="font-serif text-foreground text-base">{currentSunSign}</p>
            </div>
            <div className="border border-border px-4 py-4 text-center">
              <p className="text-muted font-sans text-[10px] tracking-[0.2em] uppercase mb-2">Moon</p>
              <p className="font-serif text-foreground text-base">{moon.name}</p>
            </div>
          </div>

          {/* AI Briefing */}
          <div className="border-l-2 border-gold pl-4 space-y-3 min-h-[10rem]">
            <p className="text-gold font-sans text-[10px] tracking-[0.2em] uppercase">
              Today&apos;s Cosmic Weather
            </p>
            {!text && !done ? (
              <div className="flex items-center gap-3 py-2">
                <CrystalOrb />
                <span className="text-muted font-sans text-[11px] tracking-widest uppercase animate-pulse">
                  Reading the sky
                </span>
              </div>
            ) : (
              <p className="font-serif text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {text}
              </p>
            )}
          </div>

          {/* Enter CTA — appears once streaming is done */}
          {done && (
            <div className="text-center pt-2 pb-6">
              <button
                onClick={() => router.push('/oracle')}
                className="font-sans text-xs tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors border border-border hover:border-gold px-8 py-3"
              >
                Enter the Oracle
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function CrystalOrb() {
  return (
    <div className="relative w-7 h-7 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-full border border-gold opacity-15 animate-ping"
        style={{ animationDuration: '2.4s' }}
      />
      <div className="absolute inset-[3px] rounded-full border border-gold opacity-25 animate-pulse" />
      <div
        className="absolute inset-[6px] rounded-full bg-gold opacity-10 animate-pulse"
        style={{ animationDelay: '0.4s' }}
      />
      <div className="absolute inset-[10px] rounded-full bg-gold opacity-50" />
    </div>
  )
}
