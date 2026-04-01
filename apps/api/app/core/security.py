"""
Security — Validation tokens BetterAuth via PostgreSQL
FastAPI ne gère plus l'auth, il valide juste les sessions BetterAuth
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
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
            SELECT s.id, s."userId", s."expiresAt", u.email, u.name, u.role
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
    }
