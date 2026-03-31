'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { QuestionCard } from './QuestionCard'
import { saveProfile } from '@/lib/profile'
import { calcLifePathNumber } from '@/lib/lifePathNumber'
import { getStarSign } from '@/lib/starSign'
import type { OracleProfile } from '@/lib/types'

interface OracleStableMeta {
  name: string
  dob: string
  placeOfBirth?: string
  timeOfBirth?: string
}

const STEPS = [
  { question: 'What shall I call you?',          type: 'text'   as const, options: [], optional: false },
  { question: 'Your date of birth',              type: 'date'   as const, options: [], optional: false },
  { question: 'Where were you born?',            type: 'text'   as const, options: [], optional: true  },
  { question: 'What time were you born?',        type: 'time'   as const, options: [], optional: true  },
  { question: 'What draws you here today?',      type: 'single' as const, options: ['Love & Relationships', 'Career & Purpose', 'Health & Healing', 'Spiritual Growth', 'General Guidance'], optional: false },
  { question: 'Where is your energy right now?', type: 'single' as const, options: ['Grounded & Curious', 'Unsettled & Seeking', 'Heavy & Tired', 'Open & Expansive'], optional: false },
  { question: 'Which paths speak to you?',       type: 'multi'  as const, options: ['Astrology', 'Crystals', 'Energy Healing', 'Spirit Guides', 'All of these'], optional: false },
]

interface Props {
  userId: string
}

export function OnboardingFlow({ userId }: Props) {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [, startTransition] = useTransition()

  // If stable profile already in Clerk metadata, skip to session questions
  useEffect(() => {
    if (!user) return
    const stable = user.unsafeMetadata?.oracleStable as OracleStableMeta | undefined
    if (stable?.name && stable?.dob) {
      setAnswers(prev => {
        // Only inject if they haven't started answering questions themselves
        if (Object.keys(prev).length > 0) return prev
        // Briefly show a welcome back toast or visually indicate we remembered their details!
        // Because of React state batching, jumping to step 4 makes users feel they lost their data.
        setStep(4)
        return {
          0: stable.name,
          1: stable.dob,
          2: stable.placeOfBirth ?? '',
          3: stable.timeOfBirth ?? '',
        }
      })
    }
  }, [user])

  // Get known name if skipping steps
  const knownName = answers[0] as string | undefined;

  async function advance(next: Record<number, string | string[]>) {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    // All questions answered — build and save profile
    const dob = next[1] as string
    const profile: OracleProfile = {
      userId,
      name: next[0] as string,
      dob,
      placeOfBirth: (next[2] as string) || undefined,
      timeOfBirth: (next[3] as string) || undefined,
      starSign: getStarSign(dob),
      lifePathNumber: calcLifePathNumber(dob),
      focus: next[4] as string,
      energyState: next[5] as string,
      modalities: Array.isArray(next[6]) ? (next[6] as string[]) : [],
      createdAt: new Date().toISOString(),
    }

    await saveProfile(profile)

    // Persist stable fields to Clerk so any future device skips re-entry
    await user?.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        oracleStable: {
          name: profile.name,
          dob: profile.dob,
          placeOfBirth: profile.placeOfBirth,
          timeOfBirth: profile.timeOfBirth,
        } satisfies OracleStableMeta,
      },
    })

    startTransition(() => router.push('/oracle/briefing'))
  }

  async function handleAnswer(value: string | string[]) {
    setAnswers(prev => {
      const next = { ...prev, [step]: value }
      // We must call advance outside the setter, but we need the next state.
      // Since advance is async, we can just call it with next right here!
      // To strictly avoid side-effects in reducer:
      setTimeout(() => advance(next), 0)
      return next
    })
  }

  async function handleSkip() {
    setAnswers(prev => {
      const next = { ...prev, [step]: '' }
      setTimeout(() => advance(next), 0)
      return next
    })
  }

  const current = STEPS[step]

  return (
    <div className="relative">
      {/* Progress dots */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === step ? 'bg-gold' : i < step ? 'bg-gold opacity-40' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <QuestionCard
        key={step}
        question={
          step === 4 && knownName 
            ? `Welcome back, ${knownName.split(' ')[0]}. ${current.question}` 
            : current.question
        }
        type={current.type}
        options={current.options}
        optional={current.optional}
        onAnswer={handleAnswer}
        onSkip={current.optional ? handleSkip : undefined}
      />
    </div>
  )
}
