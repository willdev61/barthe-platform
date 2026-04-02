import type { Dossier, DossierComplet } from '../types'
import type { CreateDossierInput } from '../schemas/dossier-schema'

export async function getDossiers(): Promise<Dossier[]> {
  const res = await fetch('/api/dossiers')
  if (!res.ok) throw new Error('Erreur lors de la récupération des dossiers')
  return res.json()
}

export async function getDossier(id: string): Promise<DossierComplet | null> {
  const res = await fetch(`/api/dossiers/${id}`)
  if (!res.ok) throw new Error('Dossier introuvable')
  return res.json()
}

export async function createDossier(data: CreateDossierInput): Promise<Dossier> {
  const res = await fetch('/api/dossiers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création du dossier')
  return res.json()
}

export async function deleteDossier(id: string): Promise<void> {
  const res = await fetch(`/api/dossiers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression du dossier')
}
