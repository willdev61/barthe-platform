'use server'

import { prisma } from '@/lib/db'
import type { AdminInstitution } from '@/lib/types'

const PAYS = [
  "Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Guinée',
  'Niger', 'Togo', 'Bénin', 'Cameroun', 'Gabon', 'Congo', 'RDC',
  'Madagascar', 'Maroc', 'Tunisie', 'Algérie', 'France', 'Autre',
]

export { PAYS }

export interface CreateInstitutionInput {
  nom: string
  email_admin: string
  pays: string
  abonnement_statut: 'trial' | 'actif'
  secteurs_cibles?: string
}

export async function createInstitutionAction(input: CreateInstitutionInput): Promise<AdminInstitution> {
  const existing = await prisma.institution.findUnique({ where: { email_admin: input.email_admin } })
  if (existing) throw new Error('Un compte avec cet email admin existe déjà.')

  const institution = await prisma.institution.create({
    data: {
      nom: input.nom,
      email_admin: input.email_admin,
      pays: input.pays,
      abonnement_statut: input.abonnement_statut,
      secteurs_cibles: input.secteurs_cibles || null,
    },
    include: { _count: { select: { dossiers: true } } },
  })

  return {
    id: institution.id,
    nom: institution.nom,
    email_admin: institution.email_admin,
    pays: institution.pays,
    abonnement_statut: institution.abonnement_statut,
    nb_dossiers: institution._count.dossiers,
    created_at: institution.created_at.toISOString(),
  }
}
