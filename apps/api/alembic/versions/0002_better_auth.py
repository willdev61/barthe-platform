"""BetterAuth schema

Revision ID: 0002
Revises: 0001
Create Date: 2025-01-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("emailVerified", sa.Boolean, nullable=False, default=False),
        sa.Column("image", sa.Text, nullable=True),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updatedAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("role", sa.String(20), server_default="analyste"),
        sa.Column("institution_id", sa.String(36), nullable=True),
    )

    op.create_table(
        "session",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("expiresAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("token", sa.String(255), nullable=False, unique=True),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updatedAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("ipAddress", sa.String(255), nullable=True),
        sa.Column("userAgent", sa.Text, nullable=True),
        sa.Column("userId", sa.String(36),
                  sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
    )

    op.create_table(
        "account",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("accountId", sa.String(255), nullable=False),
        sa.Column("providerId", sa.String(255), nullable=False),
        sa.Column("userId", sa.String(36),
                  sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("accessToken", sa.Text, nullable=True),
        sa.Column("refreshToken", sa.Text, nullable=True),
        sa.Column("idToken", sa.Text, nullable=True),
        sa.Column("expiresAt", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("password", sa.Text, nullable=True),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("updatedAt", sa.TIMESTAMP(timezone=True), nullable=False),
    )

    op.create_table(
        "verification",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("identifier", sa.String(255), nullable=False),
        sa.Column("value", sa.Text, nullable=False),
        sa.Column("expiresAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("updatedAt", sa.TIMESTAMP(timezone=True), nullable=True),
    )

    op.create_table(
        "organization",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=True),
        sa.Column("logo", sa.Text, nullable=True),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("metadata", sa.Text, nullable=True),
    )

    op.create_table(
        "member",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organizationId", sa.String(36),
                  sa.ForeignKey("organization.id", ondelete="CASCADE"), nullable=False),
        sa.Column("userId", sa.String(36),
                  sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="analyste"),
        sa.Column("createdAt", sa.TIMESTAMP(timezone=True), nullable=False),
    )

    op.create_table(
        "invitation",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organizationId", sa.String(36),
                  sa.ForeignKey("organization.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("expiresAt", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("inviterId", sa.String(36),
                  sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
    )

def downgrade() -> None:
    op.drop_table("invitation")
    op.drop_table("member")
    op.drop_table("organization")
    op.drop_table("verification")
    op.drop_table("account")
    op.drop_table("session")
    op.drop_table("user")
