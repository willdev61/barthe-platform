"""
API Keys Router — Gestion des clés API (auth session BetterAuth)
POST   /api-keys        → générer une clé (retourne la clé en clair UNE SEULE FOIS)
GET    /api-keys        → lister ses clés (métadonnées uniquement)
DELETE /api-keys/{id}   → révoquer une clé
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import ApiKey

router = APIRouter()

AVAILABLE_PERMISSIONS = ["analyses:read", "analyses:write", "dossiers:read"]


class ApiKeyCreate(BaseModel):
    nom: str
    permissions: list[str] = ["analyses:read", "analyses:write", "dossiers:read"]
    expires_at: Optional[datetime] = None


def _generate_key() -> tuple[str, str]:
    """Génère une clé aléatoire et retourne (clé_en_clair, sha256_hash)."""
    raw = "bth_" + secrets.token_hex(32)
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, key_hash


def _serialize(key: ApiKey) -> dict:
    return {
        "id": str(key.id),
        "institution_id": str(key.institution_id),
        "nom": key.nom,
        "permissions": key.permissions,
        "last_used_at": key.last_used_at.isoformat() if key.last_used_at else None,
        "expires_at": key.expires_at.isoformat() if key.expires_at else None,
        "is_active": key.is_active,
        "created_at": key.created_at.isoformat(),
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_api_key(
    body: ApiKeyCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Génère une nouvelle clé API. La valeur en clair n'est retournée qu'une seule fois."""
    institution_id = current_user.get("institution_id")
    if not institution_id:
        raise HTTPException(status_code=403, detail="Aucune institution associée à ce compte")

    # Validate permissions
    invalid = set(body.permissions) - set(AVAILABLE_PERMISSIONS)
    if invalid:
        raise HTTPException(status_code=400, detail=f"Permissions inconnues : {invalid}")

    raw_key, key_hash = _generate_key()

    api_key = ApiKey(
        institution_id=uuid.UUID(institution_id),
        nom=body.nom,
        key_hash=key_hash,
        permissions=body.permissions,
        expires_at=body.expires_at,
    )
    db.add(api_key)
    await db.flush()

    return {
        **_serialize(api_key),
        "key": raw_key,  # Retourné UNE SEULE FOIS — non stocké en clair
    }


@router.get("/")
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Liste les clés API de l'institution (sans les valeurs en clair)."""
    institution_id = current_user.get("institution_id")
    if not institution_id:
        raise HTTPException(status_code=403, detail="Aucune institution associée à ce compte")

    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.institution_id == uuid.UUID(institution_id))
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    return [_serialize(k) for k in keys]


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Révoque une clé API (désactivation immédiate)."""
    institution_id = current_user.get("institution_id")
    if not institution_id:
        raise HTTPException(status_code=403, detail="Aucune institution associée à ce compte")

    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == uuid.UUID(key_id),
            ApiKey.institution_id == uuid.UUID(institution_id),
        )
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="Clé API introuvable")

    api_key.is_active = False
    await db.flush()
