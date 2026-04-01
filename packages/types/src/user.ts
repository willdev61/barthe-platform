// packages/types/src/user.ts

export type UserRole = 'admin' | 'analyste' | 'lecture'
export type AbonnementStatut = 'trial' | 'actif' | 'suspendu'

export interface Institution {
  id: string
  nom: string
  email_admin: string
  pays: string
  secteurs_cibles: string | null
  abonnement_statut: AbonnementStatut
  created_at: string
}

export interface User {
  id: string
  institution_id: string
  nom: string
  email: string
  role: UserRole
  last_login: string | null
  created_at: string
}
