'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function deleteDossierAction(id: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  await prisma.dossier.delete({
    where: { id, institution_id: institutionId },
  })
}
