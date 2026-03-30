'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasProfile, getProfile } from '@/lib/profile'
import { getMoonPhase, getCurrentSunSign } from '@/lib/astrology'
import { DailyBriefing } from './DailyBriefing'
import type { OracleProfile } from '@/lib/types'

interface Props {
  userId: string
}

export function BriefingClient({ userId }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState<OracleProfile | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const exists = await hasProfile(userId)
        if (!exists) { window.location.href = '/onboarding'; return }
        const p = await getProfile(userId)
        if (!p) { window.location.href = '/onboarding'; return }
        setProfile(p)
      } catch (err) {
        console.error('BriefingClient init failed:', err)
        window.location.href = '/onboarding'
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gold text-2xl animate-pulse select-none">◯</span>
      </div>
    )
  }

  const today = new Date()
  const moon = getMoonPhase(today)
  const currentSunSign = getCurrentSunSign(today)
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <DailyBriefing
      profile={profile}
      moon={moon}
      currentSunSign={currentSunSign}
      dateStr={dateStr}
    />
  )
}
