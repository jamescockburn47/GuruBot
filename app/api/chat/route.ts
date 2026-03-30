// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { auth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { buildSystemPrompt } from '@/lib/systemPrompt'
import type { OracleProfile } from '@/lib/types'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
})

const CAP = 200

function sanitizeProfile(profile: OracleProfile): OracleProfile {
  return {
    ...profile,
    name:         profile.name.slice(0, CAP),
    dob:          profile.dob.slice(0, 20),
    placeOfBirth: profile.placeOfBirth?.slice(0, CAP),
    timeOfBirth:  profile.timeOfBirth?.slice(0, 10),
    starSign:     profile.starSign.slice(0, CAP),
    focus:        profile.focus.slice(0, CAP),
    energyState:  profile.energyState.slice(0, CAP),
    modalities:   profile.modalities.map(m => m.slice(0, CAP)),
  }
}

export async function POST(req: Request) {
  // Auth check
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Rate limiting
  const { success } = await ratelimit.limit(userId)
  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'The oracle needs a moment to gather its thoughts. Please wait before seeking further guidance.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Parse body
  let messages: unknown[]
  let profile: OracleProfile
  try {
    const body = await req.json() as { messages: unknown[]; profile: OracleProfile }
    messages = body.messages
    profile = body.profile
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  // Validate profile
  if (
    !profile ||
    typeof profile !== 'object' ||
    profile.userId !== userId ||
    typeof profile.name !== 'string' ||
    typeof profile.dob !== 'string' ||
    typeof profile.starSign !== 'string' ||
    typeof profile.focus !== 'string' ||
    typeof profile.energyState !== 'string' ||
    !Array.isArray(profile.modalities)
  ) {
    return new Response('Invalid profile', { status: 400 })
  }

  // Sanitize profile fields (length-cap to prevent prompt injection)
  const safeProfile = sanitizeProfile(profile)

  // Truncate to last 40 messages (20 user + 20 oracle pairs)
  const truncated = Array.isArray(messages) ? messages.slice(-40) : []

  // Convert messages
  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>
  try {
    modelMessages = await convertToModelMessages(truncated as any)
  } catch {
    return new Response('Invalid messages', { status: 400 })
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4.6'),
    system: buildSystemPrompt(safeProfile),
    messages: modelMessages,
  })

  return result.toUIMessageStreamResponse()
}
