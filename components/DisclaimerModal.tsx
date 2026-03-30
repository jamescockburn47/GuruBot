'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DISCLAIMER_ITEMS = [
  'Your readings stay on your device. We do not store your conversations on our servers.',
  "Your messages are sent to Anthropic's API for processing. Anthropic's privacy policy applies.",
  'Do not share bank details, medical records, passwords, or other sensitive personal information.',
  'Readings are for spiritual exploration only. This is not a substitute for medical, legal, or financial advice.',
]

interface DisclaimerModalProps {
  open: boolean
  onAccept: () => void
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-background border-border max-w-md" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="text-center text-gold text-2xl mb-2 select-none">◈</div>
          <DialogTitle className="font-serif text-center tracking-widest uppercase text-sm text-foreground">
            Before You Enter
          </DialogTitle>
          <DialogDescription className="sr-only">Privacy and usage disclaimer</DialogDescription>
        </DialogHeader>

        <div className="border-t border-border pt-4 space-y-3">
          {DISCLAIMER_ITEMS.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-gold text-xs mt-0.5 select-none flex-shrink-0">✦</span>
              <p className="text-xs text-muted font-sans leading-relaxed">{item}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={onAccept}
            className="w-full bg-foreground text-background text-xs tracking-[0.15em] uppercase font-sans hover:opacity-80 rounded-none"
          >
            I Understand — Enter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
