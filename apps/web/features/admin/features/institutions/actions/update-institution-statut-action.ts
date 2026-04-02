'use server'

import { prisma } from '@/lib/db'

export async function updateInstitutionStatutAction(
  id: string,
  statut: 'actif' | 'suspendu'
): Promise<void> {
  await prisma.institution.update({
    where: { id },
    data: { abonnement_statut: statut },
  })
}
