'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { markAsRead, markAllAsRead } from '../services/notification-service'

export async function markReadAction(notificationId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return

  await markAsRead(notificationId, session.user.id)
}

export async function markAllReadAction(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return

  await markAllAsRead(session.user.id)
}
