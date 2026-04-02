'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Institution, AbonnementStatut, InstitutionSettings } from '@/lib/types'

export async function getMyInstitutionAction(): Promise<Institution> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  })
  if (!institution) throw new Error('Institution introuvable')

  return {
    ...institution,
    abonnement_statut: institution.abonnement_statut as AbonnementStatut,
    settings: institution.settings as unknown as InstitutionSettings | undefined,
    created_at: institution.created_at.toISOString(),
  }
}
