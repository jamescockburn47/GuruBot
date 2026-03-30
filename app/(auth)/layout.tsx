export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-gold text-3xl mb-8 select-none opacity-50">◯</div>
      {children}
      <p className="mt-8 text-xs text-muted font-sans">
        The Oracle &nbsp;✦&nbsp; Spiritual Guidance
      </p>
    </div>
  )
}
