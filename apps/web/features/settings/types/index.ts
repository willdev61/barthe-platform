export type { Institution, InstitutionSettings, ScoringThresholds } from '@/lib/types'

export type ApiKey = {
  id: string
  nom: string
  permissions: string[]
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export type OrgMember = {
  id: string
  role: string
  user: { id: string; name: string; email: string }
}

export type OrgInvitation = {
  id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'
}

export type OrgData = {
  members: OrgMember[]
  invitations: OrgInvitation[]
}
