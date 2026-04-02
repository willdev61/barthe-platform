// ---- Shared Types for BARTHE ----

export type AbonnementStatut = 'trial' | 'actif' | 'suspendu'
export type UserRole = 'admin' | 'analyste' | 'lecture'
export type DossierStatut = 'en_attente' | 'en_cours' | 'analyse' | 'erreur'
export type ScoreLabel = 'Favorable' | 'Réservé' | 'Défavorable'
export type AlerteCriticite = 'info' | 'warning' | 'critical'

export interface ScoringThresholds {
  ebitda_min: number
  levier_max: number
  dscr_min: number
}

export interface InstitutionSettings {
  scoring_thresholds: ScoringThresholds
  secteurs_actifs: string[]
  rapport_logo_url: string | null
  rapport_mentions: string
}

export interface Institution {
  id: string
  nom: string
  email_admin: string
  pays: string
  secteurs_cibles: string | null
  abonnement_statut: AbonnementStatut
  created_at: string
  settings?: InstitutionSettings
}

export interface User {
  id: string
  institution_id: string
  nom: string
  email: string
  role: UserRole
  last_login: string | null
  created_at: string
}

export interface Dossier {
  id: string
  institution_id: string
  created_by: string
  nom_projet: string
  secteur: string | null
  fichier_nom: string | null
  fichier_url: string | null
  statut: DossierStatut
  score: number | null
  created_at: string
  updated_at: string
}

export interface RatioFinancier {
  label: string
  valeur: number | null
  unite: string
  seuil_min?: number
  seuil_max?: number
  description: string
}

export interface Alerte {
  id: string
  message: string
  criticite: AlerteCriticite
}

export interface DonneesNormalisees {
  chiffre_affaires: number | null
  charges_exploitation: number | null
  ebitda: number | null
  resultat_net: number | null
  dette_financiere: number | null
  secteur: string
}

export interface Analyse {
  id: string
  dossier_id: string
  donnees_normalisees: DonneesNormalisees
  ratios: Record<string, RatioFinancier>
  alertes: Alerte[]
  synthese_narrative: string | null
  modele_llm: string
  tokens_utilises: number | null
  created_at: string
}

export interface Rapport {
  id: string
  dossier_id: string
  genere_par: string
  pdf_url: string
  created_at: string
}

export interface DossierComplet extends Dossier {
  analyse?: Analyse
  rapports?: Rapport[]
}

export interface AuditLog {
  id: string
  user_id: string | null
  institution_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export interface AuditLogsResponse {
  items: AuditLog[]
  total: number
  page: number
  limit: number
}

// ---- Helpers ----

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 75) return 'Favorable'
  if (score >= 50) return 'Réservé'
  return 'Défavorable'
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-score-favorable'
  if (score >= 50) return 'text-score-reserve'
  return 'text-score-defavorable'
}

export function getScoreBgColor(score: number): string {
  if (score >= 75) return 'bg-score-favorable-bg text-score-favorable'
  if (score >= 50) return 'bg-score-reserve-bg text-score-reserve'
  return 'bg-score-defavorable-bg text-score-defavorable'
}

export function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number | null, decimals = 1): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}
