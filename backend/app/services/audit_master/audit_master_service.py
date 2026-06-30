from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_master_repository import AuditMasterRepository
from app.schemas.audit_master import AuditMasterCreate, AuditMasterUpdate


class AuditMasterService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditMasterRepository(db)

    async def list_audit_master(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        client_id: int | None,
        audit_type: str | None,
        status_filter: str | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            client_id=client_id,
            audit_type=audit_type,
            status=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_audit_master(self, audit_id: int):
        item = await self.repository.get_by_id(audit_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit Master record not found.",
            )

        return item

    async def _validate_client(self, client_id: int) -> None:
        entity = await self.repository.get_active_audit_entity_by_id(client_id)

        if not entity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected client/audit entity is invalid or inactive.",
            )

    async def create_audit_master(
        self,
        payload: AuditMasterCreate,
        created_by: str,
    ):
        await self._validate_client(payload.client_id)

        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit Master record created successfully.",
            "data": item,
        }

    async def update_audit_master(
        self,
        audit_id: int,
        payload: AuditMasterUpdate,
        updated_by: str,
    ):
        item = await self.get_audit_master(audit_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "client_id" in update_data:
            await self._validate_client(update_data["client_id"])

        audit_start_date = update_data.get("audit_start_date", item.audit_start_date)
        audit_end_date = update_data.get("audit_end_date", item.audit_end_date)

        if audit_end_date < audit_start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audit end date cannot be before audit start date.",
            )

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Master record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_audit_master(
        self,
        audit_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_master(audit_id)

        if not item.is_active:
            return {
                "message": "Audit Master record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Master record deactivated successfully.",
            "data": item,
        }

    async def restore_audit_master(
        self,
        audit_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_master(audit_id)

        if item.is_active:
            return {
                "message": "Audit Master record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Master record restored successfully.",
            "data": item,
        }

    async def permanent_delete_audit_master(self, audit_id: int):
        item = await self.get_audit_master(audit_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Audit Master record permanently deleted successfully.",
            "data": None,
        }
