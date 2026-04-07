import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createNotification,
  createNotificationsForAdmins,
} from '@/features/notifications/services/notification-service'
import {
  sendAnalyseTermineeEmail,
  sendAnalyseEchoueeEmail,
} from '@/lib/mailer'
import type { NotificationType } from '@/features/notifications/types'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.INTERNAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    type: NotificationType
    institution_id: string
    user_id: string | null
    metadata: Record<string, unknown>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, institution_id, user_id, metadata } = body

  try {
    switch (type) {
      case 'ANALYSE_TERMINEE': {
        if (!user_id) break
        const notification = await createNotification({
          user_id,
          institution_id,
          type,
          title: 'Analyse terminée',
          message: `Le dossier "${metadata.dossier_nom}" a été analysé. Score : ${metadata.score}/100`,
          metadata,
        })

        // Send email fire-and-forget
        const user = await prisma.user.findUnique({ where: { id: user_id } })
        if (user) {
          sendAnalyseTermineeEmail({
            to: user.email,
            userName: user.nom,
            dossierNom: String(metadata.dossier_nom ?? ''),
            score: Number(metadata.score ?? 0),
            dossierId: String(metadata.dossier_id ?? ''),
          }).catch(() => null)
        }
        break
      }

      case 'ANALYSE_ECHOUEE': {
        if (!user_id) break
        await createNotification({
          user_id,
          institution_id,
          type,
          title: 'Échec de l\'analyse',
          message: `L'analyse du dossier "${metadata.dossier_nom}" a échoué. Vérifiez le fichier et réessayez.`,
          metadata,
        })

        const user = await prisma.user.findUnique({ where: { id: user_id } })
        if (user) {
          sendAnalyseEchoueeEmail({
            to: user.email,
            userName: user.nom,
            dossierNom: String(metadata.dossier_nom ?? ''),
          }).catch(() => null)
        }
        break
      }

      case 'ALERTE_CRITIQUE': {
        if (!user_id) break
        // Notify creator
        await createNotification({
          user_id,
          institution_id,
          type,
          title: 'Alerte critique détectée',
          message: `Des alertes critiques ont été détectées dans le dossier "${metadata.dossier_nom}".`,
          metadata,
        })
        // Also notify admins (may duplicate if creator is admin — acceptable)
        await createNotificationsForAdmins(institution_id, {
          type,
          title: 'Alerte critique détectée',
          message: `Des alertes critiques ont été détectées dans le dossier "${metadata.dossier_nom}".`,
          metadata,
        })
        break
      }

      case 'RAPPORT_PRET': {
        if (!user_id) break
        await createNotification({
          user_id,
          institution_id,
          type,
          title: 'Rapport PDF prêt',
          message: `Le rapport pour "${metadata.dossier_nom}" est disponible au téléchargement.`,
          metadata,
        })
        break
      }

      case 'API_KEY_PREMIERE_UTILISATION': {
        await createNotificationsForAdmins(institution_id, {
          type,
          title: 'Clé API utilisée',
          message: `La clé API "${metadata.key_nom}" a été utilisée pour la première fois.`,
          metadata,
        })
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notifications/webhook]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
