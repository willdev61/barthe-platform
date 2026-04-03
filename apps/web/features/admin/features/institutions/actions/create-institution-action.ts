'use server'

import { prisma } from '@/lib/db'
import type { AdminInstitution } from '@/lib/types'

export interface CreateInstitutionInput {
  nom: string
  email_admin: string
  pays: string
  abonnement_statut: 'actif' | 'inactif' | 'trial'
  trial_duration_days?: number
  dossiers_limit?: number
  secteurs_cibles?: string
}

export async function createInstitutionAction(input: CreateInstitutionInput): Promise<AdminInstitution> {
  const existing = await prisma.institution.findUnique({ where: { email_admin: input.email_admin } })
  if (existing) throw new Error('Un compte avec cet email admin existe déjà.')

  const trialEnd = input.abonnement_statut === 'trial' && input.trial_duration_days
    ? new Date(Date.now() + input.trial_duration_days * 24 * 60 * 60 * 1000)
    : null

  const institution = await prisma.institution.create({
    data: {
      nom: input.nom,
      email_admin: input.email_admin,
      pays: input.pays,
      abonnement_statut: input.abonnement_statut,
      trial_end: trialEnd,
      dossiers_limit: input.abonnement_statut === 'trial' ? (input.dossiers_limit ?? 5) : null,
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
    trial_end: institution.trial_end ? institution.trial_end.toISOString() : null,
    dossiers_limit: institution.dossiers_limit,
  }
}
