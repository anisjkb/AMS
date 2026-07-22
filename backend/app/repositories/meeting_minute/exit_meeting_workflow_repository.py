from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable

from sqlalchemy import (
    String,
    cast,
    func,
    or_,
    select,
    update,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_minute.exit_meeting_minute import (
    ExitMeetingMinute,
)
from app.models.meeting_minute.exit_meeting_minute_snapshot import (
    ExitMeetingMinuteSnapshot,
)
from app.models.meeting_minute.exit_meeting_minute_unlock_request import (
    ExitMeetingMinuteUnlockRequest,
)
from app.models.meeting_minute.exit_meeting_minute_workflow_event import (
    ExitMeetingMinuteWorkflowEvent,
)


class ExitMeetingWorkflowRepository:
    LOCK_REVIEW_STATUSES = (
        "pending_lock_approval",
        "pending_relock_approval",
    )

    OPEN_UNLOCK_REQUEST_STATUSES = (
        "pending",
        "approved",
    )

    DIRECTLY_EDITABLE_STATUSES = (
        "draft",
        "changes_requested",
    )

    EDITABLE_WORKFLOW_STATUSES = (
        "draft",
        "changes_requested",
        "unlocked_for_edit",
    )

    MINUTE_UPDATE_FIELDS = {
        "meeting_id",
        "chairman_participant_id",
        "status",
    }

    EDIT_SCOPE_MINUTE_FIELDS = {
        "minute_information": {
            "meeting_id",
            "status",
        },
        "chairman": {
            "chairman_participant_id",
        },
        "participants": set(),
        "visit_dates": set(),
        "findings": set(),
        "management_response": set(),
        "full_report": {
            "meeting_id",
            "chairman_participant_id",
            "status",
        },
    }

    WORKFLOW_MUTABLE_FIELDS = {
        "workflow_status",
        "workflow_version",
        "unlock_cycle_number",
        "submitted_by_user_id",
        "submitted_at",
        "reviewed_by_user_id",
        "reviewed_at",
        "review_note",
        "current_edit_scope",
        "edit_approved_until",
        "last_workflow_by_user_id",
        "last_workflow_at",
        "current_snapshot_id",
        "current_unlock_request_id",
        "is_locked",
        "locked_at",
        "locked_by_user_id",
        "template_key",
        "template_version",
        "snapshot_version",
        "snapshot_data",
        "snapshot_hash",
        "updated_by",
        "updated_at",
    }

    UNLOCK_MUTABLE_FIELDS = {
        "request_status",
        "reviewed_by_user_id",
        "reviewed_at",
        "review_comment",
        "approved_until",
        "completed_at",
        "cancelled_at",
        "is_active",
        "updated_by",
        "updated_at",
    }

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

    @staticmethod
    def utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def ensure_different_actors(
        maker_user_id: str | None,
        checker_user_id: str | None,
    ) -> None:
        if (
            maker_user_id
            and checker_user_id
            and maker_user_id == checker_user_id
        ):
            raise ValueError(
                "The maker cannot approve their "
                "own workflow request."
            )

    @classmethod
    def normalize_edit_scope(
        cls,
        edit_scope: Iterable[str],
    ) -> list[str]:
        normalized = [
            str(item).strip()
            for item in edit_scope
            if str(item).strip()
        ]

        unique_scope = list(
            dict.fromkeys(normalized)
        )

        if "full_report" in unique_scope:
            return ["full_report"]

        return unique_scope

    @classmethod
    def allowed_minute_update_fields(
        cls,
        workflow_status: str,
        current_edit_scope: (
            list[str] | None
        ),
    ) -> set[str]:
        if workflow_status in (
            cls.DIRECTLY_EDITABLE_STATUSES
        ):
            return set(
                cls.MINUTE_UPDATE_FIELDS
            )

        if workflow_status != "unlocked_for_edit":
            return set()

        normalized_scope = (
            cls.normalize_edit_scope(
                current_edit_scope or []
            )
        )

        if "full_report" in normalized_scope:
            return set(
                cls.MINUTE_UPDATE_FIELDS
            )

        allowed_fields: set[str] = set()

        for scope_name in normalized_scope:
            allowed_fields.update(
                cls.EDIT_SCOPE_MINUTE_FIELDS.get(
                    scope_name,
                    set(),
                )
            )

        return allowed_fields

    @classmethod
    def forbidden_minute_update_fields(
        cls,
        workflow_status: str,
        current_edit_scope: (
            list[str] | None
        ),
        requested_fields: Iterable[str],
    ) -> set[str]:
        requested = {
            str(field_name)
            for field_name in requested_fields
        }

        allowed = (
            cls.allowed_minute_update_fields(
                workflow_status,
                current_edit_scope,
            )
        )

        return requested - allowed

    @classmethod
    def ensure_minute_edit_allowed(
        cls,
        workflow_status: str,
        current_edit_scope: (
            list[str] | None
        ),
        requested_fields: Iterable[str],
    ) -> None:
        forbidden = (
            cls.forbidden_minute_update_fields(
                workflow_status,
                current_edit_scope,
                requested_fields,
            )
        )

        if forbidden:
            raise ValueError(
                "The current workflow state or "
                "approved edit scope does not allow "
                "these fields: "
                + ", ".join(sorted(forbidden))
            )

    async def get_minute(
        self,
        minute_id: int,
    ) -> ExitMeetingMinute | None:
        result = await self.db.execute(
            select(ExitMeetingMinute).where(
                ExitMeetingMinute.minute_id
                == minute_id
            )
        )

        return result.scalar_one_or_none()

    async def get_minute_for_update(
        self,
        minute_id: int,
    ) -> ExitMeetingMinute | None:
        result = await self.db.execute(
            select(ExitMeetingMinute)
            .where(
                ExitMeetingMinute.minute_id
                == minute_id
            )
            .with_for_update()
        )

        return result.scalar_one_or_none()

    async def list_lock_review_queue(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        workflow_status: str | None = None,
    ) -> tuple[
        list[ExitMeetingMinute],
        int,
    ]:
        page = max(page, 1)
        page_size = max(
            min(page_size, 100),
            1,
        )
        offset = (page - 1) * page_size

        filters = [
            ExitMeetingMinute.is_active.is_(
                True
            )
        ]

        if workflow_status:
            filters.append(
                ExitMeetingMinute.workflow_status
                == workflow_status
            )
        else:
            filters.append(
                ExitMeetingMinute.workflow_status.in_(
                    self.LOCK_REVIEW_STATUSES
                )
            )

        if search:
            search_term = (
                f"%{search.strip()}%"
            )

            filters.append(
                or_(
                    cast(
                        ExitMeetingMinute.minute_id,
                        String,
                    ).ilike(search_term),
                    cast(
                        ExitMeetingMinute.meeting_id,
                        String,
                    ).ilike(search_term),
                    ExitMeetingMinute.status.ilike(
                        search_term
                    ),
                    ExitMeetingMinute.workflow_status
                    .ilike(search_term),
                    ExitMeetingMinute
                    .submitted_by_user_id
                    .ilike(search_term),
                )
            )

        count_stmt = (
            select(func.count())
            .select_from(ExitMeetingMinute)
            .where(*filters)
        )

        total = int(
            await self.db.scalar(count_stmt)
            or 0
        )

        data_stmt = (
            select(ExitMeetingMinute)
            .where(*filters)
            .order_by(
                ExitMeetingMinute.submitted_at
                .asc()
                .nulls_last(),
                ExitMeetingMinute.minute_id
                .asc(),
            )
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(
            data_stmt
        )

        return (
            list(result.scalars().all()),
            total,
        )

    async def list_unlock_review_queue(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        request_status: str = "pending",
    ) -> tuple[
        list[dict[str, Any]],
        int,
    ]:
        page = max(page, 1)
        page_size = max(
            min(page_size, 100),
            1,
        )
        offset = (page - 1) * page_size

        filters = [
            (
                ExitMeetingMinuteUnlockRequest
                .request_status
                == request_status
            ),
            (
                ExitMeetingMinuteUnlockRequest
                .is_active
                .is_(True)
            ),
        ]

        if search:
            search_term = (
                f"%{search.strip()}%"
            )

            filters.append(
                or_(
                    cast(
                        ExitMeetingMinuteUnlockRequest
                        .request_id,
                        String,
                    ).ilike(search_term),
                    cast(
                        ExitMeetingMinuteUnlockRequest
                        .minute_id,
                        String,
                    ).ilike(search_term),
                    ExitMeetingMinuteUnlockRequest
                    .request_reason
                    .ilike(search_term),
                    ExitMeetingMinuteUnlockRequest
                    .requested_by_user_id
                    .ilike(search_term),
                    ExitMeetingMinute.workflow_status
                    .ilike(search_term),
                )
            )

        count_stmt = (
            select(func.count())
            .select_from(
                ExitMeetingMinuteUnlockRequest
            )
            .join(
                ExitMeetingMinute,
                ExitMeetingMinute.minute_id
                == (
                    ExitMeetingMinuteUnlockRequest
                    .minute_id
                ),
            )
            .where(*filters)
        )

        total = int(
            await self.db.scalar(count_stmt)
            or 0
        )

        data_stmt = (
            select(
                ExitMeetingMinuteUnlockRequest,
                ExitMeetingMinute,
            )
            .join(
                ExitMeetingMinute,
                ExitMeetingMinute.minute_id
                == (
                    ExitMeetingMinuteUnlockRequest
                    .minute_id
                ),
            )
            .where(*filters)
            .order_by(
                ExitMeetingMinuteUnlockRequest
                .requested_at
                .asc(),
                ExitMeetingMinuteUnlockRequest
                .request_id
                .asc(),
            )
            .offset(offset)
            .limit(page_size)
        )

        result = await self.db.execute(
            data_stmt
        )

        items = [
            {
                "request": row[0],
                "minute": row[1],
            }
            for row in result.all()
        ]

        return items, total

    async def get_unlock_request(
        self,
        request_id: int,
    ) -> (
        ExitMeetingMinuteUnlockRequest
        | None
    ):
        result = await self.db.execute(
            select(
                ExitMeetingMinuteUnlockRequest
            ).where(
                ExitMeetingMinuteUnlockRequest
                .request_id
                == request_id
            )
        )

        return result.scalar_one_or_none()

    async def get_unlock_request_for_update(
        self,
        request_id: int,
    ) -> (
        ExitMeetingMinuteUnlockRequest
        | None
    ):
        result = await self.db.execute(
            select(
                ExitMeetingMinuteUnlockRequest
            )
            .where(
                ExitMeetingMinuteUnlockRequest
                .request_id
                == request_id
            )
            .with_for_update()
        )

        return result.scalar_one_or_none()

    async def get_open_unlock_request(
        self,
        minute_id: int,
    ) -> (
        ExitMeetingMinuteUnlockRequest
        | None
    ):
        result = await self.db.execute(
            select(
                ExitMeetingMinuteUnlockRequest
            )
            .where(
                ExitMeetingMinuteUnlockRequest
                .minute_id
                == minute_id,
                ExitMeetingMinuteUnlockRequest
                .request_status
                .in_(
                    self.OPEN_UNLOCK_REQUEST_STATUSES
                ),
                ExitMeetingMinuteUnlockRequest
                .is_active
                .is_(True),
            )
            .order_by(
                ExitMeetingMinuteUnlockRequest
                .request_id
                .desc()
            )
            .limit(1)
        )

        return result.scalar_one_or_none()

    async def create_unlock_request(
        self,
        minute_id: int,
        request_reason: str,
        edit_scope: list[str],
        requested_by_user_id: str,
    ) -> (
        ExitMeetingMinuteUnlockRequest
    ):
        existing_request = (
            await self.get_open_unlock_request(
                minute_id
            )
        )

        if existing_request:
            raise ValueError(
                "An open unlock request already "
                "exists for this minute."
            )

        request = (
            ExitMeetingMinuteUnlockRequest(
                minute_id=minute_id,
                request_status="pending",
                request_reason=(
                    request_reason.strip()
                ),
                edit_scope=(
                    self.normalize_edit_scope(
                        edit_scope
                    )
                ),
                requested_by_user_id=(
                    requested_by_user_id
                ),
                requested_at=self.utc_now(),
                is_active=True,
                created_by=(
                    requested_by_user_id
                ),
                updated_by=(
                    requested_by_user_id
                ),
            )
        )

        self.db.add(request)
        await self.db.flush()

        return request

    async def update_unlock_request(
        self,
        request: (
            ExitMeetingMinuteUnlockRequest
        ),
        values: dict[str, Any],
    ) -> (
        ExitMeetingMinuteUnlockRequest
    ):
        safe_values = {
            key: value
            for key, value in values.items()
            if key in self.UNLOCK_MUTABLE_FIELDS
        }

        for key, value in safe_values.items():
            setattr(request, key, value)

        await self.db.flush()
        return request

    async def update_minute_workflow(
        self,
        minute: ExitMeetingMinute,
        values: dict[str, Any],
        increment_version: bool = True,
    ) -> ExitMeetingMinute:
        safe_values = {
            key: value
            for key, value in values.items()
            if key in self.WORKFLOW_MUTABLE_FIELDS
        }

        for key, value in safe_values.items():
            if (
                key == "updated_at"
                and isinstance(value, datetime)
                and value.tzinfo is not None
            ):
                value = (
                    value.astimezone(timezone.utc)
                    .replace(tzinfo=None)
                )

            setattr(minute, key, value)

        if increment_version:
            minute.workflow_version = (
                int(
                    minute.workflow_version
                    or 0
                )
                + 1
            )

        await self.db.flush()
        return minute

    async def get_snapshot(
        self,
        snapshot_id: int,
    ) -> (
        ExitMeetingMinuteSnapshot
        | None
    ):
        result = await self.db.execute(
            select(
                ExitMeetingMinuteSnapshot
            ).where(
                ExitMeetingMinuteSnapshot
                .snapshot_id
                == snapshot_id
            )
        )

        return result.scalar_one_or_none()

    async def get_current_snapshot(
        self,
        minute_id: int,
    ) -> (
        ExitMeetingMinuteSnapshot
        | None
    ):
        result = await self.db.execute(
            select(
                ExitMeetingMinuteSnapshot
            ).where(
                ExitMeetingMinuteSnapshot
                .minute_id
                == minute_id,
                ExitMeetingMinuteSnapshot
                .is_current
                .is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def list_snapshots(
        self,
        minute_id: int,
    ) -> list[
        ExitMeetingMinuteSnapshot
    ]:
        result = await self.db.execute(
            select(
                ExitMeetingMinuteSnapshot
            )
            .where(
                ExitMeetingMinuteSnapshot
                .minute_id
                == minute_id
            )
            .order_by(
                ExitMeetingMinuteSnapshot
                .snapshot_version
                .desc(),
                ExitMeetingMinuteSnapshot
                .snapshot_id
                .desc(),
            )
        )

        return list(
            result.scalars().all()
        )

    async def next_snapshot_version(
        self,
        minute_id: int,
    ) -> int:
        result = await self.db.scalar(
            select(
                func.max(
                    ExitMeetingMinuteSnapshot
                    .snapshot_version
                )
            ).where(
                ExitMeetingMinuteSnapshot
                .minute_id
                == minute_id
            )
        )

        return int(result or 0) + 1

    async def create_current_snapshot(
        self,
        minute: ExitMeetingMinute,
        snapshot_data: dict[str, Any],
        snapshot_hash: str,
        snapshot_kind: str,
        template_key: str,
        template_version: str,
        locked_by_user_id: str,
        approved_by_user_id: str,
        lock_reason: str | None = None,
        source_unlock_request_id: (
            int | None
        ) = None,
        locked_at: datetime | None = None,
    ) -> ExitMeetingMinuteSnapshot:
        locked_at = (
            locked_at or self.utc_now()
        )

        snapshot_version = (
            await self.next_snapshot_version(
                minute.minute_id
            )
        )

        await self.db.execute(
            update(
                ExitMeetingMinuteSnapshot
            )
            .where(
                ExitMeetingMinuteSnapshot
                .minute_id
                == minute.minute_id,
                ExitMeetingMinuteSnapshot
                .is_current
                .is_(True),
            )
            .values(is_current=False)
        )

        snapshot = ExitMeetingMinuteSnapshot(
            minute_id=minute.minute_id,
            snapshot_version=(
                snapshot_version
            ),
            snapshot_kind=snapshot_kind,
            snapshot_data=snapshot_data,
            snapshot_hash=snapshot_hash,
            template_key=template_key,
            template_version=(
                template_version
            ),
            source_unlock_request_id=(
                source_unlock_request_id
            ),
            locked_by_user_id=(
                locked_by_user_id
            ),
            approved_by_user_id=(
                approved_by_user_id
            ),
            locked_at=locked_at,
            lock_reason=lock_reason,
            is_current=True,
            created_by=(
                approved_by_user_id
            ),
            created_at=locked_at,
        )

        self.db.add(snapshot)
        await self.db.flush()

        # Keep current snapshot fields on the main
        # record for backward-compatible report reads.
        minute.current_snapshot_id = (
            snapshot.snapshot_id
        )
        minute.snapshot_version = (
            snapshot_version
        )
        minute.snapshot_data = snapshot_data
        minute.snapshot_hash = snapshot_hash

        minute.template_key = template_key
        minute.template_version = (
            template_version
        )

        minute.is_locked = True
        minute.locked_at = locked_at
        minute.locked_by_user_id = (
            locked_by_user_id
        )

        minute.workflow_status = "locked"
        minute.reviewed_by_user_id = (
            approved_by_user_id
        )
        minute.reviewed_at = locked_at
        minute.review_note = lock_reason

        minute.current_edit_scope = None
        minute.edit_approved_until = None

        minute.last_workflow_by_user_id = (
            approved_by_user_id
        )
        minute.last_workflow_at = locked_at

        minute.updated_by = (
            approved_by_user_id
        )
        minute.updated_at = locked_at

        minute.workflow_version = (
            int(
                minute.workflow_version or 0
            )
            + 1
        )

        await self.db.flush()
        return snapshot

    async def append_event(
        self,
        minute_id: int,
        event_type: str,
        to_status: str,
        performed_by_user_id: str | None,
        from_status: str | None = None,
        event_comment: str | None = None,
        event_payload: (
            dict[str, Any] | None
        ) = None,
        unlock_request_id: int | None = None,
        snapshot_id: int | None = None,
        performed_at: datetime | None = None,
    ) -> ExitMeetingMinuteWorkflowEvent:
        event_time = (
            performed_at or self.utc_now()
        )

        event = (
            ExitMeetingMinuteWorkflowEvent(
                minute_id=minute_id,
                unlock_request_id=(
                    unlock_request_id
                ),
                snapshot_id=snapshot_id,
                event_type=event_type,
                from_status=from_status,
                to_status=to_status,
                event_comment=event_comment,
                event_payload=event_payload,
                performed_by_user_id=(
                    performed_by_user_id
                ),
                performed_at=event_time,
                created_at=event_time,
            )
        )

        self.db.add(event)
        await self.db.flush()

        return event

    async def list_events(
        self,
        minute_id: int,
        limit: int = 100,
    ) -> list[
        ExitMeetingMinuteWorkflowEvent
    ]:
        safe_limit = max(
            min(limit, 500),
            1,
        )

        result = await self.db.execute(
            select(
                ExitMeetingMinuteWorkflowEvent
            )
            .where(
                ExitMeetingMinuteWorkflowEvent
                .minute_id
                == minute_id
            )
            .order_by(
                ExitMeetingMinuteWorkflowEvent
                .performed_at
                .desc(),
                ExitMeetingMinuteWorkflowEvent
                .event_id
                .desc(),
            )
            .limit(safe_limit)
        )

        return list(
            result.scalars().all()
        )

    async def count_pending_lock_reviews(
        self,
    ) -> int:
        result = await self.db.scalar(
            select(func.count())
            .select_from(ExitMeetingMinute)
            .where(
                ExitMeetingMinute.workflow_status
                .in_(
                    self.LOCK_REVIEW_STATUSES
                ),
                ExitMeetingMinute.is_active
                .is_(True),
            )
        )

        return int(result or 0)

    async def count_pending_unlock_reviews(
        self,
    ) -> int:
        result = await self.db.scalar(
            select(func.count())
            .select_from(
                ExitMeetingMinuteUnlockRequest
            )
            .where(
                ExitMeetingMinuteUnlockRequest
                .request_status
                == "pending",
                ExitMeetingMinuteUnlockRequest
                .is_active
                .is_(True),
            )
        )

        return int(result or 0)

    async def flush(self) -> None:
        await self.db.flush()

    async def commit(self) -> None:
        await self.db.commit()

    async def rollback(self) -> None:
        await self.db.rollback()

    async def refresh(
        self,
        instance: Any,
    ) -> None:
        await self.db.refresh(instance)
