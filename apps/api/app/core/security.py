"""
Security — Validation tokens BetterAuth via PostgreSQL + API Key validation
FastAPI ne gère plus l'auth, il valide juste les sessions BetterAuth
"""
import hashlib
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from fastapi import HTTPException, Depends, Header
from app.core.database import get_db


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")

    result = await db.execute(
        text("""
            SELECT s.id, s."userId", s."expiresAt", u.email, u.name, u.role, u.institution_id
            FROM session s
            JOIN "user" u ON u.id = s."userId"
            WHERE s.token = :token
              AND s."expiresAt" > NOW()
        """),
        {"token": token}
    )
    session = result.fetchone()

    if not session:
        raise HTTPException(status_code=401, detail="Session invalide ou expirée")

    return {
        "user_id": session.userId,
        "email": session.email,
        "name": session.name,
        "role": session.role,
        "institution_id": session.institution_id,
    }


async def get_api_key_institution(
    x_api_key: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Valide une clé API et retourne l'institution associée."""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Clé API manquante (header X-Api-Key)")

    # 1. Hasher la clé reçue avec SHA-256
    key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()

    # 2. Comparer avec key_hash en base
    result = await db.execute(
        text("""
            SELECT ak.id, ak.institution_id, ak.permissions, ak.is_active, ak.expires_at,
                   i.nom AS institution_nom
            FROM api_keys ak
            JOIN institutions i ON i.id = ak.institution_id
            WHERE ak.key_hash = :key_hash
        """),
        {"key_hash": key_hash}
    )
    row = result.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    # 3. Vérifier is_active et expires_at
    if not row.is_active:
        raise HTTPException(status_code=401, detail="Clé API révoquée")

    if row.expires_at and row.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Clé API expirée")

    # 4. Mettre à jour last_used_at
    await db.execute(
        text("UPDATE api_keys SET last_used_at = NOW() WHERE id = :key_id"),
        {"key_id": str(row.id)}
    )

    # 5. Retourner l'institution associée
    return {
        "api_key_id": str(row.id),
        "institution_id": str(row.institution_id),
        "institution_nom": row.institution_nom,
        "permissions": row.permissions,
    }
