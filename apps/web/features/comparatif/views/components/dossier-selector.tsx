'use client'

import { CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getScoreBgColor } from '@/lib/types'
import type { Dossier } from '@/features/dossiers/types'

interface DossierSelectorProps {
  dossiers: Dossier[]
  selected: string[]
  onToggle: (id: string) => void
  loading: boolean
}

export function DossierSelector({ dossiers, selected, onToggle, loading }: DossierSelectorProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-sm font-semibold text-foreground mb-3">
        Dossiers analysés{' '}
        <span className="text-muted-foreground font-normal">
          ({selected.length}/5 sélectionnés)
        </span>
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : dossiers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun dossier analysé disponible.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {dossiers.map((d) => {
            const isSelected = selected.includes(d.id)
            const isDisabled = !isSelected && selected.length >= 5
            return (
              <button
                key={d.id}
                onClick={() => !isDisabled && onToggle(d.id)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : isDisabled
                    ? 'border-border bg-muted/40 text-muted-foreground cursor-not-allowed opacity-50'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50 text-foreground'
                )}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.nom_projet}</p>
                  <p className="text-xs text-muted-foreground">{d.secteur ?? '—'}</p>
                </div>
                {d.score !== null && (
                  <span className={cn('ml-auto text-xs font-semibold px-2 py-0.5 rounded-full shrink-0', getScoreBgColor(d.score))}>
                    {d.score}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
