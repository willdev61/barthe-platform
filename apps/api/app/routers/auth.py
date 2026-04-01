"""
FastAPI Auth Router
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.core.config import settings
from app.models.models import User, Institution
from app.schemas.schemas import LoginRequest, TokenResponse, RegisterRequest

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )

    token = create_access_token(
        {"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        user_nom=user.nom,
        user_role=user.role,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email déjà utilisé")

    user = User(
        nom=body.nom,
        email=body.email,
        password_hash=hash_password(body.password),
        institution_id=body.institution_id,
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": str(user.id), "role": user.role})

    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        user_nom=user.nom,
        user_role=user.role,
    )
