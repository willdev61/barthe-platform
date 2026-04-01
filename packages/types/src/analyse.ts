// packages/types/src/analyse.ts

export type AlerteCriticite = 'info' | 'warning' | 'critical'
export type ScoreLabel = 'Favorable' | 'Réservé' | 'Défavorable'

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

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 75) return 'Favorable'
  if (score >= 50) return 'Réservé'
  return 'Défavorable'
}
