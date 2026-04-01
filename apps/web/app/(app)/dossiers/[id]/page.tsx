'use client'

import { use } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, AlertOctagon, FileText } from 'lucide-react'
import { getDossier } from '@/lib/api'
import type { DossierComplet } from '@/lib/types'
import { getScoreLabel, formatCurrency, formatDate } from '@/lib/types'
import { ScoreRing } from '@/components/score-badge'
import { RatioCard } from '@/components/ratio-card'
import { AlertList } from '@/components/alert-list'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const STATUT_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  en_attente: { label: 'En attente', className: 'bg-muted text-muted-foreground' },
  en_cours: { label: 'En cours', className: 'bg-blue-50 text-blue-700' },
  analyse: { label: 'Analysé', className: 'bg-score-favorable-bg text-score-favorable' },
  erreur: { label: 'Erreur', className: 'bg-score-defavorable-bg text-score-defavorable' },
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  )
}

export default function DossierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [exportLoading, setExportLoading] = useState(false)

  const { data: dossier, isLoading, error } = useSWR<DossierComplet | null>(
    `dossier-${id}`,
    () => getDossier(id)
  )

  const handleExport = async () => {
    setExportLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setExportLoading(false)
    // In production: open PDF url
    alert('Export PDF généré (simulation). URL: /rapports/' + id + '.pdf')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !dossier) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertOctagon className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Dossier introuvable
          </h2>
          <p className="text-sm text-muted-foreground">
            Ce dossier n&apos;existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  const { analyse } = dossier
  const statut = STATUT_CONFIG[dossier.statut] ?? STATUT_CONFIG.en_attente

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {dossier.statut === 'analyse' && (
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exportLoading ? 'Génération…' : 'Exporter PDF'}
          </button>
        )}
      </div>

      {/* Project header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Score ring */}
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
                <p className="text-xs text-muted-foreground">
                  Score de finançabilité
                </p>
              </div>
            </div>
          )}

          {/* Project info */}
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

      {!analyse ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Analyse non disponible pour ce dossier.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Financial data table */}
          <section className="bg-card border border-border rounded-xl p-6">
            <SectionHeader title="Données financières" icon={FileText} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-4">
                      Indicateur
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3">
                      Valeur (FCFA)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      label: "Chiffre d'affaires",
                      value: analyse.donnees_normalisees.chiffre_affaires,
                    },
                    {
                      label: "Charges d'exploitation",
                      value: analyse.donnees_normalisees.charges_exploitation,
                    },
                    {
                      label: 'EBITDA',
                      value: analyse.donnees_normalisees.ebitda,
                    },
                    {
                      label: 'Résultat net',
                      value: analyse.donnees_normalisees.resultat_net,
                    },
                    {
                      label: 'Dette financière',
                      value: analyse.donnees_normalisees.dette_financiere,
                    },
                  ].map((row) => (
                    <tr key={row.label} className="group">
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {row.label}
                      </td>
                      <td
                        className={cn(
                          'py-3 text-right font-mono tabular-nums',
                          row.label === 'Résultat net' && row.value !== null && row.value < 0
                            ? 'text-score-defavorable font-semibold'
                            : 'text-foreground'
                        )}
                      >
                        {formatCurrency(row.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ratios */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Ratios financiers clés
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyse.ratios).map(([key, ratio]) => (
                <RatioCard key={key} name={key} ratio={ratio} />
              ))}
            </div>
          </section>

          {/* Alerts */}
          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <AlertOctagon className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Alertes détectées
                </h2>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {analyse.alertes.length} alerte
                {analyse.alertes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <AlertList alertes={analyse.alertes} />
          </section>

          {/* LLM Narrative */}
          {analyse.synthese_narrative && (
            <section className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Synthèse narrative IA
                </h2>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {analyse.modele_llm}
                </span>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                  {analyse.synthese_narrative
                    .split('\n\n')
                    .map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm text-foreground leading-relaxed mb-3 last:mb-0"
                      >
                        {paragraph.replace(/\*\*/g, '')}
                      </p>
                    ))}
                </div>
              </div>
            </section>
          )}

          {/* Export button bottom */}
          {dossier.statut === 'analyse' && (
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {exportLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exportLoading ? 'Génération du PDF…' : 'Exporter le rapport PDF'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
