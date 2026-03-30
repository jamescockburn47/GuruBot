import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Theme toggle — top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Oracle symbol */}
      <div className="text-4xl text-gold opacity-60 mb-8 select-none">◯</div>

      {/* Title */}
      <h1 className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-foreground mb-3 text-center uppercase">
        The Oracle
      </h1>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6 text-gold opacity-40 text-xs tracking-widest select-none">
        ✦ &nbsp; Your Personal Spiritual Guide &nbsp; ✦
      </div>

      {/* Tagline */}
      <p className="text-muted text-sm max-w-sm text-center leading-relaxed mb-10 font-sans">
        Guidance through astrology, crystals, energy healing, and the wisdom of the unseen.
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/sign-up"
          className="px-8 py-3 bg-foreground text-background text-xs tracking-[0.15em] uppercase font-sans hover:opacity-80 transition-opacity"
        >
          Begin Your Journey
        </Link>
        <Link
          href="/sign-in"
          className="px-8 py-3 border border-border text-muted text-xs tracking-[0.15em] uppercase font-sans hover:border-gold hover:text-foreground transition-colors"
        >
          Return
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <Link href="/disclaimer" className="text-xs text-muted hover:text-gold transition-colors font-sans">
          Privacy & Disclaimer
        </Link>
      </div>
    </div>
  )
}
