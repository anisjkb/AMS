from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.audit_discussion_issue_repository import (
    AuditDiscussionIssueRepository,
)
from app.schemas.audit_discussion_issue import (
    AuditDiscussionIssueCreate,
    AuditDiscussionIssueUpdate,
)


class AuditDiscussionIssueService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditDiscussionIssueRepository(db)

    async def list_audit_discussion_issues(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
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

    async def get_audit_discussion_issue(self, issue_id: int):
        item = await self.repository.get_by_id(issue_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit Discussion Issue record not found.",
            )

        return item

    async def create_audit_discussion_issue(
        self,
        payload: AuditDiscussionIssueCreate,
        created_by: str,
    ):
        item = await self.repository.create(
            payload=payload,
            created_by=created_by,
        )

        return {
            "message": "Audit Discussion Issue record created successfully.",
            "data": item,
        }

    async def update_audit_discussion_issue(
        self,
        issue_id: int,
        payload: AuditDiscussionIssueUpdate,
        updated_by: str,
    ):
        item = await self.get_audit_discussion_issue(issue_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Discussion Issue record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_audit_discussion_issue(
        self,
        issue_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_discussion_issue(issue_id)

        if not item.is_active:
            return {
                "message": "Audit Discussion Issue record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Discussion Issue record deactivated successfully.",
            "data": item,
        }

    async def restore_audit_discussion_issue(
        self,
        issue_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_discussion_issue(issue_id)

        if item.is_active:
            return {
                "message": "Audit Discussion Issue record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Discussion Issue record restored successfully.",
            "data": item,
        }

    async def permanent_delete_audit_discussion_issue(self, issue_id: int):
        item = await self.get_audit_discussion_issue(issue_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Audit Discussion Issue record permanently deleted successfully.",
            "data": None,
        }
