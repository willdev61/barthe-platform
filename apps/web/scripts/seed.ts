/**
 * Seed complet pour tests manuels en local — BARTHE Platform
 *
 * Ce script crée :
 *   - 1 super-admin (accès back office)
 *   - 2 institutions avec leurs admins et analystes
 *   - Des dossiers réalistes à différents stades (en_attente, en_cours, analyse, erreur)
 *   - Des analyses financières complètes pour les dossiers terminés
 *   - Des audit logs
 *
 * Usage :
 *   pnpm --filter web seed
 *   ou
 *   npx tsx --env-file .env.local scripts/seed.ts
 *
 * Comptes créés :
 *   superadmin@barthe.app          / barthe2024   → Back office
 *   admin@banque-atlantique.ci     / demo1234     → Admin Banque Atlantique CI
 *   aminata.kone@ba-ci.com         / demo1234     → Analyste Banque Atlantique CI
 *   kofi.asante@ba-ci.com          / demo1234     → Analyste Banque Atlantique CI
 *   admin@boad-senegal.sn          / demo1234     → Admin BOAD Sénégal
 *   ibrahima.diallo@boad-sn.org    / demo1234     → Analyste BOAD Sénégal
 */

import { auth } from '../lib/auth'
import { prisma } from '../lib/db'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// ─── Helpers ────────────────────────────────────────────────────────────────

function bearerHeaders(token: string): Headers {
  return new Headers({ Authorization: `Bearer ${token}` })
}

async function signUp(email: string, password: string, name: string): Promise<string> {
  try {
    const res = await auth.api.signUpEmail({ body: { email, password, name } })
    return res.user.id
  } catch {
    // L'utilisateur existe déjà — on récupère son ID
    const row = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    if (row.rows.length === 0) throw new Error(`Impossible de créer/trouver ${email}`)
    return row.rows[0].id
  }
}

async function signIn(email: string, password: string): Promise<string> {
  const res = await auth.api.signInEmail({ body: { email, password } })
  const token = (res as unknown as Record<string, unknown>).token as string | undefined
  if (!token) {
    // Fallback : lire le token de session directement en base
    const row = await pool.query(`SELECT token FROM session WHERE "userId" = (SELECT id FROM "user" WHERE email = $1) ORDER BY "createdAt" DESC LIMIT 1`, [email])
    if (row.rows.length === 0) throw new Error(`Impossible de récupérer le token pour ${email}`)
    return row.rows[0].token
  }
  return token
}

async function setUserRole(userId: string, role: string): Promise<void> {
  await pool.query(`UPDATE "user" SET role = $1 WHERE id = $2`, [role, userId])
}

async function createOrganization(name: string, slug: string, token: string): Promise<string> {
  // Vérifie si l'org existe déjà
  const existing = await pool.query(`SELECT id FROM organization WHERE slug = $1`, [slug])
  if (existing.rows.length > 0) return existing.rows[0].id

  const res = await auth.api.createOrganization({
    body: { name, slug },
    headers: bearerHeaders(token),
  })
  return (res as unknown as Record<string, unknown>).id as string
}

async function addMember(organizationId: string, userId: string, role: 'member' | 'admin' | 'owner'): Promise<void> {
  const exists = await pool.query(
    `SELECT id FROM member WHERE "organizationId" = $1 AND "userId" = $2`,
    [organizationId, userId]
  )
  if (exists.rows.length > 0) return

  await pool.query(
    `INSERT INTO member (id, "organizationId", "userId", role, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
    [organizationId, userId, role]
  )
}

// ─── Données financières réalistes ──────────────────────────────────────────

const ANALYSES = {
  agro_industrie: {
    donnees_normalisees: {
      chiffre_affaires: 4_850_000_000,
      charges_exploitation: 3_620_000_000,
      ebitda: 1_230_000_000,
      resultat_net: 680_000_000,
      dette_financiere: 2_100_000_000,
      secteur: 'Agriculture / Agro-industrie',
    },
    ratios: {
      ebitda_margin: { label: 'Marge EBITDA', valeur: 25.36, unite: '%', seuil_min: 15, description: 'EBITDA / CA' },
      dscr: { label: 'DSCR', valeur: 1.42, unite: 'x', seuil_min: 1.2, description: 'Capacité de remboursement' },
      levier: { label: 'Levier financier', valeur: 3.09, unite: 'x', seuil_max: 5, description: 'Dette / EBITDA' },
      roe: { label: 'ROE', valeur: 18.4, unite: '%', seuil_min: 10, description: 'Rentabilité des capitaux' },
      taux_endettement: { label: "Taux d'endettement", valeur: 43.3, unite: '%', seuil_max: 60, description: 'Dette / Actif total' },
    },
    alertes: [
      { id: 'a1', message: 'Forte dépendance à un marché export unique (UE)', criticite: 'warning' },
      { id: 'a2', message: 'Marge nette solide au-dessus des seuils sectoriels', criticite: 'info' },
    ],
    synthese_narrative: `Le projet SANIA présente un profil financier solide avec une marge EBITDA de 25,4%, supérieure aux standards du secteur agro-industriel en Afrique de l'Ouest (15-20%). Le DSCR de 1,42x offre un coussin de sécurité satisfaisant pour le remboursement de la dette. Le principal risque identifié est la concentration des débouchés commerciaux vers l'Union Européenne (68% du CA), rendant le projet sensible aux fluctuations du marché européen. La structure de financement avec un levier de 3,1x reste dans les limites acceptables. Avis : FAVORABLE sous réserve de diversification commerciale.`,
    modele_llm: 'gpt-4o',
    tokens_utilises: 3847,
  },
  infrastructure_portuaire: {
    donnees_normalisees: {
      chiffre_affaires: 12_400_000_000,
      charges_exploitation: 9_100_000_000,
      ebitda: 3_300_000_000,
      resultat_net: 1_450_000_000,
      dette_financiere: 18_500_000_000,
      secteur: 'Infrastructure / Transport',
    },
    ratios: {
      ebitda_margin: { label: 'Marge EBITDA', valeur: 26.6, unite: '%', seuil_min: 15, description: 'EBITDA / CA' },
      dscr: { label: 'DSCR', valeur: 1.18, unite: 'x', seuil_min: 1.2, description: 'Capacité de remboursement', seuil_max: undefined },
      levier: { label: 'Levier financier', valeur: 5.61, unite: 'x', seuil_max: 5, description: 'Dette / EBITDA' },
      roe: { label: 'ROE', valeur: 11.2, unite: '%', seuil_min: 10, description: 'Rentabilité des capitaux' },
      taux_endettement: { label: "Taux d'endettement", valeur: 61.4, unite: '%', seuil_max: 60, description: 'Dette / Actif total' },
    },
    alertes: [
      { id: 'b1', message: 'DSCR en-dessous du seuil minimal requis (1,20x)', criticite: 'critical' },
      { id: 'b2', message: 'Levier financier supérieur au seuil maximal (5x)', criticite: 'critical' },
      { id: 'b3', message: "Taux d'endettement légèrement au-dessus du plafond", criticite: 'warning' },
      { id: 'b4', message: "Projet d'intérêt public — potentiel soutien souverain à valider", criticite: 'info' },
    ],
    synthese_narrative: `Le projet d'infrastructure portuaire à Dakar présente une taille de financement significative (18,5 Mds FCFA) avec une rentabilité opérationnelle correcte (EBITDA 26,6%). Cependant, deux ratios clés sont hors normes : le DSCR à 1,18x est en-dessous du seuil minimal de 1,20x, et le levier financier à 5,61x dépasse le plafond de 5x. La nature de l'infrastructure d'utilité publique et le soutien potentiel de l'État sénégalais atténuent partiellement ces risques. Un réaménagement de la structure de financement (apport en fonds propres supplémentaire ou allongement de maturité) permettrait de ramener les ratios dans les normes. Avis : RÉSERVÉ — restructuration financière recommandée avant décision.`,
    modele_llm: 'gpt-4o',
    tokens_utilises: 5123,
  },
}

// ─── Seed principal ──────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🚀 Démarrage du seed BARTHE...\n')

  // ── 1. Créer les utilisateurs ──────────────────────────────────────────────
  console.log('👤 Création des utilisateurs...')

  const superAdminId = await signUp('superadmin@barthe.app', 'barthe2024', 'Super Admin BARTHE')
  await setUserRole(superAdminId, 'admin')
  console.log('   ✅ superadmin@barthe.app (back office admin)')

  const adminBaId = await signUp('admin@banque-atlantique.ci', 'demo1234', 'Kouassi Yao')
  console.log('   ✅ admin@banque-atlantique.ci')

  const aminataId = await signUp('aminata.kone@ba-ci.com', 'demo1234', 'Aminata Koné')
  console.log('   ✅ aminata.kone@ba-ci.com')

  const kofiId = await signUp('kofi.asante@ba-ci.com', 'demo1234', 'Kofi Asante')
  console.log('   ✅ kofi.asante@ba-ci.com')

  const adminBoadId = await signUp('admin@boad-senegal.sn', 'demo1234', 'Ousmane Diagne')
  console.log('   ✅ admin@boad-senegal.sn')

  const ibrahimaId = await signUp('ibrahima.diallo@boad-sn.org', 'demo1234', 'Ibrahima Diallo')
  console.log('   ✅ ibrahima.diallo@boad-sn.org')

  // ── 2. Créer les organisations better-auth + institutions Prisma ───────────
  console.log('\n🏦 Création des institutions...')

  const tokenAdminBa = await signIn('admin@banque-atlantique.ci', 'demo1234')
  const orgBaId = await createOrganization('Banque Atlantique CI', 'banque-atlantique-ci', tokenAdminBa)

  await prisma.institution.upsert({
    where: { id: orgBaId },
    update: {},
    create: {
      id: orgBaId,
      nom: 'Banque Atlantique CI',
      email_admin: 'admin@banque-atlantique.ci',
      pays: "Côte d'Ivoire",
      secteurs_cibles: 'Agriculture, Industrie, Commerce, Services financiers',
      abonnement_statut: 'actif',
      settings: {
        scoring_thresholds: { ebitda_min: 15, levier_max: 5, dscr_min: 1.2 },
        secteurs_actifs: ['Agriculture', 'Industrie', 'Commerce', 'Fintech', 'Services'],
        rapport_logo_url: null,
        rapport_mentions: 'Document confidentiel — Banque Atlantique CI © 2024',
      },
    },
  })
  console.log('   ✅ Banque Atlantique CI (actif) — org ID:', orgBaId)

  const tokenAdminBoad = await signIn('admin@boad-senegal.sn', 'demo1234')
  const orgBoadId = await createOrganization('BOAD Sénégal', 'boad-senegal', tokenAdminBoad)

  await prisma.institution.upsert({
    where: { id: orgBoadId },
    update: {},
    create: {
      id: orgBoadId,
      nom: 'BOAD Sénégal',
      email_admin: 'admin@boad-senegal.sn',
      pays: 'Sénégal',
      secteurs_cibles: 'Infrastructure, Énergie, Agriculture',
      abonnement_statut: 'trial',
      settings: {
        scoring_thresholds: { ebitda_min: 12, levier_max: 6, dscr_min: 1.15 },
        secteurs_actifs: ['Infrastructure', 'Énergie', 'Agriculture', 'Commerce'],
        rapport_logo_url: null,
        rapport_mentions: 'Confidentiel — BOAD Sénégal',
      },
    },
  })
  console.log('   ✅ BOAD Sénégal (trial) — org ID:', orgBoadId)

  // ── 3. Ajouter les membres aux organisations ───────────────────────────────
  console.log('\n👥 Ajout des membres...')

  await addMember(orgBaId, adminBaId, 'owner')
  await addMember(orgBaId, aminataId, 'member')
  await addMember(orgBaId, kofiId, 'member')
  console.log('   ✅ Membres Banque Atlantique CI')

  await addMember(orgBoadId, adminBoadId, 'owner')
  await addMember(orgBoadId, ibrahimaId, 'member')
  console.log('   ✅ Membres BOAD Sénégal')

  // ── 4. Créer les utilisateurs Prisma (miroir des users better-auth) ────────
  console.log('\n🗂️  Synchronisation des utilisateurs Prisma...')

  const prismaUsers = [
    { id: adminBaId, institution_id: orgBaId, nom: 'Kouassi Yao', email: 'admin@banque-atlantique.ci', role: 'admin' },
    { id: aminataId, institution_id: orgBaId, nom: 'Aminata Koné', email: 'aminata.kone@ba-ci.com', role: 'analyste' },
    { id: kofiId, institution_id: orgBaId, nom: 'Kofi Asante', email: 'kofi.asante@ba-ci.com', role: 'analyste' },
    { id: adminBoadId, institution_id: orgBoadId, nom: 'Ousmane Diagne', email: 'admin@boad-senegal.sn', role: 'admin' },
    { id: ibrahimaId, institution_id: orgBoadId, nom: 'Ibrahima Diallo', email: 'ibrahima.diallo@boad-sn.org', role: 'analyste' },
  ]

  for (const u of prismaUsers) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    })
  }
  console.log('   ✅ Utilisateurs Prisma synchronisés')

  // ── 5. Créer les dossiers ─────────────────────────────────────────────────
  console.log('\n📁 Création des dossiers...')

  // — Banque Atlantique CI — 4 dossiers —
  const dossierSania = await prisma.dossier.upsert({
    where: { id: 'dossier-sania-001' },
    update: {},
    create: {
      id: 'dossier-sania-001',
      institution_id: orgBaId,
      created_by: aminataId,
      nom_projet: 'Projet Agro-Industrie SANIA',
      secteur: 'Agriculture / Agro-industrie',
      fichier_nom: 'BusinessPlan_SANIA_2024.xlsx',
      fichier_url: null,
      statut: 'analyse',
      score: 78,
    },
  })
  console.log('   ✅ [BA-CI] Projet Agro-Industrie SANIA (analyse, score: 78)')

  await prisma.dossier.upsert({
    where: { id: 'dossier-textile-002' },
    update: {},
    create: {
      id: 'dossier-textile-002',
      institution_id: orgBaId,
      created_by: aminataId,
      nom_projet: 'Financement PME Textile Abidjan',
      secteur: 'Industrie textile',
      fichier_nom: 'BP_TextileAbidjan_v2.xlsx',
      fichier_url: null,
      statut: 'en_cours',
      score: null,
    },
  })
  console.log('   ✅ [BA-CI] Financement PME Textile Abidjan (en_cours)')

  await prisma.dossier.upsert({
    where: { id: 'dossier-hotel-003' },
    update: {},
    create: {
      id: 'dossier-hotel-003',
      institution_id: orgBaId,
      created_by: kofiId,
      nom_projet: 'Projet Hôtelier Grand Bassam',
      secteur: 'Tourisme / Hôtellerie',
      fichier_nom: 'BP_Hotel_GrandBassam.xlsx',
      fichier_url: null,
      statut: 'erreur',
      score: null,
    },
  })
  console.log('   ✅ [BA-CI] Projet Hôtelier Grand Bassam (erreur)')

  await prisma.dossier.upsert({
    where: { id: 'dossier-solar-004' },
    update: {},
    create: {
      id: 'dossier-solar-004',
      institution_id: orgBaId,
      created_by: kofiId,
      nom_projet: 'Centrale Solaire Bouaké 20MW',
      secteur: 'Énergie renouvelable',
      fichier_nom: null,
      fichier_url: null,
      statut: 'en_attente',
      score: null,
    },
  })
  console.log('   ✅ [BA-CI] Centrale Solaire Bouaké 20MW (en_attente)')

  // — BOAD Sénégal — 2 dossiers —
  const dossierPort = await prisma.dossier.upsert({
    where: { id: 'dossier-port-001' },
    update: {},
    create: {
      id: 'dossier-port-001',
      institution_id: orgBoadId,
      created_by: ibrahimaId,
      nom_projet: 'Infrastructure Portuaire Dakar Phase 2',
      secteur: 'Infrastructure / Transport',
      fichier_nom: 'BP_PortDakar_Phase2_2024.xlsx',
      fichier_url: null,
      statut: 'analyse',
      score: 58,
    },
  })
  console.log('   ✅ [BOAD-SN] Infrastructure Portuaire Dakar Phase 2 (analyse, score: 58)')

  await prisma.dossier.upsert({
    where: { id: 'dossier-agri-002' },
    update: {},
    create: {
      id: 'dossier-agri-002',
      institution_id: orgBoadId,
      created_by: ibrahimaId,
      nom_projet: 'Programme Irrigation Casamance',
      secteur: 'Agriculture',
      fichier_nom: 'BP_IrrigationCasamance.xlsx',
      fichier_url: null,
      statut: 'en_attente',
      score: null,
    },
  })
  console.log('   ✅ [BOAD-SN] Programme Irrigation Casamance (en_attente)')

  // ── 6. Créer les analyses ─────────────────────────────────────────────────
  console.log('\n📊 Création des analyses...')

  await prisma.analyse.upsert({
    where: { dossier_id: dossierSania.id },
    update: {},
    create: {
      dossier_id: dossierSania.id,
      donnees_normalisees: ANALYSES.agro_industrie.donnees_normalisees,
      ratios: ANALYSES.agro_industrie.ratios,
      alertes: ANALYSES.agro_industrie.alertes,
      synthese_narrative: ANALYSES.agro_industrie.synthese_narrative,
      modele_llm: ANALYSES.agro_industrie.modele_llm,
      tokens_utilises: ANALYSES.agro_industrie.tokens_utilises,
    },
  })
  console.log('   ✅ Analyse SANIA (Favorable, DSCR 1.42x, Levier 3.1x)')

  await prisma.analyse.upsert({
    where: { dossier_id: dossierPort.id },
    update: {},
    create: {
      dossier_id: dossierPort.id,
      donnees_normalisees: ANALYSES.infrastructure_portuaire.donnees_normalisees,
      ratios: ANALYSES.infrastructure_portuaire.ratios,
      alertes: ANALYSES.infrastructure_portuaire.alertes,
      synthese_narrative: ANALYSES.infrastructure_portuaire.synthese_narrative,
      modele_llm: ANALYSES.infrastructure_portuaire.modele_llm,
      tokens_utilises: ANALYSES.infrastructure_portuaire.tokens_utilises,
    },
  })
  console.log('   ✅ Analyse Port Dakar (Réservé, DSCR 1.18x, Levier 5.6x)')

  // ── 7. Créer les audit logs ───────────────────────────────────────────────
  console.log('\n📋 Création des audit logs...')

  const auditEntries = [
    { user_id: aminataId, institution_id: orgBaId, action: 'CREATE', entity_type: 'Dossier', entity_id: 'dossier-sania-001', metadata: { nom_projet: 'Projet Agro-Industrie SANIA' } },
    { user_id: aminataId, institution_id: orgBaId, action: 'ANALYSE', entity_type: 'Dossier', entity_id: 'dossier-sania-001', metadata: { score: 78, verdict: 'Favorable' } },
    { user_id: aminataId, institution_id: orgBaId, action: 'CREATE', entity_type: 'Dossier', entity_id: 'dossier-textile-002', metadata: { nom_projet: 'Financement PME Textile Abidjan' } },
    { user_id: kofiId, institution_id: orgBaId, action: 'CREATE', entity_type: 'Dossier', entity_id: 'dossier-hotel-003', metadata: { nom_projet: 'Projet Hôtelier Grand Bassam' } },
    { user_id: kofiId, institution_id: orgBaId, action: 'ERROR', entity_type: 'Dossier', entity_id: 'dossier-hotel-003', metadata: { raison: 'Fichier Excel non conforme — structure non reconnue' } },
    { user_id: ibrahimaId, institution_id: orgBoadId, action: 'CREATE', entity_type: 'Dossier', entity_id: 'dossier-port-001', metadata: { nom_projet: 'Infrastructure Portuaire Dakar Phase 2' } },
    { user_id: ibrahimaId, institution_id: orgBoadId, action: 'ANALYSE', entity_type: 'Dossier', entity_id: 'dossier-port-001', metadata: { score: 58, verdict: 'Réservé' } },
  ]

  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry })
  }
  console.log(`   ✅ ${auditEntries.length} entrées d'audit`)

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  SEED TERMINÉ

📌 Comptes disponibles :
   Back office  │ superadmin@barthe.app         │ barthe2024
   Admin BA-CI  │ admin@banque-atlantique.ci     │ demo1234
   Analyste     │ aminata.kone@ba-ci.com         │ demo1234
   Analyste     │ kofi.asante@ba-ci.com          │ demo1234
   Admin BOAD   │ admin@boad-senegal.sn          │ demo1234
   Analyste     │ ibrahima.diallo@boad-sn.org    │ demo1234

🏦 Institutions :
   Banque Atlantique CI  (actif)  — 4 dossiers
   BOAD Sénégal          (trial)  — 2 dossiers

📁 Dossiers :
   [BA-CI]  Agro-Industrie SANIA     → analyse   score 78  ✅ Favorable
   [BA-CI]  PME Textile Abidjan      → en_cours
   [BA-CI]  Hôtelier Grand Bassam    → erreur
   [BA-CI]  Centrale Solaire 20MW    → en_attente
   [BOAD]   Port Dakar Phase 2       → analyse   score 58  ⚠️  Réservé
   [BOAD]   Irrigation Casamance     → en_attente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

seed()
  .catch((e) => {
    console.error('\n❌ Erreur seed :', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
