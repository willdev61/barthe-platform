'use client'

import { use, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, AlertOctagon, FileText, Trash2 } from 'lucide-react'
import type { DossierComplet } from '../../types'
import { getDossier } from '../../services/dossier-service'
import { DossierHeader } from '../components/dossier-header'
import { DeleteDossierDialog } from '../dialogs/delete-dossier-dialog'
import { RatioCard } from '@/features/analyse/views/components/ratio-card'
import { AlertList } from '@/features/analyse/views/components/alert-list'
import { formatCurrency } from '@/lib/types'
import { cn } from '@/lib/utils'

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

export function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: dossier, isLoading, error } = useSWR<DossierComplet | null>(
    `dossier-${id}`,
    () => getDossier(id)
  )

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const res = await fetch(`/api/rapports/${id}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      window.open(data.pdf_url, '_blank')
    } catch {
      // handle error
    } finally {
      setExportLoading(false)
    }
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
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertOctagon className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Dossier introuvable</h2>
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

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-destructive border border-destructive/30 rounded-lg text-sm font-medium hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
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
      </div>

      <DossierHeader dossier={dossier} />

      {!analyse ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-xl">
          <Loader2 className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Analyse non disponible pour ce dossier.</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                    { label: "Chiffre d'affaires", value: analyse.donnees_normalisees.chiffre_affaires },
                    { label: "Charges d'exploitation", value: analyse.donnees_normalisees.charges_exploitation },
                    { label: 'EBITDA', value: analyse.donnees_normalisees.ebitda },
                    { label: 'Résultat net', value: analyse.donnees_normalisees.resultat_net },
                    { label: 'Dette financière', value: analyse.donnees_normalisees.dette_financiere },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 pr-4 font-medium text-foreground">{row.label}</td>
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

          <section>
            <SectionHeader title="Ratios financiers clés" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyse.ratios).map(([key, ratio]) => (
                <RatioCard key={key} name={key} ratio={ratio} />
              ))}
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Alertes détectées" icon={AlertOctagon} />
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {analyse.alertes.length} alerte{analyse.alertes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <AlertList alertes={analyse.alertes} />
          </section>

          {analyse.synthese_narrative && (
            <section className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Synthèse narrative IA</h2>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {analyse.modele_llm}
                </span>
              </div>
              <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                {analyse.synthese_narrative.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-sm text-foreground leading-relaxed mb-3 last:mb-0">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
            </section>
          )}

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

      <DeleteDossierDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        dossierId={dossier.id}
        nomProjet={dossier.nom_projet}
        onSuccess={() => router.push('/dossiers')}
      />
    </div>
  )
}
