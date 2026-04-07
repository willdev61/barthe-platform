'use server'

import { prisma } from '@/lib/db'
import { createNotification } from '@/features/notifications/services/notification-service'
import { sendRoleModifieEmail } from '@/lib/mailer'

export async function updateUserRoleAction(id: string, role: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { institution_id: true, nom: true, email: true },
  })

  await prisma.user.update({
    where: { id },
    data: { role },
  })

  if (user) {
    const inst = await prisma.institution.findUnique({
      where: { id: user.institution_id },
      select: { nom: true },
    })
    createNotification({
      user_id: id,
      institution_id: user.institution_id,
      type: 'ROLE_MODIFIE',
      title: 'Rôle modifié',
      message: `Votre rôle a été mis à jour : ${role}.`,
      metadata: { new_role: role },
    }).catch(() => null)
    sendRoleModifieEmail({
      to: user.email,
      userName: user.nom,
      newRole: role,
      institutionNom: inst?.nom ?? user.institution_id,
    }).catch(() => null)
  }
}
