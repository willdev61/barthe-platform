"""
Public API Router — Authentification via header X-Api-Key
POST  /public/v1/analyses       → soumettre un BP pour analyse
GET   /public/v1/analyses/{id}  → récupérer le résultat d'une analyse
GET   /public/v1/dossiers       → lister les dossiers de l'institution
"""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_api_key_institution
from app.models.models import Dossier, Analyse, Institution
from app.services.llm_normalizer import normalize_with_llm
from app.services.ratio_engine import compute_ratios, compute_score, build_alertes_from_llm

ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv"}

router = APIRouter()


def _require_permission(auth: dict, permission: str) -> None:
    if permission not in auth.get("permissions", []):
        raise HTTPException(
            status_code=403,
            detail=f"Permission manquante : {permission}",
        )


@router.post("/analyses", status_code=status.HTTP_202_ACCEPTED)
async def submit_analyse(
    file: UploadFile = File(...),
    nom_projet: str = Form(...),
    secteur: str = Form(None),
    auth: dict = Depends(get_api_key_institution),
    db: AsyncSession = Depends(get_db),
):
    """
    Soumet un Business Plan (PDF ou Excel) pour analyse.
    Retourne immédiatement l'ID du dossier ; l'analyse est lancée de façon synchrone.
    """
    _require_permission(auth, "analyses:write")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format non supporté. Formats acceptés : {', '.join(ALLOWED_EXTENSIONS)}",
        )

    institution_id = uuid.UUID(auth["institution_id"])

    # Créer le dossier (pas d'utilisateur humain — soumission via clé API)
    dossier = Dossier(
        institution_id=institution_id,
        created_by=None,
        api_key_id=uuid.UUID(auth["api_key_id"]),
        nom_projet=nom_projet,
        secteur=secteur,
        fichier_nom=file.filename,
        statut="en_cours",
    )
    db.add(dossier)
    await db.flush()

    # Sauvegarder le fichier
    upload_dir = os.path.join(settings.STORAGE_PATH, "dossiers")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{dossier.id}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    fichier_url = f"/uploads/dossiers/{filename}"
    dossier.fichier_url = fichier_url
    await db.flush()

    # Charger les seuils de l'institution
    inst_result = await db.execute(select(Institution).where(Institution.id == institution_id))
    institution = inst_result.scalar_one_or_none()
    thresholds = ((institution.inst_settings or {}).get("scoring_thresholds", {})) if institution else {}

    try:
        normalized, llm_alertes, tokens_used = await normalize_with_llm(fichier_url)
        ratios = compute_ratios(normalized, thresholds)
        alertes = build_alertes_from_llm(llm_alertes)
        score = compute_score(ratios, alertes, thresholds)

        analyse_row = Analyse(
            dossier_id=dossier.id,
            donnees_normalisees=normalized.model_dump(),
            ratios={k: v.model_dump() for k, v in ratios.items()},
            alertes=[a.model_dump() for a in alertes],
            tokens_utilises=tokens_used,
        )
        db.add(analyse_row)

        dossier.score = score
        dossier.secteur = normalized.secteur
        dossier.statut = "analyse"
        await db.flush()

        return {
            "dossier_id": str(dossier.id),
            "analyse_id": str(analyse_row.id),
            "statut": "analyse",
            "score": score,
        }
    except Exception as exc:
        dossier.statut = "erreur"
        await db.flush()
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse : {exc}") from exc


@router.get("/analyses/{analyse_id}")
async def get_analyse(
    analyse_id: str,
    auth: dict = Depends(get_api_key_institution),
    db: AsyncSession = Depends(get_db),
):
    """Récupère le résultat d'une analyse par son ID."""
    _require_permission(auth, "analyses:read")

    result = await db.execute(select(Analyse).where(Analyse.id == uuid.UUID(analyse_id)))
    analyse = result.scalar_one_or_none()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse introuvable")

    # Vérifier que le dossier appartient à l'institution
    dossier_result = await db.execute(select(Dossier).where(Dossier.id == analyse.dossier_id))
    dossier = dossier_result.scalar_one_or_none()
    if not dossier or str(dossier.institution_id) != auth["institution_id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")

    return {
        "id": str(analyse.id),
        "dossier_id": str(analyse.dossier_id),
        "nom_projet": dossier.nom_projet,
        "score": dossier.score,
        "statut": dossier.statut,
        "donnees_normalisees": analyse.donnees_normalisees,
        "ratios": analyse.ratios,
        "alertes": analyse.alertes,
        "synthese_narrative": analyse.synthese_narrative,
        "modele_llm": analyse.modele_llm,
        "tokens_utilises": analyse.tokens_utilises,
        "created_at": analyse.created_at.isoformat(),
    }


@router.get("/dossiers")
async def list_dossiers(
    auth: dict = Depends(get_api_key_institution),
    db: AsyncSession = Depends(get_db),
):
    """Liste les dossiers de l'institution associée à la clé API."""
    _require_permission(auth, "dossiers:read")

    institution_id = uuid.UUID(auth["institution_id"])
    result = await db.execute(
        select(Dossier)
        .where(Dossier.institution_id == institution_id)
        .order_by(Dossier.created_at.desc())
    )
    dossiers = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "nom_projet": d.nom_projet,
            "secteur": d.secteur,
            "statut": d.statut,
            "score": d.score,
            "fichier_nom": d.fichier_nom,
            "created_at": d.created_at.isoformat(),
            "updated_at": d.updated_at.isoformat(),
        }
        for d in dossiers
    ]
