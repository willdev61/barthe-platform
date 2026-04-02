'use server'

import { prisma } from '@/lib/db'

export async function updateUserRoleAction(id: string, role: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { role },
  })
}
