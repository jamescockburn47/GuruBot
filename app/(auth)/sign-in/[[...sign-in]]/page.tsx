import { SignIn } from '@clerk/nextjs'

const clerkAppearance = {
  elements: {
    rootBox: 'w-full max-w-sm',
    card: 'bg-surface border border-border shadow-none rounded-none p-8',
    headerTitle: 'font-serif tracking-widest uppercase text-sm text-foreground',
    headerSubtitle: 'text-muted font-sans text-xs',
    formFieldLabel: 'text-xs tracking-widest uppercase text-muted font-sans',
    formFieldInput: 'bg-background border-border text-foreground font-sans text-sm rounded-none focus:border-gold',
    formButtonPrimary: 'bg-foreground text-background text-xs tracking-widest uppercase font-sans hover:opacity-80 rounded-none',
    footerActionLink: 'text-gold hover:text-foreground',
    identityPreviewText: 'text-muted font-sans text-xs',
    dividerLine: 'bg-border',
    dividerText: 'text-muted text-xs font-sans',
    socialButtonsBlockButton: 'border-border text-muted hover:border-gold font-sans text-xs rounded-none',
  },
}

export default function SignInPage() {
  return <SignIn appearance={clerkAppearance} />
}
