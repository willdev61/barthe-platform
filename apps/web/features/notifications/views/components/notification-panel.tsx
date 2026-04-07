'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell } from 'lucide-react'
import type { NotificationItem as NotificationItemType } from '../../types'
import { NotificationItem } from './notification-item'

interface Props {
  items: NotificationItemType[]
  onRead: (id: string) => void
  onMarkAllRead: () => void
  unreadCount: number
}

export function NotificationPanel({ items, onRead, onMarkAllRead, unreadCount }: Props) {
  return (
    <div className="flex flex-col w-96 max-h-[520px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-sm font-semibold text-foreground">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary hover:underline"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Bell className="w-8 h-8 opacity-30" />
          <p className="text-sm">Aucune notification</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {items.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={onRead} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
