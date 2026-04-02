'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Clock,
  X,
} from 'lucide-react'
import { organization, useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

// ---- Types ----

type OrgMember = {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
  }
}

type OrgInvitation = {
  id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'
}

type OrgData = {
  members: OrgMember[]
  invitations: OrgInvitation[]
}

// ---- Constants ----

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Accès complet à toutes les fonctionnalités' },
  { value: 'analyste', label: 'Analyste', description: 'Peut créer et analyser des dossiers' },
  { value: 'lecture', label: 'Lecture seule', description: 'Consultation des dossiers uniquement' },
] as const

type InviteRole = typeof ROLES[number]['value']

// ---- Sub-components ----

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        (role === 'admin' || role === 'owner') && 'bg-primary/10 text-primary',
        role === 'analyste' &&
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        role === 'lecture' && 'bg-muted text-muted-foreground',
      )}
    >
      {role === 'owner'
        ? 'Propriétaire'
        : role === 'admin'
        ? 'Admin'
        : role === 'analyste'
        ? 'Analyste'
        : 'Lecture'}
    </span>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function InviteModal({
  orgId,
  onClose,
  onSuccess,
}: {
  orgId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('analyste')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await organization.inviteMember({
      email,
      role,
      organizationId: orgId,
    })

    if (error) {
      setError(error.message || "Erreur lors de l'envoi de l'invitation")
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">Inviter un membre</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nouveau@institution.ci"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rôle</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors',
                    role === r.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 hover:bg-accent',
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                      role === r.value ? 'border-primary' : 'border-muted-foreground',
                    )}
                  >
                    {role === r.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? 'Envoi…' : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Skeleton ----

function MemberSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3 animate-pulse"
        >
          <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
          <div className="w-16 h-5 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ---- Page ----

export default function EquipePage() {
  const { data: session } = useSession()
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [orgId, setOrgId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadOrg = async () => {
    setLoading(true)
    const { data } = await organization.getFullOrganization()
    setOrgData(data as unknown as OrgData)
    setLoading(false)
  }

  useEffect(() => {
    if (!session) return

    const init = async () => {
      // Try activeOrganizationId from session first
      const sessionOrgId = (session?.session as any)?.activeOrganizationId as string | undefined

      if (sessionOrgId) {
        setOrgId(sessionOrgId)
        await loadOrg()
        return
      }

      // No active org — list and activate the first one
      const { data: orgs } = await organization.list()
      const first = (orgs as any)?.[0]
      if (!first) {
        setLoading(false)
        return
      }
      await organization.setActive({ organizationId: first.id })
      setOrgId(first.id)
      await loadOrg()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const handleRemove = async (memberId: string) => {
    if (!orgId) return
    setRemovingId(memberId)
    await organization.removeMember({ memberIdOrEmail: memberId, organizationId: orgId })
    setRemovingId(null)
    loadOrg()
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId)
    await organization.cancelInvitation({ invitationId })
    setCancellingId(null)
    loadOrg()
  }

  const pendingInvitations =
    orgData?.invitations?.filter((inv) => inv.status === 'pending') ?? []

  if (!orgId && !loading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">Aucune organisation active.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Équipe</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gérez les membres et les accès à votre institution
        </p>
      </div>

      <div className="space-y-6">
        {/* Members list */}
        <Section
          icon={Users}
          title="Membres"
          description="Membres actifs de votre organisation"
          action={
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Inviter un membre
            </button>
          }
        >
          {loading ? (
            <MemberSkeleton />
          ) : (orgData?.members?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun membre
            </p>
          ) : (
            <div className="divide-y divide-border">
              {orgData!.members.map((member) => {
                const initials = (member.user?.name || member.user?.email || '?')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                      <span className="text-xs font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.user?.name || member.user?.email}
                      </p>
                      {member.user?.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={member.role} />
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={removingId === member.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                          title="Retirer ce membre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* Pending invitations */}
        {pendingInvitations.length > 0 && (
          <Section
            icon={Clock}
            title="Invitations en attente"
            description="Invitations envoyées, en attente d'acceptation"
          >
            <div className="divide-y divide-border">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {inv.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Invitation envoyée</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={inv.role} />
                    <button
                      onClick={() => handleCancelInvitation(inv.id)}
                      disabled={cancellingId === inv.id}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                      title="Annuler l'invitation"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {showInviteModal && orgId && (
        <InviteModal
          orgId={orgId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={async () => {
            setShowInviteModal(false)
            await loadOrg()
          }}
        />
      )}
    </div>
  )
}
