'use client'

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Trash2,
  Clock,
  Users,
  Shield,
  Key,
  Bell,
  LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { NotificationItem as NotificationItemType, NotificationType } from '../../types'

interface NotificationConfig {
  icon: LucideIcon
  color: string
}

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  ANALYSE_TERMINEE: { icon: CheckCircle2, color: 'text-green-500' },
  ANALYSE_ECHOUEE: { icon: XCircle, color: 'text-red-500' },
  ALERTE_CRITIQUE: { icon: AlertTriangle, color: 'text-red-500' },
  RAPPORT_PRET: { icon: FileText, color: 'text-blue-500' },
  DOSSIER_SUPPRIME: { icon: Trash2, color: 'text-orange-500' },
  TRIAL_EXPIRE_7J: { icon: Clock, color: 'text-yellow-500' },
  TRIAL_EXPIRE_3J: { icon: Clock, color: 'text-orange-500' },
  TRIAL_EXPIRE_1J: { icon: Clock, color: 'text-red-500' },
  TRIAL_EXPIRE: { icon: Clock, color: 'text-red-600' },
  LIMITE_80: { icon: AlertTriangle, color: 'text-yellow-500' },
  LIMITE_100: { icon: AlertTriangle, color: 'text-red-500' },
  MEMBRE_REJOINT: { icon: Users, color: 'text-indigo-500' },
  ROLE_MODIFIE: { icon: Shield, color: 'text-indigo-500' },
  COMPTE_DESACTIVE: { icon: XCircle, color: 'text-red-500' },
  NOUVELLE_IP: { icon: Shield, color: 'text-orange-500' },
  API_KEY_EXPIRE_7J: { icon: Key, color: 'text-yellow-500' },
  API_KEY_PREMIERE_UTILISATION: { icon: Key, color: 'text-green-500' },
}

interface Props {
  notification: NotificationItemType
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const config = NOTIFICATION_CONFIG[notification.type] ?? { icon: Bell, color: 'text-gray-400' }
  const Icon = config.icon

  return (
    <button
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors ${
        !notification.is_read ? 'bg-accent/30' : ''
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-snug">{notification.title}</p>
          {!notification.is_read && (
            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notification.message}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
        </p>
      </div>
    </button>
  )
}
