'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { createInstitutionAction } from '../../actions/create-institution-action'
import { PAYS, PAYS_ISO } from '../../constants'
import type { AdminInstitution } from '@/features/admin/types'
import { toast } from 'sonner'

const schema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email_admin: z.string().email('Adresse email invalide'),
  pays: z.string().min(1, 'Veuillez sélectionner un pays'),
  abonnement_statut: z.enum(['actif', 'inactif', 'trial']),
  trial_duration_days: z.coerce.number().min(1).max(365).optional(),
  dossiers_limit: z.coerce.number().min(1).max(999).optional(),
  secteurs_cibles: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateInstitutionDialogProps {
  onClose: () => void
  onCreated: (institution: AdminInstitution) => void
}

export function CreateInstitutionDialog({ onClose, onCreated }: CreateInstitutionDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      email_admin: '',
      pays: "Côte d'Ivoire",
      abonnement_statut: 'trial',
      trial_duration_days: 30,
      dossiers_limit: 5,
      secteurs_cibles: '',
    },
  })

  const selectedPays = watch('pays')
  const selectedStatut = watch('abonnement_statut')
  const isTrial = selectedStatut === 'trial'

  const onSubmit = async (values: FormValues) => {
    try {
      const institution = await createInstitutionAction({
        nom: values.nom,
        email_admin: values.email_admin,
        pays: values.pays,
        abonnement_statut: values.abonnement_statut,
        trial_duration_days: isTrial ? values.trial_duration_days : undefined,
        dossiers_limit: isTrial ? values.dossiers_limit : undefined,
        secteurs_cibles: values.secteurs_cibles,
      })
      toast.success('Institution créée', { description: `${institution.nom} a été créée avec succès.` })
      onCreated(institution)
    } catch (err) {
      toast.error('Erreur', { description: err instanceof Error ? err.message : 'Erreur lors de la création' })
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
            <h2 className="text-base font-semibold text-foreground">Nouvelle institution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Créer un accès pour une institution financière</p>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email de l&apos;administrateur <span className="text-destructive">*</span>
            </label>
            <input
              {...register('email_admin')}
              type="email"
              placeholder="admin@institution.ci"
              className={fieldClass(!!errors.email_admin)}
            />
            {errors.email_admin
              ? <p className="text-xs text-destructive mt-1">{errors.email_admin.message}</p>
              : <p className="text-xs text-muted-foreground mt-1">Cet email sera utilisé pour les invitations et la gestion du compte.</p>
            }
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
                <option value="trial">Trial (période d&apos;essai)</option>
                <option value="actif">ACTIF</option>
                <option value="inactif">INACTIF</option>
              </select>
            </div>
          </div>

          {/* Champs trial */}
          {isTrial && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1.5">
                  Durée (jours) <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('trial_duration_days')}
                  type="number"
                  min={1}
                  max={365}
                  className={fieldClass(!!errors.trial_duration_days)}
                />
                {errors.trial_duration_days && (
                  <p className="text-xs text-destructive mt-1">{errors.trial_duration_days.message}</p>
                )}
                <p className="text-xs text-amber-700 mt-1">Expiration automatique après ce délai</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1.5">
                  Limite dossiers <span className="text-destructive">*</span>
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
                <p className="text-xs text-amber-700 mt-1">Nombre maximum de dossiers</p>
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
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Création…</> : 'Créer l\'institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
