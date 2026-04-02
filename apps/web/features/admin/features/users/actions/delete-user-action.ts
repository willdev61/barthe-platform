'use server'

import { prisma } from '@/lib/db'

export async function deleteUserAction(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } })
}
