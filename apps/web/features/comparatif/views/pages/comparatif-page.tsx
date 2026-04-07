'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Download, GitCompareArrows } from 'lucide-react'
import type { Dossier } from '@/features/dossiers/types'
import type { ComparatifItem } from '../../types'
import { getDossiers } from '@/features/dossiers/services/dossier-service'
import { getComparatif } from '../../services/comparatif-service'
import { DossierSelector } from '../components/dossier-selector'
import { ComparatifTable } from '../components/comparatif-table'
import { ComparatifRadar } from '../components/comparatif-radar'

function exportCSV(comparatif: ComparatifItem[]) {
  const headers = [
    'Projet', 'Secteur', 'CA (FCFA)', 'EBITDA (FCFA)', 'Dette (FCFA)', 'Score',
    'Marge brute (%)', "Taux EBITDA (%)", 'Levier (x)', 'DSCR (x)', 'Endettement (%)',
  ]
  const rows = comparatif.map((c) => [
    `"${c.nom_projet}"`, c.secteur ?? '',
    c.ca ?? '', c.ebitda ?? '', c.dette ?? '', c.score ?? '',
    c.ratios.marge_brute ?? '', c.ratios.taux_ebitda ?? '',
    c.ratios.levier_financier ?? '', c.ratios.dscr ?? '',
    c.ratios.ratio_endettement ?? '',
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comparatif_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ComparatifPage() {
  const [selected, setSelected] = useState<string[]>([])

  const { data: dossiers, isLoading: loadingDossiers } = useSWR<Dossier[]>('dossiers', getDossiers)

  const { data: comparatif, isLoading: loadingComp } = useSWR<ComparatifItem[]>(
    selected.length >= 2 ? ['comparatif', ...selected.sort()] : null,
    () => getComparatif(selected)
  )

  const analysedDossiers = dossiers?.filter((d) => d.statut === 'analyse') ?? []

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparatif</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sélectionnez 2 à 5 dossiers analysés pour les comparer côte à côte.
          </p>
        </div>
        {comparatif && comparatif.length >= 2 && (
          <button
            onClick={() => exportCSV(comparatif)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        )}
      </div>

      <DossierSelector
        dossiers={analysedDossiers}
        selected={selected}
        onToggle={toggle}
        loading={loadingDossiers}
      />

      {selected.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <GitCompareArrows className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {selected.length === 0 ? 'Sélectionnez au moins 2 dossiers' : 'Sélectionnez un dossier supplémentaire'}
          </p>
          <p className="text-xs text-muted-foreground">Le tableau et le graphique radar apparaîtront ici.</p>
        </div>
      ) : (
        <>
          <ComparatifTable comparatif={comparatif ?? []} loading={loadingComp} />
          {comparatif && !loadingComp && <ComparatifRadar comparatif={comparatif} />}
        </>
      )}
    </div>
  )
}
