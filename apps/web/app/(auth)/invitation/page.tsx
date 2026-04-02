'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { organization, signIn, signUp, useSession } from '@/lib/auth-client'

type InvitationDetails = {
  id: string
  email: string
  role: string
  organizationName?: string
  status: string
}

type AuthMode = 'login' | 'register'

// ---- Auth form ----

function AuthForm({
  defaultEmail,
  onSuccess,
}: {
  defaultEmail: string
  onSuccess: () => void
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await signIn.email({ email, password })
      if (error) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }
    } else {
      const { error } = await signUp.email({ email, password, name })
      if (error) {
        setError(error.message || 'Erreur lors de la création du compte')
        setLoading(false)
        return
      }
    }

    onSuccess()
  }

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex rounded-lg border border-border p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'login'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          J&apos;ai déjà un compte
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'register'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Créer un compte
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom Nom"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@institution.ci"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#534AB7] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading
            ? mode === 'login'
              ? 'Connexion…'
              : 'Création du compte…'
            : mode === 'login'
            ? 'Se connecter'
            : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}

// ---- Page ----

export default function InvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('id') ?? searchParams.get('invitationId') ?? ''

  const { data: session, isPending: sessionLoading } = useSession()

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [fetchError, setFetchError] = useState('')
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [loadingInvitation, setLoadingInvitation] = useState(true)

  // Fetch invitation details
  useEffect(() => {
    if (!invitationId) {
      setFetchError('Lien d\'invitation invalide ou expiré.')
      setLoadingInvitation(false)
      return
    }

    organization
      .getInvitation({ query: { id: invitationId } })
      .then(({ data, error }) => {
        if (error || !data) {
          setFetchError("Invitation introuvable ou expirée.")
        } else {
          setInvitation(data as unknown as InvitationDetails)
        }
        setLoadingInvitation(false)
      })
  }, [invitationId])

  // Accept invitation
  const handleAccept = async () => {
    setAccepting(true)
    setAcceptError('')

    const { error } = await organization.acceptInvitation({ invitationId })

    if (error) {
      setAcceptError(error.message || "Erreur lors de l'acceptation de l'invitation")
      setAccepting(false)
      return
    }

    router.push('/dashboard')
  }

  // After auth, try accepting
  const handleAuthSuccess = () => {
    handleAccept()
  }

  const roleLabel =
    invitation?.role === 'admin'
      ? 'Admin'
      : invitation?.role === 'analyste'
      ? 'Analyste'
      : invitation?.role === 'lecture'
      ? 'Lecture seule'
      : invitation?.role ?? ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0]">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#534AB7] text-white font-bold text-lg px-4 py-2 rounded-lg mb-4">
            BARTHE
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Invitation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Rejoignez votre équipe sur BARTHE
          </p>
        </div>

        {/* Loading */}
        {(loadingInvitation || sessionLoading) && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-[#534AB7] border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error fetching invitation */}
        {!loadingInvitation && !sessionLoading && fetchError && (
          <div className="text-center space-y-3">
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{fetchError}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-[#534AB7] hover:underline"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {/* Invitation details + accept flow */}
        {!loadingInvitation && !sessionLoading && invitation && (
          <div className="space-y-6">
            {/* Invitation summary */}
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
                <span className="font-medium">{roleLabel}</span>
              </p>
            </div>

            {invitation.status !== 'pending' && (
              <p className="text-sm text-center text-gray-500">
                Cette invitation n&apos;est plus valide (statut : {invitation.status}).
              </p>
            )}

            {invitation.status === 'pending' && (
              <>
                {/* Already logged in — direct accept */}
                {session ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Connecté en tant que{' '}
                      <span className="font-medium">{session.user.email}</span>
                    </p>
                    {acceptError && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {acceptError}
                      </p>
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
                  /* Not logged in — auth form */
                  <AuthForm
                    defaultEmail={invitation.email}
                    onSuccess={handleAuthSuccess}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
