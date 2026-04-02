'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { UserCircle, Loader2, Trash2 } from 'lucide-react'
import type { AdminUser } from '@/features/admin/types'
import { getAdminUsers, updateUserRole, deleteAdminUser } from '../../services/admin-user-service'
import { formatDate } from '@/lib/types'
import { cn } from '@/lib/utils'

const ROLES = ['admin', 'analyste', 'lecture'] as const
type Role = typeof ROLES[number]

const ROLE_STYLES: Record<Role, string> = {
  admin:    'bg-destructive/10 text-destructive',
  analyste: 'bg-primary/10 text-primary',
  lecture:  'bg-muted text-muted-foreground',
}

export function UsersPage() {
  const { data, isLoading, mutate } = useSWR<AdminUser[]>('admin-users', getAdminUsers)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)

  const handleRoleChange = async (id: string, role: string) => {
    setPendingId(id)
    setEditingRole(null)
    try {
      await updateUserRole(id, role)
      mutate((prev) => prev?.map((u) => u.id === id ? { ...u, role } : u))
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setPendingId(id)
    try {
      await deleteAdminUser(id)
      mutate((prev) => prev?.filter((u) => u.id !== id))
    } finally {
      setPendingId(null)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {data ? `${data.length} utilisateur${data.length !== 1 ? 's' : ''}` : '…'}
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Rôle</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Institution</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Dernière connexion</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
                          <span className="text-[10px] font-semibold text-primary">
                            {user.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{user.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{user.email}</td>
                    <td className="px-5 py-3.5">
                      {editingRole === user.id ? (
                        <div className="flex items-center gap-1">
                          {ROLES.map((r) => (
                            <button key={r} onClick={() => handleRoleChange(user.id, r)} disabled={pendingId === user.id}
                              className={cn('px-2 py-0.5 rounded-md text-xs font-medium transition-colors', r === user.role ? ROLE_STYLES[r as Role] : 'text-muted-foreground hover:bg-accent')}
                            >{r}</button>
                          ))}
                          <button onClick={() => setEditingRole(null)} className="text-xs text-muted-foreground hover:text-foreground ml-1">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setEditingRole(user.id)} title="Modifier le rôle" className="group flex items-center gap-1.5">
                          {pendingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full', ROLE_STYLES[user.role as Role] ?? 'bg-muted text-muted-foreground')}>{user.role}</span>
                              <UserCircle className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{user.institution}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{user.last_login ? formatDate(user.last_login) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirm === user.id ? (
                          <>
                            <button onClick={() => handleDelete(user.id)} disabled={pendingId === user.id} className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
                              {pendingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmer'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">Annuler</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(user.id)} title="Désactiver / Supprimer" className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
