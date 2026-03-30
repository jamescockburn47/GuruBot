'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProfile, saveProfile } from '@/lib/profile'
import { calcLifePathNumber } from '@/lib/lifePathNumber'
import { getStarSign } from '@/lib/starSign'
import type { OracleProfile } from '@/lib/types'

const FOCUS_OPTIONS = ['Love & Relationships', 'Career & Purpose', 'Health & Healing', 'Spiritual Growth', 'General Guidance']
const ENERGY_OPTIONS = ['Grounded & Curious', 'Unsettled & Seeking', 'Heavy & Tired', 'Open & Expansive']
const MODALITY_OPTIONS = ['Astrology', 'Crystals', 'Energy Healing', 'Spirit Guides', 'All of these']

export default function ProfileEditor({ userId }: { userId: string }) {
  const router = useRouter()
  const [profile, setProfile] = useState<OracleProfile | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile(userId).then(p => {
      if (!p) { router.push('/onboarding'); return }
      setProfile(p)
    })
  }, [userId, router])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const updated: OracleProfile = {
      ...profile,
      starSign: getStarSign(profile.dob),
      lifePathNumber: calcLifePathNumber(profile.dob),
    }
    await saveProfile(updated)
    setSaving(false)
    router.push('/oracle')
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gold text-2xl animate-pulse select-none">◯</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="text-gold text-2xl mb-4 select-none">◯</div>
          <h1 className="font-serif tracking-[0.2em] uppercase text-sm text-foreground">
            Your Profile
          </h1>
          <p className="text-xs text-muted mt-1 font-sans">
            {profile.starSign} · Life Path {profile.lifePathNumber}
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] tracking-widest uppercase text-muted font-sans">Name</label>
            <input
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-surface border border-border text-foreground font-sans text-sm px-3 py-2 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-muted font-sans">Current Focus</label>
            {FOCUS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setProfile({ ...profile, focus: opt })}
                className={`w-full text-left px-3 py-2 text-xs font-sans border transition-colors ${
                  profile.focus === opt ? 'border-gold text-foreground bg-surface' : 'border-border text-muted hover:border-gold'
                }`}
              >
                <span className="mr-2 text-gold">{profile.focus === opt ? '◆' : '◇'}</span>
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-muted font-sans">Current Energy</label>
            {ENERGY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setProfile({ ...profile, energyState: opt })}
                className={`w-full text-left px-3 py-2 text-xs font-sans border transition-colors ${
                  profile.energyState === opt ? 'border-gold text-foreground bg-surface' : 'border-border text-muted hover:border-gold'
                }`}
              >
                <span className="mr-2 text-gold">{profile.energyState === opt ? '◆' : '◇'}</span>
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-muted font-sans">Paths</label>
            {MODALITY_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  const modalities = profile.modalities.includes(opt)
                    ? profile.modalities.filter(m => m !== opt)
                    : [...profile.modalities, opt]
                  setProfile({ ...profile, modalities })
                }}
                className={`w-full text-left px-3 py-2 text-xs font-sans border transition-colors ${
                  profile.modalities.includes(opt) ? 'border-gold text-foreground bg-surface' : 'border-border text-muted hover:border-gold'
                }`}
              >
                <span className="mr-2 text-gold">{profile.modalities.includes(opt) ? '◆' : '◇'}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link
            href="/oracle"
            className="flex-1 text-center px-4 py-3 border border-border text-muted text-xs tracking-widest uppercase font-sans hover:border-gold hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-foreground text-background text-xs tracking-widest uppercase font-sans hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {saving ? '…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
