'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { FolderOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Dossier } from '../../types'
import { getDossiers } from '../../services/dossier-service'
import { DossierCard } from '../components/dossier-card'
import { DossierFilters } from '../components/dossier-filters'

export function DossiersPage() {
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('all')

  const { data: dossiers, isLoading, error } = useSWR<Dossier[]>('dossiers', getDossiers)

  const filtered = useMemo(() => {
    if (!dossiers) return []
    return dossiers.filter((d) => {
      const matchSearch = d.nom_projet.toLowerCase().includes(search.toLowerCase())
      const matchStatut = statutFilter === 'all' || d.statut === statutFilter
      return matchSearch && matchStatut
    })
  }, [dossiers, search, statutFilter])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
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

      <DossierFilters
        search={search}
        onSearchChange={setSearch}
        statut={statutFilter}
        onStatutChange={setStatutFilter}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
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
          <p className="text-muted-foreground">Erreur lors du chargement des dossiers.</p>
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
