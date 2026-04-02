import { cn } from '@/lib/utils'
import type { RatioFinancier } from '../../types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function getRatioStatus(ratio: RatioFinancier): 'good' | 'warning' | 'bad' | 'neutral' {
  if (ratio.valeur === null) return 'neutral'
  if (ratio.seuil_min !== undefined && ratio.seuil_max === undefined) {
    if (ratio.valeur >= ratio.seuil_min) return 'good'
    if (ratio.valeur >= ratio.seuil_min * 0.75) return 'warning'
    return 'bad'
  }
  if (ratio.seuil_max !== undefined && ratio.seuil_min === undefined) {
    if (ratio.valeur <= ratio.seuil_max) return 'good'
    if (ratio.valeur <= ratio.seuil_max * 1.3) return 'warning'
    return 'bad'
  }
  return 'neutral'
}

const statusConfig = {
  good: { badge: 'bg-score-favorable-bg text-score-favorable', icon: TrendingUp, border: 'border-l-score-favorable' },
  warning: { badge: 'bg-score-reserve-bg text-score-reserve', icon: Minus, border: 'border-l-score-reserve' },
  bad: { badge: 'bg-score-defavorable-bg text-score-defavorable', icon: TrendingDown, border: 'border-l-score-defavorable' },
  neutral: { badge: 'bg-muted text-muted-foreground', icon: Minus, border: 'border-l-border' },
}

interface RatioCardProps {
  name: string
  ratio: RatioFinancier
}

export function RatioCard({ name, ratio }: RatioCardProps) {
  const status = getRatioStatus(ratio)
  const config = statusConfig[status]
  const Icon = config.icon

  const formatValue = (val: number | null, unit: string) => {
    if (val === null) return '—'
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(val)}${unit}`
  }

  const getThresholdLabel = () => {
    if (ratio.seuil_min !== undefined) return `Seuil min : ${formatValue(ratio.seuil_min, ratio.unite)}`
    if (ratio.seuil_max !== undefined) return `Seuil max : ${formatValue(ratio.seuil_max, ratio.unite)}`
    return null
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-5 border-l-4', config.border)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{ratio.label}</p>
          <p className="text-2xl font-bold text-foreground mt-1 leading-none">{formatValue(ratio.valeur, ratio.unite)}</p>
        </div>
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg shrink-0', config.badge)} aria-hidden="true">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{ratio.description}</p>
        {getThresholdLabel() && (
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.badge)}>
            {getThresholdLabel()}
          </span>
        )}
      </div>
    </div>
  )
}
