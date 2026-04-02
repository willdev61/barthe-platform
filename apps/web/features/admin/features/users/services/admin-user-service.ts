import type { AdminUser } from '@/features/admin/types'

export async function getAdminUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Erreur chargement utilisateurs')
  return res.json()
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Erreur mise à jour rôle')
}

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur suppression utilisateur')
}
