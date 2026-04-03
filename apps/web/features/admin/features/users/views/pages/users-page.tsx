'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { UserCircle, Loader2, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminUser } from '@/features/admin/types'
import { getAdminUsers, updateUserRole, deleteAdminUser } from '../../services/admin-user-service'
import { formatDate } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

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
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterInstitution, setFilterInstitution] = useState('all')

  const institutions = useMemo(() =>
    Array.from(new Set((data ?? []).map((u) => u.institution))).sort(),
    [data]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return (data ?? []).filter((user) => {
      const matchSearch = !q ||
        user.nom.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.institution.toLowerCase().includes(q)
      const matchRole = filterRole === 'all' || user.role === filterRole
      const matchInstitution = filterInstitution === 'all' || user.institution === filterInstitution
      return matchSearch && matchRole && matchInstitution
    })
  }, [data, search, filterRole, filterInstitution])

  const handleRoleChange = async (id: string, role: string) => {
    const user = data?.find((u) => u.id === id)
    setPendingId(id)
    setEditingRole(null)
    try {
      await updateUserRole(id, role)
      mutate((prev) => prev?.map((u) => u.id === id ? { ...u, role } : u))
      toast.success('Rôle mis à jour', { description: `${user?.nom} → ${role}` })
    } catch {
      toast.error('Erreur', { description: 'Impossible de modifier le rôle.' })
    } finally {
      setPendingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const user = data?.find((u) => u.id === id)
    setPendingId(id)
    try {
      await deleteAdminUser(id)
      mutate((prev) => prev?.filter((u) => u.id !== id))
      toast.success('Utilisateur supprimé', { description: user?.nom })
    } catch {
      toast.error('Erreur', { description: 'Impossible de supprimer l\'utilisateur.' })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {data
            ? filtered.length < data.length
              ? `${filtered.length} / ${data.length} utilisateur${data.length !== 1 ? 's' : ''}`
              : `${data.length} utilisateur${data.length !== 1 ? 's' : ''}`
            : '…'}
        </p>
      </div>

      {/* Toolbar recherche + filtre */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom, email, institution…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="analyste">Analyste</SelectItem>
            <SelectItem value="lecture">Lecture</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterInstitution} onValueChange={setFilterInstitution}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les institutions</SelectItem>
            {institutions.map((inst) => (
              <SelectItem key={inst} value={inst}>{inst}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-5 py-3">Utilisateur</TableHead>
                <TableHead className="px-5 py-3">Email</TableHead>
                <TableHead className="px-5 py-3">Rôle</TableHead>
                <TableHead className="px-5 py-3">Institution</TableHead>
                <TableHead className="px-5 py-3">Dernière connexion</TableHead>
                <TableHead className="px-5 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0">
                        <span className="text-[10px] font-semibold text-primary">
                          {user.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{user.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="px-5 py-3.5">
                    {editingRole === user.id ? (
                      <div className="flex items-center gap-1">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(user.id, r)}
                            disabled={pendingId === user.id}
                            className={cn(
                              'px-2 py-0.5 rounded-md text-xs font-medium transition-colors',
                              r === user.role ? ROLE_STYLES[r as Role] : 'text-muted-foreground hover:bg-accent'
                            )}
                          >
                            {r}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-xs text-muted-foreground hover:text-foreground ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(user.id)}
                        title="Modifier le rôle"
                        className="group flex items-center gap-1.5"
                      >
                        {pendingId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full', ROLE_STYLES[user.role as Role] ?? 'bg-muted text-muted-foreground')}>
                              {user.role}
                            </span>
                            <UserCircle className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-muted-foreground">{user.institution}</TableCell>
                  <TableCell className="px-5 py-3.5 text-muted-foreground">
                    {user.last_login ? formatDate(user.last_login) : '—'}
                  </TableCell>
                  <TableCell className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={pendingId === user.id}
                            title="Supprimer"
                            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                          >
                            {pendingId === user.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l&apos;utilisateur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer <strong>{user.nom}</strong> ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    Aucun utilisateur ne correspond à votre recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
