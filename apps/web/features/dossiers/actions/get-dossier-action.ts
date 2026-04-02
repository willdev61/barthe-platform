'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { DossierComplet, DossierStatut, Analyse, Rapport } from '@/lib/types'

export async function getDossierAction(id: string): Promise<DossierComplet | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const dossier = await prisma.dossier.findUnique({
    where: { id, institution_id: institutionId },
    include: {
      analyse: true,
      rapports: { orderBy: { created_at: 'desc' } },
    },
  })

  if (!dossier) return null

  return {
    ...dossier,
    statut: dossier.statut as DossierStatut,
    created_at: dossier.created_at.toISOString(),
    updated_at: dossier.updated_at.toISOString(),
    analyse: dossier.analyse
      ? {
          ...dossier.analyse,
          donnees_normalisees: dossier.analyse.donnees_normalisees as unknown as Analyse['donnees_normalisees'],
          ratios: dossier.analyse.ratios as unknown as Analyse['ratios'],
          alertes: dossier.analyse.alertes as unknown as Analyse['alertes'],
          created_at: dossier.analyse.created_at.toISOString(),
        }
      : undefined,
    rapports: dossier.rapports.map((r): Rapport => ({
      ...r,
      created_at: r.created_at.toISOString(),
    })),
  }
}
