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

  const { messages, profile } = await req.json() as {
    messages: unknown[]
    profile: OracleProfile
  }

  // Truncate to last 40 messages (20 user + 20 oracle pairs)
  const truncated = Array.isArray(messages) ? messages.slice(-40) : []

  const result = streamText({
    model: anthropic('claude-sonnet-4.6'),
    system: buildSystemPrompt(profile),
    messages: await convertToModelMessages(truncated as any),
  })

  return result.toUIMessageStreamResponse()
}
