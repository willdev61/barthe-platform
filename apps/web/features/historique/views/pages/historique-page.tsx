'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { History, Download, Search, FolderPlus, BarChart2, FileDown, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/types'
import type { AuditLog, AuditLogsResponse } from '../../types'
import { getAuditLogs } from '../../services/audit-service'
import { ACTION_OPTIONS, PERIOD_OPTIONS } from '../components/historique-filters'
import type { ActionFilter, PeriodFilter } from '../components/historique-filters'
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

function getActionConfig(action: string) {
  switch (action) {
    case 'dossier.created':  return { label: 'Dossier créé',       icon: FolderPlus, color: 'text-blue-600',   bg: 'bg-blue-50' }
    case 'analyse.run':      return { label: 'Analyse lancée',      icon: BarChart2,  color: 'text-purple-600', bg: 'bg-purple-50' }
    case 'rapport.exported': return { label: 'Rapport exporté',     icon: FileDown,   color: 'text-green-600',  bg: 'bg-green-50' }
    case 'user.invited':     return { label: 'Invitation envoyée',  icon: UserPlus,   color: 'text-orange-600', bg: 'bg-orange-50' }
    default:                 return { label: action,                 icon: History,    color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

function filterByPeriod(logs: AuditLog[], period: PeriodFilter): AuditLog[] {
  if (period === 'all') return logs
  const cutoff = new Date()
  if (period === 'today') cutoff.setHours(0, 0, 0, 0)
  else if (period === '7d') cutoff.setDate(cutoff.getDate() - 7)
  else if (period === '30d') cutoff.setDate(cutoff.getDate() - 30)
  return logs.filter((l) => new Date(l.created_at) >= cutoff)
}

function exportCSV(logs: AuditLog[]) {
  const headers = ['Date', 'Action', 'Type entité', 'ID entité', 'Utilisateur', 'IP', 'Métadonnées']
  const rows = logs.map((l) => [
    l.created_at, l.action, l.entity_type, l.entity_id ?? '',
    l.user_id ?? '', l.ip_address ?? '', JSON.stringify(l.metadata),
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historique_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoriquePage() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [search, setSearch] = useState('')

  const swrKey = actionFilter === 'all' ? 'audit' : `audit?action=${actionFilter}`
  const { data, isLoading, error } = useSWR<AuditLogsResponse>(swrKey, () =>
    getAuditLogs({ action: actionFilter === 'all' ? undefined : actionFilter })
  )

  const filtered = useMemo(() => {
    const byPeriod = filterByPeriod(data?.items ?? [], periodFilter)
    if (!search.trim()) return byPeriod
    const q = search.toLowerCase()
    return byPeriod.filter((l) =>
      l.action.toLowerCase().includes(q) ||
      l.entity_type.toLowerCase().includes(q) ||
      (l.ip_address ?? '').toLowerCase().includes(q) ||
      Object.values(l.metadata).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [data, periodFilter, search])

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {data ? `${filtered.length}${data.total && data.total !== filtered.length ? ` / ${data.total}` : ''} action${filtered.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <button
          onClick={() => filtered.length > 0 && exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActionFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
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
          <div className="p-10 text-center text-sm text-muted-foreground">
            Erreur lors du chargement de l&apos;historique.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-5 py-3">Action</TableHead>
                <TableHead className="px-5 py-3">Détails</TableHead>
                <TableHead className="px-5 py-3">Type</TableHead>
                <TableHead className="px-5 py-3">IP</TableHead>
                <TableHead className="px-5 py-3">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => {
                const cfg = getActionConfig(log.action)
                const Icon = cfg.icon
                const detail =
                  (log.metadata['nom_projet'] ?? log.metadata['email'] ?? log.entity_id ?? '') as string

                return (
                  <TableRow key={log.id}>
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg shrink-0', cfg.bg)}>
                          <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                        </div>
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                          {cfg.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-muted-foreground max-w-[220px] truncate">
                      {detail || '—'}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {log.entity_type}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-muted-foreground font-mono">
                      {log.ip_address ?? '—'}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Aucune action ne correspond aux filtres sélectionnés.
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
