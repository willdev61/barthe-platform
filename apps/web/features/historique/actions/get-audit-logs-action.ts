'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { AuditLogsResponse, AuditLog } from '@/lib/types'

const PAGE_SIZE = 20

export async function getAuditLogsAction(params?: {
  page?: number
  action?: string
  start_date?: string
  end_date?: string
}): Promise<AuditLogsResponse> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const page = params?.page ?? 1
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    institution_id: institutionId,
    ...(params?.action ? { action: params.action } : {}),
    ...(params?.start_date || params?.end_date
      ? {
          created_at: {
            ...(params.start_date ? { gte: new Date(params.start_date) } : {}),
            ...(params.end_date ? { lte: new Date(params.end_date) } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    items: items.map((l): AuditLog => ({
      ...l,
      metadata: l.metadata as AuditLog['metadata'],
      created_at: l.created_at.toISOString(),
    })),
    total,
    page,
    limit: PAGE_SIZE,
  }
}
