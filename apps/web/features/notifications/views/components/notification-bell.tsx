'use client'

import { useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getNotificationsAction } from '../../actions/get-notifications-action'
import { markReadAction, markAllReadAction } from '../../actions/mark-read-action'
import { NotificationPanel } from './notification-panel'
import type { NotificationsResult } from '../../types'

const SWR_KEY = 'notifications'

async function fetcher(): Promise<NotificationsResult> {
  return getNotificationsAction()
}

export function NotificationBell() {
  const { data } = useSWR(SWR_KEY, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  })

  const unreadCount = data?.unread_count ?? 0
  const items = data?.items ?? []

  const handleRead = useCallback(async (id: string) => {
    // Optimistic update
    await mutate(
      SWR_KEY,
      (prev: NotificationsResult | undefined) => {
        if (!prev) return prev
        return {
          items: prev.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
          unread_count: Math.max(0, prev.unread_count - 1),
        }
      },
      false
    )
    await markReadAction(id)
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    await mutate(
      SWR_KEY,
      (prev: NotificationsResult | undefined) => {
        if (!prev) return prev
        return {
          items: prev.items.map((n) => ({ ...n, is_read: true })),
          unread_count: 0,
        }
      },
      false
    )
    await markAllReadAction()
  }, [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="p-0 w-auto shadow-lg" sideOffset={8}>
        <NotificationPanel
          items={items}
          onRead={handleRead}
          onMarkAllRead={handleMarkAllRead}
          unreadCount={unreadCount}
        />
      </PopoverContent>
    </Popover>
  )
}
