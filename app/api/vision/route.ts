import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import type { OracleProfile, VisionReadingType } from '@/lib/types'

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
      image: string, 
      readingType: VisionReadingType,
      profile: OracleProfile 
    }
    
    if (!body.image || !body.readingType || !body.profile) {
      return new Response('Missing required fields', { status: 400 })
    }

    if (body.profile.userId !== userId) {
      return new Response('Invalid profile', { status: 400 })
    }

    const safeProfile = sanitizeProfile(body.profile)
    
    let typePrompt = ''
    switch (body.readingType) {
      case 'tarot':
        typePrompt = `This is a Tarot or Oracle card spread. Identify the visible cards and provide a cohesive reading focusing on their energy, layout, and meaning in the context of the seeker's current focus.`
        break
      case 'palm':
        typePrompt = `This is an image of the seeker's palm. Analyze the major lines (heart, head, life) and any notable mounts or patterns. Provide a palmistry reading.`
        break
      case 'tasseography':
        typePrompt = `This is an image of tea leaves or coffee grounds inside a cup. Identify any prominent shapes, symbols, or patterns and interpret their divinatory meaning.`
        break
      case 'astrology':
        typePrompt = `This is an astrological natal chart or transit wheel. Identify the prominent planetary placements, aspects, or the ascendant/midheaven, and provide a reading.`
        break
      case 'scrying':
        typePrompt = `This is an image provided for scrying (crystal gazing, patterns, or an environment). Identify the energetic impressions, shapes, and intuitive messages coming through.`
        break
      case 'general':
      default:
        typePrompt = `Analyze the provided image for spiritual, symbolic, or energetic significance. Let the Oracle interpret what is seen.`
        break
    }

    // Strip data URI prefix if present e.g. "data:image/jpeg;base64,...""
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '')
    const mimeMatch = body.image.match(/^data:(image\/\w+);base64,/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'

    const systemPrompt = `You are a mystical, ancient Oracle providing a direct, deeply insightful reading based primarily on the visual image the seeker has presented.
The Seeker's Profile:
Name: ${safeProfile.name}
Star Sign: ${safeProfile.starSign}
Life Path Number: ${safeProfile.lifePathNumber}
Current Focus: ${safeProfile.focus}
Energy State: ${safeProfile.energyState}

Read the image specifically for the seeker based on this instruction:
${typePrompt}

Do not describe your actions or use asterisks. Speak directly, atmospherically, and concisely.`

    const minimax = createOpenAI({
      apiKey: process.env.MINIMAX_API_KEY,
      baseURL: 'https://api.minimax.io/v1',
    })

    const result = await streamText({
      model: minimax('MiniMax-M2.7'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Oracle, I present this to you. What do you see?' },
            { type: 'image', image: body.image }
          ]
        }
      ],
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('Vision API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
