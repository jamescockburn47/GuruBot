'use client'

import { useState, useRef, useEffect } from 'react'
import { Streamdown } from 'streamdown'
import { v4 as uuidv4 } from 'uuid'
import { stripThinking } from '@/lib/stripThinking'
import type { OracleProfile } from '@/lib/types'
import { drawRandomCards, type TarotCard } from '@/lib/tarotData'
import { saveVisionReading } from '@/lib/sessions'

interface Props {
  userId: string
  profile: OracleProfile
  onClose: () => void
}

export function InAppTarot({ userId, profile, onClose }: Props) {
  const [cards, setCards] = useState<TarotCard[]>([])
  const [revealed, setRevealed] = useState<boolean[]>([])
  const [isReading, setIsReading] = useState(false)
  const [resultText, setResultText] = useState('')
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  
  const resultEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Draw 3 cards on mount
    const drawn = drawRandomCards(3)
    setCards(drawn)
    setRevealed([false, false, false])
  }, [])

  useEffect(() => {
    if (isReading) {
      resultEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [resultText, isReading])

  async function handleReveal(index: number) {
    if (revealed[index]) return
    const newRevealed = [...revealed]
    newRevealed[index] = true
    setRevealed(newRevealed)

    // If all are revealed, start the reading!
    if (newRevealed.every(r => r === true)) {
      startReading(cards)
    }
  }

  async function startReading(drawnCards: TarotCard[]) {
    setIsReading(true)
    setResultText('')
    setErrorStatus(null)

    try {
      const res = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: drawnCards,
          spreadType: '3-card',
          profile: profile
        }),
      })

      if (!res.ok) throw new Error('Network error')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let completeText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        completeText += chunk
        setResultText(completeText)
      }

      // Save reading history
      await saveVisionReading(userId, {
        id: uuidv4(),
        type: 'tarot',
        imageBase64: '', // no literal image uploaded
        resultText: completeText,
        createdAt: new Date().toISOString()
      })
    } catch (err) {
      console.error(err)
      setErrorStatus("A cloud obscured the vision. Please try again.")
    } finally {
      setIsReading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl text-foreground">The Tarot</h1>
        <button onClick={onClose} className="text-muted hover:text-gold text-xs uppercase tracking-widest transition-colors">
          Back
        </button>
      </div>
      
      <p className="font-sans text-sm text-muted text-center max-w-lg mx-auto">
        Concentrate on your path. Touch each card to reveal your Past, Present, and Future.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {cards.map((card, i) => (
          <div key={card.id} className="relative aspect-[2/3] w-full max-w-[240px] mx-auto cursor-pointer" style={{ perspective: '1000px' }} onClick={() => handleReveal(i)}>
            <div 
              className="w-full h-full transition-transform duration-700" 
              style={{ transformStyle: 'preserve-3d', transform: revealed[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Back of Card */}
              <div 
                className="absolute inset-0 bg-oracle-bg flex items-center justify-center border-2 border-gold/60 shadow-xl overflow-hidden" 
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
              >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold via-[#0a0a0a] to-[#000000]"></div>
                <div className="absolute inset-3 border border-gold/30 rounded-sm"></div>
                <div className="text-gold opacity-80 text-5xl select-none">🎴</div>
              </div>
              
              {/* Front of Card */}
              <div 
                className="absolute inset-0 rotate-y-180 border-2 border-gold flex flex-col items-center bg-black"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <img src={card.imagePath} alt={card.name} className="w-full h-full object-cover bg-black" />
                <div className="absolute bottom-0 inset-x-0 bg-black/95 backdrop-blur-md p-3 text-center border-t border-gold/50 z-10">
                  <span className="font-serif text-sm tracking-widest uppercase text-gold">
                    {i === 0 ? 'Past' : i === 1 ? 'Present' : 'Future'}
                  </span>
                  <div className="font-sans text-xs text-white/90 mt-1">
                    {card.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="min-h-[200px] mt-12">
        {errorStatus ? (
          <div className="text-center text-red-400 font-sans text-sm">{errorStatus}</div>
        ) : (resultText || isReading) ? (
          <div className="border-l-2 border-oracle-border pl-4 bg-oracle-bg px-5 py-6 mb-12">
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans mb-4 flex items-center gap-3">
              Oracle
              {isReading && <span className="animate-pulse">◯</span>}
            </div>
            <div className="font-serif text-[15px] text-foreground leading-relaxed space-y-4">
              <Streamdown>{stripThinking(resultText)}</Streamdown>
            </div>
          </div>
        ) : null}
        <div ref={resultEndRef} className="h-4" />
      </div>
    </div>
  )
}
