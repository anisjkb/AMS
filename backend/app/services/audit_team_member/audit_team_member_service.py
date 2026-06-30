from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_team_member_repository import AuditTeamMemberRepository
from app.schemas.audit_team_member import (
    AuditTeamMemberCreate,
    AuditTeamMemberUpdate,
)


class AuditTeamMemberService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditTeamMemberRepository(db)

    async def list_audit_team_members(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        team_id: int | None,
        member_type: str | None,
        status_filter: str | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            team_id=team_id,
            member_type=member_type,
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

    async def get_audit_team_member(self, team_member_id: int):
        item = await self.repository.get_by_id(team_member_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit Team Member record not found.",
            )

        return item

    async def _validate_team(self, team_id: int) -> None:
        team = await self.repository.get_active_team_by_id(team_id)

        if not team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected audit team is invalid or inactive.",
            )

    async def _validate_employee_reference(
        self,
        emp_id: str,
        member_type: str,
    ) -> None:
        try:
            employee_id = int(emp_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected employee reference is invalid.",
            ) from exc

        employee = await self.repository.get_active_employee_by_id(employee_id)

        if not employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected employee is invalid or inactive.",
            )

        if employee.employee_type != member_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected employee does not match the selected Employee Type.",
            )

    async def create_audit_team_member(
        self,
        payload: AuditTeamMemberCreate,
        created_by: str,
    ):
        await self._validate_team(payload.team_id)
        await self._validate_employee_reference(
            emp_id=payload.emp_id,
            member_type=payload.member_type,
        )

        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit Team Member record created successfully.",
            "data": item,
        }

    async def update_audit_team_member(
        self,
        team_member_id: int,
        payload: AuditTeamMemberUpdate,
        updated_by: str,
    ):
        item = await self.get_audit_team_member(team_member_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "team_id" in update_data:
            await self._validate_team(update_data["team_id"])

        emp_id = update_data.get("emp_id", item.emp_id)
        member_type = update_data.get("member_type", item.member_type)

        if emp_id and member_type:
            await self._validate_employee_reference(
                emp_id=emp_id,
                member_type=member_type,
            )

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Team Member record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_audit_team_member(
        self,
        team_member_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_team_member(team_member_id)

        if not item.is_active:
            return {
                "message": "Audit Team Member record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Team Member record deactivated successfully.",
            "data": item,
        }

    async def restore_audit_team_member(
        self,
        team_member_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_team_member(team_member_id)

        if item.is_active:
            return {
                "message": "Audit Team Member record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Team Member record restored successfully.",
            "data": item,
        }

    async def permanent_delete_audit_team_member(self, team_member_id: int):
        item = await self.get_audit_team_member(team_member_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Audit Team Member record permanently deleted successfully.",
            "data": None,
        }
