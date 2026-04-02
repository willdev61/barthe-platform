'use client'

import { Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'analyse', label: 'Analysés' },
  { value: 'erreur', label: 'Erreur' },
] as const

interface DossierFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statut: string
  onStatutChange: (value: string) => void
}

export function DossierFilters({
  search,
  onSearchChange,
  statut,
  onStatutChange,
}: DossierFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher un dossier…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
        <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
        {STATUT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatutChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              statut === opt.value
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
