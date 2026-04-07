'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { FolderOpen, Plus, Search, Trash2, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/types'
import type { Dossier, DossierStatut } from '../../types'
import { getDossiers, deleteDossier } from '../../services/dossier-service'
import { ScoreBadge } from '@/features/analyse/views/components/score-badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const STATUT_CONFIG: Record<DossierStatut, { label: string; className: string }> = {
  en_attente: { label: 'En attente', className: 'bg-muted text-muted-foreground' },
  en_cours:   { label: 'En cours',   className: 'bg-blue-50 text-blue-700' },
  analyse:    { label: 'Analysé',    className: 'bg-score-favorable-bg text-score-favorable' },
  erreur:     { label: 'Erreur',     className: 'bg-score-defavorable-bg text-score-defavorable' },
}

export function DossiersPage() {
  const router = useRouter()
  const { data: dossiers, isLoading, error, mutate } = useSWR<Dossier[]>('dossiers', getDossiers)

  const [search, setSearch]       = useState('')
  const [statutFilter, setStatutFilter] = useState('all')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!dossiers) return []
    return dossiers.filter((d) => {
      const matchSearch =
        !search.trim() ||
        d.nom_projet.toLowerCase().includes(search.toLowerCase()) ||
        (d.secteur?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchStatut = statutFilter === 'all' || d.statut === statutFilter
      return matchSearch && matchStatut
    })
  }, [dossiers, search, statutFilter])

  const handleDelete = async (dossier: Dossier) => {
    setPendingId(dossier.id)
    try {
      await deleteDossier(dossier.id)
      mutate((prev) => prev?.filter((d) => d.id !== dossier.id))
      toast.success('Dossier supprimé', { description: dossier.nom_projet })
    } catch {
      toast.error('Erreur', { description: 'Impossible de supprimer le dossier.' })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dossiers</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {dossiers
              ? filtered.length < dossiers.length
                ? `${filtered.length} / ${dossiers.length} dossiers`
                : `${dossiers.length} dossier${dossiers.length !== 1 ? 's' : ''}`
              : '…'}
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
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom, secteur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="analyse">Analysé</SelectItem>
            <SelectItem value="erreur">Erreur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">Erreur lors du chargement des dossiers.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-5 py-3">Projet</TableHead>
                <TableHead className="px-5 py-3">Secteur</TableHead>
                <TableHead className="px-5 py-3 text-center">Statut</TableHead>
                <TableHead className="px-5 py-3 text-center">Score</TableHead>
                <TableHead className="px-5 py-3">Créé le</TableHead>
                <TableHead className="px-5 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((dossier) => {
                const statut = STATUT_CONFIG[dossier.statut]
                const isPending = pendingId === dossier.id
                return (
                  <TableRow
                    key={dossier.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dossiers/${dossier.id}`)}
                  >
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shrink-0">
                          <FolderOpen className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground text-sm">
                          {dossier.nom_projet}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-muted-foreground">
                      {dossier.secteur ?? '—'}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-center">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        statut.className
                      )}>
                        {statut.label}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-center">
                      {dossier.score !== null ? (
                        <ScoreBadge score={dossier.score} size="sm" />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-muted-foreground">
                      {formatDate(dossier.created_at)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/dossiers/${dossier.id}`}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="left">Voir le dossier</TooltipContent>
                            </Tooltip>
                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <button className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="left">Supprimer</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer{' '}
                                    <strong>{dossier.nom_projet}</strong> ? Cette action est
                                    irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(dossier)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                        <FolderOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {dossiers?.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dossiers?.length === 0
                            ? 'Importez votre premier Business Plan pour commencer.'
                            : 'Modifiez vos critères de recherche.'}
                        </p>
                      </div>
                      {dossiers?.length === 0 && (
                        <Link
                          href="/import"
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Importer un Business Plan
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
