// ---- API client — mock mode (USE_MOCK=true) ----

import type { Dossier, DossierComplet, Analyse } from './types'
import {
  MOCK_DOSSIERS,
  MOCK_ANALYSES,
  getMockDossierComplet,
} from './mock-data'

const USE_MOCK = true

// ---- Dossiers ----

export async function getDossiers(): Promise<Dossier[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return [...MOCK_DOSSIERS]
  }
  const res = await fetch('/api/dossiers')
  if (!res.ok) throw new Error('Erreur lors de la récupération des dossiers')
  return res.json()
}

export async function getDossier(id: string): Promise<DossierComplet | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return getMockDossierComplet(id)
  }
  const res = await fetch(`/api/dossiers/${id}`)
  if (!res.ok) throw new Error('Dossier introuvable')
  return res.json()
}

export async function createDossier(data: {
  nom_projet: string
  fichier_nom: string
}): Promise<Dossier> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600))
    const newDossier: Dossier = {
      id: 'dos-' + Date.now(),
      institution_id: 'inst-001',
      created_by: 'user-001',
      nom_projet: data.nom_projet,
      secteur: null,
      fichier_nom: data.fichier_nom,
      fichier_url: null,
      statut: 'en_attente',
      score: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return newDossier
  }
  const res = await fetch('/api/dossiers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la création du dossier')
  return res.json()
}

export async function deleteDossier(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return
  }
  const res = await fetch(`/api/dossiers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur lors de la suppression du dossier')
}

// ---- Analyses ----

export async function runAnalyse(dossierId: string): Promise<Analyse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 3000))
    const analyse = MOCK_ANALYSES[dossierId]
    if (!analyse) throw new Error('Analyse impossible sur ce dossier mock')
    return analyse
  }
  const res = await fetch(`/api/analyses/${dossierId}/run`, { method: 'POST' })
  if (!res.ok) throw new Error("Erreur lors de l'analyse")
  return res.json()
}

export async function getAnalyse(dossierId: string): Promise<Analyse | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return MOCK_ANALYSES[dossierId] ?? null
  }
  const res = await fetch(`/api/analyses/${dossierId}`)
  if (!res.ok) return null
  return res.json()
}

// ---- Rapports ----

export async function generateRapport(dossierId: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500))
    return `/rapports/${dossierId}.pdf`
  }
  const res = await fetch(`/api/rapports/${dossierId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Erreur lors de la génération du rapport')
  const data = await res.json()
  return data.pdf_url
}
