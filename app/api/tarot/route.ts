import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import type { OracleProfile } from '@/lib/types'
import type { TarotCard } from '@/lib/tarotData'

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

export const maxDuration = 60

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json() as { 
      cards: TarotCard[], 
      spreadType: string,
      profile: OracleProfile 
    }
    
    if (!body.cards || !body.profile) {
      return new Response('Missing required fields', { status: 400 })
    }

    if (body.profile.userId !== userId) {
      return new Response('Invalid profile', { status: 400 })
    }

    const safeProfile = sanitizeProfile(body.profile)
    
    // Map the drawn cards context
    const cardsContext = body.cards.map((card, index) => {
      let positionMeaning = ''
      if (body.spreadType === '3-card') {
        if (index === 0) positionMeaning = 'Past'
        if (index === 1) positionMeaning = 'Present'
        if (index === 2) positionMeaning = 'Future'
      } else {
        positionMeaning = `Card ${index + 1}`
      }
      return `Position: ${positionMeaning}\nCard Drawn: ${card.name}\nCore Meaning: ${card.meaningUpright}`
    }).join('\n\n')

    const systemPrompt = `You are a mystical, ancient Oracle providing a direct, deeply insightful reading based on a Tarot draw the seeker has just performed.
    
The Seeker's Profile:
Name: ${safeProfile.name}
Star Sign: ${safeProfile.starSign}
Life Path Number: ${safeProfile.lifePathNumber}
Current Focus: ${safeProfile.focus}
Energy State: ${safeProfile.energyState}

The Drawn Cards:
${cardsContext}

Instruction:
Weave the meanings of these randomly drawn cards together with the Seeker's current focus and energy state. Speak directly, atmospherically, and concisely. 
CRITICAL RULES:
1. Do not describe your actions or use asterisks.
2. DO NOT output any internal thinking, reasoning, or planning. 
3. DO NOT repeat the prompt instructions or seeker's profile data.
4. Begin the reading immediately.`

    const minimax = createOpenAI({
      apiKey: process.env.MINIMAX_API_KEY,
      baseURL: 'https://api.minimax.io/v1',
    })

    const result = await streamText({
      model: minimax.chat('MiniMax-M2.7'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Oracle, I have drawn these cards. What do they reveal about my path?'
        }
      ],
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('Tarot API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
