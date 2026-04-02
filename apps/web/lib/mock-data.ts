// ---- Mock Data for BARTHE (USE_MOCK=true) ----

import type {
  User,
  Institution,
  Dossier,
  DossierComplet,
  Analyse,
  AuditLog,
  InstitutionSettings,
} from './types'

export const MOCK_INSTITUTION_SETTINGS: InstitutionSettings = {
  scoring_thresholds: { ebitda_min: 20, levier_max: 3.0, dscr_min: 1.2 },
  secteurs_actifs: ['Agriculture', 'Commerce général', 'Services numériques', 'Agroalimentaire'],
  rapport_logo_url: null,
  rapport_mentions: 'Document confidentiel — usage interne uniquement',
}

export const MOCK_INSTITUTION: Institution = {
  id: 'inst-001',
  nom: 'Banque Atlantique CI',
  email_admin: 'admin@ba-ci.com',
  pays: "Côte d'Ivoire",
  secteurs_cibles: 'Agriculture, Commerce, Services',
  abonnement_statut: 'actif',
  created_at: '2024-01-15T09:00:00Z',
  settings: MOCK_INSTITUTION_SETTINGS,
}

export const MOCK_USER: User = {
  id: 'user-001',
  institution_id: 'inst-001',
  nom: 'Koné Aminata',
  email: 'aminata.kone@ba-ci.com',
  role: 'analyste',
  last_login: new Date().toISOString(),
  created_at: '2024-01-20T10:00:00Z',
}

export const MOCK_DOSSIERS: Dossier[] = [
  {
    id: 'dos-001',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'Agro-Export Abidjan SARL',
    secteur: 'Agriculture',
    fichier_nom: 'business_plan_agro_export_2024.xlsx',
    fichier_url: '/uploads/dos-001.xlsx',
    statut: 'analyse',
    score: 82,
    created_at: '2025-03-20T08:30:00Z',
    updated_at: '2025-03-20T09:15:00Z',
  },
  {
    id: 'dos-002',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'TechServices Dakar SAS',
    secteur: 'Services numériques',
    fichier_nom: 'bp_techservices_2024.xlsx',
    fichier_url: '/uploads/dos-002.xlsx',
    statut: 'analyse',
    score: 61,
    created_at: '2025-03-18T14:00:00Z',
    updated_at: '2025-03-18T14:45:00Z',
  },
  {
    id: 'dos-003',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'Boulangerie Moderne Ouaga',
    secteur: 'Agroalimentaire',
    fichier_nom: 'boulangerie_ouaga_bp.xlsx',
    fichier_url: '/uploads/dos-003.xlsx',
    statut: 'analyse',
    score: 38,
    created_at: '2025-03-15T11:00:00Z',
    updated_at: '2025-03-15T11:50:00Z',
  },
  {
    id: 'dos-004',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'Logistique Express Lomé',
    secteur: 'Transport & Logistique',
    fichier_nom: 'logistique_express_lome.xlsx',
    fichier_url: '/uploads/dos-004.xlsx',
    statut: 'en_cours',
    score: null,
    created_at: '2025-03-25T09:00:00Z',
    updated_at: '2025-03-25T09:05:00Z',
  },
  {
    id: 'dos-005',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'Clinique Santé Plus Bamako',
    secteur: 'Santé',
    fichier_nom: 'sante_plus_bamako.xlsx',
    fichier_url: '/uploads/dos-005.xlsx',
    statut: 'en_attente',
    score: null,
    created_at: '2025-03-26T16:00:00Z',
    updated_at: '2025-03-26T16:00:00Z',
  },
  {
    id: 'dos-006',
    institution_id: 'inst-001',
    created_by: 'user-001',
    nom_projet: 'Immobilier Sud Abidjan',
    secteur: 'Immobilier',
    fichier_nom: 'immobilier_sud.xlsx',
    fichier_url: '/uploads/dos-006.xlsx',
    statut: 'erreur',
    score: null,
    created_at: '2025-03-17T10:00:00Z',
    updated_at: '2025-03-17T10:02:00Z',
  },
]

export const MOCK_ANALYSES: Record<string, Analyse> = {
  'dos-001': {
    id: 'ana-001',
    dossier_id: 'dos-001',
    donnees_normalisees: {
      chiffre_affaires: 850000000,
      charges_exploitation: 620000000,
      ebitda: 230000000,
      resultat_net: 145000000,
      dette_financiere: 580000000,
      secteur: 'Agriculture',
    },
    ratios: {
      marge_brute: {
        label: 'Marge brute',
        valeur: 27.1,
        unite: '%',
        seuil_min: 15,
        description: '(CA - Charges) / CA × 100',
      },
      taux_ebitda: {
        label: "Taux d'EBITDA",
        valeur: 27.1,
        unite: '%',
        seuil_min: 20,
        description: 'EBITDA / CA × 100',
      },
      levier_financier: {
        label: 'Levier financier',
        valeur: 2.52,
        unite: 'x',
        seuil_max: 3,
        description: 'Dette / EBITDA',
      },
      ratio_endettement: {
        label: 'Ratio endettement',
        valeur: 68.2,
        unite: '%',
        seuil_max: 100,
        description: 'Dette / CA × 100',
      },
      dscr: {
        label: 'DSCR',
        valeur: 1.57,
        unite: 'x',
        seuil_min: 1.2,
        description: 'EBITDA / (Dette × 0.15)',
      },
    },
    alertes: [
      {
        id: 'alt-001',
        message:
          'Forte dépendance saisonnière des revenus — prévoir un fonds de roulement adapté.',
        criticite: 'warning',
      },
      {
        id: 'alt-002',
        message:
          'Concentration client : les 3 premiers acheteurs représentent 65% du CA.',
        criticite: 'warning',
      },
    ],
    synthese_narrative: `L'entreprise Agro-Export Abidjan présente un profil financier globalement solide pour le secteur agricole. Le chiffre d'affaires de 850M FCFA est soutenu par des contrats d'exportation bien établis vers l'Europe et l'Asie.

Le taux d'EBITDA de 27,1% dépasse le seuil de référence sectoriel (20%), témoignant d'une bonne maîtrise des coûts opérationnels. Le levier financier de 2,52x reste en deçà du seuil d'alerte de 3x, ce qui reflète une gestion prudente de l'endettement.

Le DSCR de 1,57 indique une capacité de remboursement confortable. Deux points d'attention méritent surveillance : la saisonnalité des flux de trésorerie liée aux cycles agricoles et la concentration client. Une ligne de crédit de campagne pourrait compléter favorablement le financement demandé.

**Recommandation :** Financement favorable sous réserve de mise en place d'une garantie réelle et d'un suivi trimestriel des indicateurs de performance.`,
    modele_llm: 'claude-sonnet-4-6',
    tokens_utilises: 2840,
    created_at: '2025-03-20T09:15:00Z',
  },
  'dos-002': {
    id: 'ana-002',
    dossier_id: 'dos-002',
    donnees_normalisees: {
      chiffre_affaires: 420000000,
      charges_exploitation: 340000000,
      ebitda: 80000000,
      resultat_net: 42000000,
      dette_financiere: 290000000,
      secteur: 'Services numériques',
    },
    ratios: {
      marge_brute: {
        label: 'Marge brute',
        valeur: 19.0,
        unite: '%',
        seuil_min: 15,
        description: '(CA - Charges) / CA × 100',
      },
      taux_ebitda: {
        label: "Taux d'EBITDA",
        valeur: 19.0,
        unite: '%',
        seuil_min: 20,
        description: 'EBITDA / CA × 100',
      },
      levier_financier: {
        label: 'Levier financier',
        valeur: 3.63,
        unite: 'x',
        seuil_max: 3,
        description: 'Dette / EBITDA',
      },
      ratio_endettement: {
        label: 'Ratio endettement',
        valeur: 69.0,
        unite: '%',
        seuil_max: 100,
        description: 'Dette / CA × 100',
      },
      dscr: {
        label: 'DSCR',
        valeur: 1.84,
        unite: 'x',
        seuil_min: 1.2,
        description: 'EBITDA / (Dette × 0.15)',
      },
    },
    alertes: [
      {
        id: 'alt-003',
        message:
          "Taux d'EBITDA légèrement en dessous du seuil de référence (19% vs 20%).",
        criticite: 'warning',
      },
      {
        id: 'alt-004',
        message:
          'Levier financier élevé à 3,63x — risque de sous-capitalisation.',
        criticite: 'critical',
      },
      {
        id: 'alt-005',
        message: 'Hypothèses de croissance optimistes : +40% CA année 2.',
        criticite: 'info',
      },
    ],
    synthese_narrative: `TechServices Dakar présente un profil à risque modéré. La société opère dans un secteur en croissance mais affiche un levier financier de 3,63x, dépassant le seuil prudentiel de 3x. Le taux d'EBITDA reste légèrement en dessous des standards sectoriels.

**Recommandation :** Financement réservé — des garanties complémentaires sont nécessaires avant décision finale.`,
    modele_llm: 'claude-sonnet-4-6',
    tokens_utilises: 1950,
    created_at: '2025-03-18T14:45:00Z',
  },
  'dos-003': {
    id: 'ana-003',
    dossier_id: 'dos-003',
    donnees_normalisees: {
      chiffre_affaires: 180000000,
      charges_exploitation: 175000000,
      ebitda: 5000000,
      resultat_net: -8000000,
      dette_financiere: 120000000,
      secteur: 'Agroalimentaire',
    },
    ratios: {
      marge_brute: {
        label: 'Marge brute',
        valeur: 2.8,
        unite: '%',
        seuil_min: 15,
        description: '(CA - Charges) / CA × 100',
      },
      taux_ebitda: {
        label: "Taux d'EBITDA",
        valeur: 2.8,
        unite: '%',
        seuil_min: 20,
        description: 'EBITDA / CA × 100',
      },
      levier_financier: {
        label: 'Levier financier',
        valeur: 24.0,
        unite: 'x',
        seuil_max: 3,
        description: 'Dette / EBITDA',
      },
      ratio_endettement: {
        label: 'Ratio endettement',
        valeur: 66.7,
        unite: '%',
        seuil_max: 100,
        description: 'Dette / CA × 100',
      },
      dscr: {
        label: 'DSCR',
        valeur: 0.28,
        unite: 'x',
        seuil_min: 1.2,
        description: 'EBITDA / (Dette × 0.15)',
      },
    },
    alertes: [
      {
        id: 'alt-006',
        message: 'Résultat net négatif : -8M FCFA. Pertes opérationnelles.',
        criticite: 'critical',
      },
      {
        id: 'alt-007',
        message:
          'DSCR de 0,28 — incapacité manifeste à couvrir le service de la dette.',
        criticite: 'critical',
      },
      {
        id: 'alt-008',
        message:
          "Levier financier extrême à 24x — surendettement structurel.",
        criticite: 'critical',
      },
      {
        id: 'alt-009',
        message:
          "Marge brute de 2,8% très insuffisante pour le secteur agroalimentaire.",
        criticite: 'critical',
      },
    ],
    synthese_narrative: `La Boulangerie Moderne Ouaga présente un profil financier très défavorable. L'entreprise génère des pertes nettes et affiche un DSCR de 0,28, bien en dessous du seuil minimal de 1,2.

**Recommandation :** Financement non recommandé en l'état. Restructuration financière préalable indispensable.`,
    modele_llm: 'claude-sonnet-4-6',
    tokens_utilises: 2100,
    created_at: '2025-03-15T11:50:00Z',
  },
}

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'dossier.created',
    entity_type: 'dossier',
    entity_id: 'dos-001',
    metadata: { nom_projet: 'Agro-Export Abidjan SARL' },
    ip_address: '192.168.1.10',
    created_at: '2025-03-20T08:30:00Z',
  },
  {
    id: 'aud-002',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'analyse.run',
    entity_type: 'analyse',
    entity_id: 'ana-001',
    metadata: { dossier_id: 'dos-001', score: 82, tokens: 2840 },
    ip_address: '192.168.1.10',
    created_at: '2025-03-20T09:00:00Z',
  },
  {
    id: 'aud-003',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'rapport.exported',
    entity_type: 'rapport',
    entity_id: 'rap-001',
    metadata: { dossier_id: 'dos-001', pdf_url: '/uploads/rapport_dos-001.pdf' },
    ip_address: '192.168.1.10',
    created_at: '2025-03-20T09:20:00Z',
  },
  {
    id: 'aud-004',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'dossier.created',
    entity_type: 'dossier',
    entity_id: 'dos-002',
    metadata: { nom_projet: 'TechServices Dakar SAS' },
    ip_address: '192.168.1.10',
    created_at: '2025-03-18T14:00:00Z',
  },
  {
    id: 'aud-005',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'analyse.run',
    entity_type: 'analyse',
    entity_id: 'ana-002',
    metadata: { dossier_id: 'dos-002', score: 61, tokens: 1950 },
    ip_address: '192.168.1.10',
    created_at: '2025-03-18T14:30:00Z',
  },
  {
    id: 'aud-006',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'dossier.created',
    entity_type: 'dossier',
    entity_id: 'dos-003',
    metadata: { nom_projet: 'Boulangerie Moderne Ouaga' },
    ip_address: '192.168.1.10',
    created_at: '2025-03-15T11:00:00Z',
  },
  {
    id: 'aud-007',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'analyse.run',
    entity_type: 'analyse',
    entity_id: 'ana-003',
    metadata: { dossier_id: 'dos-003', score: 38, tokens: 2100 },
    ip_address: '192.168.1.10',
    created_at: '2025-03-15T11:30:00Z',
  },
  {
    id: 'aud-008',
    user_id: 'user-001',
    institution_id: 'inst-001',
    action: 'user.invited',
    entity_type: 'user',
    entity_id: null,
    metadata: { email: 'diallo.ibrahima@ba-ci.com', role: 'analyste' },
    ip_address: '192.168.1.10',
    created_at: '2025-03-10T10:00:00Z',
  },
]

export function getMockDossierComplet(id: string): DossierComplet | null {
  const dossier = MOCK_DOSSIERS.find((d) => d.id === id)
  if (!dossier) return null
  return {
    ...dossier,
    analyse: MOCK_ANALYSES[id],
    rapports: [],
  }
}
