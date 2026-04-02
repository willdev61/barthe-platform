'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, GitCompareArrows, CheckSquare, Square } from 'lucide-react'
import { getDossiers, getComparatif } from '@/lib/api'
import type { Dossier, ComparatifItem } from '@/lib/types'
import { formatCurrency, getScoreBgColor } from '@/lib/types'
import { cn } from '@/lib/utils'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

// Normalize each ratio to a 0–100 score (higher = better)
function normalizeRatio(key: keyof ComparatifItem['ratios'], value: number | null): number {
  if (value === null) return 0
  switch (key) {
    case 'marge_brute':      return Math.min(100, Math.max(0, (value / 50) * 100))
    case 'taux_ebitda':      return Math.min(100, Math.max(0, (value / 40) * 100))
    case 'levier_financier': return Math.min(100, Math.max(0, ((6 - Math.min(value, 6)) / 6) * 100))
    case 'dscr':             return Math.min(100, Math.max(0, (value / 3) * 100))
    case 'ratio_endettement':return Math.min(100, Math.max(0, ((150 - Math.min(value, 150)) / 150) * 100))
    default:                 return 0
  }
}

const RATIO_LABELS: Record<keyof ComparatifItem['ratios'], string> = {
  marge_brute: 'Marge brute',
  taux_ebitda: "Taux d'EBITDA",
  levier_financier: 'Levier (inv.)',
  dscr: 'DSCR',
  ratio_endettement: 'Endettement (inv.)',
}

export default function ComparatifPage() {
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

  const maxScore = comparatif ? Math.max(...comparatif.map((c) => c.score ?? -1)) : -1

  const radarData = (Object.keys(RATIO_LABELS) as Array<keyof ComparatifItem['ratios']>).map(
    (key) => ({
      metric: RATIO_LABELS[key],
      ...Object.fromEntries(
        (comparatif ?? []).map((item, i) => [String(i), normalizeRatio(key, item.ratios[key])])
      ),
    })
  )

  const exportCSV = () => {
    if (!comparatif) return
    const headers = ['Projet', 'Secteur', 'CA (FCFA)', 'EBITDA (FCFA)', 'Dette (FCFA)', 'Score',
      'Marge brute (%)', "Taux EBITDA (%)", 'Levier (x)', 'DSCR (x)', 'Endettement (%)']
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparatif</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sélectionnez 2 à 5 dossiers analysés pour les comparer côte à côte.
          </p>
        </div>
        {comparatif && comparatif.length >= 2 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        )}
      </div>

      {/* Dossier selector */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm font-semibold text-foreground mb-3">
          Dossiers analysés{' '}
          <span className="text-muted-foreground font-normal">
            ({selected.length}/5 sélectionnés)
          </span>
        </p>

        {loadingDossiers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : analysedDossiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun dossier analysé disponible.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {analysedDossiers.map((d) => {
              const isSelected = selected.includes(d.id)
              const isDisabled = !isSelected && selected.length >= 5
              return (
                <button
                  key={d.id}
                  onClick={() => !isDisabled && toggle(d.id)}
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
                    <span
                      className={cn(
                        'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full shrink-0',
                        getScoreBgColor(d.score)
                      )}
                    >
                      {d.score}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {selected.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <GitCompareArrows className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            {selected.length === 0
              ? 'Sélectionnez au moins 2 dossiers'
              : 'Sélectionnez un dossier supplémentaire'}
          </p>
          <p className="text-xs text-muted-foreground">
            Le tableau et le graphique radar apparaîtront ici.
          </p>
        </div>
      )}

      {/* Comparison table */}
      {selected.length >= 2 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Tableau comparatif</h2>
          </div>
          {loadingComp ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : comparatif ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Projet</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Secteur</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">CA</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">EBITDA</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">Dette</th>
                    <th className="text-right px-5 py-3 font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparatif.map((item, i) => {
                    const isBest = item.score !== null && item.score === maxScore
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'border-b border-border last:border-0',
                          isBest ? 'bg-score-favorable-bg' : 'hover:bg-muted/20'
                        )}
                      >
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: COLORS[i] }}
                            />
                            <span className="truncate max-w-[200px]">{item.nom_projet}</span>
                            {isBest && (
                              <span className="text-[10px] font-semibold text-score-favorable border border-score-favorable/30 rounded-full px-1.5 py-0.5 shrink-0">
                                Meilleur
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{item.secteur ?? '—'}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.ca)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.ebitda)}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums">{formatCurrency(item.dette)}</td>
                        <td className="px-5 py-3.5 text-right">
                          {item.score !== null ? (
                            <span
                              className={cn(
                                'inline-block text-xs font-semibold px-2 py-0.5 rounded-full',
                                getScoreBgColor(item.score)
                              )}
                            >
                              {item.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* Radar chart */}
      {selected.length >= 2 && comparatif && !loadingComp && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Graphique radar — ratios clés</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Valeurs normalisées sur 100 — plus le score est élevé, meilleur est l&apos;indicateur.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickCount={4}
              />
              {comparatif.map((item, i) => (
                <Radar
                  key={item.id}
                  name={item.nom_projet}
                  dataKey={String(i)}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
