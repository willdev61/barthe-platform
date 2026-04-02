'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { History, Download } from 'lucide-react'
import type { AuditLog, AuditLogsResponse } from '../../types'
import { getAuditLogs } from '../../services/audit-service'
import { HistoriqueFilters, ACTION_OPTIONS, PERIOD_OPTIONS } from '../components/historique-filters'
import type { ActionFilter, PeriodFilter } from '../components/historique-filters'
import { AuditLogItem } from '../components/audit-log-item'

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

      <HistoriqueFilters
        action={actionFilter}
        onActionChange={setActionFilter}
        period={periodFilter}
        onPeriodChange={setPeriodFilter}
      />

      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground mb-6">
          {filtered.length} action{filtered.length !== 1 ? 's' : ''}
          {data?.total && data.total !== filtered.length ? ` sur ${data.total}` : ''}
        </p>
      )}

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
          <p className="text-muted-foreground text-sm">Erreur lors du chargement de l&apos;historique.</p>
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
