import { CheckCircle2, FileText, BarChart3 } from 'lucide-react'
import type { Analyse, Dossier } from '@/lib/types'
import { ScoreBadge } from '@/features/analyse/views/components/score-badge'

interface AnalyseResultProps {
  dossier: Dossier
  analyse: Analyse
  onGoToDashboard: () => void
  onGoToDossier: () => void
}

export function AnalyseResult({ dossier, analyse, onGoToDashboard, onGoToDossier }: AnalyseResultProps) {
  const score = dossier.score ?? 0

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-5 h-5 text-score-favorable" />
          <h2 className="text-base font-semibold text-foreground">Analyse terminée</h2>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <ScoreBadge score={score} size="xl" showLabel />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Score de finançabilité</p>
            <p className="text-lg font-bold text-foreground">{dossier.nom_projet}</p>
            <p className="text-sm text-muted-foreground">
              Secteur : {analyse.donnees_normalisees.secteur}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              label: "Chiffre d'affaires",
              value: analyse.donnees_normalisees.chiffre_affaires
                ? `${(analyse.donnees_normalisees.chiffre_affaires / 1_000_000).toFixed(0)}M FCFA`
                : '—',
            },
            {
              label: 'EBITDA',
              value: analyse.donnees_normalisees.ebitda
                ? `${(analyse.donnees_normalisees.ebitda / 1_000_000).toFixed(0)}M FCFA`
                : '—',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {analyse.alertes.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-score-reserve-bg border border-score-reserve/20 rounded-lg">
            <BarChart3 className="w-4 h-4 text-score-reserve shrink-0" />
            <p className="text-sm text-score-reserve">
              {analyse.alertes.length} alerte{analyse.alertes.length > 1 ? 's' : ''} détectée
              {analyse.alertes.length > 1 ? 's' : ''} — consultez le dossier complet.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onGoToDashboard}
          className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          Retour au tableau de bord
        </button>
        <button
          onClick={onGoToDossier}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FileText className="w-4 h-4" />
          Voir l&apos;analyse complète
        </button>
      </div>
    </div>
  )
}
