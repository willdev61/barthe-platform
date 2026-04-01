"""
Pydantic v2 Schemas — Auth, Dossier, Analyse
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict


# ---- Auth ----

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    user_nom: str
    user_role: str


class RegisterRequest(BaseModel):
    nom: str
    email: EmailStr
    password: str
    institution_id: str


# ---- Dossier ----

class DossierCreate(BaseModel):
    nom_projet: str
    secteur: Optional[str] = None
    fichier_nom: Optional[str] = None


class DossierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    institution_id: UUID
    created_by: UUID
    nom_projet: str
    secteur: Optional[str]
    fichier_nom: Optional[str]
    fichier_url: Optional[str]
    statut: str
    score: Optional[int]
    created_at: datetime
    updated_at: datetime


# ---- Analyse ----

class DonneesNormalisees(BaseModel):
    chiffre_affaires: Optional[int] = None
    charges_exploitation: Optional[int] = None
    ebitda: Optional[int] = None
    resultat_net: Optional[int] = None
    dette_financiere: Optional[int] = None
    secteur: str = ""
    alertes: list[str] = []


class RatioFinancier(BaseModel):
    label: str
    valeur: Optional[float]
    unite: str
    seuil_min: Optional[float] = None
    seuil_max: Optional[float] = None
    description: str


class AlerteSchema(BaseModel):
    id: str
    message: str
    criticite: str  # "info" | "warning" | "critical"


class AnalyseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    dossier_id: UUID
    donnees_normalisees: DonneesNormalisees
    ratios: dict[str, RatioFinancier]
    alertes: list[AlerteSchema]
    synthese_narrative: Optional[str]
    modele_llm: str
    tokens_utilises: Optional[int]
    created_at: datetime
