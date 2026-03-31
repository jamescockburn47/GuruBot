import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const minimax = createOpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: 'https://api.minimax.io/v1',
  fetch: async (url, options) => {
    console.log('>>> URL:', url)
    return fetch(url, options)
  }
})

async function run() {
  try {
    await generateText({
      model: minimax.chat('MiniMax-M2.7'), 
      system: 'You are an oracle.',
      messages: [{ role: 'user', content: 'test' }]
    })
    console.log("Success!")
  } catch (error) {
    console.error('API Error:', error.message)
  }
}

run()
