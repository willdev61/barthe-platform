'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getNotifications } from '../services/notification-service'
import type { NotificationsResult } from '../types'

export async function getNotificationsAction(): Promise<NotificationsResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { items: [], unread_count: 0 }

  return getNotifications(session.user.id)
}
