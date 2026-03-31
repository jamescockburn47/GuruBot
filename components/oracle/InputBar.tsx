'use client'
import { useState } from 'react'

interface InputBarProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 max-w-2xl mx-auto w-full">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask the oracle..."
          rows={1}
          className="flex-1 bg-surface border border-border text-foreground font-sans text-sm px-3 py-2 resize-none placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
          style={{ minHeight: '38px', maxHeight: '120px' }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="text-muted hover:text-gold transition-colors text-lg leading-none select-none disabled:opacity-30"
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
