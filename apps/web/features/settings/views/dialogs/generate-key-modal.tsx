'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createApiKeyAction } from '../../actions/api-keys-action'

const ALL_PERMISSIONS = ['analyses:read', 'analyses:write', 'dossiers:read']

interface GenerateKeyModalProps {
  onClose: () => void
  onCreated: () => void
}

export function GenerateKeyModal({ onClose, onCreated }: GenerateKeyModalProps) {
  const [nom, setNom] = useState('')
  const [permissions, setPermissions] = useState<string[]>([...ALL_PERMISSIONS])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const togglePermission = (perm: string) =>
    setPermissions((prev) => prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await createApiKeyAction({ nom: nom.trim(), permissions })
      setGeneratedKey(data.key)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">
            {generatedKey ? 'Clé générée' : 'Nouvelle clé API'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">
                Copiez cette clé maintenant — elle ne sera plus affichée.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono text-amber-900 dark:text-amber-200 break-all">{generatedKey}</code>
                <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors" title="Copier">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-amber-700 dark:text-amber-300" />}
                </button>
              </div>
            </div>
            <button onClick={onClose} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              J&apos;ai copié ma clé
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nom de la clé</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Intégration ERP, CI/CD pipeline…"
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Permissions</label>
              <div className="space-y-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors', permissions.includes(perm) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent')}>
                    <input type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} className="rounded border-input" />
                    <code className="text-xs font-mono text-foreground">{perm}</code>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading || permissions.length === 0} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity">
                {loading ? 'Génération…' : 'Générer la clé'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
