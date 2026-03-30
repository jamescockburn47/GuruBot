'use client'
import { useRef, useState } from 'react'
import { compressImage } from '@/lib/compressImage'
import type { CompressedImage } from '@/lib/compressImage'

interface InputBarProps {
  onSend: (text: string, image?: CompressedImage) => void
  disabled?: boolean
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState<CompressedImage | null>(null)
  const [compressing, setCompressing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    setImageError(null)
    try {
      const compressed = await compressImage(file)
      setPendingImage(compressed)
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Image could not be attached')
    } finally {
      setCompressing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleSend() {
    if (!text.trim() && !pendingImage) return
    onSend(text.trim(), pendingImage ?? undefined)
    setText('')
    setPendingImage(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border px-4 py-3 space-y-2">
      {imageError && (
        <p className="text-xs font-sans text-red-400 px-1">{imageError}</p>
      )}
      {pendingImage && (
        <div className="flex items-center gap-2">
          <img
            src={`data:${pendingImage.mimeType};base64,${pendingImage.base64}`}
            alt="Attached"
            className="h-12 w-12 object-cover border border-border"
          />
          <button
            onClick={() => setPendingImage(null)}
            className="text-muted hover:text-foreground text-xs font-sans"
          >
            ✕ Remove
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 max-w-2xl mx-auto w-full">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || compressing}
          className="text-muted hover:text-gold transition-colors text-lg leading-none select-none disabled:opacity-30"
          aria-label="Attach image"
          title="Attach image (palm, natal chart, crystal...)"
        >
          {compressing ? '…' : '⌖'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

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
          disabled={disabled || (!text.trim() && !pendingImage)}
          className="text-muted hover:text-gold transition-colors text-lg leading-none select-none disabled:opacity-30"
          aria-label="Send"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
