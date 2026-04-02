import type { AdminInstitution } from '@/features/admin/types'

export async function getAdminInstitutions(): Promise<AdminInstitution[]> {
  const res = await fetch('/api/admin/institutions')
  if (!res.ok) throw new Error('Erreur chargement institutions')
  return res.json()
}

export async function updateInstitutionStatut(id: string, statut: 'actif' | 'suspendu'): Promise<void> {
  const res = await fetch(`/api/admin/institutions/${id}/statut`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut }),
  })
  if (!res.ok) throw new Error('Erreur mise à jour statut')
}

export async function deleteAdminInstitution(id: string): Promise<void> {
  const res = await fetch(`/api/admin/institutions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur suppression institution')
}
