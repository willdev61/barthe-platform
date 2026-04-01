"""
FastAPI Analyses Router
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Dossier, Analyse
from app.schemas.schemas import AnalyseResponse
from app.services.llm_normalizer import normalize_with_llm
from app.services.ratio_engine import compute_ratios, compute_score, build_alertes_from_llm

router = APIRouter()

# ---- Mock analyses ----

MOCK_ANALYSES: dict[str, dict] = {
    "dos-001": {
        "id": "ana-001", "dossier_id": "dos-001",
        "donnees_normalisees": {
            "chiffre_affaires": 850000000, "charges_exploitation": 620000000,
            "ebitda": 230000000, "resultat_net": 145000000,
            "dette_financiere": 580000000, "secteur": "Agriculture",
        },
        "ratios": {
            "marge_brute": {"label": "Marge brute", "valeur": 27.1, "unite": "%", "seuil_min": 15.0, "description": "(CA - Charges) / CA × 100"},
            "taux_ebitda": {"label": "Taux d'EBITDA", "valeur": 27.1, "unite": "%", "seuil_min": 20.0, "description": "EBITDA / CA × 100"},
            "levier_financier": {"label": "Levier financier", "valeur": 2.52, "unite": "x", "seuil_max": 3.0, "description": "Dette / EBITDA"},
            "ratio_endettement": {"label": "Ratio endettement", "valeur": 68.2, "unite": "%", "seuil_max": 100.0, "description": "Dette / CA × 100"},
            "dscr": {"label": "DSCR", "valeur": 1.57, "unite": "x", "seuil_min": 1.2, "description": "EBITDA / (Dette × 0.15)"},
        },
        "alertes": [
            {"id": "alt-001", "message": "Forte dépendance saisonnière des revenus.", "criticite": "warning"},
            {"id": "alt-002", "message": "Concentration client : 3 acheteurs = 65% du CA.", "criticite": "warning"},
        ],
        "synthese_narrative": (
            "L'entreprise Agro-Export Abidjan présente un profil financier globalement solide pour le secteur agricole. "
            "Le taux d'EBITDA de 27,1% dépasse le seuil de référence sectoriel (20%), témoignant d'une bonne maîtrise des coûts. "
            "Le levier financier de 2,52x reste en deçà du seuil d'alerte de 3x.\n\n"
            "**Recommandation :** Financement favorable sous réserve de mise en place d'une garantie réelle."
        ),
        "modele_llm": "claude-sonnet-4-6",
        "tokens_utilises": 2840,
        "created_at": "2025-03-20T09:15:00Z",
    },
    "dos-002": {
        "id": "ana-002", "dossier_id": "dos-002",
        "donnees_normalisees": {
            "chiffre_affaires": 420000000, "charges_exploitation": 340000000,
            "ebitda": 80000000, "resultat_net": 42000000,
            "dette_financiere": 290000000, "secteur": "Services numériques",
        },
        "ratios": {
            "marge_brute": {"label": "Marge brute", "valeur": 19.0, "unite": "%", "seuil_min": 15.0, "description": "(CA - Charges) / CA × 100"},
            "taux_ebitda": {"label": "Taux d'EBITDA", "valeur": 19.0, "unite": "%", "seuil_min": 20.0, "description": "EBITDA / CA × 100"},
            "levier_financier": {"label": "Levier financier", "valeur": 3.63, "unite": "x", "seuil_max": 3.0, "description": "Dette / EBITDA"},
            "ratio_endettement": {"label": "Ratio endettement", "valeur": 69.0, "unite": "%", "seuil_max": 100.0, "description": "Dette / CA × 100"},
            "dscr": {"label": "DSCR", "valeur": 1.84, "unite": "x", "seuil_min": 1.2, "description": "EBITDA / (Dette × 0.15)"},
        },
        "alertes": [
            {"id": "alt-003", "message": "Taux d'EBITDA légèrement en dessous du seuil (19% vs 20%).", "criticite": "warning"},
            {"id": "alt-004", "message": "Levier financier élevé à 3,63x — risque de sous-capitalisation.", "criticite": "critical"},
        ],
        "synthese_narrative": (
            "TechServices Dakar présente un profil à risque modéré. "
            "Le levier financier de 3,63x dépasse le seuil prudentiel de 3x.\n\n"
            "**Recommandation :** Financement réservé — garanties complémentaires nécessaires."
        ),
        "modele_llm": "claude-sonnet-4-6",
        "tokens_utilises": 1950,
        "created_at": "2025-03-18T14:45:00Z",
    },
    "dos-003": {
        "id": "ana-003", "dossier_id": "dos-003",
        "donnees_normalisees": {
            "chiffre_affaires": 180000000, "charges_exploitation": 175000000,
            "ebitda": 5000000, "resultat_net": -8000000,
            "dette_financiere": 120000000, "secteur": "Agroalimentaire",
        },
        "ratios": {
            "marge_brute": {"label": "Marge brute", "valeur": 2.8, "unite": "%", "seuil_min": 15.0, "description": "(CA - Charges) / CA × 100"},
            "taux_ebitda": {"label": "Taux d'EBITDA", "valeur": 2.8, "unite": "%", "seuil_min": 20.0, "description": "EBITDA / CA × 100"},
            "levier_financier": {"label": "Levier financier", "valeur": 24.0, "unite": "x", "seuil_max": 3.0, "description": "Dette / EBITDA"},
            "ratio_endettement": {"label": "Ratio endettement", "valeur": 66.7, "unite": "%", "seuil_max": 100.0, "description": "Dette / CA × 100"},
            "dscr": {"label": "DSCR", "valeur": 0.28, "unite": "x", "seuil_min": 1.2, "description": "EBITDA / (Dette × 0.15)"},
        },
        "alertes": [
            {"id": "alt-006", "message": "Résultat net négatif : -8M FCFA.", "criticite": "critical"},
            {"id": "alt-007", "message": "DSCR de 0,28 — incapacité à couvrir le service de la dette.", "criticite": "critical"},
            {"id": "alt-008", "message": "Levier financier extrême à 24x — surendettement structurel.", "criticite": "critical"},
        ],
        "synthese_narrative": (
            "La Boulangerie Moderne Ouaga présente un profil financier très défavorable. "
            "L'entreprise génère des pertes nettes et affiche un DSCR de 0,28.\n\n"
            "**Recommandation :** Financement non recommandé en l'état."
        ),
        "modele_llm": "claude-sonnet-4-6",
        "tokens_utilises": 2100,
        "created_at": "2025-03-15T11:50:00Z",
    },
}


@router.post("/{dossier_id}/run")
async def run_analyse(dossier_id: str, db: AsyncSession = Depends(get_db)):
    """
    Trigger full analysis pipeline:
    1. Parse Excel
    2. Normalize with LLM
    3. Compute ratios & score
    4. Persist to DB
    """
    if settings.USE_MOCK:
        analyse = MOCK_ANALYSES.get(dossier_id)
        if not analyse:
            # Return a generic successful mock for unknown IDs
            return MOCK_ANALYSES["dos-001"]
        return analyse

    # Real pipeline
    result = await db.execute(select(Dossier).where(Dossier.id == uuid.UUID(dossier_id)))
    dossier = result.scalar_one_or_none()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier introuvable")

    if not dossier.fichier_url:
        raise HTTPException(status_code=400, detail="Aucun fichier associé à ce dossier")

    # Update status
    dossier.statut = "en_cours"
    await db.flush()

    try:
        # 1. Normalize data via LLM
        normalized, llm_alertes, tokens_used = await normalize_with_llm(dossier.fichier_url)

        # 2. Compute ratios
        ratios = compute_ratios(normalized)

        # 3. Build structured alerts
        alertes = build_alertes_from_llm(llm_alertes)

        # 4. Compute score
        score = compute_score(ratios, alertes)

        # 5. Persist analyse
        analyse_row = Analyse(
            dossier_id=dossier.id,
            donnees_normalisees=normalized.model_dump(),
            ratios={k: v.model_dump() for k, v in ratios.items()},
            alertes=[a.model_dump() for a in alertes],
            tokens_utilises=tokens_used,
        )
        db.add(analyse_row)

        # 6. Update dossier
        dossier.score = score
        dossier.secteur = normalized.secteur
        dossier.statut = "analyse"
        await db.flush()

        return {
            "id": str(analyse_row.id),
            "dossier_id": dossier_id,
            "donnees_normalisees": normalized.model_dump(),
            "ratios": {k: v.model_dump() for k, v in ratios.items()},
            "alertes": [a.model_dump() for a in alertes],
            "score": score,
            "modele_llm": "claude-sonnet-4-6",
            "tokens_utilises": tokens_used,
        }

    except Exception as e:
        dossier.statut = "erreur"
        await db.flush()
        raise HTTPException(status_code=500, detail=f"Erreur d'analyse: {str(e)}")


@router.get("/{dossier_id}")
async def get_analyse(dossier_id: str, db: AsyncSession = Depends(get_db)):
    if settings.USE_MOCK:
        analyse = MOCK_ANALYSES.get(dossier_id)
        if not analyse:
            raise HTTPException(status_code=404, detail="Analyse introuvable")
        return analyse

    result = await db.execute(
        select(Analyse).where(Analyse.dossier_id == uuid.UUID(dossier_id))
    )
    analyse = result.scalar_one_or_none()
    if not analyse:
        raise HTTPException(status_code=404, detail="Analyse introuvable")
    return {
        "id": str(analyse.id),
        "dossier_id": dossier_id,
        "donnees_normalisees": analyse.donnees_normalisees,
        "ratios": analyse.ratios,
        "alertes": analyse.alertes,
        "synthese_narrative": analyse.synthese_narrative,
        "modele_llm": analyse.modele_llm,
        "tokens_utilises": analyse.tokens_utilises,
        "created_at": analyse.created_at.isoformat(),
    }
