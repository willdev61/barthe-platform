'use server'

import { prisma } from '@/lib/db'

export async function deleteInstitutionAction(id: string): Promise<void> {
  await prisma.institution.delete({ where: { id } })
}
