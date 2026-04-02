// ---- API client — mock mode (USE_MOCK=true) ----

import type { Dossier, DossierComplet, Analyse, AuditLog, AuditLogsResponse, Institution, InstitutionSettings, ComparatifItem, AdminInstitution, AdminUser, AdminStats, MonitoringData } from './types'
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

// ---- Admin ----

const MOCK_ADMIN_INSTITUTIONS: AdminInstitution[] = [
  { id: 'inst-001', nom: 'Banque Atlantique CI', email_admin: 'admin@ba-ci.com', pays: "Côte d'Ivoire", abonnement_statut: 'actif', nb_dossiers: 6, created_at: '2024-01-15T09:00:00Z' },
  { id: 'inst-002', nom: 'SGBCI Groupe', email_admin: 'admin@sgbci.com', pays: "Côte d'Ivoire", abonnement_statut: 'actif', nb_dossiers: 3, created_at: '2024-02-03T11:00:00Z' },
  { id: 'inst-003', nom: 'Ecobank Ghana', email_admin: 'admin@ecobank.gh', pays: 'Ghana', abonnement_statut: 'trial', nb_dossiers: 1, created_at: '2024-03-10T14:00:00Z' },
  { id: 'inst-004', nom: "BNI Côte d'Ivoire", email_admin: 'admin@bni.ci', pays: "Côte d'Ivoire", abonnement_statut: 'suspendu', nb_dossiers: 0, created_at: '2024-01-28T08:00:00Z' },
]

const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 'user-001', nom: 'Koné Aminata', email: 'aminata.kone@ba-ci.com', role: 'analyste', institution: 'Banque Atlantique CI', institution_id: 'inst-001', last_login: '2025-03-28T08:45:00Z', actif: true },
  { id: 'user-002', nom: 'Traoré Boubacar', email: 'boubacar@ba-ci.com', role: 'admin', institution: 'Banque Atlantique CI', institution_id: 'inst-001', last_login: '2025-03-27T16:00:00Z', actif: true },
  { id: 'user-003', nom: 'Diallo Ibrahima', email: 'diallo@sgbci.com', role: 'analyste', institution: 'SGBCI Groupe', institution_id: 'inst-002', last_login: '2025-03-25T10:20:00Z', actif: true },
  { id: 'user-004', nom: 'Asante Kwame', email: 'kwame@ecobank.gh', role: 'lecture', institution: 'Ecobank Ghana', institution_id: 'inst-003', last_login: '2025-03-20T12:00:00Z', actif: true },
]

const _dailyData = (() => {
  const values = [3,1,4,2,5,3,2,1,4,3,5,2,3,1,4,6,2,3,5,4,2,1,3,4,5,3,2,4,3,5]
  const base = new Date('2025-03-01')
  return values.map((dossiers, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    return { date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }), dossiers }
  })
})()

const MOCK_MONITORING_DATA: MonitoringData = {
  stats: { total_institutions: 4, total_dossiers: 10, total_tokens_llm: 285400, score_moyen: 64, tokens_cout_estime_usd: 2.85 },
  dossiers_par_jour: _dailyData,
  dernieres_analyses: [
    { dossier_id: 'dos-001', nom_projet: 'Agro-Export Abidjan SARL', institution: 'Banque Atlantique CI', score: 82, tokens: 2840, created_at: '2025-03-20T09:15:00Z' },
    { dossier_id: 'dos-002', nom_projet: 'TechServices Dakar SAS', institution: 'Banque Atlantique CI', score: 61, tokens: 1950, created_at: '2025-03-18T14:45:00Z' },
    { dossier_id: 'dos-003', nom_projet: 'Boulangerie Moderne Ouaga', institution: 'Banque Atlantique CI', score: 38, tokens: 2100, created_at: '2025-03-15T11:50:00Z' },
  ],
}

export async function getAdminInstitutions(): Promise<AdminInstitution[]> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 400)); return [...MOCK_ADMIN_INSTITUTIONS] }
  const res = await fetch('/api/admin/institutions')
  if (!res.ok) throw new Error('Erreur chargement institutions')
  return res.json()
}

export async function updateInstitutionStatut(id: string, statut: 'actif' | 'suspendu'): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  const res = await fetch(`/api/admin/institutions/${id}/statut`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut }),
  })
  if (!res.ok) throw new Error('Erreur mise à jour statut')
}

export async function deleteAdminInstitution(id: string): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  const res = await fetch(`/api/admin/institutions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur suppression institution')
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 400)); return [...MOCK_ADMIN_USERS] }
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Erreur chargement utilisateurs')
  return res.json()
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  const res = await fetch(`/api/admin/users/${id}/role`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Erreur mise à jour rôle')
}

export async function deleteAdminUser(id: string): Promise<void> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 300)); return }
  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erreur suppression utilisateur')
}

export async function getAdminMonitoring(): Promise<MonitoringData> {
  if (USE_MOCK) { await new Promise(r => setTimeout(r, 500)); return MOCK_MONITORING_DATA }
  const res = await fetch('/api/admin/monitoring')
  if (!res.ok) throw new Error('Erreur chargement monitoring')
  return res.json()
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
