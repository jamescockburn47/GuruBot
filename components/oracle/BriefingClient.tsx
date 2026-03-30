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
      const exists = await hasProfile(userId)
      if (!exists) { router.push('/onboarding'); return }
      const p = await getProfile(userId)
      setProfile(p!)
    }
    init()
  }, [userId, router])

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
