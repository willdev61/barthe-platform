'use server'

import { prisma } from '@/lib/db'
import type { MonitoringData } from '@/lib/types'

export async function getAdminMonitoringAction(): Promise<MonitoringData> {
  const [
    total_institutions,
    total_dossiers,
    tokensAgg,
    scoreAgg,
    dossiersParJour,
    dernieres_analyses,
  ] = await prisma.$transaction([
    prisma.institution.count(),
    prisma.dossier.count(),
    prisma.analyse.aggregate({ _sum: { tokens_utilises: true } }),
    prisma.dossier.aggregate({ _avg: { score: true }, where: { score: { not: null } } }),
    prisma.$queryRaw<{ date: string; dossiers: number }[]>`
      SELECT DATE(created_at)::text AS date, COUNT(*)::int AS dossiers
      FROM "Dossier"
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
    prisma.dossier.findMany({
      where: { statut: 'analyse' },
      orderBy: { updated_at: 'desc' },
      take: 10,
      include: {
        analyse: { select: { tokens_utilises: true } },
        institution: { select: { nom: true } },
      },
    }),
  ])

  const total_tokens_llm = tokensAgg._sum.tokens_utilises ?? 0
  const score_moyen = scoreAgg._avg.score ?? 0

  return {
    stats: {
      total_institutions,
      total_dossiers,
      total_tokens_llm,
      score_moyen: Math.round(score_moyen),
      tokens_cout_estime_usd: total_tokens_llm * 0.000002,
    },
    dossiers_par_jour: dossiersParJour,
    dernieres_analyses: dernieres_analyses.map((d) => ({
      dossier_id: d.id,
      nom_projet: d.nom_projet,
      institution: d.institution.nom,
      score: d.score ?? 0,
      tokens: d.analyse?.tokens_utilises ?? 0,
      created_at: d.updated_at.toISOString(),
    })),
  }
}
