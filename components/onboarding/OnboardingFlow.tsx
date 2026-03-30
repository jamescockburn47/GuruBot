'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionCard } from './QuestionCard'
import { saveProfile } from '@/lib/profile'
import { calcLifePathNumber } from '@/lib/lifePathNumber'
import { getStarSign } from '@/lib/starSign'
import type { OracleProfile } from '@/lib/types'

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
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [, startTransition] = useTransition()

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
      modalities: next[6] as string[],
      createdAt: new Date().toISOString(),
    }

    await saveProfile(profile)
    startTransition(() => router.push('/oracle'))
  }

  async function handleAnswer(value: string | string[]) {
    const next = { ...answers, [step]: value }
    setAnswers(next)
    await advance(next)
  }

  async function handleSkip() {
    const next = { ...answers, [step]: '' }
    setAnswers(next)
    await advance(next)
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
        question={current.question}
        type={current.type}
        options={current.options}
        optional={current.optional}
        onAnswer={handleAnswer}
        onSkip={current.optional ? handleSkip : undefined}
      />
    </div>
  )
}
