'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-6 h-6" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="text-muted hover:text-gold transition-colors text-lg leading-none select-none"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? '☀' : '☽'}
    </button>
  )
}
