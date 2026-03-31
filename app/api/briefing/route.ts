import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import { getMoonPhase, getCurrentSunSign } from '@/lib/astrology'
import type { OracleProfile } from '@/lib/types'

const CAP = 200

function sanitizeProfile(p: OracleProfile): OracleProfile {
  return {
    ...p,
    name:         p.name.slice(0, CAP),
    dob:          p.dob.slice(0, 20),
    starSign:     p.starSign.slice(0, CAP),
    focus:        p.focus.slice(0, CAP),
    energyState:  p.energyState.slice(0, CAP),
    modalities:   p.modalities.map(m => m.slice(0, CAP)),
    placeOfBirth: p.placeOfBirth?.slice(0, CAP),
    timeOfBirth:  p.timeOfBirth?.slice(0, 10),
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  let profile: OracleProfile
  try {
    const body = await req.json() as { profile: OracleProfile }
    profile = body.profile
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  if (!profile || typeof profile !== 'object' || profile.userId !== userId) {
    return new Response('Invalid profile', { status: 400 })
  }

  const safe = sanitizeProfile(profile)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const moon = getMoonPhase(today)
  const sunSign = getCurrentSunSign(today)

  const birthContext = [
    safe.placeOfBirth ? `born in ${safe.placeOfBirth}` : null,
    safe.timeOfBirth  ? `at ${safe.timeOfBirth}`       : null,
  ].filter(Boolean).join(', ')

  const minimax = createOpenAI({
    apiKey: process.env.MINIMAX_API_KEY,
    baseURL: 'https://api.minimax.io/v1',
  })

  const result = streamText({
    model: minimax.chat('MiniMax-M2.7'),
    system: `You are an unnamed oracle delivering a brief personal daily cosmic briefing. Speak directly — no stage directions, no physical actions in asterisks. Atmospheric, specific, and concise. Under 180 words total across three paragraphs.`,
    messages: [{
      role: 'user',
      content: `Today is ${dateStr}.

The seeker: ${safe.name}, born ${safe.dob}${birthContext ? `, ${birthContext}` : ''}, natal sign ${safe.starSign}, life path ${safe.lifePathNumber}.
Current sky: Sun in ${sunSign} · ${moon.name}.
They come seeking guidance on ${safe.focus}. Their energy is ${safe.energyState}.

Write exactly three short paragraphs:
1. Today's cosmic weather — what Sun in ${sunSign} and ${moon.name} mean in the broader sky right now.
2. How this sky specifically touches ${safe.name}'s natal ${safe.starSign} and life path ${safe.lifePathNumber}.
3. One clear spiritual focus or action for today, addressed to ${safe.name} directly.

No preamble. Begin with paragraph one.`,
    }],
  })

  return result.toTextStreamResponse()
}
