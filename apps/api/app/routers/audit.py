"""
FastAPI Audit Router
GET /audit                  → historique de l'institution (paginé)
GET /audit/dossiers/{id}    → historique d'un dossier spécifique
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.config import settings
from app.models.models import AuditLog

router = APIRouter()

# ---- Mock data ----

MOCK_AUDIT_LOGS: list[dict] = [
    {
        "id": "aud-001",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "dossier.created",
        "entity_type": "dossier",
        "entity_id": "dos-001",
        "metadata": {"nom_projet": "Agro-Export Abidjan SARL"},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-20T08:30:00Z",
    },
    {
        "id": "aud-002",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "analyse.run",
        "entity_type": "analyse",
        "entity_id": "ana-001",
        "metadata": {"dossier_id": "dos-001", "score": 82, "tokens": 2840},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-20T09:00:00Z",
    },
    {
        "id": "aud-003",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "rapport.exported",
        "entity_type": "rapport",
        "entity_id": "rap-001",
        "metadata": {"dossier_id": "dos-001", "pdf_url": "/uploads/rapport_dos-001.pdf"},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-20T09:20:00Z",
    },
    {
        "id": "aud-004",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "dossier.created",
        "entity_type": "dossier",
        "entity_id": "dos-002",
        "metadata": {"nom_projet": "TechServices Dakar SAS"},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-18T14:00:00Z",
    },
    {
        "id": "aud-005",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "analyse.run",
        "entity_type": "analyse",
        "entity_id": "ana-002",
        "metadata": {"dossier_id": "dos-002", "score": 61, "tokens": 1950},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-18T14:30:00Z",
    },
    {
        "id": "aud-006",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "dossier.created",
        "entity_type": "dossier",
        "entity_id": "dos-003",
        "metadata": {"nom_projet": "Boulangerie Moderne Ouaga"},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-15T11:00:00Z",
    },
    {
        "id": "aud-007",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "analyse.run",
        "entity_type": "analyse",
        "entity_id": "ana-003",
        "metadata": {"dossier_id": "dos-003", "score": 38, "tokens": 2100},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-15T11:30:00Z",
    },
    {
        "id": "aud-008",
        "user_id": "user-001",
        "institution_id": "inst-001",
        "action": "user.invited",
        "entity_type": "user",
        "entity_id": None,
        "metadata": {"email": "diallo.ibrahima@ba-ci.com", "role": "analyste"},
        "ip_address": "192.168.1.10",
        "created_at": "2025-03-10T10:00:00Z",
    },
]


@router.get("/")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Historique de l'institution (paginé)."""
    if settings.USE_MOCK:
        items = MOCK_AUDIT_LOGS
        if action:
            items = [l for l in items if l["action"] == action]
        if entity_type:
            items = [l for l in items if l["entity_type"] == entity_type]
        total = len(items)
        offset = (page - 1) * limit
        return {"items": items[offset: offset + limit], "total": total, "page": page, "limit": limit}

    query = select(AuditLog).order_by(AuditLog.created_at.desc())
    count_query = select(func.count()).select_from(AuditLog)

    if action:
        query = query.where(AuditLog.action == action)
        count_query = count_query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
        count_query = count_query.where(AuditLog.entity_type == entity_type)
    if start_date:
        query = query.where(AuditLog.created_at >= start_date)
        count_query = count_query.where(AuditLog.created_at >= start_date)
    if end_date:
        query = query.where(AuditLog.created_at <= end_date)
        count_query = count_query.where(AuditLog.created_at <= end_date)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "items": [_serialize(log) for log in logs],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("/dossiers/{dossier_id}")
async def get_dossier_audit(
    dossier_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Historique d'un dossier spécifique."""
    if settings.USE_MOCK:
        return [l for l in MOCK_AUDIT_LOGS if l.get("entity_id") == dossier_id or l.get("metadata", {}).get("dossier_id") == dossier_id]

    result = await db.execute(
        select(AuditLog)
        .where(
            (AuditLog.entity_id == uuid.UUID(dossier_id)) |
            (AuditLog.extra["dossier_id"].astext == dossier_id)
        )
        .order_by(AuditLog.created_at.desc())
    )
    logs = result.scalars().all()
    return [_serialize(log) for log in logs]


def _serialize(log: AuditLog) -> dict:
    return {
        "id": str(log.id),
        "user_id": log.user_id,
        "institution_id": str(log.institution_id) if log.institution_id else None,
        "action": log.action,
        "entity_type": log.entity_type,
        "entity_id": str(log.entity_id) if log.entity_id else None,
        "metadata": log.extra,
        "ip_address": log.ip_address,
        "created_at": log.created_at.isoformat(),
    }
