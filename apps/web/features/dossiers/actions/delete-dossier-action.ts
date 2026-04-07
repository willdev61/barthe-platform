'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotificationsForAdmins } from '@/features/notifications/services/notification-service'

export async function deleteDossierAction(id: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const dossier = await prisma.dossier.findUnique({
    where: { id, institution_id: institutionId },
    select: { nom_projet: true },
  })

  await prisma.dossier.delete({
    where: { id, institution_id: institutionId },
  })

  if (dossier) {
    createNotificationsForAdmins(institutionId, {
      type: 'DOSSIER_SUPPRIME',
      title: 'Dossier supprimé',
      message: `Le dossier "${dossier.nom_projet}" a été supprimé par ${session.user.name ?? session.user.email}.`,
      metadata: { dossier_id: id, dossier_nom: dossier.nom_projet, supprime_par: session.user.id },
    }).catch(() => null)
  }
}
