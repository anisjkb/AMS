from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_visit_repository import (
    AuditVisitRepository,
)


class AuditVisitService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditVisitRepository(db)

    async def list_audit_visits(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }
