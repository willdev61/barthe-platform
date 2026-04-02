// ---- API client — mock mode (USE_MOCK=true) ----

import type { Dossier, DossierComplet, Analyse, AuditLog, AuditLogsResponse, Institution, InstitutionSettings, ComparatifItem } from './types'
import {
  MOCK_DOSSIERS,
  MOCK_ANALYSES,
  MOCK_AUDIT_LOGS,
  MOCK_INSTITUTION,
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

// ---- Comparatif ----

const MOCK_COMPARATIF: Record<string, ComparatifItem> = {
  'dos-001': {
    id: 'dos-001', nom_projet: 'Agro-Export Abidjan SARL', secteur: 'Agriculture',
    score: 82, ca: 850000000, ebitda: 230000000, dette: 580000000,
    ratios: { marge_brute: 27.1, taux_ebitda: 27.1, levier_financier: 2.52, dscr: 1.57, ratio_endettement: 68.2 },
  },
  'dos-002': {
    id: 'dos-002', nom_projet: 'TechServices Dakar SAS', secteur: 'Services numériques',
    score: 61, ca: 420000000, ebitda: 80000000, dette: 290000000,
    ratios: { marge_brute: 19.0, taux_ebitda: 19.0, levier_financier: 3.63, dscr: 1.84, ratio_endettement: 69.0 },
  },
  'dos-003': {
    id: 'dos-003', nom_projet: 'Boulangerie Moderne Ouaga', secteur: 'Agroalimentaire',
    score: 38, ca: 180000000, ebitda: 5000000, dette: 120000000,
    ratios: { marge_brute: 2.8, taux_ebitda: 2.8, levier_financier: 24.0, dscr: 0.28, ratio_endettement: 66.7 },
  },
}

export async function getComparatif(ids: string[]): Promise<ComparatifItem[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return ids.map((id) => MOCK_COMPARATIF[id] ?? {
      id, nom_projet: 'Dossier inconnu', secteur: null,
      score: null, ca: null, ebitda: null, dette: null,
      ratios: { marge_brute: null, taux_ebitda: null, levier_financier: null, dscr: null, ratio_endettement: null },
    })
  }
  const res = await fetch('/api/dossiers/comparatif', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dossier_ids: ids }),
  })
  if (!res.ok) throw new Error('Erreur lors du chargement du comparatif')
  return res.json()
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

// ---- Audit ----

export async function getAuditLogs(params?: {
  page?: number
  action?: string
  start_date?: string
  end_date?: string
}): Promise<AuditLogsResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    let items = [...MOCK_AUDIT_LOGS]
    if (params?.action) items = items.filter((l) => l.action === params.action)
    return { items, total: items.length, page: params?.page ?? 1, limit: 20 }
  }
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.action) qs.set('action', params.action)
  if (params?.start_date) qs.set('start_date', params.start_date)
  if (params?.end_date) qs.set('end_date', params.end_date)
  const res = await fetch(`/api/audit?${qs}`)
  if (!res.ok) throw new Error("Erreur lors du chargement de l'historique")
  return res.json()
}

// ---- Institutions ----

export async function getMyInstitution(): Promise<Institution> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return { ...MOCK_INSTITUTION }
  }
  const res = await fetch('/api/institutions/me')
  if (!res.ok) throw new Error("Erreur lors du chargement de l'institution")
  return res.json()
}

export async function updateInstitutionSettings(data: InstitutionSettings): Promise<Institution> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return { ...MOCK_INSTITUTION, settings: data }
  }
  const res = await fetch('/api/institutions/me/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erreur lors de la sauvegarde des paramètres')
  return res.json()
}

export async function uploadInstitutionLogo(file: File): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return URL.createObjectURL(file)
  }
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/institutions/me/logo', { method: 'PUT', body: form })
  if (!res.ok) throw new Error('Erreur lors de la mise en ligne du logo')
  const data = await res.json()
  return data.logo_url
}

export async function getAuditLogsForDossier(dossierId: string): Promise<AuditLog[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return MOCK_AUDIT_LOGS.filter(
      (l) =>
        l.entity_id === dossierId ||
        (l.metadata as Record<string, unknown>)['dossier_id'] === dossierId
    )
  }
  const res = await fetch(`/api/audit/dossiers/${dossierId}`)
  if (!res.ok) throw new Error("Erreur lors du chargement de l'historique")
  return res.json()
}
