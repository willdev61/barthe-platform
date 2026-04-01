import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dossier } from '@/lib/types'
import { getScoreLabel, getScoreBgColor, formatDate } from '@/lib/types'
import { ScoreBadge } from './score-badge'

const STATUT_CONFIG: Record<
  Dossier['statut'],
  { label: string; className: string }
> = {
  en_attente: {
    label: 'En attente',
    className:
      'bg-muted text-muted-foreground',
  },
  en_cours: {
    label: 'En cours',
    className:
      'bg-blue-50 text-blue-700',
  },
  analyse: {
    label: 'Analysé',
    className:
      'bg-score-favorable-bg text-score-favorable',
  },
  erreur: {
    label: 'Erreur',
    className:
      'bg-score-defavorable-bg text-score-defavorable',
  },
}

interface DossierCardProps {
  dossier: Dossier
}

export function DossierCard({ dossier }: DossierCardProps) {
  const statut = STATUT_CONFIG[dossier.statut]

  return (
    <Link
      href={`/dossiers/${dossier.id}`}
      className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                statut.className
              )}
            >
              {statut.label}
            </span>
            {dossier.secteur && (
              <span className="text-xs text-muted-foreground">
                {dossier.secteur}
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-foreground truncate leading-tight text-balance">
            {dossier.nom_projet}
          </h3>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(dossier.created_at)}</span>
          </div>
        </div>

        {/* Right: score or arrow */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          {dossier.score !== null ? (
            <ScoreBadge score={dossier.score} size="sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">—</span>
            </div>
          )}
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  )
}
