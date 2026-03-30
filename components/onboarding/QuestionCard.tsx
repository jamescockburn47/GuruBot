'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type QuestionType = 'text' | 'date' | 'time' | 'single' | 'multi'

interface QuestionCardProps {
  question: string
  type: QuestionType
  options?: string[]
  optional?: boolean
  onAnswer: (value: string | string[]) => void
  onSkip?: () => void
}

export function QuestionCard({ question, type, options = [], optional, onAnswer, onSkip }: QuestionCardProps) {
  const [textValue, setTextValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  function toggleOption(opt: string) {
    if (type === 'single') {
      setSelected([opt])
    } else {
      setSelected(prev =>
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      )
    }
  }

  function handleSubmit() {
    if (type === 'text' && textValue.trim()) onAnswer(textValue.trim())
    else if (type === 'date' && dateValue) onAnswer(dateValue)
    else if (type === 'time' && textValue) onAnswer(textValue)
    else if ((type === 'single' || type === 'multi') && selected.length > 0) {
      onAnswer(type === 'single' ? selected[0] : selected)
    }
  }

  const canSubmit =
    (type === 'text' && textValue.trim().length > 0) ||
    (type === 'date' && dateValue.length > 0) ||
    (type === 'time' && textValue.length > 0) ||
    ((type === 'single' || type === 'multi') && selected.length > 0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <h2 className="font-serif text-xl md:text-2xl text-foreground text-center leading-relaxed">
          {question}
        </h2>

        <div className="w-8 h-px bg-gold opacity-40 mx-auto" />

        <div className="space-y-3">
          {type === 'text' && (
            <Input
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
              placeholder="Your answer..."
              className="bg-surface border-border text-foreground font-sans text-sm rounded-none text-center placeholder:text-muted focus:border-gold focus-visible:ring-0"
              autoFocus
            />
          )}

          {type === 'date' && (
            <Input
              type="date"
              value={dateValue}
              onChange={e => setDateValue(e.target.value)}
              className="bg-surface border-border text-foreground font-sans text-sm rounded-none text-center focus:border-gold focus-visible:ring-0"
            />
          )}

          {type === 'time' && (
            <Input
              type="time"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              className="bg-surface border-border text-foreground font-sans text-sm rounded-none text-center focus:border-gold focus-visible:ring-0"
            />
          )}

          {(type === 'single' || type === 'multi') && (
            <div className="space-y-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={`w-full px-4 py-3 text-xs font-sans tracking-wide border transition-colors text-left ${
                    selected.includes(opt)
                      ? 'border-gold text-foreground bg-surface'
                      : 'border-border text-muted hover:border-gold hover:text-foreground'
                  }`}
                >
                  <span className="mr-3 text-gold opacity-60">
                    {selected.includes(opt) ? '◆' : '◇'}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-foreground text-background text-xs tracking-[0.15em] uppercase font-sans hover:opacity-80 rounded-none disabled:opacity-30"
        >
          Continue
        </Button>

        {optional && onSkip && (
          <button
            onClick={onSkip}
            className="w-full text-center text-xs text-muted hover:text-gold font-sans transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
