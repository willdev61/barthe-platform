'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export interface SubscriptionInfo {
  statut: string
  trial_end: string | null
  dossiers_limit: number | null
  nb_dossiers: number
  jours_restants: number | null
}

export async function getMySubscriptionAction(): Promise<SubscriptionInfo | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) return null

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: {
      abonnement_statut: true,
      trial_end: true,
      dossiers_limit: true,
      _count: { select: { dossiers: true } },
    },
  })
  if (!institution) return null

  const joursRestants = institution.trial_end
    ? Math.max(0, Math.ceil((institution.trial_end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return {
    statut: institution.abonnement_statut,
    trial_end: institution.trial_end ? institution.trial_end.toISOString() : null,
    dossiers_limit: institution.dossiers_limit,
    nb_dossiers: institution._count.dossiers,
    jours_restants: joursRestants,
  }
}
