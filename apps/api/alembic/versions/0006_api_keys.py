"""API Keys table

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Allow dossiers created via API key to have no human user
    op.alter_column("dossiers", "created_by", nullable=True)
    # Track which API key created a dossier (nullable — only set for API-created dossiers)
    op.add_column(
        "dossiers",
        sa.Column("api_key_id", postgresql.UUID(as_uuid=True), nullable=True),
    )

    op.create_table(
        "api_keys",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "institution_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("institutions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("nom", sa.String(200), nullable=False),
        sa.Column("key_hash", sa.String(64), nullable=False, unique=True),
        sa.Column(
            "permissions",
            postgresql.JSONB,
            nullable=False,
            server_default='["analyses:read","analyses:write","dossiers:read"]',
        ),
        sa.Column("last_used_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("ix_api_keys_institution_id", "api_keys", ["institution_id"])
    op.create_index("ix_api_keys_key_hash", "api_keys", ["key_hash"])


def downgrade() -> None:
    op.drop_index("ix_api_keys_key_hash", table_name="api_keys")
    op.drop_index("ix_api_keys_institution_id", table_name="api_keys")
    op.drop_table("api_keys")
    op.drop_column("dossiers", "api_key_id")
    op.alter_column("dossiers", "created_by", nullable=False)
