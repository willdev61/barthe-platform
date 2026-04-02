'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { organization } from '@/lib/auth-client'

const ROLES = [
  { value: 'admin',    label: 'Admin',        description: 'Accès complet à toutes les fonctionnalités' },
  { value: 'analyste', label: 'Analyste',     description: 'Peut créer et analyser des dossiers' },
  { value: 'lecture',  label: 'Lecture seule', description: 'Consultation des dossiers uniquement' },
] as const

type InviteRole = typeof ROLES[number]['value']

interface InviteModalProps {
  orgId: string
  onClose: () => void
  onSuccess: () => void
}

export function InviteModal({ orgId, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('analyste')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await organization.inviteMember({ email, role, organizationId: orgId })

    if (error) {
      setError(error.message || "Erreur lors de l'envoi de l'invitation")
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">Inviter un membre</h3>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nouveau@institution.ci"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Rôle</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
                    role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-accent',
                  )}
                >
                  <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0', role === r.value ? 'border-primary' : 'border-muted-foreground')}>
                    {role === r.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity">
              {loading ? 'Envoi…' : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
