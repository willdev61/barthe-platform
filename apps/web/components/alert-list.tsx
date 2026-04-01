import { cn } from '@/lib/utils'
import type { Alerte } from '@/lib/types'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface AlertListProps {
  alertes: Alerte[]
  className?: string
}

const criticiteConfig = {
  info: {
    label: 'Info',
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClass: 'text-blue-600',
    icon: Info,
  },
  warning: {
    label: 'Attention',
    className: 'bg-score-reserve-bg border-score-reserve/30 text-score-reserve',
    iconClass: 'text-score-reserve',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Critique',
    className:
      'bg-score-defavorable-bg border-score-defavorable/30 text-score-defavorable',
    iconClass: 'text-score-defavorable',
    icon: AlertCircle,
  },
}

export function AlertList({ alertes, className }: AlertListProps) {
  if (!alertes || alertes.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 bg-score-favorable-bg rounded-xl border border-score-favorable/20',
          className
        )}
      >
        <Info className="w-4 h-4 text-score-favorable shrink-0" />
        <p className="text-sm text-score-favorable font-medium">
          Aucune alerte détectée.
        </p>
      </div>
    )
  }

  // Sort: critical first, then warning, then info
  const sorted = [...alertes].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 }
    return order[a.criticite] - order[b.criticite]
  })

  return (
    <div className={cn('space-y-2.5', className)}>
      {sorted.map((alerte) => {
        const config = criticiteConfig[alerte.criticite]
        const Icon = config.icon

        return (
          <div
            key={alerte.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border',
              config.className
            )}
            role="alert"
          >
            <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', config.iconClass)} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  {config.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{alerte.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
