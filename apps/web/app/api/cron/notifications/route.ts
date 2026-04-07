import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createNotification,
  notificationExistsInLast26h,
} from '@/features/notifications/services/notification-service'
import {
  sendTrialExpirationEmail,
  sendApiKeyExpirationEmail,
} from '@/lib/mailer'
import type { NotificationType } from '@/features/notifications/types'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = { trial: 0, api_keys: 0 }

  // ── Trial expiration notifications ──────────────────────────────────────────
  const trialInstitutions = await prisma.institution.findMany({
    where: { abonnement_statut: 'trial', trial_end: { not: null } },
    include: { users: { where: { role: 'admin' }, select: { id: true, nom: true, email: true } } },
  })

  for (const inst of trialInstitutions) {
    if (!inst.trial_end) continue
    const now = new Date()
    const diffMs = inst.trial_end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    let notifType: NotificationType | null = null
    let joursRestants = 0
    if (diffDays <= 0) { notifType = 'TRIAL_EXPIRE'; joursRestants = 0 }
    else if (diffDays === 1) { notifType = 'TRIAL_EXPIRE_1J'; joursRestants = 1 }
    else if (diffDays <= 3) { notifType = 'TRIAL_EXPIRE_3J'; joursRestants = 3 }
    else if (diffDays <= 7) { notifType = 'TRIAL_EXPIRE_7J'; joursRestants = 7 }

    if (!notifType) continue

    const alreadySent = await notificationExistsInLast26h(inst.id, notifType)
    if (alreadySent) continue

    const title = joursRestants === 0 ? 'Période d\'essai expirée' : `Essai expire dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`
    const message = joursRestants === 0
      ? 'Votre accès a été suspendu. Contactez votre administrateur pour activer votre abonnement.'
      : `Votre période d'essai expire dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}. Contactez-nous pour continuer.`

    for (const admin of inst.users) {
      await createNotification({
        user_id: admin.id,
        institution_id: inst.id,
        type: notifType,
        title,
        message,
        metadata: { institution_nom: inst.nom, jours_restants: joursRestants },
      })

      sendTrialExpirationEmail({
        to: admin.email,
        userName: admin.nom,
        institutionNom: inst.nom,
        joursRestants,
      }).catch(() => null)

      results.trial++
    }
  }

  // ── API Key expiration notifications (7 days) ────────────────────────────────
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const expiringKeys = await prisma.apiKey.findMany({
    where: {
      is_active: true,
      expires_at: { lte: in7Days, gt: new Date() },
    },
    include: {
      institution: {
        include: {
          users: { where: { role: 'admin' }, select: { id: true, nom: true, email: true } },
        },
      },
    },
  })

  for (const key of expiringKeys) {
    const alreadySent = await notificationExistsInLast26h(key.institution_id, 'API_KEY_EXPIRE_7J')
    if (alreadySent) continue

    const expiresAtFormatted = key.expires_at!.toLocaleDateString('fr-FR')

    for (const admin of key.institution.users) {
      await createNotification({
        user_id: admin.id,
        institution_id: key.institution_id,
        type: 'API_KEY_EXPIRE_7J',
        title: 'Clé API bientôt expirée',
        message: `La clé API "${key.nom}" expire le ${expiresAtFormatted}.`,
        metadata: { key_id: key.id, key_nom: key.nom, expires_at: key.expires_at!.toISOString() },
      })

      sendApiKeyExpirationEmail({
        to: admin.email,
        adminName: admin.nom,
        keyName: key.nom,
        expiresAt: expiresAtFormatted,
      }).catch(() => null)

      results.api_keys++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
