"""
LLM Normalizer — Anthropic Claude SDK
"""

import json
import re
from typing import Any
import anthropic
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.schemas import DonneesNormalisees


SYSTEM_PROMPT = """
Tu es un analyste financier expert en instruction bancaire africaine.
On te fournit le contenu brut d'un Business Plan.
Ta mission :
1. Identifier les lignes financières clés peu importe leur libellé
2. Les mapper vers le format standard BARTHE
3. Détecter le secteur d'activité
4. Signaler toute incohérence dans les hypothèses

Réponds UNIQUEMENT avec un JSON valide, sans texte autour :
{
  "chiffre_affaires": <nombre entier ou null>,
  "charges_exploitation": <nombre entier ou null>,
  "ebitda": <nombre entier ou null>,
  "resultat_net": <nombre entier ou null>,
  "dette_financiere": <nombre entier ou null>,
  "secteur": "<string>",
  "alertes": ["<string>"]
}

Le CA peut aussi s'appeler : ventes nettes, produits d'activité, revenus, MRR×12, ARR.
L'EBITDA peut aussi s'appeler : EBE, excédent brut d'exploitation, résultat brut.
Si un champ est introuvable, mets null. Montants en entiers sans symboles.
"""


def read_file_content(file_url: str) -> str:
    """Read Excel/CSV file from disk and return as plain text for LLM."""
    import os
    filepath = file_url.lstrip("/")
    if not os.path.exists(filepath):
        return "[Fichier introuvable]"
    ext = os.path.splitext(filepath)[1].lower()
    if ext in (".xlsx", ".xls"):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
            lines: list[str] = []
            for sheet in wb.worksheets:
                lines.append(f"=== Feuille: {sheet.title} ===")
                for row in sheet.iter_rows(values_only=True):
                    row_str = " | ".join(str(c) for c in row if c is not None)
                    if row_str.strip():
                        lines.append(row_str)
            wb.close()
            return "\n".join(lines[:500])
        except Exception as e:
            return f"[Erreur lecture Excel: {e}]"
    elif ext == ".csv":
        with open(filepath, encoding="utf-8", errors="replace") as f:
            return f.read(16000)
    return "[Format non supporté]"


async def normalize_with_llm(raw_text: str) -> tuple[DonneesNormalisees, int]:
    """
    Send raw Excel content to Claude and get normalized financial data.
    Returns (DonneesNormalisees, tokens_used).
    Retries up to 2 times if critical fields are missing.
    """
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    total_tokens = 0
    last_error: Exception | None = None

    for attempt in range(3):  # max 3 attempts (initial + 2 retries)
        prompt = raw_text
        if attempt > 0:
            prompt = (
                f"TENTATIVE {attempt + 1}: Les champs critiques sont manquants. "
                f"Cherche plus attentivement dans le document.\n\n{raw_text}"
            )

        message = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
        total_tokens += message.usage.input_tokens + message.usage.output_tokens

        raw_json = message.content[0].text.strip()
        # Strip markdown code blocks if present
        raw_json = re.sub(r"```(?:json)?", "", raw_json).strip()

        try:
            data = json.loads(raw_json)
            normalized = DonneesNormalisees(**data)

            # Check critical fields — retry if CA and EBITDA are both null
            if normalized.chiffre_affaires is None and normalized.ebitda is None:
                last_error = ValueError("Champs critiques manquants (CA et EBITDA)")
                continue

            return normalized, total_tokens

        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            last_error = e
            continue

    raise RuntimeError(
        f"Normalisation LLM échouée après 3 tentatives: {last_error}"
    )
