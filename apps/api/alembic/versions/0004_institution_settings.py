"""Institution settings

Revision ID: 0004
Revises: 0002
Create Date: 2026-04-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004"
down_revision = "0002"
branch_labels = None
depends_on = None

_DEFAULT_SETTINGS = {
    "scoring_thresholds": {"ebitda_min": 20.0, "levier_max": 3.0, "dscr_min": 1.2},
    "secteurs_actifs": [],
    "rapport_logo_url": None,
    "rapport_mentions": "Document confidentiel",
}


def upgrade() -> None:
    op.add_column(
        "institutions",
        sa.Column(
            "settings",
            postgresql.JSONB,
            nullable=False,
            server_default=sa.text(
                "'{\"scoring_thresholds\": {\"ebitda_min\": 20.0, \"levier_max\": 3.0, \"dscr_min\": 1.2},"
                " \"secteurs_actifs\": [], \"rapport_logo_url\": null, \"rapport_mentions\": \"Document confidentiel\"}'::jsonb"
            ),
        ),
    )


def downgrade() -> None:
    op.drop_column("institutions", "settings")
