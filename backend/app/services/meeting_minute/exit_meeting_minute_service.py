from __future__ import annotations

import hashlib
import hmac
import json
from datetime import date, datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.meeting_minute.exit_meeting_minute_repository import (
    ExitMeetingMinuteRepository,
)
from app.repositories.meeting_minute.exit_meeting_workflow_repository import (
    ExitMeetingWorkflowRepository,
)
from app.schemas.meeting_minute.exit_meeting_minute import (
    ExitMeetingMinuteCreate,
    ExitMeetingMinuteUpdate,
)


class ExitMeetingMinuteService:
    TEMPLATE_KEY = "exit_meeting_minutes"
    TEMPLATE_VERSION = "1.0"
    SNAPSHOT_VERSION = 1

    def __init__(self, db: AsyncSession):
        self.repository = ExitMeetingMinuteRepository(db)

    async def list_exit_meeting_minutes(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        is_locked: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        items, total = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            meeting_id=meeting_id,
            is_locked=is_locked,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def get_exit_meeting_minute(
        self,
        minute_id: int,
    ) -> dict[str, Any]:
        item = await self.repository.get_by_id(minute_id)

        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exit Meeting Minutes record not found.",
            )

        return item

    @staticmethod
    def _ensure_unlocked(
        minute: dict[str, Any],
    ) -> None:
        if minute.get("is_locked"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "This Exit Meeting Minutes record is locked "
                    "and cannot be modified, deactivated, restored, "
                    "or deleted. Create a new minute or revision "
                    "for any correction."
                ),
            )

    async def _validate_meeting_and_chairman(
        self,
        meeting_id: int,
        chairman_participant_id: int,
    ) -> dict[str, Any]:
        meeting = await self.repository.get_active_meeting(
            meeting_id
        )

        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected Meeting Master record is invalid "
                    "or inactive."
                ),
            )

        if meeting.get("audit_id") is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected meeting is not linked with an "
                    "Audit Master record."
                ),
            )

        chairman = (
            await self.repository.get_active_participant_for_meeting(
                participant_id=chairman_participant_id,
                meeting_id=meeting_id,
            )
        )

        if not chairman:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Selected chairman must be an active "
                    "participant of the selected meeting."
                ),
            )

        return meeting

    async def create_exit_meeting_minute(
        self,
        payload: ExitMeetingMinuteCreate,
        created_by: str | None,
    ):
        await self._validate_meeting_and_chairman(
            meeting_id=payload.meeting_id,
            chairman_participant_id=(
                payload.chairman_participant_id
            ),
        )

        item = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": (
                "Exit Meeting Minutes record created "
                "successfully."
            ),
            "data": item,
        }

    async def update_exit_meeting_minute(
        self,
        minute_id: int,
        payload: ExitMeetingMinuteUpdate,
        updated_by: str | None,
    ):
        existing = await self.get_exit_meeting_minute(
            minute_id
        )
        self._ensure_unlocked(existing)

        update_data = payload.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )


        workflow_status_value = str(
            existing.get(
                "workflow_status"
            )
            or "draft"
        )

        approved_until_value = (
            existing.get(
                "edit_approved_until"
            )
        )

        if (
            workflow_status_value
            == "unlocked_for_edit"
            and approved_until_value
            is not None
        ):
            if isinstance(
                approved_until_value,
                str,
            ):
                approved_until_value = (
                    datetime.fromisoformat(
                        approved_until_value
                        .replace(
                            "Z",
                            "+00:00",
                        )
                    )
                )

            if (
                approved_until_value.tzinfo
                is None
            ):
                approved_until_value = (
                    approved_until_value
                    .replace(
                        tzinfo=timezone.utc
                    )
                )

            if (
                approved_until_value
                <= datetime.now(
                    timezone.utc
                )
            ):
                raise HTTPException(
                    status_code=(
                        status
                        .HTTP_409_CONFLICT
                    ),
                    detail=(
                        "The approved unlock/edit "
                        "period has expired."
                    ),
                )

        try:
            (
                ExitMeetingWorkflowRepository
                .ensure_minute_edit_allowed(
                    workflow_status=(
                        workflow_status_value
                    ),
                    current_edit_scope=(
                        existing.get(
                            "current_edit_scope"
                        )
                    ),
                    requested_fields=(
                        update_data.keys()
                    ),
                )
            )
        except ValueError as error:
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=str(error),
            ) from error

        meeting_id = update_data.get(
            "meeting_id",
            existing["meeting_id"],
        )
        chairman_participant_id = update_data.get(
            "chairman_participant_id",
            existing["chairman_participant_id"],
        )

        await self._validate_meeting_and_chairman(
            meeting_id=meeting_id,
            chairman_participant_id=(
                chairman_participant_id
            ),
        )

        item = await self.repository.update(
            minute_id=minute_id,
            data=update_data,
            updated_by=updated_by,
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Exit Meeting Minutes record was locked "
                    "or changed by another request."
                ),
            )

        return {
            "message": (
                "Exit Meeting Minutes record updated "
                "successfully."
            ),
            "data": item,
        }

    async def deactivate_exit_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        existing = await self.get_exit_meeting_minute(
            minute_id
        )
        self._ensure_unlocked(existing)

        if not existing.get("is_active"):
            return {
                "message": (
                    "Exit Meeting Minutes record is already "
                    "inactive."
                ),
                "data": existing,
            }

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=False,
            updated_by=updated_by,
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Exit Meeting Minutes record was locked "
                    "or changed by another request."
                ),
            )

        return {
            "message": (
                "Exit Meeting Minutes record deactivated "
                "successfully."
            ),
            "data": item,
        }

    async def restore_exit_meeting_minute(
        self,
        minute_id: int,
        updated_by: str | None,
    ):
        existing = await self.get_exit_meeting_minute(
            minute_id
        )
        self._ensure_unlocked(existing)

        if existing.get("is_active"):
            return {
                "message": (
                    "Exit Meeting Minutes record is already "
                    "active."
                ),
                "data": existing,
            }

        item = await self.repository.update_is_active(
            minute_id=minute_id,
            is_active=True,
            updated_by=updated_by,
        )

        if not item:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Exit Meeting Minutes record was locked "
                    "or changed by another request."
                ),
            )

        return {
            "message": (
                "Exit Meeting Minutes record restored "
                "successfully."
            ),
            "data": item,
        }

    async def permanent_delete_exit_meeting_minute(
        self,
        minute_id: int,
    ):
        existing = await self.get_exit_meeting_minute(
            minute_id
        )
        self._ensure_unlocked(existing)

        deleted = await self.repository.permanent_delete(
            minute_id
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The Exit Meeting Minutes record was locked "
                    "or changed by another request."
                ),
            )

        return {
            "message": (
                "Exit Meeting Minutes record permanently "
                "deleted successfully."
            ),
            "data": None,
        }

    @staticmethod
    def _json_default(value: Any) -> str:
        if isinstance(value, datetime):
            return value.isoformat()

        if isinstance(value, date):
            return value.isoformat()

        raise TypeError(
            f"Object of type {type(value).__name__} "
            "is not JSON serializable."
        )

    def _json_compatible(
        self,
        value: Any,
    ) -> Any:
        serialized = json.dumps(
            value,
            ensure_ascii=False,
            default=self._json_default,
        )

        return json.loads(serialized)

    def _canonical_json(
        self,
        value: Any,
    ) -> str:
        compatible_value = self._json_compatible(value)

        return json.dumps(
            compatible_value,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )

    def _calculate_snapshot_hash(
        self,
        snapshot_data: dict[str, Any],
    ) -> str:
        canonical_json = self._canonical_json(
            snapshot_data
        )

        return hashlib.sha256(
            canonical_json.encode("utf-8")
        ).hexdigest()

    async def _build_live_report(
        self,
        minute: dict[str, Any],
    ) -> dict[str, Any]:
        audit_id = minute.get("audit_id")

        if audit_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The meeting linked with this minute does "
                    "not have an Audit Master record."
                ),
            )

        meeting_id = int(minute["meeting_id"])

        internal_participants = (
            await self.repository.list_report_participants(
                meeting_id=meeting_id,
                source_type="internal_audit_team",
            )
        )

        client_participants = (
            await self.repository.list_report_participants(
                meeting_id=meeting_id,
                source_type="client_entity_team",
            )
        )

        visit_dates = (
            await self.repository.list_report_visit_dates(
                audit_id=int(audit_id),
            )
        )

        findings = (
            await self.repository.list_report_findings(
                audit_id=int(audit_id),
            )
        )

        return {
            "minute": minute,
            "internal_participants": internal_participants,
            "client_participants": client_participants,
            "visit_dates": visit_dates,
            "findings": findings,
        }

    async def get_report(
        self,
        minute_id: int,
    ) -> dict[str, Any]:
        minute = await self.get_exit_meeting_minute(
            minute_id
        )

        if not minute.get("is_locked"):
            return await self._build_live_report(minute)

        snapshot_data = minute.get("snapshot_data")

        if not isinstance(snapshot_data, dict):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Locked Exit Meeting Minutes snapshot is "
                    "missing or invalid."
                ),
            )

        stored_hash = minute.get("snapshot_hash")

        if not stored_hash:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Locked Exit Meeting Minutes snapshot hash "
                    "is missing."
                ),
            )

        calculated_hash = self._calculate_snapshot_hash(
            snapshot_data
        )

        if not hmac.compare_digest(
            stored_hash,
            calculated_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Exit Meeting Minutes snapshot integrity "
                    "verification failed."
                ),
            )

        return snapshot_data


    async def lock_exit_meeting_minute(
        self,
        minute_id: int,
        locked_by_user_id: str | None,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Direct locking is disabled. "
                "Submit the minute for checker "
                "approval through the Maker-Checker "
                "workflow."
            ),
        )
