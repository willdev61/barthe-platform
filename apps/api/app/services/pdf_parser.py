"""
Parser PDF — extrait le texte des Business Plans en PDF
Stratégie : pdfplumber pour les PDF texte, pymupdf pour les PDF scannés
"""
import pdfplumber
import fitz  # pymupdf
from pathlib import Path


def extract_pdf_content(file_path: str) -> str:
    """Extrait le contenu textuel d'un PDF BP"""
    # Tenter d'abord pdfplumber (meilleur pour les tableaux)
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row:
                            text += " | ".join(
                                str(cell) for cell in row if cell
                            ) + "\n"
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            if len(text.strip()) > 100:
                return text
    except Exception:
        pass

    # Fallback : pymupdf (pour les PDF scannés)
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text
