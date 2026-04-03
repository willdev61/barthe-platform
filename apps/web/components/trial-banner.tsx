'use client'

import useSWR from 'swr'
import { AlertTriangle, Clock, XCircle, FolderOpen } from 'lucide-react'
import { getMySubscriptionAction } from '@/features/subscription/actions/get-my-subscription-action'
import { cn } from '@/lib/utils'

export function TrialBanner() {
  const { data } = useSWR('my-subscription', getMySubscriptionAction)

  if (!data) return null

  const { statut, jours_restants, dossiers_limit, nb_dossiers } = data

  if (statut === 'actif') return null

  const isExpired = statut === 'trial' && jours_restants !== null && jours_restants <= 0
  const isInactif = statut === 'inactif'
  const isCritical = isInactif || isExpired || (jours_restants !== null && jours_restants <= 5)
  const isWarning = !isCritical && jours_restants !== null && jours_restants <= 15

  if (statut === 'trial' && !isExpired && jours_restants !== null && jours_restants > 15) return null

  return (
    <div className={cn(
      'flex items-center gap-3 px-5 py-3 text-sm border-b shrink-0',
      isCritical
        ? 'bg-destructive/10 border-destructive/20 text-destructive'
        : 'bg-amber-50 border-amber-200 text-amber-800'
    )}>
      {isInactif || isExpired
        ? <XCircle className="w-4 h-4 shrink-0" />
        : <AlertTriangle className="w-4 h-4 shrink-0" />
      }

      <span className="flex-1">
        {isInactif && 'Votre compte est inactif. Contactez votre administrateur pour réactiver l\'accès.'}
        {isExpired && 'Votre période d\'essai a expiré. Contactez votre administrateur pour activer votre abonnement.'}
        {!isInactif && !isExpired && statut === 'trial' && (
          <>
            Période d&apos;essai —{' '}
            <strong>
              {jours_restants === 0 ? 'expire aujourd\'hui' : `${jours_restants} jour${(jours_restants ?? 0) > 1 ? 's' : ''} restant${(jours_restants ?? 0) > 1 ? 's' : ''}`}
            </strong>
            {dossiers_limit !== null && (
              <span className="ml-3 inline-flex items-center gap-1 opacity-80">
                <FolderOpen className="w-3.5 h-3.5" />
                {nb_dossiers} / {dossiers_limit} dossiers utilisés
              </span>
            )}
          </>
        )}
      </span>

      {!isInactif && !isExpired && (
        <span className={cn(
          'hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          isCritical ? 'bg-destructive/20' : 'bg-amber-200'
        )}>
          <Clock className="w-3 h-3" />
          TRIAL
        </span>
      )}
    </div>
  )
}
