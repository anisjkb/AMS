from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_type import AuditType
from app.repositories.audit_type_repository import AuditTypeRepository
from app.schemas.audit_type import (
    AuditTypeCreate,
    AuditTypeListResponse,
    AuditTypeMessageResponse,
    AuditTypeUpdate,
)


class AuditTypeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = AuditTypeRepository(db)

    async def list_audit_type(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "audit_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
        status: str | None = None,
    ) -> AuditTypeListResponse:
        total, items = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            is_active=is_active,
            status=status,
        )

        return AuditTypeListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=items,
        )

    async def get_audit_type(self, audit_type_id: int) -> AuditType:
        item = await self.repository.get_by_id(audit_type_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit type not found.",
            )
        return item

    async def create_audit_type(
        self,
        payload: AuditTypeCreate,
        *,
        username: str | None = None,
    ) -> AuditTypeMessageResponse:
        existing = await self.repository.get_by_name(payload.audit_type_name)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Audit type name already exists.",
            )

        item = AuditType(**payload.model_dump())
        if username:
            item.created_by = username
            item.updated_by = username

        created = await self.repository.create(item)
        return AuditTypeMessageResponse(
            message="Audit type created successfully.",
            data=created,
        )

    async def update_audit_type(
        self,
        audit_type_id: int,
        payload: AuditTypeUpdate,
        *,
        username: str | None = None,
    ) -> AuditTypeMessageResponse:
        item = await self.get_audit_type(audit_type_id)
        data = payload.model_dump(exclude_unset=True)

        if "audit_type_name" in data and data["audit_type_name"]:
            existing = await self.repository.get_by_name(data["audit_type_name"])
            if existing is not None and existing.audit_type_id != audit_type_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Audit type name already exists.",
                )

        for field, value in data.items():
            setattr(item, field, value)

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return AuditTypeMessageResponse(
            message="Audit type updated successfully.",
            data=updated,
        )

    async def deactivate_audit_type(
        self,
        audit_type_id: int,
        *,
        username: str | None = None,
    ) -> AuditTypeMessageResponse:
        item = await self.get_audit_type(audit_type_id)
        item.is_active = False
        item.status = "inactive"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return AuditTypeMessageResponse(
            message="Audit type inactivated successfully.",
            data=updated,
        )

    async def restore_audit_type(
        self,
        audit_type_id: int,
        *,
        username: str | None = None,
    ) -> AuditTypeMessageResponse:
        item = await self.get_audit_type(audit_type_id)
        item.is_active = True
        item.status = "active"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return AuditTypeMessageResponse(
            message="Audit type restored successfully.",
            data=updated,
        )

    async def permanent_delete_audit_type(self, audit_type_id: int) -> AuditTypeMessageResponse:
        item = await self.get_audit_type(audit_type_id)
        await self.repository.delete(item)
        return AuditTypeMessageResponse(
            message="Audit type permanently deleted successfully.",
            data=None,
        )
