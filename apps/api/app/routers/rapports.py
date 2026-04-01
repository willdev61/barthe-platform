"""
FastAPI Rapports Router
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Dossier, Analyse, Rapport
from app.services.pdf_generator import generate_pdf

router = APIRouter()


@router.post("/{dossier_id}", status_code=status.HTTP_201_CREATED)
async def create_rapport(dossier_id: str, db: AsyncSession = Depends(get_db)):
    """Generate a PDF rapport for a dossier."""
    if settings.USE_MOCK:
        return {
            "id": str(uuid.uuid4()),
            "dossier_id": dossier_id,
            "pdf_url": f"/uploads/rapport_{dossier_id}_mock.pdf",
            "created_at": "2025-01-01T00:00:00Z",
        }

    # Load dossier
    dossier_result = await db.execute(
        select(Dossier).where(Dossier.id == uuid.UUID(dossier_id))
    )
    dossier = dossier_result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    if dossier.statut != "analyse":
        raise HTTPException(status_code=400, detail="Le dossier n'est pas encore analysé")

    # Load analyse
    analyse_result = await db.execute(
        select(Analyse).where(Analyse.dossier_id == dossier.id)
    )
    analyse = analyse_result.scalar_one_or_none()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse introuvable pour ce dossier")

    # Generate PDF
    dossier_dict = {
        "id": str(dossier.id),
        "nom_projet": dossier.nom_projet,
        "secteur": dossier.secteur,
        "fichier_nom": dossier.fichier_nom,
        "statut": dossier.statut,
        "score": dossier.score,
    }
    analyse_dict = {
        "donnees_normalisees": analyse.donnees_normalisees,
        "ratios": analyse.ratios,
        "alertes": analyse.alertes,
        "synthese_narrative": analyse.synthese_narrative,
    }
    pdf_url = await generate_pdf(
        dossier=dossier_dict,
        analyse=analyse_dict,
        institution_nom="Institution",
        output_dir=settings.STORAGE_PATH,
    )

    # Persist rapport record
    rapport = Rapport(
        dossier_id=dossier.id,
        genere_par=dossier.created_by,
        pdf_url=pdf_url,
    )
    db.add(rapport)
    await db.flush()

    return {
        "id": str(rapport.id),
        "dossier_id": dossier_id,
        "pdf_url": pdf_url,
        "created_at": rapport.created_at.isoformat(),
    }


@router.get("/{dossier_id}")
async def get_rapport(dossier_id: str, db: AsyncSession = Depends(get_db)):
    """Get the most recent rapport for a dossier."""
    if settings.USE_MOCK:
        return {
            "id": str(uuid.uuid4()),
            "dossier_id": dossier_id,
            "pdf_url": f"/uploads/rapport_{dossier_id}_mock.pdf",
            "created_at": "2025-01-01T00:00:00Z",
        }

    result = await db.execute(
        select(Rapport)
        .where(Rapport.dossier_id == uuid.UUID(dossier_id))
        .order_by(Rapport.created_at.desc())
    )
    rapport = result.scalars().first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Aucun rapport trouvé pour ce dossier")

    return {
        "id": str(rapport.id),
        "dossier_id": dossier_id,
        "pdf_url": rapport.pdf_url,
        "created_at": rapport.created_at.isoformat(),
    }
