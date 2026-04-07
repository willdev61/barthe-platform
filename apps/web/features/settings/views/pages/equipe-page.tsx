'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Trash2, Mail, Clock, X } from 'lucide-react'
import { organization, useSession } from '@/lib/auth-client'
import type { OrgData } from '../../types'
import { Section } from '../components/section'
import { RoleBadge } from '../components/role-badge'
import { InviteModal } from '../dialogs/invite-modal'

function MemberSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
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

export function EquipePage() {
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
      const sessionOrgId = (session?.session as any)?.activeOrganizationId as string | undefined
      if (sessionOrgId) {
        setOrgId(sessionOrgId)
        await loadOrg()
        return
      }
      const { data: orgs } = await organization.list()
      const first = (orgs as any)?.[0]
      if (!first) { setLoading(false); return }
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

  const pendingInvitations = orgData?.invitations?.filter((inv) => inv.status === 'pending') ?? []

  if (!orgId && !loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">Aucune organisation active.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Équipe</h1>
        <p className="text-muted-foreground mt-1 text-sm">Gérez les membres et les accès à votre institution</p>
      </div>

      <div className="space-y-6">
        <Section
          icon={Users}
          title="Membres"
          description="Membres actifs de votre organisation"
          action={
            <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
              <UserPlus className="w-3.5 h-3.5" /> Inviter un membre
            </button>
          }
        >
          {loading ? <MemberSkeleton /> : (orgData?.members?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun membre</p>
          ) : (
            <div className="divide-y divide-border">
              {orgData!.members.map((member) => {
                const initials = (member.user?.name || member.user?.email || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                      <span className="text-xs font-semibold text-primary">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{member.user?.name || member.user?.email}</p>
                      {member.user?.name && <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={member.role} />
                      {member.role !== 'owner' && (
                        <button onClick={() => handleRemove(member.id)} disabled={removingId === member.id} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40" title="Retirer ce membre">
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

        {pendingInvitations.length > 0 && (
          <Section icon={Clock} title="Invitations en attente" description="Invitations envoyées, en attente d'acceptation">
            <div className="divide-y divide-border">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">Invitation envoyée</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={inv.role} />
                    <button onClick={() => handleCancelInvitation(inv.id)} disabled={cancellingId === inv.id} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40" title="Annuler l'invitation">
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
          onSuccess={async () => { setShowInviteModal(false); await loadOrg() }}
        />
      )}
    </div>
  )
}
