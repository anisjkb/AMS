from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_discussion_issue import AuditDiscussionIssue
from app.models.audit_visit_info import AuditVisitInfo
from app.repositories.audit_visit_observation_repository import (
    AuditVisitObservationRepository,
)
from app.schemas.audit_visit_observation import (
    AuditVisitObservationCreate,
    AuditVisitObservationUpdate,
)


class AuditVisitObservationService:
    def __init__(self, db: AsyncSession):
        self.repository = AuditVisitObservationRepository(db)

    async def list_audit_visit_observations(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        issue_id: int | None,
        visit_id: int | None,
        audit_id: int | None,
        team_id: int | None,
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
            issue_id=issue_id,
            visit_id=visit_id,
            audit_id=audit_id,
            team_id=team_id,
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

    async def get_audit_visit_observation(self, visit_observation_id: int):
        item = await self.repository.get_by_id(visit_observation_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit Visit Observation record not found.",
            )

        return item

    async def _get_valid_issue(
        self,
        issue_id: int,
    ) -> AuditDiscussionIssue:
        issue = await self.repository.get_active_issue_by_id(issue_id)

        if not issue:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Discussion Issue is invalid or inactive.",
            )

        return issue

    async def _get_valid_visit(self, visit_id: int) -> AuditVisitInfo:
        visit = await self.repository.get_active_visit_by_id(visit_id)

        if not visit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Visit Info is invalid or inactive.",
            )

        return visit

    async def _validate_audit_master(self, audit_id: int) -> None:
        audit_master = await self.repository.get_active_audit_master_by_id(audit_id)

        if not audit_master:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Master is invalid or inactive.",
            )

    async def _validate_team(self, team_id: int) -> None:
        team = await self.repository.get_active_team_by_id(team_id)

        if not team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected Audit Team is invalid or inactive.",
            )

    async def _normalize_data(self, data: dict) -> dict:
        normalized = dict(data)

        issue_id = normalized.get("issue_id")
        if issue_id is not None:
            issue = await self._get_valid_issue(issue_id)
            normalized["audit_type"] = issue.audit_type
            normalized["discussion_point"] = issue.discussion_point

        visit_id = normalized.get("visit_id")
        if visit_id is not None:
            visit = await self._get_valid_visit(visit_id)
            normalized["audit_id"] = visit.audit_id
            normalized["team_id"] = visit.team_id

        audit_id = normalized.get("audit_id")
        if audit_id is not None:
            await self._validate_audit_master(audit_id)

        team_id = normalized.get("team_id")
        if team_id is not None:
            await self._validate_team(team_id)

        return normalized

    async def create_audit_visit_observation(
        self,
        payload: AuditVisitObservationCreate,
        created_by: str,
    ):
        data = await self._normalize_data(payload.model_dump())

        item = await self.repository.create_from_data(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Audit Visit Observation record created successfully.",
            "data": item,
        }

    async def update_audit_visit_observation(
        self,
        visit_observation_id: int,
        payload: AuditVisitObservationUpdate,
        updated_by: str,
    ):
        item = await self.get_audit_visit_observation(visit_observation_id)
        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        merged_data = {
            "issue_id": item.issue_id,
            "audit_type": item.audit_type,
            "discussion_point": item.discussion_point,
            "observation_discussion": item.observation_discussion,
            "observation_decision": item.observation_decision,
            "visit_id": item.visit_id,
            "audit_id": item.audit_id,
            "team_id": item.team_id,
            "observation_note": item.observation_note,
            "status": item.status,
            "is_active": item.is_active,
            **update_data,
        }

        normalized = await self._normalize_data(merged_data)

        update_data = {
            key: value
            for key, value in normalized.items()
            if key in merged_data
        }

        updated_item = await self.repository.update(
            item=item,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Observation record updated successfully.",
            "data": updated_item,
        }

    async def deactivate_audit_visit_observation(
        self,
        visit_observation_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_visit_observation(visit_observation_id)

        if not item.is_active:
            return {
                "message": "Audit Visit Observation record is already inactive.",
                "data": item,
            }

        item = await self.repository.deactivate(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Observation record deactivated successfully.",
            "data": item,
        }

    async def restore_audit_visit_observation(
        self,
        visit_observation_id: int,
        updated_by: str,
    ):
        item = await self.get_audit_visit_observation(visit_observation_id)

        if item.is_active:
            return {
                "message": "Audit Visit Observation record is already active.",
                "data": item,
            }

        item = await self.repository.restore(
            item=item,
            updated_by=updated_by,
        )

        return {
            "message": "Audit Visit Observation record restored successfully.",
            "data": item,
        }

    async def permanent_delete_audit_visit_observation(
        self,
        visit_observation_id: int,
    ):
        item = await self.get_audit_visit_observation(visit_observation_id)

        await self.repository.permanent_delete(item)

        return {
            "message": "Audit Visit Observation record permanently deleted successfully.",
            "data": None,
        }
