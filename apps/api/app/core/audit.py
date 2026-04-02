"""
Audit trail — middleware d'enregistrement des actions
"""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog


async def log_action(
    db: AsyncSession,
    user_id: Optional[str],
    institution_id: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    metadata: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> None:
    """Enregistre une action dans l'audit trail"""
    log = AuditLog(
        user_id=user_id,
        institution_id=uuid.UUID(institution_id) if institution_id else None,
        action=action,
        entity_type=entity_type,
        entity_id=uuid.UUID(entity_id) if entity_id else None,
        extra=metadata or {},
        ip_address=ip_address,
    )
    db.add(log)
    await db.flush()
