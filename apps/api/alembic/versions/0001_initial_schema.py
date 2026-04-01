"""Initial schema — BARTHE

Revision ID: 0001
Revises: 
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "institutions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nom", sa.String(200), nullable=False),
        sa.Column("email_admin", sa.String(200), nullable=False, unique=True),
        sa.Column("pays", sa.String(100), server_default="Côte d'Ivoire"),
        sa.Column("secteurs_cibles", sa.Text, nullable=True),
        sa.Column("abonnement_statut", sa.String(20), server_default="trial"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nom", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("role", sa.String(20), server_default="analyste"),
        sa.Column("password_hash", sa.Text, nullable=False),
        sa.Column("last_login", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
    )

    op.create_table(
        "dossiers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("nom_projet", sa.String(300), nullable=False),
        sa.Column("secteur", sa.String(100), nullable=True),
        sa.Column("fichier_nom", sa.String(300), nullable=True),
        sa.Column("fichier_url", sa.Text, nullable=True),
        sa.Column("statut", sa.String(20), server_default="en_attente"),
        sa.Column("score", sa.SmallInteger, nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
    )

    op.create_table(
        "analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("dossier_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("donnees_normalisees", postgresql.JSONB, nullable=False),
        sa.Column("ratios", postgresql.JSONB, server_default="{}"),
        sa.Column("alertes", postgresql.JSONB, server_default="[]"),
        sa.Column("synthese_narrative", sa.Text, nullable=True),
        sa.Column("modele_llm", sa.String(100), server_default="claude-sonnet-4-6"),
        sa.Column("tokens_utilises", sa.Integer, nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
    )

    op.create_table(
        "rapports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("dossier_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("dossiers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("genere_par", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("pdf_url", sa.Text, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
    )

    # Indexes for performance
    op.create_index("ix_dossiers_institution_id", "dossiers", ["institution_id"])
    op.create_index("ix_dossiers_statut", "dossiers", ["statut"])
    op.create_index("ix_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_table("rapports")
    op.drop_table("analyses")
    op.drop_table("dossiers")
    op.drop_table("users")
    op.drop_table("institutions")
