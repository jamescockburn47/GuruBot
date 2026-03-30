'use client'
import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'
import { Streamdown } from 'streamdown'

function CrystalOrb() {
  return (
    <div className="relative w-6 h-6 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-full border border-gold opacity-15 animate-ping"
        style={{ animationDuration: '2.4s' }}
      />
      <div className="absolute inset-[2px] rounded-full border border-gold opacity-25 animate-pulse" />
      <div
        className="absolute inset-[5px] rounded-full bg-gold opacity-10 animate-pulse"
        style={{ animationDelay: '0.4s' }}
      />
      <div className="absolute inset-[9px] rounded-full bg-gold opacity-50" />
    </div>
  )
}

interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-gold text-4xl opacity-30 select-none">☽</div>
        <p className="text-muted text-xs font-sans tracking-widest uppercase">
          The oracle awaits
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            {message.role === 'assistant' ? (
              <div className="max-w-[85%] space-y-1">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-sans mb-2">
                  Oracle
                </div>
                <div className="border-l-2 border-oracle-border pl-4 bg-oracle-bg px-4 py-3">
                  <div className="font-serif text-sm text-foreground leading-relaxed">
                    <Streamdown>
                      {message.parts
                        ?.filter(p => p.type === 'text')
                        .map(p => (p as { type: 'text'; text: string }).text)
                        .join('') ?? ''}
                    </Streamdown>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-[75%] bg-user-bg border border-user-border px-4 py-3">
                <p className="font-sans text-sm text-foreground leading-relaxed">
                  {message.parts
                    ?.filter(p => p.type === 'text')
                    .map(p => (p as { type: 'text'; text: string }).text)
                    .join('') ?? ''}
                </p>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="border-l-2 border-oracle-border pl-4 bg-oracle-bg px-4 py-3">
              <div className="flex items-center gap-3">
                <CrystalOrb />
                <span className="text-muted font-sans text-[10px] tracking-[0.2em] uppercase animate-pulse">
                  Consulting the oracle
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
