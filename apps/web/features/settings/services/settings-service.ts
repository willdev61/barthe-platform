import type { Institution, InstitutionSettings } from '../types'

export async function getMyInstitution(): Promise<Institution> {
  const res = await fetch('/api/institutions/me')
  if (!res.ok) throw new Error("Erreur lors du chargement de l'institution")
  return res.json()
}

export async function updateInstitutionSettings(data: InstitutionSettings): Promise<Institution> {
  const res = await fetch('/api/institutions/me/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde des paramètres')
  return res.json()
}

export async function uploadInstitutionLogo(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/institutions/me/logo', { method: 'PUT', body: form })
  if (!res.ok) throw new Error('Erreur lors de la mise en ligne du logo')
  const data = await res.json()
  return data.logo_url
}
