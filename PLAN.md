# Plan de refactorisation — Architecture Feature-Based

> **Objectif :** Architecture modulaire par feature avec base PostgreSQL partagée entre Next.js et Python.
> **Décision d'architecture :** Scénario A — Server Actions + Prisma pour le CRUD, Python uniquement pour le traitement fichiers (Excel/PDF, LLM, scoring, génération PDF).

---

## Règles d'architecture

```
apps/web/
├── features/
│   └── <feature>/
│       ├── actions/     # Server Actions (mutations via Prisma) — CRUD uniquement
│       ├── services/    # Appels HTTP Python (fetch) — analyse fichiers uniquement
│       ├── schemas/     # Zod — validation server-side dans les actions
│       ├── types/       # Types TypeScript propres à la feature
│       └── views/
│           ├── pages/       # Composant page entier
│           ├── forms/       # Formulaires (React Hook Form + Zod)
│           ├── components/  # Composants UI réutilisables
│           └── dialogs/     # Modales / drawers
├── common/
│   ├── types/           # Types partagés (pagination, form state, page props)
│   └── hooks/           # Hooks partagés
└── app/                 # Route files minimalistes — importent les views/pages
```

### Règle de séparation Python vs Server Actions

| Opération | Couche | Raison |
|---|---|---|
| Liste / détail dossiers | Server Action → Prisma | CRUD simple |
| Créer dossier (métadonnées) | Server Action → Prisma | CRUD simple |
| Supprimer dossier | Server Action → Prisma | CRUD simple |
| Upload fichier Excel/PDF | `fetch` → Python | Python gère le parsing |
| Lancer l'analyse LLM | `fetch` → Python | Python gère l'analyse |
| Générer rapport PDF | `fetch` → Python | Python gère la génération |
| Settings institution | Server Action → Prisma | CRUD simple |
| Audit logs | Server Action → Prisma | CRUD simple |
| Admin institutions/users | Server Action → Prisma | CRUD simple |
| Comparatif | Server Action → Prisma | Requête DB directe |
| Auth | Better-Auth | inchangé |

---

## Statut global

| Phase | Contenu | Statut |
|---|---|---|
| Phase 0 | Prisma setup + schéma DB | ⬜ À faire |
| Phase 1 | `features/dossiers` → Server Actions | ⬜ À refaire |
| Phase 2 | `features/import` — garde Python | ✅ Fait (Python) |
| Phase 3 | `features/analyse` — garde Python | ✅ Fait (Python) |
| Phase 4 | `features/comparatif` → Server Actions | ⬜ À refaire |
| Phase 5 | `features/historique` → Server Actions | ⬜ À refaire |
| Phase 6 | `features/settings` → Server Actions | ⬜ À refaire |
| Phase 7 | `features/auth` | ✅ Fait (Better-Auth) |
| Phase 8 | `features/admin` → Server Actions | ⬜ À refaire |
| Phase 9 | Nettoyage `lib/api.ts`, `lib/mock-data.ts` | ⬜ À faire |

---

## Phase 0 — Prisma setup ✦ PRIORITÉ ABSOLUE

Avant toute migration vers les Server Actions, Prisma doit être configuré.

### Installation
```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

### Schéma à créer (`prisma/schema.prisma`)

Basé sur `lib/types.ts` existant :

```prisma
model Institution {
  id               String   @id @default(cuid())
  nom              String
  email_admin      String   @unique
  pays             String
  secteurs_cibles  String?
  abonnement_statut String  @default("trial")
  created_at       DateTime @default(now())
  settings         Json?
  dossiers         Dossier[]
  users            User[]
  audit_logs       AuditLog[]
}

model User {
  id             String      @id @default(cuid())
  institution_id String
  nom            String
  email          String      @unique
  role           String      @default("analyste")
  last_login     DateTime?
  created_at     DateTime    @default(now())
  institution    Institution @relation(fields: [institution_id], references: [id])
}

model Dossier {
  id             String      @id @default(cuid())
  institution_id String
  created_by     String
  nom_projet     String
  secteur        String?
  fichier_nom    String?
  fichier_url    String?
  statut         String      @default("en_attente")
  score          Int?
  created_at     DateTime    @default(now())
  updated_at     DateTime    @updatedAt
  institution    Institution @relation(fields: [institution_id], references: [id])
  analyse        Analyse?
  rapports       Rapport[]
  audit_logs     AuditLog[]
}

model Analyse {
  id                  String   @id @default(cuid())
  dossier_id          String   @unique
  donnees_normalisees Json
  ratios              Json
  alertes             Json
  synthese_narrative  String?
  modele_llm          String
  tokens_utilises     Int?
  created_at          DateTime @default(now())
  dossier             Dossier  @relation(fields: [dossier_id], references: [id])
}

model Rapport {
  id         String   @id @default(cuid())
  dossier_id String
  genere_par String
  pdf_url    String
  created_at DateTime @default(now())
  dossier    Dossier  @relation(fields: [dossier_id], references: [id])
}

model AuditLog {
  id             String      @id @default(cuid())
  user_id        String?
  institution_id String?
  action         String
  entity_type    String
  entity_id      String?
  metadata       Json        @default("{}")
  ip_address     String?
  created_at     DateTime    @default(now())
  institution    Institution? @relation(fields: [institution_id], references: [id])
}
```

### Fichier lib/db.ts à créer
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Phase 1 — features/dossiers → Server Actions

Remplacer `services/dossier-service.ts` (fetch Python) par des `actions/`.

```
features/dossiers/
├── actions/
│   ├── get-dossiers-action.ts      # 'use server' — prisma.dossier.findMany()
│   ├── get-dossier-action.ts       # 'use server' — prisma.dossier.findUnique()
│   ├── create-dossier-action.ts    # 'use server' — prisma.dossier.create()
│   └── delete-dossier-action.ts    # 'use server' — prisma.dossier.delete()
└── services/
    └── (vide — supprimé)
```

---

## Phase 4 — features/comparatif → Server Actions

```
features/comparatif/
└── actions/
    └── get-comparatif-action.ts    # 'use server' — prisma.dossier.findMany({ where: { id: { in: ids } } })
```

---

## Phase 5 — features/historique → Server Actions

```
features/historique/
└── actions/
    ├── get-audit-logs-action.ts
    └── get-audit-logs-dossier-action.ts
```

---

## Phase 6 — features/settings → Server Actions

```
features/settings/
└── actions/
    ├── get-institution-action.ts
    ├── update-institution-settings-action.ts
    └── upload-logo-action.ts       # upload vers storage, puis update Prisma
```

---

## Phase 8 — features/admin → Server Actions

```
features/admin/features/
├── institutions/actions/
│   ├── get-admin-institutions-action.ts
│   ├── update-institution-statut-action.ts
│   └── delete-institution-action.ts
├── users/actions/
│   ├── get-admin-users-action.ts
│   ├── update-user-role-action.ts
│   └── delete-user-action.ts
└── monitoring/actions/
    └── get-monitoring-action.ts
```

---

## Phase 9 — Nettoyage

- [ ] Supprimer `lib/api.ts`
- [ ] Supprimer `lib/mock-data.ts`
- [ ] Vérifier qu'aucun import ne pointe encore sur `lib/api`

---

## Ce qui ne change PAS

- `features/import` — `upload-zone`, `import-service` → Python (parsing Excel/PDF)
- `features/analyse` — `analyse-service` → Python (LLM, scoring, rapport PDF)
- `features/auth` — Better-Auth, aucun changement
- Shadcn/UI, SWR (lectures client), Tailwind CSS — aucun changement
- Structure des routes App Router — aucun changement
