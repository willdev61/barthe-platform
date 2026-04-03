'use server'

import { prisma } from '@/lib/db'

export async function updateInstitutionStatutAction(
  id: string,
  statut: 'actif' | 'inactif'
): Promise<void> {
  await prisma.institution.update({
    where: { id },
    data: {
      abonnement_statut: statut,
      // Quand on sort du trial (vers actif ou inactif), on efface les champs trial
      trial_end: null,
      dossiers_limit: null,
    },
  })
}
