// packages/types/src/dossier.ts

export type DossierStatut = 'en_attente' | 'en_cours' | 'analyse' | 'erreur'

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
