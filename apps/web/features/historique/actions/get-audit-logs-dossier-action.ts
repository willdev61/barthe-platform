'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { AuditLog } from '@/lib/types'

export async function getAuditLogsForDossierAction(dossierId: string): Promise<AuditLog[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const logs = await prisma.auditLog.findMany({
    where: {
      institution_id: institutionId,
      entity_type: 'dossier',
      entity_id: dossierId,
    },
    orderBy: { created_at: 'desc' },
  })

  return logs.map((l): AuditLog => ({
    ...l,
    metadata: l.metadata as AuditLog['metadata'],
    created_at: l.created_at.toISOString(),
  }))
}
