'use client'
import type { OracleSession } from '@/lib/types'

interface PastReadingsPanelProps {
  open: boolean
  onClose: () => void
  sessions: OracleSession[]
  currentSessionId: string | null
  onSelectSession: (session: OracleSession) => void
}

export function PastReadingsPanel({
  open,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
}: PastReadingsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-background border-l border-border z-50 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
            Past Readings
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-sm font-sans"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-16">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <span className="text-gold opacity-30 text-xl select-none">◯</span>
              <p className="text-xs text-muted font-sans">No past readings</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => { onSelectSession(session); onClose() }}
                  className={`w-full text-left px-6 py-4 hover:bg-surface transition-colors group ${
                    session.id === currentSessionId ? 'bg-surface' : ''
                  }`}
                >
                  <p className="font-sans text-xs text-foreground leading-snug line-clamp-2 mb-1">
                    {session.title}
                  </p>
                  <p className="font-sans text-[10px] text-muted">
                    {new Date(session.startedAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
