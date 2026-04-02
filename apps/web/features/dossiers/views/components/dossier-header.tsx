import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DossierComplet } from '../../types'
import { getScoreLabel, formatDate } from '@/lib/types'
import { ScoreRing } from '@/features/analyse/views/components/score-badge'

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  en_attente: { label: 'En attente', className: 'bg-muted text-muted-foreground' },
  en_cours: { label: 'En cours', className: 'bg-blue-50 text-blue-700' },
  analyse: { label: 'Analysé', className: 'bg-score-favorable-bg text-score-favorable' },
  erreur: { label: 'Erreur', className: 'bg-score-defavorable-bg text-score-defavorable' },
}

interface DossierHeaderProps {
  dossier: DossierComplet
}

export function DossierHeader({ dossier }: DossierHeaderProps) {
  const statut = STATUT_CONFIG[dossier.statut] ?? STATUT_CONFIG.en_attente
  const { analyse } = dossier

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {dossier.score !== null && (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ScoreRing score={dossier.score} size={140} />
            <div className="text-center">
              <p
                className={cn(
                  'text-sm font-bold',
                  dossier.score >= 75
                    ? 'text-score-favorable'
                    : dossier.score >= 50
                    ? 'text-score-reserve'
                    : 'text-score-defavorable'
                )}
              >
                {getScoreLabel(dossier.score)}
              </p>
              <p className="text-xs text-muted-foreground">Score de finançabilité</p>
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                statut.className
              )}
            >
              {statut.label}
            </span>
            {dossier.secteur && (
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {dossier.secteur}
              </span>
            )}
          </div>

          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2 text-balance">
            {dossier.nom_projet}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Créé le {formatDate(dossier.created_at)}</span>
            {dossier.fichier_nom && (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {dossier.fichier_nom}
              </span>
            )}
            {analyse && (
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                Analysé par {analyse.modele_llm} ·{' '}
                {analyse.tokens_utilises?.toLocaleString('fr-FR')} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
