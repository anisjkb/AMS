from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_entity_financial_snapshot_repository import (
    AuditEntityFinancialSnapshotRepository,
)
from app.schemas.audit_entity_financial_snapshot import (
    AuditEntityFinancialSnapshotCreate,
    AuditEntityFinancialSnapshotUpdate,
)


ALLOWED_STATEMENT_TYPES = {
    "separate",
    "consolidated",
    "management",
    "provisional",
}

ALLOWED_FINANCIAL_STATUSES = {
    "draft",
    "management_provided",
    "unaudited",
    "audited",
    "finalized",
    "restated",
}


class AuditEntityFinancialSnapshotService:
    def __init__(self, db: AsyncSession):
        self.snapshot_repo = AuditEntityFinancialSnapshotRepository(db)

    async def list_snapshots(
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
        if statement_type:
            self._validate_statement_type(statement_type)

        if financial_status:
            self._validate_financial_status(financial_status)

        total, items = await self.snapshot_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            audit_entity_id=audit_entity_id,
            fiscal_year=fiscal_year,
            statement_type=statement_type,
            financial_status=financial_status,
            is_audited=is_audited,
            is_consolidated=is_consolidated,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_snapshot(
        self,
        snapshot_id: int,
    ):
        snapshot = await self.snapshot_repo.get_by_id_any_status(snapshot_id)

        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity financial snapshot not found.",
            )

        return snapshot

    async def create_snapshot(
        self,
        payload: AuditEntityFinancialSnapshotCreate,
        created_by: str,
    ):
        self._validate_statement_type(payload.statement_type)
        self._validate_financial_status(payload.financial_status)
        self._validate_dates(payload.period_start_date, payload.period_end_date)

        await self._validate_audit_entity(payload.audit_entity_id)

        await self._validate_duplicate_snapshot(
            audit_entity_id=payload.audit_entity_id,
            fiscal_year=payload.fiscal_year,
            statement_type=payload.statement_type,
            exclude_id=None,
        )

        snapshot = await self.snapshot_repo.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit entity financial snapshot created successfully.",
            "data": snapshot,
        }

    async def update_snapshot(
        self,
        snapshot_id: int,
        payload: AuditEntityFinancialSnapshotUpdate,
        updated_by: str,
    ):
        snapshot = await self.snapshot_repo.get_by_id_any_status(snapshot_id)

        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity financial snapshot not found.",
            )

        fields_set = payload.model_fields_set

        next_entity_id = (
            payload.audit_entity_id
            if "audit_entity_id" in fields_set and payload.audit_entity_id is not None
            else snapshot.audit_entity_id
        )
        next_fiscal_year = (
            payload.fiscal_year
            if "fiscal_year" in fields_set and payload.fiscal_year is not None
            else snapshot.fiscal_year
        )
        next_statement_type = (
            payload.statement_type
            if "statement_type" in fields_set and payload.statement_type is not None
            else snapshot.statement_type
        )
        next_financial_status = (
            payload.financial_status
            if "financial_status" in fields_set and payload.financial_status is not None
            else snapshot.financial_status
        )
        next_period_start_date = (
            payload.period_start_date
            if "period_start_date" in fields_set
            else snapshot.period_start_date
        )
        next_period_end_date = (
            payload.period_end_date
            if "period_end_date" in fields_set
            else snapshot.period_end_date
        )

        self._validate_statement_type(next_statement_type)
        self._validate_financial_status(next_financial_status)
        self._validate_dates(next_period_start_date, next_period_end_date)

        await self._validate_audit_entity(next_entity_id)

        await self._validate_duplicate_snapshot(
            audit_entity_id=next_entity_id,
            fiscal_year=next_fiscal_year,
            statement_type=next_statement_type,
            exclude_id=snapshot.id,
        )

        snapshot = await self.snapshot_repo.update(
            snapshot=snapshot,
            payload=payload,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity financial snapshot updated successfully.",
            "data": snapshot,
        }

    async def deactivate_snapshot(
        self,
        snapshot_id: int,
        updated_by: str,
    ):
        snapshot = await self.snapshot_repo.get_by_id_any_status(snapshot_id)

        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity financial snapshot not found.",
            )

        if not snapshot.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity financial snapshot is already inactive.",
            )

        snapshot = await self.snapshot_repo.set_active_status(
            snapshot=snapshot,
            is_active=False,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity financial snapshot deactivated successfully.",
            "data": snapshot,
        }

    async def restore_snapshot(
        self,
        snapshot_id: int,
        updated_by: str,
    ):
        snapshot = await self.snapshot_repo.get_by_id_any_status(snapshot_id)

        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity financial snapshot not found.",
            )

        if snapshot.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit entity financial snapshot is already active.",
            )

        snapshot = await self.snapshot_repo.set_active_status(
            snapshot=snapshot,
            is_active=True,
            updated_by=updated_by,
        )

        return {
            "message": "Audit entity financial snapshot restored successfully.",
            "data": snapshot,
        }

    async def permanent_delete_snapshot(
        self,
        snapshot_id: int,
    ):
        snapshot = await self.snapshot_repo.get_by_id_any_status(snapshot_id)

        if not snapshot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit entity financial snapshot not found.",
            )

        await self.snapshot_repo.permanent_delete(snapshot)

        return {
            "message": "Audit entity financial snapshot permanently deleted successfully.",
            "data": None,
        }

    async def _validate_audit_entity(
        self,
        audit_entity_id: int,
    ) -> None:
        entity = await self.snapshot_repo.get_audit_entity_by_id(audit_entity_id)

        if not entity or not entity.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit entity is invalid or inactive.",
            )

    async def _validate_duplicate_snapshot(
        self,
        audit_entity_id: int,
        fiscal_year: str,
        statement_type: str,
        exclude_id: int | None,
    ) -> None:
        existing = await self.snapshot_repo.get_duplicate_snapshot(
            audit_entity_id=audit_entity_id,
            fiscal_year=fiscal_year,
            statement_type=statement_type,
            exclude_id=exclude_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This audit entity already has a financial snapshot for this fiscal year and statement type.",
            )

    def _validate_statement_type(
        self,
        statement_type: str,
    ) -> None:
        if statement_type not in ALLOWED_STATEMENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid statement type. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_STATEMENT_TYPES))
                ),
            )

    def _validate_financial_status(
        self,
        financial_status: str,
    ) -> None:
        if financial_status not in ALLOWED_FINANCIAL_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid financial status. Allowed values are: "
                    + ", ".join(sorted(ALLOWED_FINANCIAL_STATUSES))
                ),
            )

    def _validate_dates(
        self,
        period_start_date,
        period_end_date,
    ) -> None:
        if period_start_date and period_end_date and period_end_date < period_start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Period end date cannot be earlier than period start date.",
            )
