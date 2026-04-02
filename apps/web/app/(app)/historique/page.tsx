'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import {
  History,
  Filter,
  Download,
  FolderPlus,
  BarChart2,
  FileDown,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { getAuditLogs } from '@/lib/api'
import type { AuditLog, AuditLogsResponse } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/types'

// ---- Config ----

const ACTION_OPTIONS = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'dossier.created', label: 'Dossier créé' },
  { value: 'analyse.run', label: 'Analyse lancée' },
  { value: 'rapport.exported', label: 'Rapport exporté' },
  { value: 'user.invited', label: 'Invitation' },
] as const

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tout' },
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
] as const

type ActionFilter = (typeof ACTION_OPTIONS)[number]['value']
type PeriodFilter = (typeof PERIOD_OPTIONS)[number]['value']

// ---- Helpers ----

function getActionConfig(action: string): {
  label: string
  icon: React.ElementType
  color: string
  bg: string
} {
  switch (action) {
    case 'dossier.created':
      return { label: 'Dossier créé', icon: FolderPlus, color: 'text-blue-600', bg: 'bg-blue-50' }
    case 'analyse.run':
      return { label: 'Analyse lancée', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' }
    case 'rapport.exported':
      return { label: 'Rapport exporté', icon: FileDown, color: 'text-green-600', bg: 'bg-green-50' }
    case 'user.invited':
      return { label: 'Invitation envoyée', icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50' }
    default:
      return { label: action, icon: History, color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

function filterByPeriod(logs: AuditLog[], period: PeriodFilter): AuditLog[] {
  if (period === 'all') return logs
  const now = new Date()
  const cutoff = new Date()
  if (period === 'today') {
    cutoff.setHours(0, 0, 0, 0)
  } else if (period === '7d') {
    cutoff.setDate(now.getDate() - 7)
  } else if (period === '30d') {
    cutoff.setDate(now.getDate() - 30)
  }
  return logs.filter((l) => new Date(l.created_at) >= cutoff)
}

function exportCSV(logs: AuditLog[]) {
  const headers = ['Date', 'Action', 'Type entité', 'ID entité', 'Utilisateur', 'IP', 'Métadonnées']
  const rows = logs.map((l) => [
    l.created_at,
    l.action,
    l.entity_type,
    l.entity_id ?? '',
    l.user_id ?? '',
    l.ip_address ?? '',
    JSON.stringify(l.metadata),
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

// ---- Components ----

function AuditLogItem({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getActionConfig(log.action)
  const Icon = cfg.icon
  const hasMetadata = Object.keys(log.metadata).length > 0

  return (
    <div className="flex gap-4">
      {/* Icon */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-full', cfg.bg)}>
          <Icon className={cn('w-4 h-4', cfg.color)} />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{cfg.label}</p>
            {log.metadata['nom_projet'] && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {String(log.metadata['nom_projet'])}
              </p>
            )}
            {log.metadata['email'] && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {String(log.metadata['email'])}
              </p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {formatDate(log.created_at)}
          </time>
        </div>

        {hasMetadata && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Détails
          </button>
        )}

        {expanded && hasMetadata && (
          <div className="mt-2 rounded-lg border border-border bg-muted/50 p-3">
            <dl className="space-y-1">
              {Object.entries(log.metadata).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <dt className="text-muted-foreground shrink-0">{k}:</dt>
                  <dd className="text-foreground truncate font-mono">{String(v)}</dd>
                </div>
              ))}
            </dl>
            {log.ip_address && (
              <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                IP: {log.ip_address}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Page ----

export default function HistoriquePage() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')

  const swrKey = actionFilter === 'all' ? 'audit' : `audit?action=${actionFilter}`
  const { data, isLoading, error } = useSWR<AuditLogsResponse>(swrKey, () =>
    getAuditLogs({ action: actionFilter === 'all' ? undefined : actionFilter })
  )

  const filtered = useMemo(() => {
    if (!data?.items) return []
    return filterByPeriod(data.items, periodFilter)
  }, [data, periodFilter])

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Audit trail des actions effectuées sur la plateforme
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Action filter */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2 shrink-0" />
          {ACTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActionFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
                actionFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriodFilter(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
                periodFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground mb-6">
          {filtered.length} action{filtered.length !== 1 ? 's' : ''}
          {data?.total && data.total !== filtered.length ? ` sur ${data.total}` : ''}
        </p>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">
            Erreur lors du chargement de l&apos;historique.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <History className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Aucune action</h3>
          <p className="text-sm text-muted-foreground max-w-sm text-pretty">
            Aucune action ne correspond aux filtres sélectionnés.
          </p>
        </div>
      ) : (
        <div className="relative">
          {filtered.map((log) => (
            <AuditLogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
