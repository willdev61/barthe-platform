"""
SQLAlchemy 2.x models
"""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, SmallInteger, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Institution(Base):
    __tablename__ = "institutions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom: Mapped[str] = mapped_column(String(200), nullable=False)
    email_admin: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    pays: Mapped[str] = mapped_column(String(100), default="Côte d'Ivoire")
    secteurs_cibles: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    abonnement_statut: Mapped[str] = mapped_column(String(20), default="trial")
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
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
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
