import { signIn, signUp, signOut, organization } from '@/lib/auth-client'
import type { InvitationDetails } from '../types'

export async function loginWithEmail(email: string, password: string): Promise<string> {
  const { data, error } = await signIn.email({ email, password })
  if (error) throw new Error('Email ou mot de passe incorrect')
  const role = (data?.user as Record<string, unknown> | undefined)?.role as string ?? 'user'
  return role
}

export async function registerWithEmail(email: string, password: string, name: string): Promise<void> {
  const { error } = await signUp.email({ email, password, name })
  if (error) throw new Error(error.message || 'Erreur lors de la création du compte')
}

export async function logout(): Promise<void> {
  await signOut()
}

export async function getInvitation(invitationId: string): Promise<InvitationDetails> {
  const { data, error } = await organization.getInvitation({ query: { id: invitationId } })
  if (error || !data) throw new Error('Invitation introuvable ou expirée.')
  return data as unknown as InvitationDetails
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const { error } = await organization.acceptInvitation({ invitationId })
  if (error) throw new Error(error.message || "Erreur lors de l'acceptation de l'invitation")
}
