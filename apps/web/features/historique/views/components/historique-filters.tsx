'use client'

import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ACTION_OPTIONS = [
  { value: 'all',              label: 'Toutes les actions' },
  { value: 'dossier.created',  label: 'Dossier créé' },
  { value: 'analyse.run',      label: 'Analyse lancée' },
  { value: 'rapport.exported', label: 'Rapport exporté' },
  { value: 'user.invited',     label: 'Invitation' },
] as const

export const PERIOD_OPTIONS = [
  { value: 'all',   label: 'Tout' },
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d',    label: '7 derniers jours' },
  { value: '30d',   label: '30 derniers jours' },
] as const

export type ActionFilter = (typeof ACTION_OPTIONS)[number]['value']
export type PeriodFilter = (typeof PERIOD_OPTIONS)[number]['value']

interface HistoriqueFiltersProps {
  action: ActionFilter
  onActionChange: (value: ActionFilter) => void
  period: PeriodFilter
  onPeriodChange: (value: PeriodFilter) => void
}

export function HistoriqueFilters({ action, onActionChange, period, onPeriodChange }: HistoriqueFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
        <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
        {ACTION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onActionChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
              action === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPeriodChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
              period === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
