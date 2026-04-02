'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Institution, InstitutionSettings, AbonnementStatut } from '@/lib/types'

export async function updateInstitutionSettingsAction(settings: InstitutionSettings): Promise<Institution> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const institution = await prisma.institution.update({
    where: { id: institutionId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { settings: settings as any },
  })

  return {
    ...institution,
    abonnement_statut: institution.abonnement_statut as AbonnementStatut,
    settings: institution.settings as unknown as InstitutionSettings,
    created_at: institution.created_at.toISOString(),
  }
}
