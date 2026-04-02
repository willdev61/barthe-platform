"""
Ratio Engine — Financial ratios + scoring
All calculations are pure Python, no LLM.
"""

from typing import Optional
from app.schemas.schemas import DonneesNormalisees, RatioFinancier, AlerteSchema
import uuid


def _safe_div(numerator: Optional[float], denominator: Optional[float]) -> Optional[float]:
    if numerator is None or denominator is None or denominator == 0:
        return None
    return numerator / denominator


def compute_ratios(data: DonneesNormalisees, thresholds: Optional[dict] = None) -> dict[str, RatioFinancier]:
    t = thresholds or {}
    ebitda_min = float(t.get("ebitda_min", 20.0))
    levier_max = float(t.get("levier_max", 3.0))
    dscr_min = float(t.get("dscr_min", 1.2))

    ca = data.chiffre_affaires
    charges = data.charges_exploitation
    ebitda = data.ebitda
    dette = data.dette_financiere

    # Marge brute = (CA - Charges) / CA × 100
    marge_brute_val = None
    if ca and charges:
        marge_brute_val = _safe_div((ca - charges), ca)
        if marge_brute_val is not None:
            marge_brute_val *= 100

    # Taux EBITDA = EBITDA / CA × 100
    taux_ebitda_val = None
    if ebitda and ca:
        taux_ebitda_val = _safe_div(ebitda, ca)
        if taux_ebitda_val is not None:
            taux_ebitda_val *= 100

    # Levier financier = Dette / EBITDA
    levier_val = _safe_div(dette, ebitda)

    # Ratio endettement = Dette / CA × 100
    ratio_endt_val = None
    if dette and ca:
        ratio_endt_val = _safe_div(dette, ca)
        if ratio_endt_val is not None:
            ratio_endt_val *= 100

    # DSCR = EBITDA / (Dette × 0.15)
    dscr_val = None
    if dette and ebitda:
        dscr_val = _safe_div(ebitda, dette * 0.15)

    def r(v: Optional[float]) -> Optional[float]:
        return round(v, 2) if v is not None else None

    return {
        "marge_brute": RatioFinancier(
            label="Marge brute",
            valeur=r(marge_brute_val),
            unite="%",
            seuil_min=15.0,
            description="(CA - Charges) / CA × 100",
        ),
        "taux_ebitda": RatioFinancier(
            label="Taux d'EBITDA",
            valeur=r(taux_ebitda_val),
            unite="%",
            seuil_min=ebitda_min,
            description="EBITDA / CA × 100",
        ),
        "levier_financier": RatioFinancier(
            label="Levier financier",
            valeur=r(levier_val),
            unite="x",
            seuil_max=levier_max,
            description="Dette / EBITDA",
        ),
        "ratio_endettement": RatioFinancier(
            label="Ratio endettement",
            valeur=r(ratio_endt_val),
            unite="%",
            seuil_max=100.0,
            description="Dette / CA × 100",
        ),
        "dscr": RatioFinancier(
            label="DSCR",
            valeur=r(dscr_val),
            unite="x",
            seuil_min=dscr_min,
            description="EBITDA / (Dette × 0.15)",
        ),
    }


def compute_score(
    ratios: dict[str, RatioFinancier],
    alertes: list[AlerteSchema],
    thresholds: Optional[dict] = None,
) -> int:
    """
    Score /100:
    - Taux EBITDA > ebitda_min% → +25 pts
    - Levier < levier_max → +25 pts
    - DSCR > dscr_min → +25 pts
    - Aucune alerte critique → +25 pts
    """
    t = thresholds or {}
    ebitda_min = float(t.get("ebitda_min", 20.0))
    levier_max = float(t.get("levier_max", 3.0))
    dscr_min = float(t.get("dscr_min", 1.2))

    score = 0

    taux_ebitda = ratios.get("taux_ebitda")
    if taux_ebitda and taux_ebitda.valeur is not None and taux_ebitda.valeur > ebitda_min:
        score += 25

    levier = ratios.get("levier_financier")
    if levier and levier.valeur is not None and levier.valeur < levier_max:
        score += 25

    dscr = ratios.get("dscr")
    if dscr and dscr.valeur is not None and dscr.valeur > dscr_min:
        score += 25

    has_critical = any(a.criticite == "critical" for a in alertes)
    if not has_critical:
        score += 25

    return min(score, 100)


def build_alertes_from_llm(llm_alertes: list[str]) -> list[AlerteSchema]:
    """Convert raw LLM alert strings to structured AlerteSchema objects."""
    result: list[AlerteSchema] = []
    for msg in llm_alertes:
        criticite = "info"
        lower = msg.lower()
        if any(k in lower for k in ["négatif", "critique", "insufficient", "impossible", "dscr", "surendett"]):
            criticite = "critical"
        elif any(k in lower for k in ["attention", "risque", "élevé", "concentration", "saisonn"]):
            criticite = "warning"
        result.append(AlerteSchema(id=str(uuid.uuid4()), message=msg, criticite=criticite))
    return result
