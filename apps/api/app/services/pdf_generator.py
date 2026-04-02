"""
PDF Generator Service
Generates a PDF rapport using reportlab (server-side).
Falls back to a simple HTML string if reportlab is unavailable.
"""

import os
import uuid
from datetime import datetime
from typing import Optional


def _format_currency(value: int | None) -> str:
    if value is None:
        return "—"
    return f"{value:,}".replace(",", " ") + " FCFA"


def _format_ratio(value: float | None, unit: str) -> str:
    if value is None:
        return "—"
    return f"{value:.2f}{unit}"


async def generate_pdf(
    dossier: dict,
    analyse: dict,
    institution_nom: str,
    output_dir: str = "./uploads",
    logo_path: Optional[str] = None,
    rapport_mentions: Optional[str] = None,
) -> str:
    """
    Generate a PDF report for a dossier analysis.
    Returns the file path (URL) of the generated PDF.
    """
    os.makedirs(output_dir, exist_ok=True)
    pdf_filename = f"rapport_{dossier['id']}_{uuid.uuid4().hex[:8]}.pdf"
    pdf_path = os.path.join(output_dir, pdf_filename)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )

        # Color palette
        PRIMARY = colors.HexColor("#534AB7")
        SUCCESS = colors.HexColor("#3B6D11")
        WARNING = colors.HexColor("#854F0B")
        DANGER = colors.HexColor("#A32D2D")
        LIGHT_GRAY = colors.HexColor("#F5F4F0")
        BORDER = colors.HexColor("#E5E3DC")

        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2.5 * cm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "BARTHETitle",
            parent=styles["Heading1"],
            fontSize=20,
            textColor=PRIMARY,
            spaceAfter=4,
        )
        subtitle_style = ParagraphStyle(
            "BARTHESubtitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#6B6A7A"),
            spaceAfter=12,
        )
        section_style = ParagraphStyle(
            "BARTHESection",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=PRIMARY,
            spaceBefore=16,
            spaceAfter=8,
        )
        body_style = ParagraphStyle(
            "BARTHEBody",
            parent=styles["Normal"],
            fontSize=10,
            leading=16,
            spaceAfter=6,
        )

        story = []
        now_str = datetime.now().strftime("%d/%m/%Y à %H:%M")

        # ---- Header ----
        if logo_path and os.path.isfile(logo_path):
            try:
                from reportlab.platypus import Image as RLImage
                logo_img = RLImage(logo_path, width=3 * cm, height=1.5 * cm, kind="proportional")
                story.append(logo_img)
                story.append(Spacer(1, 6))
            except Exception:
                pass  # skip logo if image cannot be loaded
        story.append(Paragraph("BARTHE", title_style))
        story.append(Paragraph("Rapport d'Analyse de Business Plan", subtitle_style))
        story.append(Paragraph(f"Institution : {institution_nom}", body_style))
        story.append(Paragraph(f"Généré le : {now_str}", body_style))
        story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
        story.append(Spacer(1, 12))

        # ---- Project info ----
        story.append(Paragraph("Informations du Projet", section_style))
        info_data = [
            ["Projet", dossier.get("nom_projet", "—")],
            ["Secteur", dossier.get("secteur") or "—"],
            ["Fichier source", dossier.get("fichier_nom") or "—"],
            ["Statut", dossier.get("statut", "—")],
        ]
        info_table = Table(info_data, colWidths=[5 * cm, 12 * cm])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#374151")),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 12))

        # ---- Score ----
        score = dossier.get("score")
        if score is not None:
            story.append(Paragraph("Score de Finançabilité", section_style))
            label = "Favorable" if score >= 75 else "Réservé" if score >= 50 else "Défavorable"
            score_color = SUCCESS if score >= 75 else WARNING if score >= 50 else DANGER
            score_data = [[f"Score : {score} / 100", f"Mention : {label}"]]
            score_table = Table(score_data, colWidths=[8.5 * cm, 8.5 * cm])
            score_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
                ("TEXTCOLOR", (0, 0), (-1, -1), score_color),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 13),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
                ("PADDING", (0, 0), (-1, -1), 10),
            ]))
            story.append(score_table)
            story.append(Spacer(1, 12))

        # ---- Financial data ----
        donnees = analyse.get("donnees_normalisees", {})
        story.append(Paragraph("Données Financières", section_style))
        fin_rows = [
            ["Indicateur", "Valeur (FCFA)"],
            ["Chiffre d'affaires", _format_currency(donnees.get("chiffre_affaires"))],
            ["Charges d'exploitation", _format_currency(donnees.get("charges_exploitation"))],
            ["EBITDA", _format_currency(donnees.get("ebitda"))],
            ["Résultat net", _format_currency(donnees.get("resultat_net"))],
            ["Dette financière", _format_currency(donnees.get("dette_financiere"))],
        ]
        fin_table = Table(fin_rows, colWidths=[9 * cm, 8 * cm])
        fin_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ]))
        story.append(fin_table)
        story.append(Spacer(1, 12))

        # ---- Ratios ----
        ratios = analyse.get("ratios", {})
        story.append(Paragraph("Ratios Financiers Clés", section_style))
        ratio_rows = [["Ratio", "Valeur", "Seuil", "Description"]]
        for key, r in ratios.items():
            val = _format_ratio(r.get("valeur"), r.get("unite", ""))
            seuil = (
                f"Min : {r['seuil_min']}{r.get('unite', '')}" if r.get("seuil_min") is not None
                else f"Max : {r['seuil_max']}{r.get('unite', '')}" if r.get("seuil_max") is not None
                else "—"
            )
            ratio_rows.append([r.get("label", key), val, seuil, r.get("description", "")])
        ratio_table = Table(ratio_rows, colWidths=[4 * cm, 3 * cm, 4 * cm, 6 * cm])
        ratio_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(ratio_table)
        story.append(Spacer(1, 12))

        # ---- Alerts ----
        alertes = analyse.get("alertes", [])
        if alertes:
            story.append(Paragraph("Alertes Détectées", section_style))
            for a in alertes:
                criticite = a.get("criticite", "info")
                color = DANGER if criticite == "critical" else WARNING if criticite == "warning" else colors.HexColor("#1D4ED8")
                prefix = {"critical": "[CRITIQUE]", "warning": "[ATTENTION]", "info": "[INFO]"}.get(criticite, "")
                story.append(
                    Paragraph(
                        f'<font color="#{color.hexval()[1:] if hasattr(color, "hexval") else "854F0B"}">'
                        f'<b>{prefix}</b></font> {a.get("message", "")}',
                        body_style,
                    )
                )

        # ---- Narrative ----
        narrative = analyse.get("synthese_narrative")
        if narrative:
            story.append(Paragraph("Synthèse Narrative IA", section_style))
            for para in narrative.split("\n\n"):
                clean = para.replace("**", "")
                story.append(Paragraph(clean, body_style))

        # ---- Footer note ----
        story.append(Spacer(1, 24))
        story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER))
        story.append(Spacer(1, 6))
        footer_text = rapport_mentions or "Document confidentiel · Usage interne uniquement"
        story.append(
            Paragraph(
                f"Généré par BARTHE — {footer_text}",
                ParagraphStyle("footer", parent=styles["Normal"], fontSize=8,
                               textColor=colors.HexColor("#9CA3AF"), alignment=1),
            )
        )

        doc.build(story)
        return f"/uploads/{pdf_filename}"

    except ImportError:
        # Fallback: write a placeholder text file if reportlab not available
        fallback_path = pdf_path.replace(".pdf", ".txt")
        with open(fallback_path, "w", encoding="utf-8") as f:
            f.write(f"BARTHE — Rapport d'Analyse\n")
            f.write(f"Projet : {dossier.get('nom_projet', '—')}\n")
            f.write(f"Score : {dossier.get('score', '—')}/100\n")
            f.write(f"Généré par BARTHE — Document confidentiel\n")
        return f"/uploads/{os.path.basename(fallback_path)}"
