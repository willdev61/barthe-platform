"""
FastAPI Institutions Router
GET  /institutions/me           → paramètres de mon institution
PUT  /institutions/me/settings  → mettre à jour les paramètres
PUT  /institutions/me/logo      → uploader le logo
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Institution
from app.schemas.schemas import InstitutionSettings

router = APIRouter()

# ---- Mock data ----

MOCK_INSTITUTION = {
    "id": "inst-001",
    "nom": "Banque Atlantique CI",
    "email_admin": "admin@ba-ci.com",
    "pays": "Côte d'Ivoire",
    "secteurs_cibles": "Agriculture, Commerce, Services",
    "abonnement_statut": "actif",
    "created_at": "2024-01-15T09:00:00Z",
    "settings": {
        "scoring_thresholds": {"ebitda_min": 20.0, "levier_max": 3.0, "dscr_min": 1.2},
        "secteurs_actifs": ["Agriculture", "Commerce général", "Services numériques", "Agroalimentaire"],
        "rapport_logo_url": None,
        "rapport_mentions": "Document confidentiel — usage interne uniquement",
    },
}

_ALLOWED_LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".webp"}
_MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB


@router.get("/me")
async def get_my_institution(db: AsyncSession = Depends(get_db)):
    """Retourne les paramètres de l'institution courante."""
    if settings.USE_MOCK:
        return MOCK_INSTITUTION

    # In production, institution_id comes from the authenticated user session.
    # Using placeholder until auth is wired into this router.
    result = await db.execute(select(Institution).limit(1))
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution introuvable")
    return _serialize(institution)


@router.put("/me/settings")
async def update_settings(
    body: InstitutionSettings,
    db: AsyncSession = Depends(get_db),
):
    """Met à jour les paramètres personnalisés de l'institution."""
    if settings.USE_MOCK:
        return {**MOCK_INSTITUTION, "settings": body.model_dump()}

    result = await db.execute(select(Institution).limit(1))
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution introuvable")

    # Merge — preserve logo_url if not provided in payload
    current = institution.inst_settings or {}
    updated = body.model_dump()
    if updated.get("rapport_logo_url") is None and current.get("rapport_logo_url"):
        updated["rapport_logo_url"] = current["rapport_logo_url"]

    institution.inst_settings = updated
    await db.flush()
    return _serialize(institution)


@router.put("/me/logo", status_code=status.HTTP_200_OK)
async def upload_logo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload le logo institution (utilisé dans les rapports PDF)."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in _ALLOWED_LOGO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format non supporté. Formats acceptés : {', '.join(_ALLOWED_LOGO_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > _MAX_LOGO_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Fichier trop lourd (max 2 Mo)")

    logos_dir = os.path.join(settings.STORAGE_PATH, "logos")
    os.makedirs(logos_dir, exist_ok=True)
    filename = f"logo_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(logos_dir, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    logo_url = f"/uploads/logos/{filename}"

    if settings.USE_MOCK:
        return {"logo_url": logo_url}

    result = await db.execute(select(Institution).limit(1))
    institution = result.scalar_one_or_none()
    if institution:
        current = institution.inst_settings or {}
        institution.inst_settings = {**current, "rapport_logo_url": logo_url}
        await db.flush()

    return {"logo_url": logo_url}


def _serialize(institution: Institution) -> dict:
    return {
        "id": str(institution.id),
        "nom": institution.nom,
        "email_admin": institution.email_admin,
        "pays": institution.pays,
        "secteurs_cibles": institution.secteurs_cibles,
        "abonnement_statut": institution.abonnement_statut,
        "created_at": institution.created_at.isoformat(),
        "settings": institution.inst_settings or {},
    }
