'use server'

import { prisma } from '@/lib/db'
import type { AdminUser } from '@/lib/types'

export async function getAdminUsersAction(): Promise<AdminUser[]> {
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    include: { institution: { select: { nom: true } } },
  })

  return users.map((u) => ({
    id: u.id,
    nom: u.nom,
    email: u.email,
    role: u.role,
    institution: u.institution.nom,
    institution_id: u.institution_id,
    last_login: u.last_login?.toISOString() ?? null,
    actif: true,
  }))
}
