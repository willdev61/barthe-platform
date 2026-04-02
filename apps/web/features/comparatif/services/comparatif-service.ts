import type { ComparatifItem } from '../types'

export async function getComparatif(ids: string[]): Promise<ComparatifItem[]> {
  const res = await fetch('/api/dossiers/comparatif', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dossier_ids: ids }),
  })
  if (!res.ok) throw new Error('Erreur lors du chargement du comparatif')
  return res.json()
}
