'use client'

import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpeedDialProps {
  onImport: () => void
}

export function SpeedDial({ onImport }: SpeedDialProps) {
  const [expanded, setExpanded] = useState(false)

  const handleAction = () => {
    setExpanded(false)
    onImport()
  }

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
      {/* Action item */}
      <div
        className={cn(
          'flex items-center gap-3 transition-all duration-200 ease-out',
          expanded
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <span className="bg-card border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
          Importer un Business Plan
        </span>
        <button
          onClick={handleAction}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border text-foreground shadow-md hover:bg-accent transition-colors"
          aria-label="Importer un Business Plan"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Main FAB */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg',
          'hover:opacity-90 active:scale-95 transition-all duration-200'
        )}
        aria-label={expanded ? 'Fermer' : 'Nouveau dossier'}
      >
        <Plus
          className={cn(
            'w-6 h-6 transition-transform duration-200',
            expanded && 'rotate-45'
          )}
        />
      </button>
    </div>
  )
}
