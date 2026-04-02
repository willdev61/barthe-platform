"""
Admin Router — Back Office BARTHE
Tous les endpoints sont protégés par require_admin (role === "admin").
"""

import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Institution, User, Dossier, Analyse

router = APIRouter()


# ---- Auth guard ----

MOCK_ADMIN_USER = {"id": "admin-001", "role": "admin", "email": "admin@barthe.io"}


async def get_current_user(request: Request) -> dict:
    """
    Extract current user from BetterAuth session.
    In mock mode returns a static admin user.
    In production, validate the BetterAuth session token from the cookie/header.
    """
    if settings.USE_MOCK:
        return MOCK_ADMIN_USER
    # TODO: wire BetterAuth session validation when deploying to production
    raise HTTPException(status_code=401, detail="Non authentifié")


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux admins")
    return current_user


# ---- Mock data ----

MOCK_INSTITUTIONS_ADMIN = [
    {
        "id": "inst-001", "nom": "Banque Atlantique CI", "email_admin": "admin@ba-ci.com",
        "pays": "Côte d'Ivoire", "abonnement_statut": "actif", "nb_dossiers": 6,
        "created_at": "2024-01-15T09:00:00Z",
    },
    {
        "id": "inst-002", "nom": "SGBCI Groupe", "email_admin": "admin@sgbci.com",
        "pays": "Côte d'Ivoire", "abonnement_statut": "actif", "nb_dossiers": 3,
        "created_at": "2024-02-03T11:00:00Z",
    },
    {
        "id": "inst-003", "nom": "Ecobank Ghana", "email_admin": "admin@ecobank.gh",
        "pays": "Ghana", "abonnement_statut": "trial", "nb_dossiers": 1,
        "created_at": "2024-03-10T14:00:00Z",
    },
    {
        "id": "inst-004", "nom": "BNI Côte d'Ivoire", "email_admin": "admin@bni.ci",
        "pays": "Côte d'Ivoire", "abonnement_statut": "suspendu", "nb_dossiers": 0,
        "created_at": "2024-01-28T08:00:00Z",
    },
]

MOCK_USERS_ADMIN = [
    {
        "id": "user-001", "nom": "Koné Aminata", "email": "aminata.kone@ba-ci.com",
        "role": "analyste", "institution": "Banque Atlantique CI",
        "institution_id": "inst-001", "last_login": "2025-03-28T08:45:00Z", "actif": True,
    },
    {
        "id": "user-002", "nom": "Traoré Boubacar", "email": "boubacar@ba-ci.com",
        "role": "admin", "institution": "Banque Atlantique CI",
        "institution_id": "inst-001", "last_login": "2025-03-27T16:00:00Z", "actif": True,
    },
    {
        "id": "user-003", "nom": "Diallo Ibrahima", "email": "diallo@sgbci.com",
        "role": "analyste", "institution": "SGBCI Groupe",
        "institution_id": "inst-002", "last_login": "2025-03-25T10:20:00Z", "actif": True,
    },
    {
        "id": "user-004", "nom": "Asante Kwame", "email": "kwame@ecobank.gh",
        "role": "lecture", "institution": "Ecobank Ghana",
        "institution_id": "inst-003", "last_login": "2025-03-20T12:00:00Z", "actif": True,
    },
]


def _daily_activity() -> list[dict]:
    base = datetime(2025, 3, 1, tzinfo=timezone.utc)
    values = [3, 1, 4, 2, 5, 3, 2, 1, 4, 3, 5, 2, 3, 1, 4, 6, 2, 3, 5, 4, 2, 1, 3, 4, 5, 3, 2, 4, 3, 5]
    return [
        {"date": (base + timedelta(days=i)).strftime("%d/%m"), "dossiers": values[i]}
        for i in range(30)
    ]


MOCK_MONITORING = {
    "stats": {
        "total_institutions": 4,
        "total_dossiers": 10,
        "total_tokens_llm": 285400,
        "score_moyen": 64,
        "tokens_cout_estime_usd": 2.85,
    },
    "dossiers_par_jour": _daily_activity(),
    "dernieres_analyses": [
        {
            "dossier_id": "dos-001", "nom_projet": "Agro-Export Abidjan SARL",
            "institution": "Banque Atlantique CI", "score": 82,
            "tokens": 2840, "created_at": "2025-03-20T09:15:00Z",
        },
        {
            "dossier_id": "dos-002", "nom_projet": "TechServices Dakar SAS",
            "institution": "Banque Atlantique CI", "score": 61,
            "tokens": 1950, "created_at": "2025-03-18T14:45:00Z",
        },
        {
            "dossier_id": "dos-003", "nom_projet": "Boulangerie Moderne Ouaga",
            "institution": "Banque Atlantique CI", "score": 38,
            "tokens": 2100, "created_at": "2025-03-15T11:50:00Z",
        },
    ],
}


# ---- Request bodies ----

class UpdateStatutRequest(BaseModel):
    statut: str  # "actif" | "suspendu"


class UpdateRoleRequest(BaseModel):
    role: str  # "admin" | "analyste" | "lecture"


# ---- Endpoints ----

@router.get("/stats")
async def get_stats(
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Stats globales de la plateforme."""
    if settings.USE_MOCK:
        return MOCK_MONITORING["stats"]

    total_inst = (await db.execute(select(func.count(Institution.id)))).scalar_one()
    total_dos = (await db.execute(select(func.count(Dossier.id)))).scalar_one()
    total_tokens = (await db.execute(select(func.sum(Analyse.tokens_utilises)))).scalar_one() or 0
    avg_score = (await db.execute(
        select(func.avg(Dossier.score)).where(Dossier.score.isnot(None))
    )).scalar_one()

    return {
        "total_institutions": total_inst,
        "total_dossiers": total_dos,
        "total_tokens_llm": int(total_tokens),
        "score_moyen": round(float(avg_score), 1) if avg_score else 0,
        "tokens_cout_estime_usd": round(int(total_tokens) / 1_000_000 * 15, 2),
    }


@router.get("/institutions")
async def list_institutions(
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Liste toutes les institutions avec leur nombre de dossiers."""
    if settings.USE_MOCK:
        return MOCK_INSTITUTIONS_ADMIN

    result = await db.execute(select(Institution).order_by(Institution.created_at.desc()))
    institutions = result.scalars().all()
    items = []
    for inst in institutions:
        nb = (await db.execute(
            select(func.count(Dossier.id)).where(Dossier.institution_id == inst.id)
        )).scalar_one()
        items.append({
            "id": str(inst.id),
            "nom": inst.nom,
            "email_admin": inst.email_admin,
            "pays": inst.pays,
            "abonnement_statut": inst.abonnement_statut,
            "nb_dossiers": nb,
            "created_at": inst.created_at.isoformat(),
        })
    return items


@router.put("/institutions/{institution_id}/statut")
async def update_institution_statut(
    institution_id: str,
    body: UpdateStatutRequest,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if body.statut not in ("actif", "suspendu"):
        raise HTTPException(status_code=400, detail="Statut invalide — valeurs acceptées : actif, suspendu")

    if settings.USE_MOCK:
        return {"id": institution_id, "abonnement_statut": body.statut}

    result = await db.execute(
        select(Institution).where(Institution.id == uuid.UUID(institution_id))
    )
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution introuvable")
    institution.abonnement_statut = body.statut
    await db.flush()
    return {"id": institution_id, "abonnement_statut": body.statut}


@router.delete("/institutions/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(
    institution_id: str,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if settings.USE_MOCK:
        return

    result = await db.execute(
        select(Institution).where(Institution.id == uuid.UUID(institution_id))
    )
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution introuvable")
    await db.delete(institution)


@router.get("/users")
async def list_users(
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Liste tous les utilisateurs avec leur institution."""
    if settings.USE_MOCK:
        return MOCK_USERS_ADMIN

    result = await db.execute(
        select(User, Institution.nom.label("inst_nom"))
        .join(Institution, User.institution_id == Institution.id, isouter=True)
        .order_by(User.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": str(user.id),
            "nom": user.nom,
            "email": user.email,
            "role": user.role,
            "institution": inst_nom or "—",
            "institution_id": str(user.institution_id),
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "actif": True,
        }
        for user, inst_nom in rows
    ]


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: UpdateRoleRequest,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in ("admin", "analyste", "lecture"):
        raise HTTPException(status_code=400, detail="Rôle invalide — valeurs : admin, analyste, lecture")

    if settings.USE_MOCK:
        return {"id": user_id, "role": body.role}

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.role = body.role
    await db.flush()
    return {"id": user_id, "role": body.role}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if settings.USE_MOCK:
        return

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    await db.delete(user)


@router.get("/monitoring")
async def get_monitoring(
    _: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Métriques LLM, activité quotidienne et dernières analyses."""
    if settings.USE_MOCK:
        return MOCK_MONITORING

    # Real aggregation delegated to stats + minimal chart data
    stats = await get_stats(_, db)
    return {
        "stats": stats,
        "dossiers_par_jour": _daily_activity(),
        "dernieres_analyses": [],
    }
