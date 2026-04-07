'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createDossierSchema } from '../schemas/dossier-schema'
import type { Dossier, DossierStatut } from '@/lib/types'
import { createNotificationsForAdmins, createNotificationsForAll } from '@/features/notifications/services/notification-service'
import { sendLimiteDossiersEmail } from '@/lib/mailer'

export async function createDossierAction(data: unknown): Promise<Dossier> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { abonnement_statut: true, trial_end: true, dossiers_limit: true },
  })
  if (!institution) throw new Error('Institution introuvable')

  if (institution.abonnement_statut === 'inactif') {
    throw new Error('Votre compte est inactif. Contactez votre administrateur.')
  }

  if (institution.abonnement_statut === 'trial') {
    if (institution.trial_end && new Date() > institution.trial_end) {
      throw new Error('Votre période d\'essai a expiré. Contactez votre administrateur.')
    }
    if (institution.dossiers_limit !== null) {
      const count = await prisma.dossier.count({ where: { institution_id: institutionId } })
      if (count >= institution.dossiers_limit) {
        throw new Error(`Limite de ${institution.dossiers_limit} dossiers atteinte en période d'essai.`)
      }
      // Notify at 80% threshold (fire-and-forget)
      const ratio = count / institution.dossiers_limit
      if (ratio >= 0.8 && ratio < 1) {
        createNotificationsForAdmins(institutionId, {
          type: 'LIMITE_80',
          title: '80% de la limite de dossiers atteinte',
          message: `Vous avez utilisé ${count} dossiers sur ${institution.dossiers_limit} disponibles.`,
          metadata: { count, limit: institution.dossiers_limit },
        }).catch(() => null)
      }
    }
  }

  const parsed = createDossierSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const dossier = await prisma.dossier.create({
    data: {
      institution_id: institutionId,
      created_by: session.user.id,
      nom_projet: parsed.data.nom_projet,
      fichier_nom: parsed.data.fichier_nom,
    },
  })

  // Notify if limit just reached (fire-and-forget)
  if (institution.dossiers_limit !== null) {
    const newCount = await prisma.dossier.count({ where: { institution_id: institutionId } })
    if (newCount >= institution.dossiers_limit) {
      const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { nom: true } })
      const admins = await prisma.user.findMany({
        where: { institution_id: institutionId, role: 'admin' },
        select: { id: true, nom: true, email: true },
      })
      createNotificationsForAll(institutionId, {
        type: 'LIMITE_100',
        title: 'Limite de dossiers atteinte',
        message: `La limite de ${institution.dossiers_limit} dossiers est atteinte. Aucun nouveau dossier ne peut être créé.`,
        metadata: { limit: institution.dossiers_limit },
      }).catch(() => null)
      for (const admin of admins) {
        sendLimiteDossiersEmail({
          to: admin.email,
          userName: admin.nom,
          institutionNom: inst?.nom ?? institutionId,
          limit: institution.dossiers_limit,
        }).catch(() => null)
      }
    }
  }

  return {
    ...dossier,
    statut: dossier.statut as DossierStatut,
    created_at: dossier.created_at.toISOString(),
    updated_at: dossier.updated_at.toISOString(),
  }
}
