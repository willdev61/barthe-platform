'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Search, Filter, FolderOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import { getDossiers } from '@/lib/api'
import type { Dossier } from '@/lib/types'
import { DossierCard } from '@/components/dossier-card'
import { cn } from '@/lib/utils'

const STATUT_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'analyse', label: 'Analysés' },
  { value: 'erreur', label: 'Erreur' },
] as const

export default function DossiersPage() {
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('all')

  const { data: dossiers, isLoading, error } = useSWR<Dossier[]>(
    'dossiers',
    getDossiers
  )

  const filtered = useMemo(() => {
    if (!dossiers) return []
    return dossiers.filter((d) => {
      const matchSearch = d.nom_projet
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchStatut =
        statutFilter === 'all' || d.statut === statutFilter
      return matchSearch && matchStatut
    })
  }, [dossiers, search, statutFilter])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dossiers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {dossiers ? `${dossiers.length} dossier${dossiers.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <Link
          href="/import"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau dossier
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un dossier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
          {STATUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatutFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                statutFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="h-10 w-10 bg-muted rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground">
            Erreur lors du chargement des dossiers.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FolderOpen className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {dossiers?.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm text-pretty">
            {dossiers?.length === 0
              ? 'Importez votre premier Business Plan pour commencer.'
              : 'Modifiez vos critères de recherche ou de filtre.'}
          </p>
          {dossiers?.length === 0 && (
            <Link
              href="/import"
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Importer un Business Plan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dossier) => (
            <DossierCard key={dossier.id} dossier={dossier} />
          ))}
        </div>
      )}
    </div>
  )
}
