"""
Helper to trigger notifications on the Next.js app via internal webhook.
Fire-and-forget: never raises, never blocks the analysis pipeline.
"""

import httpx
from app.core.config import settings


async def trigger_notification(
    type: str,
    institution_id: str,
    user_id: str | None,
    metadata: dict,
) -> None:
    """POST to Next.js /api/notifications/webhook (fire-and-forget)."""
    if not getattr(settings, "NEXT_INTERNAL_URL", None) or not getattr(settings, "INTERNAL_WEBHOOK_SECRET", None):
        return
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{settings.NEXT_INTERNAL_URL}/api/notifications/webhook",
                json={
                    "type": type,
                    "institution_id": institution_id,
                    "user_id": user_id,
                    "metadata": metadata,
                },
                headers={"x-internal-secret": settings.INTERNAL_WEBHOOK_SECRET},
            )
    except Exception:
        pass
