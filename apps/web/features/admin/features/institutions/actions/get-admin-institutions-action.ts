'use server'

import { prisma } from '@/lib/db'
import type { AdminInstitution } from '@/lib/types'

export async function getAdminInstitutionsAction(): Promise<AdminInstitution[]> {
  const institutions = await prisma.institution.findMany({
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { dossiers: true } } },
  })

  return institutions.map((i) => ({
    id: i.id,
    nom: i.nom,
    email_admin: i.email_admin,
    pays: i.pays,
    secteurs_cibles: i.secteurs_cibles,
    abonnement_statut: i.abonnement_statut,
    nb_dossiers: i._count.dossiers,
    created_at: i.created_at.toISOString(),
    trial_end: i.trial_end ? i.trial_end.toISOString() : null,
    dossiers_limit: i.dossiers_limit,
  }))
}
