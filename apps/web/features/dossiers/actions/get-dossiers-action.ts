'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Dossier, DossierStatut } from '@/lib/types'

export async function getDossiersAction(): Promise<Dossier[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const dossiers = await prisma.dossier.findMany({
    where: { institution_id: institutionId },
    orderBy: { created_at: 'desc' },
  })

  return dossiers.map((d) => ({
    ...d,
    statut: d.statut as DossierStatut,
    created_at: d.created_at.toISOString(),
    updated_at: d.updated_at.toISOString(),
  }))
}
