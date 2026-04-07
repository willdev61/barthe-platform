'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { authClient } from '@/lib/auth-client'
import { X, User, KeyRound, Loader2, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Tab = 'info' | 'password'

interface ProfileDialogProps {
  open: boolean
  onClose: () => void
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const [tab, setTab] = useState<Tab>('info')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Mon profil</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          <button
            onClick={() => setTab('info')}
            className={cn(
              'flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors mr-6',
              tab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="w-4 h-4" />
            Informations
          </button>
          <button
            onClick={() => setTab('password')}
            className={cn(
              'flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === 'password' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <KeyRound className="w-4 h-4" />
            Mot de passe
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'info' ? <InfoForm onClose={onClose} /> : <PasswordForm onClose={onClose} />}
        </div>
      </div>
    </div>
  )
}

function InfoForm({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    const { error } = await authClient.updateUser({ name })
    setLoading(false)
    if (error) { setStatus('error'); return }
    setStatus('success')
    setTimeout(onClose, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jean Dupont"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={session?.user?.email ?? ''}
          disabled
          className="opacity-60 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié ici.</p>
      </div>
      {status === 'error' && <p className="text-sm text-destructive">Une erreur s&apos;est produite.</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || status === 'success'}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {status === 'success' ? <><Check className="w-4 h-4" /> Sauvegardé</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</> : 'Sauvegarder'}
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    const { error: apiError } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false })
    setLoading(false)
    if (apiError) { setError('Mot de passe actuel incorrect.'); return }
    setSuccess(true)
    setTimeout(onClose, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current">Mot de passe actuel</Label>
        <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new">Nouveau mot de passe</Label>
        <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8 caractères minimum" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmer</Label>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || success}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {success ? <><Check className="w-4 h-4" /> Modifié</> : loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Modification…</> : 'Modifier le mot de passe'}
        </button>
      </div>
    </form>
  )
}
