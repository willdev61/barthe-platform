import type { Analyse } from '../types'

export async function getAnalyse(dossierId: string): Promise<Analyse | null> {
  const res = await fetch(`/api/analyses/${dossierId}`)
  if (!res.ok) return null
  return res.json()
}

export async function runAnalyse(dossierId: string): Promise<Analyse> {
  const res = await fetch(`/api/analyses/${dossierId}/run`, { method: 'POST' })
  if (!res.ok) throw new Error("Erreur lors de l'analyse")
  return res.json()
}

export async function generateRapport(dossierId: string): Promise<string> {
  const res = await fetch(`/api/rapports/${dossierId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Erreur lors de la génération du rapport')
  const data = await res.json()
  return data.pdf_url
}
