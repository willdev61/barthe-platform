'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import type { InvitationDetails } from '../../types'
import { getInvitation, acceptInvitation } from '../../services/auth-service'
import { AuthCard } from '../components/auth-card'
import { InvitationAuthForm } from '../forms/invitation-auth-form'

function roleLabel(role: string): string {
  return role === 'admin' ? 'Admin' : role === 'analyste' ? 'Analyste' : role === 'lecture' ? 'Lecture seule' : role
}

export function InvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('id') ?? searchParams.get('invitationId') ?? ''

  const { data: session, isPending: sessionLoading } = useSession()

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [fetchError, setFetchError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [loadingInvitation, setLoadingInvitation] = useState(true)

  useEffect(() => {
    if (!invitationId) {
      setFetchError("Lien d'invitation invalide ou expiré.")
      setLoadingInvitation(false)
      return
    }
    getInvitation(invitationId)
      .then(setInvitation)
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoadingInvitation(false))
  }, [invitationId])

  const handleAccept = async () => {
    setAccepting(true)
    setAcceptError('')
    try {
      await acceptInvitation(invitationId)
      router.push('/dashboard')
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : "Erreur lors de l'acceptation")
      setAccepting(false)
    }
  }

  return (
    <AuthCard title="Invitation" subtitle="Rejoignez votre équipe sur BARTHE">
      {(loadingInvitation || sessionLoading) && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-[#534AB7] border-t-transparent animate-spin" />
        </div>
      )}

      {!loadingInvitation && !sessionLoading && fetchError && (
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{fetchError}</p>
          <button onClick={() => router.push('/login')} className="text-sm text-[#534AB7] hover:underline">
            Retour à la connexion
          </button>
        </div>
      )}

      {!loadingInvitation && !sessionLoading && invitation && (
        <div className="space-y-6">
          <div className="bg-[#F5F4F0] rounded-lg px-4 py-3 space-y-1">
            {invitation.organizationName && (
              <p className="text-sm text-gray-700">
                <span className="text-gray-500">Organisation :</span>{' '}
                <span className="font-medium">{invitation.organizationName}</span>
              </p>
            )}
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">Email :</span>{' '}
              <span className="font-medium">{invitation.email}</span>
            </p>
            <p className="text-sm text-gray-700">
              <span className="text-gray-500">Rôle :</span>{' '}
              <span className="font-medium">{roleLabel(invitation.role)}</span>
            </p>
          </div>

          {invitation.status !== 'pending' && (
            <p className="text-sm text-center text-gray-500">
              Cette invitation n&apos;est plus valide (statut : {invitation.status}).
            </p>
          )}

          {invitation.status === 'pending' && (
            session ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Connecté en tant que <span className="font-medium">{session.user.email}</span>
                </p>
                {acceptError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{acceptError}</p>
                )}
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-[#534AB7] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {accepting ? 'Acceptation…' : "Rejoindre l'organisation"}
                </button>
              </div>
            ) : (
              <InvitationAuthForm defaultEmail={invitation.email} onSuccess={handleAccept} />
            )
          )}
        </div>
      )}
    </AuthCard>
  )
}
