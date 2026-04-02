"""
FastAPI Dossiers Router
"""

import os
import uuid
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core.audit import log_action
from app.models.models import Dossier, User
from app.schemas.schemas import DossierCreate, DossierResponse

ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv"}

router = APIRouter()

# ---- Mock data (USE_MOCK=true) ----

MOCK_DOSSIERS: list[dict] = [
    {
        "id": "dos-001", "institution_id": "inst-001", "created_by": "user-001",
        "nom_projet": "Agro-Export Abidjan SARL", "secteur": "Agriculture",
        "fichier_nom": "business_plan_agro_export_2024.xlsx", "fichier_url": "/uploads/dos-001.xlsx",
        "statut": "analyse", "score": 82,
        "created_at": "2025-03-20T08:30:00Z", "updated_at": "2025-03-20T09:15:00Z",
    },
    {
        "id": "dos-002", "institution_id": "inst-001", "created_by": "user-001",
        "nom_projet": "TechServices Dakar SAS", "secteur": "Services numériques",
        "fichier_nom": "bp_techservices_2024.xlsx", "fichier_url": "/uploads/dos-002.xlsx",
        "statut": "analyse", "score": 61,
        "created_at": "2025-03-18T14:00:00Z", "updated_at": "2025-03-18T14:45:00Z",
    },
    {
        "id": "dos-003", "institution_id": "inst-001", "created_by": "user-001",
        "nom_projet": "Boulangerie Moderne Ouaga", "secteur": "Agroalimentaire",
        "fichier_nom": "boulangerie_ouaga_bp.xlsx", "fichier_url": "/uploads/dos-003.xlsx",
        "statut": "analyse", "score": 38,
        "created_at": "2025-03-15T11:00:00Z", "updated_at": "2025-03-15T11:50:00Z",
    },
    {
        "id": "dos-004", "institution_id": "inst-001", "created_by": "user-001",
        "nom_projet": "Logistique Express Lomé", "secteur": "Transport & Logistique",
        "fichier_nom": "logistique_express_lome.xlsx", "fichier_url": None,
        "statut": "en_cours", "score": None,
        "created_at": "2025-03-25T09:00:00Z", "updated_at": "2025-03-25T09:05:00Z",
    },
]


@router.get("/", response_model=List[dict])
async def list_dossiers(db: AsyncSession = Depends(get_db)):
    if settings.USE_MOCK:
        return MOCK_DOSSIERS

    result = await db.execute(select(Dossier).order_by(Dossier.created_at.desc()))
    dossiers = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "institution_id": str(d.institution_id),
            "created_by": str(d.created_by),
            "nom_projet": d.nom_projet,
            "secteur": d.secteur,
            "fichier_nom": d.fichier_nom,
            "fichier_url": d.fichier_url,
            "statut": d.statut,
            "score": d.score,
            "created_at": d.created_at.isoformat(),
            "updated_at": d.updated_at.isoformat(),
        }
        for d in dossiers
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_dossier(
    body: DossierCreate,
    db: AsyncSession = Depends(get_db),
):
    if settings.USE_MOCK:
        new_id = str(uuid.uuid4())
        return {
            "id": new_id,
            "institution_id": "inst-001",
            "created_by": "user-001",
            "nom_projet": body.nom_projet,
            "secteur": body.secteur,
            "fichier_nom": body.fichier_nom,
            "fichier_url": None,
            "statut": "en_attente",
            "score": None,
            "created_at": "2025-01-01T00:00:00Z",
            "updated_at": "2025-01-01T00:00:00Z",
        }

    dossier = Dossier(
        nom_projet=body.nom_projet,
        secteur=body.secteur,
        fichier_nom=body.fichier_nom,
        # institution_id and created_by would come from JWT claims in production
        institution_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        created_by=uuid.UUID("00000000-0000-0000-0000-000000000001"),
    )
    db.add(dossier)
    await db.flush()
    await log_action(
        db,
        user_id=None,
        institution_id=str(dossier.institution_id),
        action="dossier.created",
        entity_type="dossier",
        entity_id=str(dossier.id),
        metadata={"nom_projet": dossier.nom_projet, "secteur": dossier.secteur},
    )
    return {"id": str(dossier.id), "nom_projet": dossier.nom_projet, "statut": dossier.statut}


@router.get("/{dossier_id}")
async def get_dossier(dossier_id: str, db: AsyncSession = Depends(get_db)):
    if settings.USE_MOCK:
        found = next((d for d in MOCK_DOSSIERS if d["id"] == dossier_id), None)
        if not found:
            raise HTTPException(status_code=404, detail="Dossier introuvable")
        return found

    result = await db.execute(select(Dossier).where(Dossier.id == uuid.UUID(dossier_id)))
    dossier = result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")
    return {"id": str(dossier.id), "nom_projet": dossier.nom_projet, "statut": dossier.statut}


@router.delete("/{dossier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dossier(dossier_id: str, db: AsyncSession = Depends(get_db)):
    if settings.USE_MOCK:
        return

    result = await db.execute(select(Dossier).where(Dossier.id == uuid.UUID(dossier_id)))
    dossier = result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")
    await db.delete(dossier)


@router.post("/{dossier_id}/upload")
async def upload_fichier(
    dossier_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a Business Plan file (PDF, Excel or CSV) and attach it to a dossier."""
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format de fichier non supporté. Formats acceptés : {', '.join(ALLOWED_EXTENSIONS)}",
        )

    if settings.USE_MOCK:
        return {
            "dossier_id": dossier_id,
            "fichier_nom": file.filename,
            "fichier_url": f"/uploads/{dossier_id}{file_ext}",
        }

    result = await db.execute(select(Dossier).where(Dossier.id == uuid.UUID(dossier_id)))
    dossier = result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    upload_dir = os.path.join(settings.STORAGE_PATH, "dossiers")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{dossier_id}{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    fichier_url = f"/uploads/dossiers/{filename}"
    dossier.fichier_nom = file.filename
    dossier.fichier_url = fichier_url
    await db.flush()

    return {
        "dossier_id": dossier_id,
        "fichier_nom": file.filename,
        "fichier_url": fichier_url,
    }
