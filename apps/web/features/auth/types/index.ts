export type AuthMode = 'login' | 'register'

export type InvitationDetails = {
  id: string
  email: string
  role: string
  organizationName?: string
  status: string
}
