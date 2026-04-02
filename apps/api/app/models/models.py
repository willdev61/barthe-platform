"""
SQLAlchemy 2.x models
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, SmallInteger, Integer, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _default_institution_settings() -> dict:
    return {
        "scoring_thresholds": {"ebitda_min": 20.0, "levier_max": 3.0, "dscr_min": 1.2},
        "secteurs_actifs": [],
        "rapport_logo_url": None,
        "rapport_mentions": "Document confidentiel",
    }


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom: Mapped[str] = mapped_column(String(200), nullable=False)
    email_admin: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    pays: Mapped[str] = mapped_column(String(100), default="Côte d'Ivoire")
    secteurs_cibles: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    abonnement_statut: Mapped[str] = mapped_column(String(20), default="trial")
    inst_settings: Mapped[dict] = mapped_column("settings", JSONB, default=_default_institution_settings)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    users: Mapped[list["User"]] = relationship("User", back_populates="institution")
    dossiers: Mapped[list["Dossier"]] = relationship("Dossier", back_populates="institution")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"))
    nom: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    role: Mapped[str] = mapped_column(String(20), default="analyste")
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    institution: Mapped["Institution"] = relationship("Institution", back_populates="users")
    dossiers: Mapped[list["Dossier"]] = relationship("Dossier", back_populates="creator")


class Dossier(Base):
    __tablename__ = "dossiers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"))
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    api_key_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    nom_projet: Mapped[str] = mapped_column(String(300), nullable=False)
    secteur: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fichier_nom: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    fichier_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    statut: Mapped[str] = mapped_column(String(20), default="en_attente")
    score: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    institution: Mapped["Institution"] = relationship("Institution", back_populates="dossiers")
    creator: Mapped["User"] = relationship("User", back_populates="dossiers")
    analyse: Mapped[Optional["Analyse"]] = relationship("Analyse", back_populates="dossier", uselist=False)
    rapports: Mapped[list["Rapport"]] = relationship("Rapport", back_populates="dossier")


class Analyse(Base):
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("dossiers.id", ondelete="CASCADE"), unique=True)
    donnees_normalisees: Mapped[dict] = mapped_column(JSON, nullable=False)
    ratios: Mapped[dict] = mapped_column(JSON, default=dict)
    alertes: Mapped[list] = mapped_column(JSON, default=list)
    synthese_narrative: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    modele_llm: Mapped[str] = mapped_column(String(100), default="claude-sonnet-4-6")
    tokens_utilises: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    dossier: Mapped["Dossier"] = relationship("Dossier", back_populates="analyse")


class Rapport(Base):
    __tablename__ = "rapports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dossier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("dossiers.id", ondelete="CASCADE"))
    genere_par: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    pdf_url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    dossier: Mapped["Dossier"] = relationship("Dossier", back_populates="rapports")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"))
    nom: Mapped[str] = mapped_column(String(200), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    permissions: Mapped[list] = mapped_column(JSONB, default=lambda: ["analyses:read", "analyses:write", "dossiers:read"])
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    institution: Mapped["Institution"] = relationship("Institution")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    institution_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    extra: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
