'use client'

import { useState, useEffect, useCallback } from 'react'
import { Key, Plus, Trash2, Copy, Check, Terminal } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import type { ApiKey } from '../../types'
import { getApiKeys, revokeApiKey } from '../../services/api-keys-service'
import { GenerateKeyModal } from '../dialogs/generate-key-modal'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function PermissionBadge({ perm }: { perm: string }) {
  const colors: Record<string, string> = {
    'analyses:read': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'analyses:write': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'dossiers:read': 'bg-muted text-muted-foreground',
  }
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[perm] ?? 'bg-muted text-muted-foreground')}>{perm}</span>
}

function KeySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3 py-4 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-muted shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 bg-muted rounded" />
            <div className="h-3 w-64 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DocsSection() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const examples = [
    { label: 'Soumettre un BP pour analyse', code: `curl -X POST https://api.barthe.ci/public/v1/analyses \\\n  -H "X-Api-Key: bth_xxxxxxxxxxxx" \\\n  -F "file=@business_plan.pdf" \\\n  -F "nom_projet=Mon Projet"` },
    { label: "Récupérer le résultat d'une analyse", code: `curl https://api.barthe.ci/public/v1/analyses/{analyse_id} \\\n  -H "X-Api-Key: bth_xxxxxxxxxxxx"` },
    { label: 'Lister les dossiers', code: `curl https://api.barthe.ci/public/v1/dossiers \\\n  -H "X-Api-Key: bth_xxxxxxxxxxxx"` },
  ]

  const handleCopy = async (code: string, idx: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Documentation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Exemples d&apos;intégration avec votre clé API</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Base URL :</span> <code className="font-mono">https://api.barthe.ci</code>
          <span className="mx-2">·</span>
          <span className="font-medium text-foreground">Auth :</span> <code className="font-mono">X-Api-Key: bth_…</code>
        </div>
        {examples.map((ex, idx) => (
          <div key={idx}>
            <p className="text-xs font-medium text-foreground mb-1.5">{ex.label}</p>
            <div className="relative group">
              <pre className="bg-muted/80 rounded-lg px-4 py-3 text-xs font-mono text-foreground overflow-x-auto">{ex.code}</pre>
              <button onClick={() => handleCopy(ex.code, idx)} className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity" title="Copier">
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ApiKeysPage() {
  const { data: session } = useSession()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const token = (session?.session as any)?.token as string | undefined

  const loadKeys = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      setKeys(await getApiKeys(token))
    } catch {
      setError('Impossible de charger les clés API')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (token) loadKeys() }, [token, loadKeys])

  const handleRevoke = async (keyId: string) => {
    if (!token) return
    setRevokingId(keyId)
    try {
      await revokeApiKey(token, keyId)
      setKeys((prev) => prev.filter((k) => k.id !== keyId))
    } catch {
      setError('Erreur lors de la révocation de la clé')
    } finally {
      setRevokingId(null)
    }
  }

  const activeKeys = keys.filter((k) => k.is_active)

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Clés API</h1>
        <p className="text-muted-foreground mt-1 text-sm">Intégrez BARTHE dans vos systèmes via des clés API sécurisées</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                <Key className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Clés actives</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{activeKeys.length} clé{activeKeys.length !== 1 ? 's' : ''} active{activeKeys.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button onClick={() => setShowGenerate(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Générer une clé
            </button>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4">{error}</p>}

          {loading ? <KeySkeleton /> : activeKeys.length === 0 ? (
            <div className="py-8 text-center">
              <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune clé API active</p>
              <p className="text-xs text-muted-foreground mt-1">Générez une clé pour commencer l&apos;intégration</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeKeys.map((key) => (
                <div key={key.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0 mt-0.5">
                    <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{key.nom}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">{key.permissions.map((p) => <PermissionBadge key={p} perm={p} />)}</div>
                    <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Créée le {formatDate(key.created_at)}</span>
                      {key.last_used_at && <span>Dernière utilisation : {formatDate(key.last_used_at)}</span>}
                      {key.expires_at && <span>Expire le {formatDate(key.expires_at)}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleRevoke(key.id)} disabled={revokingId === key.id} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 shrink-0" title="Révoquer cette clé">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DocsSection />
      </div>

      {showGenerate && token && (
        <GenerateKeyModal token={token} onClose={() => setShowGenerate(false)} onCreated={loadKeys} />
      )}
    </div>
  )
}
