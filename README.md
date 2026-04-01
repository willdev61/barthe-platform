# BARTHE — Plateforme SaaS d'Analyse de Business Plans

Plateforme B2B destinée aux institutions financières d'Afrique francophone. Permet à un analyste crédit d'importer un Business Plan Excel, d'obtenir une analyse financière standardisée avec un score de finançabilité, et d'exporter un rapport PDF prêt pour comité de crédit.

---

## Architecture

Monorepo **Turborepo 2.x** + **pnpm workspaces**

```
barthe/
├── apps/
│   ├── web/          # Next.js 16.2 — interface analyste
│   └── api/          # FastAPI Python 3.13
└── packages/
    ├── ui/           # @barthe/ui — composants shadcn partagés
    ├── types/        # @barthe/types — types TypeScript partagés
    └── config/       # @barthe/config — tsconfig & tailwind partagés
```

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16.2, React 19, Tailwind CSS 4, shadcn/ui |
| Backend | FastAPI (Python 3.13), SQLAlchemy 2.x async, Alembic |
| Base de données | PostgreSQL (asyncpg) |
| IA | Anthropic Claude (claude-sonnet-4-6) |
| Monorepo | Turborepo 2.x, pnpm 9.x |

---

## Prérequis

- **Node.js** 22.x LTS
- **pnpm** 9.x (`npm install -g pnpm`)
- **Python** 3.13
- **uv** (`pip install uv`) — gestionnaire Python
- **PostgreSQL** 15+ (optionnel si `USE_MOCK=true`)

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/your-org/barthe.git
cd barthe

# Installer les dépendances Node.js
pnpm install

# Installer les dépendances Python
cd apps/api
uv pip install -r requirements.txt
cd ../..

# Copier les variables d'environnement
cp .env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

---

## Développement

```bash
# Tout lancer en même temps (Next.js + uvicorn)
pnpm dev

# Seulement le frontend Next.js
pnpm dev:web

# Seulement l'API FastAPI
pnpm dev:api

# Build production
pnpm build
```

Accès :
- **Frontend** : http://localhost:3000
- **API** : http://localhost:8000
- **Swagger** : http://localhost:8000/docs

---

## Variables d'environnement

### apps/web/.env.local
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### apps/api/.env
```bash
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/barthe
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXX
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRE_MINUTES=1440
STORAGE_PATH=./uploads
USE_MOCK=true         # true = données mockées, pas besoin de PostgreSQL
```

---

## Mode démonstration (USE_MOCK=true)

Avec `USE_MOCK=true` (valeur par défaut), **aucune base de données ni clé Anthropic ne sont nécessaires**. Des données de démonstration sont chargées automatiquement.

Identifiants de démonstration :
- **Email** : `aminata.kone@ba-ci.com`
- **Mot de passe** : `demo1234`

---

## Migration base de données

```bash
cd apps/api

# Créer la base
createdb barthe

# Appliquer les migrations
uv run alembic upgrade head

# Créer une nouvelle migration
uv run alembic revision --autogenerate -m "description"
```

---

## Interfaces

| Route | Description |
|---|---|
| `/login` | Authentification |
| `/dashboard` | Tableau de bord — liste des dossiers |
| `/import` | Import d'un Business Plan Excel |
| `/dossiers/[id]` | Analyse détaillée + export PDF |

---

## Endpoints API

```
POST   /auth/login
POST   /auth/register

GET    /dossiers
POST   /dossiers
GET    /dossiers/{id}
DELETE /dossiers/{id}

POST   /analyses/{dossier_id}/run
GET    /analyses/{dossier_id}

POST   /rapports/{dossier_id}
GET    /rapports/{dossier_id}
```

---

## Score de finançabilité

| Critère | Points |
|---|---|
| Taux EBITDA > 20% | +25 |
| Levier financier < 3x | +25 |
| DSCR > 1,2 | +25 |
| Aucune alerte critique | +25 |

| Score | Mention |
|---|---|
| 75 – 100 | Favorable |
| 50 – 74 | Réservé |
| 0 – 49 | Défavorable |

---

## Licence

Propriétaire — Usage interne uniquement.  
Généré par BARTHE — Document confidentiel.
