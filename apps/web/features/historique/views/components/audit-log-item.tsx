'use client'

import { useState } from 'react'
import { History, FolderPlus, BarChart2, FileDown, UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/types'
import type { AuditLog } from '../../types'

function getActionConfig(action: string): {
  label: string
  icon: React.ElementType
  color: string
  bg: string
} {
  switch (action) {
    case 'dossier.created':  return { label: 'Dossier créé',        icon: FolderPlus, color: 'text-blue-600',   bg: 'bg-blue-50' }
    case 'analyse.run':      return { label: 'Analyse lancée',       icon: BarChart2,  color: 'text-purple-600', bg: 'bg-purple-50' }
    case 'rapport.exported': return { label: 'Rapport exporté',      icon: FileDown,   color: 'text-green-600',  bg: 'bg-green-50' }
    case 'user.invited':     return { label: 'Invitation envoyée',   icon: UserPlus,   color: 'text-orange-600', bg: 'bg-orange-50' }
    default:                 return { label: action,                  icon: History,    color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

interface AuditLogItemProps {
  log: AuditLog
}

export function AuditLogItem({ log }: AuditLogItemProps) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getActionConfig(log.action)
  const Icon = cfg.icon
  const hasMetadata = Object.keys(log.metadata).length > 0

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className={cn('flex items-center justify-center w-9 h-9 rounded-full', cfg.bg)}>
          <Icon className={cn('w-4 h-4', cfg.color)} />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>

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
