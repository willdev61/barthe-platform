'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { updateInstitutionAction } from '../../actions/update-institution-action'
import { PAYS, PAYS_ISO } from '../../constants'
import type { AdminInstitution } from '@/features/admin/types'
import { toast } from 'sonner'

const schema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  pays: z.string().min(1, 'Veuillez sélectionner un pays'),
  abonnement_statut: z.enum(['actif', 'inactif', 'trial']),
  trial_end: z.string().optional(),
  dossiers_limit: z.coerce.number().min(1).max(999).optional().nullable(),
  secteurs_cibles: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EditInstitutionDialogProps {
  institution: AdminInstitution
  onClose: () => void
  onUpdated: (institution: AdminInstitution) => void
}

export function EditInstitutionDialog({ institution, onClose, onUpdated }: EditInstitutionDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: institution.nom,
      pays: institution.pays,
      abonnement_statut: institution.abonnement_statut as 'actif' | 'inactif' | 'trial',
      trial_end: institution.trial_end
        ? new Date(institution.trial_end).toISOString().split('T')[0]
        : undefined,
      dossiers_limit: institution.dossiers_limit ?? undefined,
      secteurs_cibles: institution.secteurs_cibles ?? '',
    },
  })

  const selectedPays = watch('pays')
  const selectedStatut = watch('abonnement_statut')
  const isTrial = selectedStatut === 'trial'

  const onSubmit = async (values: FormValues) => {
    try {
      const updated = await updateInstitutionAction({
        id: institution.id,
        nom: values.nom,
        pays: values.pays,
        abonnement_statut: values.abonnement_statut,
        trial_end: isTrial && values.trial_end ? values.trial_end : null,
        dossiers_limit: isTrial ? (values.dossiers_limit ?? null) : null,
        secteurs_cibles: values.secteurs_cibles || null,
      })
      toast.success('Institution mise à jour', { description: updated.nom })
      onUpdated(updated)
    } catch (err) {
      toast.error('Erreur', { description: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' })
    }
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${
      hasError
        ? 'border-destructive focus:ring-destructive/30 focus:border-destructive'
        : 'border-input focus:ring-primary/30 focus:border-primary'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-semibold text-foreground">Modifier l&apos;institution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{institution.email_admin}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nom de l&apos;institution <span className="text-destructive">*</span>
            </label>
            <input
              {...register('nom')}
              placeholder="Banque Nationale de Développement"
              className={fieldClass(!!errors.nom)}
            />
            {errors.nom && <p className="text-xs text-destructive mt-1">{errors.nom.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pays <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                {PAYS_ISO[selectedPays] && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ReactCountryFlag countryCode={PAYS_ISO[selectedPays]} svg style={{ width: '1.2em', height: '1.2em' }} />
                  </span>
                )}
                <select
                  {...register('pays')}
                  className={`${fieldClass(!!errors.pays)} ${PAYS_ISO[selectedPays] ? 'pl-9' : ''} appearance-none`}
                >
                  {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {errors.pays && <p className="text-xs text-destructive mt-1">{errors.pays.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Statut <span className="text-destructive">*</span>
              </label>
              <select {...register('abonnement_statut')} className={fieldClass()}>
                <option value="trial">Trial</option>
                <option value="actif">ACTIF</option>
                <option value="inactif">INACTIF</option>
              </select>
            </div>
          </div>

          {isTrial && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1.5">
                  Date d&apos;expiration
                </label>
                <input
                  {...register('trial_end')}
                  type="date"
                  className={fieldClass(!!errors.trial_end)}
                />
                <p className="text-xs text-amber-700 mt-1">Laissez vide pour ne pas modifier</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1.5">
                  Limite dossiers
                </label>
                <input
                  {...register('dossiers_limit')}
                  type="number"
                  min={1}
                  max={999}
                  className={fieldClass(!!errors.dossiers_limit)}
                />
                {errors.dossiers_limit && (
                  <p className="text-xs text-destructive mt-1">{errors.dossiers_limit.message}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Secteurs cibles <span className="text-muted-foreground text-xs font-normal">(optionnel)</span>
            </label>
            <input
              {...register('secteurs_cibles')}
              placeholder="Agriculture, Industrie, Commerce..."
              className={fieldClass()}
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
