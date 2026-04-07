import { prisma } from '@/lib/db'
import type { NotificationItem, NotificationType, NotificationsResult } from '../types'

export interface CreateNotificationParams {
  user_id: string
  institution_id: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
}

export async function createNotification(params: CreateNotificationParams): Promise<NotificationItem> {
  const row = await prisma.notification.create({
    data: {
      user_id: params.user_id,
      institution_id: params.institution_id,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: (params.metadata ?? {}) as never,
    },
  })

  return toItem(row)
}

export async function createNotificationsForAdmins(
  institutionId: string,
  params: Omit<CreateNotificationParams, 'user_id' | 'institution_id'>
): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { institution_id: institutionId, role: 'admin' },
    select: { id: true },
  })

  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      user_id: a.id,
      institution_id: institutionId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: (params.metadata ?? {}) as never,
    })),
  })
}

export async function createNotificationsForAll(
  institutionId: string,
  params: Omit<CreateNotificationParams, 'user_id' | 'institution_id'>
): Promise<void> {
  const users = await prisma.user.findMany({
    where: { institution_id: institutionId },
    select: { id: true },
  })

  if (users.length === 0) return

  await prisma.notification.createMany({
    data: users.map((u) => ({
      user_id: u.id,
      institution_id: institutionId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: (params.metadata ?? {}) as never,
    })),
  })
}

export async function getNotifications(userId: string): Promise<NotificationsResult> {
  const [items, unread_count] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { user_id: userId, is_read: false },
    }),
  ])

  return {
    items: items.map(toItem),
    unread_count,
  }
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  })
}

export async function notificationExistsInLast26h(
  institutionId: string,
  type: NotificationType
): Promise<boolean> {
  const cutoff = new Date(Date.now() - 26 * 60 * 60 * 1000)
  const row = await prisma.notification.findFirst({
    where: {
      institution_id: institutionId,
      type,
      created_at: { gte: cutoff },
    },
  })
  return row !== null
}

function toItem(row: {
  id: string
  type: string
  title: string
  message: string
  metadata: unknown
  is_read: boolean
  created_at: Date
}): NotificationItem {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    is_read: row.is_read,
    created_at: row.created_at.toISOString(),
  }
}
