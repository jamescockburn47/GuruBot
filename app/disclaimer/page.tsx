import Link from 'next/link'

const ITEMS = [
  {
    heading: 'Your Data Stays With You',
    body: 'Your readings, intake profile, and conversation history are stored only on your device. We do not transmit or store this information on our servers.',
  },
  {
    heading: 'Third-Party Processing',
    body: "Your messages are sent to Anthropic's API for processing by the Claude language model. Anthropic's privacy policy applies to this data. We do not control Anthropic's data handling practices.",
  },
  {
    heading: 'Sensitive Information',
    body: 'Do not share bank details, medical records, passwords, identification numbers, or other sensitive personal information with the oracle.',
  },
  {
    heading: 'Not Professional Advice',
    body: "The oracle's guidance is for spiritual exploration and personal reflection only. It is not a substitute for medical, legal, psychological, or financial advice. Seek qualified professionals for such matters.",
  },
]

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-gold text-2xl mb-4 select-none">◈</div>
          <h1 className="font-serif tracking-[0.2em] uppercase text-sm text-foreground mb-2">
            Privacy & Disclaimer
          </h1>
          <div className="w-12 h-px bg-border mx-auto" />
        </div>

        <div className="space-y-8">
          {ITEMS.map((item) => (
            <div key={item.heading}>
              <h2 className="font-sans text-xs tracking-widest uppercase text-gold mb-2">
                {item.heading}
              </h2>
              <p className="font-sans text-sm text-muted leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-xs text-muted hover:text-gold transition-colors font-sans tracking-widest uppercase"
          >
            ← Return
          </Link>
        </div>
      </div>
    </div>
  )
}
