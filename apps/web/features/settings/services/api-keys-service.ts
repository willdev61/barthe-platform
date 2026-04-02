import type { ApiKey } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function getApiKeys(token: string): Promise<ApiKey[]> {
  const res = await fetch(`${API_URL}/api-keys/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Erreur de chargement des clés API')
  return res.json()
}

export async function createApiKey(
  token: string,
  data: { nom: string; permissions: string[] }
): Promise<{ key: string }> {
  const res = await fetch(`${API_URL}/api-keys/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || 'Erreur lors de la création')
  }
  return res.json()
}

export async function revokeApiKey(token: string, keyId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api-keys/${keyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Erreur lors de la révocation de la clé')
}
