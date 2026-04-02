'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { ComparatifItem, RatioFinancier } from '@/lib/types'

export async function getComparatifAction(ids: string[]): Promise<ComparatifItem[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Non authentifié')

  const institutionId = session.session.activeOrganizationId
  if (!institutionId) throw new Error('Aucune institution active')

  const dossiers = await prisma.dossier.findMany({
    where: { id: { in: ids }, institution_id: institutionId },
    include: { analyse: true },
  })

  return dossiers.map((d) => {
    const ratios = (d.analyse?.ratios ?? {}) as unknown as Record<string, RatioFinancier>
    const donnees = (d.analyse?.donnees_normalisees ?? {}) as unknown as {
      chiffre_affaires: number | null
      ebitda: number | null
      dette_financiere: number | null
    }

    return {
      id: d.id,
      nom_projet: d.nom_projet,
      secteur: d.secteur,
      score: d.score,
      ca: donnees.chiffre_affaires ?? null,
      ebitda: donnees.ebitda ?? null,
      dette: donnees.dette_financiere ?? null,
      ratios: {
        marge_brute: ratios.marge_brute?.valeur ?? null,
        taux_ebitda: ratios.taux_ebitda?.valeur ?? null,
        levier_financier: ratios.levier_financier?.valeur ?? null,
        dscr: ratios.dscr?.valeur ?? null,
        ratio_endettement: ratios.ratio_endettement?.valeur ?? null,
      },
    }
  })
}
