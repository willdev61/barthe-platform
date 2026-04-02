export { getMyInstitutionAction as getMyInstitution } from '../actions/get-institution-action'
export { updateInstitutionSettingsAction as updateInstitutionSettings } from '../actions/update-institution-settings-action'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function uploadInstitutionLogo(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/api/institutions/me/logo`, { method: 'PUT', body: form })
  if (!res.ok) throw new Error('Erreur lors de la mise en ligne du logo')
  const data = await res.json()
  return data.logo_url
}
