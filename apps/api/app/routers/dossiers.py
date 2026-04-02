"""
FastAPI Dossiers Router
"""

import os
import uuid
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core.audit import log_action
from app.models.models import Dossier, Analyse, User
from app.schemas.schemas import DossierCreate, DossierResponse

ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv"}


class ComparatifRequest(BaseModel):
    dossier_ids: list[str]

    @field_validator("dossier_ids")
    @classmethod
    def validate_ids(cls, v: list[str]) -> list[str]:
        if not v or len(v) > 5:
            raise ValueError("Entre 1 et 5 dossiers requis")
        return v


# Mock comparatif data (mirrors MOCK_ANALYSES in analyses.py)
MOCK_COMPARATIF: dict[str, dict] = {
    "dos-001": {
        "id": "dos-001", "nom_projet": "Agro-Export Abidjan SARL", "secteur": "Agriculture",
        "score": 82, "ca": 850000000, "ebitda": 230000000, "dette": 580000000,
        "ratios": {"marge_brute": 27.1, "taux_ebitda": 27.1, "levier_financier": 2.52,
                   "dscr": 1.57, "ratio_endettement": 68.2},
    },
    "dos-002": {
        "id": "dos-002", "nom_projet": "TechServices Dakar SAS", "secteur": "Services numériques",
        "score": 61, "ca": 420000000, "ebitda": 80000000, "dette": 290000000,
        "ratios": {"marge_brute": 19.0, "taux_ebitda": 19.0, "levier_financier": 3.63,
                   "dscr": 1.84, "ratio_endettement": 69.0},
    },
    "dos-003": {
        "id": "dos-003", "nom_projet": "Boulangerie Moderne Ouaga", "secteur": "Agroalimentaire",
        "score": 38, "ca": 180000000, "ebitda": 5000000, "dette": 120000000,
        "ratios": {"marge_brute": 2.8, "taux_ebitda": 2.8, "levier_financier": 24.0,
                   "dscr": 0.28, "ratio_endettement": 66.7},
    },
}

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


@router.post("/comparatif")
async def comparatif_dossiers(body: ComparatifRequest, db: AsyncSession = Depends(get_db)):
    """Return normalised financial data for up to 5 dossiers for side-by-side comparison."""
    if settings.USE_MOCK:
        items = []
        for did in body.dossier_ids:
            entry = MOCK_COMPARATIF.get(did)
            if entry:
                items.append(entry)
            else:
                # Fallback for unknown mock IDs
                items.append({
                    "id": did, "nom_projet": "Dossier inconnu", "secteur": None,
                    "score": None, "ca": None, "ebitda": None, "dette": None,
                    "ratios": {"marge_brute": None, "taux_ebitda": None,
                               "levier_financier": None, "dscr": None, "ratio_endettement": None},
                })
        return items

    # Real path — fetch dossiers + their analyses
    results = await db.execute(
        select(Dossier).where(Dossier.id.in_([uuid.UUID(i) for i in body.dossier_ids]))
    )
    dossiers = results.scalars().all()
    if not dossiers:
        raise HTTPException(status_code=404, detail="Aucun dossier trouvé")

    # Verify all belong to the same institution (use first dossier's institution)
    institution_id = dossiers[0].institution_id
    if any(d.institution_id != institution_id for d in dossiers):
        raise HTTPException(status_code=403, detail="Les dossiers doivent appartenir à la même institution")

    analyses_result = await db.execute(
        select(Analyse).where(Analyse.dossier_id.in_([d.id for d in dossiers]))
    )
    analyses_by_dossier = {str(a.dossier_id): a for a in analyses_result.scalars().all()}

    items = []
    for d in dossiers:
        analyse = analyses_by_dossier.get(str(d.id))
        dn = analyse.donnees_normalisees if analyse else {}
        ratios = analyse.ratios if analyse else {}
        items.append({
            "id": str(d.id),
            "nom_projet": d.nom_projet,
            "secteur": d.secteur,
            "score": d.score,
            "ca": dn.get("chiffre_affaires"),
            "ebitda": dn.get("ebitda"),
            "dette": dn.get("dette_financiere"),
            "ratios": {
                "marge_brute": ratios.get("marge_brute", {}).get("valeur"),
                "taux_ebitda": ratios.get("taux_ebitda", {}).get("valeur"),
                "levier_financier": ratios.get("levier_financier", {}).get("valeur"),
                "dscr": ratios.get("dscr", {}).get("valeur"),
                "ratio_endettement": ratios.get("ratio_endettement", {}).get("valeur"),
            },
        })
    return items


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
