'use server'

import { prisma } from '@/lib/db'
import type { AdminInstitution } from '@/lib/types'

export interface UpdateInstitutionInput {
  id: string
  nom: string
  pays: string
  abonnement_statut: 'actif' | 'inactif' | 'trial'
  trial_end?: string | null
  dossiers_limit?: number | null
  secteurs_cibles?: string | null
}

export async function updateInstitutionAction(input: UpdateInstitutionInput): Promise<AdminInstitution> {
  const institution = await prisma.institution.update({
    where: { id: input.id },
    data: {
      nom: input.nom,
      pays: input.pays,
      abonnement_statut: input.abonnement_statut,
      trial_end: input.trial_end ? new Date(input.trial_end) : null,
      dossiers_limit: input.dossiers_limit ?? null,
      secteurs_cibles: input.secteurs_cibles || null,
    },
    include: { _count: { select: { dossiers: true } } },
  })

  return {
    id: institution.id,
    nom: institution.nom,
    email_admin: institution.email_admin,
    pays: institution.pays,
    secteurs_cibles: institution.secteurs_cibles,
    abonnement_statut: institution.abonnement_statut,
    nb_dossiers: institution._count.dossiers,
    created_at: institution.created_at.toISOString(),
    trial_end: institution.trial_end ? institution.trial_end.toISOString() : null,
    dossiers_limit: institution.dossiers_limit,
  }
}
