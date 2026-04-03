'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createInstitutionAction, PAYS, type CreateInstitutionInput } from '../../actions/create-institution-action'
import type { AdminInstitution } from '@/features/admin/types'

interface CreateInstitutionDialogProps {
  onClose: () => void
  onCreated: (institution: AdminInstitution) => void
}

const STATUTS = [
  { value: 'trial', label: 'Trial (période d\'essai)' },
  { value: 'actif', label: 'Actif (abonnement)' },
]

export function CreateInstitutionDialog({ onClose, onCreated }: CreateInstitutionDialogProps) {
  const [form, setForm] = useState<CreateInstitutionInput>({
    nom: '',
    email_admin: '',
    pays: "Côte d'Ivoire",
    abonnement_statut: 'trial',
    secteurs_cibles: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: keyof CreateInstitutionInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const institution = await createInstitutionAction(form)
      onCreated(institution)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Nouvelle institution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Créer un accès pour une institution financière</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom de l&apos;institution <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              placeholder="Banque Nationale de Développement"
              required
              className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email de l&apos;administrateur <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={form.email_admin}
              onChange={(e) => set('email_admin', e.target.value)}
              placeholder="admin@institution.ci"
              required
              className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">Cet email sera utilisé pour les invitations et la gestion du compte.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pays <span className="text-destructive">*</span>
              </label>
              <select
                value={form.pays}
                onChange={(e) => set('pays', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {PAYS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Statut abonnement <span className="text-destructive">*</span>
              </label>
              <select
                value={form.abonnement_statut}
                onChange={(e) => set('abonnement_statut', e.target.value as 'trial' | 'actif')}
                className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Secteurs cibles <span className="text-muted-foreground text-xs font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.secteurs_cibles}
              onChange={(e) => set('secteurs_cibles', e.target.value)}
              placeholder="Agriculture, Industrie, Commerce..."
              className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 px-4 py-3 rounded-xl">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création…
                </>
              ) : (
                'Créer l\'institution'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
