from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_financial_snapshot import (
    AuditEntityFinancialSnapshot,
)
from app.schemas.audit_entity_financial_snapshot import (
    AuditEntityFinancialSnapshotCreate,
    AuditEntityFinancialSnapshotUpdate,
)


class AuditEntityFinancialSnapshotRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        fiscal_year: str | None,
        statement_type: str | None,
        financial_status: str | None,
        is_audited: bool | None,
        is_consolidated: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityFinancialSnapshot)

        if is_active is not None:
            stmt = stmt.where(AuditEntityFinancialSnapshot.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(
                AuditEntityFinancialSnapshot.audit_entity_id == audit_entity_id
            )

        if fiscal_year:
            stmt = stmt.where(AuditEntityFinancialSnapshot.fiscal_year == fiscal_year)

        if statement_type:
            stmt = stmt.where(
                AuditEntityFinancialSnapshot.statement_type == statement_type
            )

        if financial_status:
            stmt = stmt.where(
                AuditEntityFinancialSnapshot.financial_status == financial_status
            )

        if is_audited is not None:
            stmt = stmt.where(AuditEntityFinancialSnapshot.is_audited == is_audited)

        if is_consolidated is not None:
            stmt = stmt.where(
                AuditEntityFinancialSnapshot.is_consolidated == is_consolidated
            )

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityFinancialSnapshot.fiscal_year.ilike(search_term),
                    AuditEntityFinancialSnapshot.statement_type.ilike(search_term),
                    AuditEntityFinancialSnapshot.reporting_framework.ilike(search_term),
                    AuditEntityFinancialSnapshot.currency_code.ilike(search_term),
                    AuditEntityFinancialSnapshot.financial_status.ilike(search_term),
                    AuditEntityFinancialSnapshot.auditor_name.ilike(search_term),
                    AuditEntityFinancialSnapshot.source_document_reference.ilike(
                        search_term
                    ),
                    AuditEntityFinancialSnapshot.description.ilike(search_term),
                    AuditEntityFinancialSnapshot.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityFinancialSnapshot.id,
            "fiscal_year": AuditEntityFinancialSnapshot.fiscal_year,
            "period_end_date": AuditEntityFinancialSnapshot.period_end_date,
            "statement_type": AuditEntityFinancialSnapshot.statement_type,
            "financial_status": AuditEntityFinancialSnapshot.financial_status,
            "revenue": AuditEntityFinancialSnapshot.revenue,
            "total_assets": AuditEntityFinancialSnapshot.total_assets,
            "profit_after_tax": AuditEntityFinancialSnapshot.profit_after_tax,
            "created_at": AuditEntityFinancialSnapshot.created_at,
            "updated_at": AuditEntityFinancialSnapshot.updated_at,
        }

        sort_column = allowed_sort_fields.get(
            sort_by,
            AuditEntityFinancialSnapshot.id,
        )

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return total or 0, items

    async def get_by_id_any_status(
        self,
        snapshot_id: int,
    ) -> AuditEntityFinancialSnapshot | None:
        result = await self.db.execute(
            select(AuditEntityFinancialSnapshot).where(
                AuditEntityFinancialSnapshot.id == snapshot_id
            )
        )
        return result.scalar_one_or_none()

    async def get_audit_entity_by_id(
        self,
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.id == audit_entity_id)
        )
        return result.scalar_one_or_none()

    async def get_duplicate_snapshot(
        self,
        audit_entity_id: int,
        fiscal_year: str,
        statement_type: str,
        exclude_id: int | None = None,
    ) -> AuditEntityFinancialSnapshot | None:
        stmt = select(AuditEntityFinancialSnapshot).where(
            AuditEntityFinancialSnapshot.audit_entity_id == audit_entity_id,
            AuditEntityFinancialSnapshot.fiscal_year == fiscal_year,
            AuditEntityFinancialSnapshot.statement_type == statement_type,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityFinancialSnapshot.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityFinancialSnapshotCreate,
        created_by: str,
    ) -> AuditEntityFinancialSnapshot:
        snapshot = AuditEntityFinancialSnapshot(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(snapshot)
        await self.db.commit()
        await self.db.refresh(snapshot)

        return snapshot

    async def update(
        self,
        snapshot: AuditEntityFinancialSnapshot,
        payload: AuditEntityFinancialSnapshotUpdate,
        updated_by: str,
    ) -> AuditEntityFinancialSnapshot:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(snapshot, field, value)

        snapshot.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(snapshot)

        return snapshot

    async def set_active_status(
        self,
        snapshot: AuditEntityFinancialSnapshot,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityFinancialSnapshot:
        snapshot.is_active = is_active
        snapshot.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(snapshot)

        return snapshot

    async def permanent_delete(
        self,
        snapshot: AuditEntityFinancialSnapshot,
    ) -> None:
        await self.db.delete(snapshot)
        await self.db.commit()
