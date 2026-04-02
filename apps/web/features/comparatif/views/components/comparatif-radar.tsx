import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ComparatifItem } from '../../types'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

const RATIO_LABELS: Record<keyof ComparatifItem['ratios'], string> = {
  marge_brute: 'Marge brute',
  taux_ebitda: "Taux d'EBITDA",
  levier_financier: 'Levier (inv.)',
  dscr: 'DSCR',
  ratio_endettement: 'Endettement (inv.)',
}

function normalizeRatio(key: keyof ComparatifItem['ratios'], value: number | null): number {
  if (value === null) return 0
  switch (key) {
    case 'marge_brute':       return Math.min(100, Math.max(0, (value / 50) * 100))
    case 'taux_ebitda':       return Math.min(100, Math.max(0, (value / 40) * 100))
    case 'levier_financier':  return Math.min(100, Math.max(0, ((6 - Math.min(value, 6)) / 6) * 100))
    case 'dscr':              return Math.min(100, Math.max(0, (value / 3) * 100))
    case 'ratio_endettement': return Math.min(100, Math.max(0, ((150 - Math.min(value, 150)) / 150) * 100))
    default:                  return 0
  }
}

interface ComparatifRadarProps {
  comparatif: ComparatifItem[]
}

export function ComparatifRadar({ comparatif }: ComparatifRadarProps) {
  const radarData = (Object.keys(RATIO_LABELS) as Array<keyof ComparatifItem['ratios']>).map(
    (key) => ({
      metric: RATIO_LABELS[key],
      ...Object.fromEntries(
        comparatif.map((item, i) => [String(i), normalizeRatio(key, item.ratios[key])])
      ),
    })
  )

  return (
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
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickCount={4} />
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
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
