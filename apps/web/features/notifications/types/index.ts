export type NotificationType =
  | 'ANALYSE_TERMINEE'
  | 'ANALYSE_ECHOUEE'
  | 'ALERTE_CRITIQUE'
  | 'RAPPORT_PRET'
  | 'DOSSIER_SUPPRIME'
  | 'TRIAL_EXPIRE_7J'
  | 'TRIAL_EXPIRE_3J'
  | 'TRIAL_EXPIRE_1J'
  | 'TRIAL_EXPIRE'
  | 'LIMITE_80'
  | 'LIMITE_100'
  | 'MEMBRE_REJOINT'
  | 'ROLE_MODIFIE'
  | 'COMPTE_DESACTIVE'
  | 'NOUVELLE_IP'
  | 'API_KEY_EXPIRE_7J'
  | 'API_KEY_PREMIERE_UTILISATION'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface NotificationsResult {
  items: NotificationItem[]
  unread_count: number
}

// Notifications requiring email dispatch
export const EMAIL_NOTIFICATION_TYPES: NotificationType[] = [
  'ANALYSE_TERMINEE',
  'ANALYSE_ECHOUEE',
  'TRIAL_EXPIRE_7J',
  'TRIAL_EXPIRE_3J',
  'TRIAL_EXPIRE_1J',
  'TRIAL_EXPIRE',
  'LIMITE_100',
  'ROLE_MODIFIE',
  'COMPTE_DESACTIVE',
  'NOUVELLE_IP',
  'API_KEY_EXPIRE_7J',
]
