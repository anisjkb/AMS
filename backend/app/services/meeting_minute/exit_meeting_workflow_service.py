from __future__ import annotations

import hmac
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
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
from app.repositories.meeting_minute.exit_meeting_workflow_repository import (
    ExitMeetingWorkflowRepository,
)
from app.schemas.meeting_minute.exit_meeting_workflow import (
    ExitMeetingLockReviewRequest,
    ExitMeetingSubmitForLockRequest,
    ExitMeetingSubmitForRelockRequest,
    ExitMeetingUnlockRequestCreate,
    ExitMeetingUnlockReviewRequest,
)
from app.services.meeting_minute.exit_meeting_minute_service import (
    ExitMeetingMinuteService,
)


class ExitMeetingWorkflowService:
    INITIAL_SUBMISSION_STATES = {
        "draft",
        "changes_requested",
    }

    LOCK_REVIEW_STATES = {
        "pending_lock_approval",
        "pending_relock_approval",
    }

    def __init__(
        self,
        db: AsyncSession,
    ):
        self.db = db

        self.repository = (
            ExitMeetingWorkflowRepository(db)
        )

        self.minute_service = (
            ExitMeetingMinuteService(db)
        )

    @staticmethod
    def _actor_id(
        value: Any,
    ) -> str:
        actor_id = str(
            value or ""
        ).strip()

        if not actor_id:
            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "A valid workflow user ID "
                    "is required."
                ),
            )

        return actor_id

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(
            timezone.utc
        )

    @staticmethod
    def _as_utc(
        value: datetime,
    ) -> datetime:
        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc
            )

        return value.astimezone(
            timezone.utc
        )

    @staticmethod
    def _not_found(
        detail: str,
    ) -> HTTPException:
        return HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=detail,
        )

    @staticmethod
    def _conflict(
        detail: str,
    ) -> HTTPException:
        return HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=detail,
        )

    @staticmethod
    def _bad_request(
        detail: str,
    ) -> HTTPException:
        return HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=detail,
        )

    @staticmethod
    def _ensure_active(
        minute: ExitMeetingMinute,
    ) -> None:
        if not minute.is_active:
            raise ExitMeetingWorkflowService._conflict(
                "Inactive Exit Meeting Minutes "
                "cannot enter an approval workflow."
            )

    @staticmethod
    def _ensure_different_actors(
        maker_user_id: str | None,
        checker_user_id: str,
    ) -> None:
        try:
            (
                ExitMeetingWorkflowRepository
                .ensure_different_actors(
                    maker_user_id,
                    checker_user_id,
                )
            )
        except ValueError as error:
            raise (
                ExitMeetingWorkflowService
                ._conflict(str(error))
            ) from error

    def _ensure_edit_window_active(
        self,
        minute: ExitMeetingMinute,
    ) -> None:
        approved_until = (
            minute.edit_approved_until
        )

        if approved_until is None:
            return

        approved_until = self._as_utc(
            approved_until
        )

        if approved_until <= self._utc_now():
            raise self._conflict(
                "The approved unlock/edit period "
                "has expired. A new unlock request "
                "is required."
            )

    async def _get_minute_for_update(
        self,
        minute_id: int,
    ) -> ExitMeetingMinute:
        minute = (
            await self.repository
            .get_minute_for_update(
                minute_id
            )
        )

        if minute is None:
            raise self._not_found(
                "Exit Meeting Minutes record "
                "not found."
            )

        return minute

    async def _get_unlock_request(
        self,
        request_id: int,
    ) -> ExitMeetingMinuteUnlockRequest:
        unlock_request = (
            await self.repository
            .get_unlock_request(
                request_id
            )
        )

        if unlock_request is None:
            raise self._not_found(
                "Exit Meeting unlock request "
                "not found."
            )

        return unlock_request

    async def _get_unlock_request_for_update(
        self,
        request_id: int,
    ) -> ExitMeetingMinuteUnlockRequest:
        unlock_request = (
            await self.repository
            .get_unlock_request_for_update(
                request_id
            )
        )

        if unlock_request is None:
            raise self._not_found(
                "Exit Meeting unlock request "
                "not found."
            )

        return unlock_request

    async def _minute_response(
        self,
        minute_id: int,
    ) -> dict[str, Any]:
        return await (
            self.minute_service
            .get_exit_meeting_minute(
                minute_id
            )
        )

    async def _build_snapshot_payload(
        self,
        minute: ExitMeetingMinute,
        approved_by_user_id: str,
        lock_reason: str | None,
        snapshot_kind: str,
    ) -> tuple[
        dict[str, Any],
        str,
        int,
        datetime,
    ]:
        locked_at = self._utc_now()

        minute_data = (
            await self.minute_service
            .get_exit_meeting_minute(
                minute.minute_id
            )
        )

        live_report = (
            await self.minute_service
            ._build_live_report(
                minute_data
            )
        )

        snapshot_data = (
            self.minute_service
            ._json_compatible(
                live_report
            )
        )

        next_snapshot_version = (
            await self.repository
            .next_snapshot_version(
                minute.minute_id
            )
        )

        snapshot_minute = dict(
            snapshot_data["minute"]
        )

        snapshot_minute.update(
            {
                "is_locked": True,
                "locked_at": (
                    locked_at.isoformat()
                ),
                "locked_by_user_id": (
                    approved_by_user_id
                ),
                "template_key": (
                    self.minute_service
                    .TEMPLATE_KEY
                ),
                "template_version": (
                    self.minute_service
                    .TEMPLATE_VERSION
                ),
                "snapshot_version": (
                    next_snapshot_version
                ),
                "snapshot_data": None,
                "snapshot_hash": None,
                "workflow_status": "locked",
                "workflow_version": (
                    int(
                        minute.workflow_version
                        or 0
                    )
                    + 1
                ),
                "reviewed_by_user_id": (
                    approved_by_user_id
                ),
                "reviewed_at": (
                    locked_at.isoformat()
                ),
                "review_note": (
                    lock_reason
                ),
                "current_edit_scope": None,
                "edit_approved_until": None,
                "current_snapshot_id": None,
                "current_unlock_request_id": None,
                "last_workflow_by_user_id": (
                    approved_by_user_id
                ),
                "last_workflow_at": (
                    locked_at.isoformat()
                ),
                "updated_by": (
                    approved_by_user_id
                ),
                "updated_at": (
                    locked_at.isoformat()
                ),
                "snapshot_kind": (
                    snapshot_kind
                ),
            }
        )

        snapshot_data["minute"] = (
            snapshot_minute
        )

        snapshot_hash = (
            self.minute_service
            ._calculate_snapshot_hash(
                snapshot_data
            )
        )

        return (
            snapshot_data,
            snapshot_hash,
            next_snapshot_version,
            locked_at,
        )

    async def submit_for_lock(
        self,
        minute_id: int,
        payload: (
            ExitMeetingSubmitForLockRequest
        ),
        submitted_by_user_id: Any,
    ) -> dict[str, Any]:
        actor_id = self._actor_id(
            submitted_by_user_id
        )

        try:
            minute = (
                await self._get_minute_for_update(
                    minute_id
                )
            )

            self._ensure_active(minute)

            if minute.is_locked:
                raise self._conflict(
                    "The minute is already locked."
                )

            if (
                minute.workflow_status
                not in self.INITIAL_SUBMISSION_STATES
            ):
                raise self._conflict(
                    "Only Draft or Changes Requested "
                    "minutes can be submitted for "
                    "initial lock approval."
                )

            now = self._utc_now()
            from_status = (
                minute.workflow_status
            )

            await (
                self.repository
                .update_minute_workflow(
                    minute,
                    {
                        "workflow_status": (
                            "pending_lock_approval"
                        ),
                        "submitted_by_user_id": (
                            actor_id
                        ),
                        "submitted_at": now,
                        "reviewed_by_user_id": None,
                        "reviewed_at": None,
                        "review_note": None,
                        "last_workflow_by_user_id": (
                            actor_id
                        ),
                        "last_workflow_at": now,
                        "updated_by": actor_id,
                        "updated_at": now,
                    },
                )
            )

            await self.repository.append_event(
                minute_id=minute.minute_id,
                event_type=(
                    "lock_submitted"
                ),
                from_status=from_status,
                to_status=(
                    "pending_lock_approval"
                ),
                event_comment=(
                    payload.submission_comment
                ),
                event_payload={
                    "submission_type": (
                        "initial_lock"
                    ),
                },
                performed_by_user_id=(
                    actor_id
                ),
                performed_at=now,
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "The lock submission could not "
                "be saved because the workflow "
                "changed concurrently."
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Exit Meeting Minutes submitted "
                "for checker lock approval."
            ),
            "data": await self._minute_response(
                minute_id
            ),
        }

    async def review_lock_submission(
        self,
        minute_id: int,
        payload: (
            ExitMeetingLockReviewRequest
        ),
        reviewed_by_user_id: Any,
    ) -> dict[str, Any]:
        checker_id = self._actor_id(
            reviewed_by_user_id
        )

        try:
            minute = (
                await self._get_minute_for_update(
                    minute_id
                )
            )

            self._ensure_active(minute)

            if (
                minute.workflow_status
                not in self.LOCK_REVIEW_STATES
            ):
                raise self._conflict(
                    "This minute is not pending "
                    "lock or relock approval."
                )

            self._ensure_different_actors(
                minute.submitted_by_user_id,
                checker_id,
            )

            now = self._utc_now()
            from_status = (
                minute.workflow_status
            )

            is_relock = (
                from_status
                == "pending_relock_approval"
            )

            unlock_request = None

            if is_relock:
                if (
                    minute
                    .current_unlock_request_id
                    is None
                ):
                    raise self._conflict(
                        "The relock submission does "
                        "not have an approved unlock "
                        "request."
                    )

                unlock_request = (
                    await self
                    ._get_unlock_request_for_update(
                        minute
                        .current_unlock_request_id
                    )
                )

                if (
                    unlock_request
                    .request_status
                    != "approved"
                ):
                    raise self._conflict(
                        "The related unlock request "
                        "is not approved."
                    )

            if (
                payload.decision
                == "request_changes"
            ):
                target_status = (
                    "unlocked_for_edit"
                    if is_relock
                    else "changes_requested"
                )

                await (
                    self.repository
                    .update_minute_workflow(
                        minute,
                        {
                            "workflow_status": (
                                target_status
                            ),
                            "reviewed_by_user_id": (
                                checker_id
                            ),
                            "reviewed_at": now,
                            "review_note": (
                                payload
                                .review_comment
                            ),
                            "last_workflow_by_user_id": (
                                checker_id
                            ),
                            "last_workflow_at": now,
                            "updated_by": checker_id,
                            "updated_at": now,
                        },
                    )
                )

                await self.repository.append_event(
                    minute_id=minute.minute_id,
                    unlock_request_id=(
                        unlock_request.request_id
                        if unlock_request
                        else None
                    ),
                    event_type=(
                        "relock_changes_requested"
                        if is_relock
                        else (
                            "lock_changes_requested"
                        )
                    ),
                    from_status=from_status,
                    to_status=target_status,
                    event_comment=(
                        payload.review_comment
                    ),
                    performed_by_user_id=(
                        checker_id
                    ),
                    performed_at=now,
                )

                await self.repository.commit()

                return {
                    "message": (
                        "Changes requested by the "
                        "checker."
                    ),
                    "data": (
                        await self
                        ._minute_response(
                            minute_id
                        )
                    ),
                }

            snapshot_kind = (
                "relock"
                if is_relock
                else "initial_lock"
            )

            (
                snapshot_data,
                snapshot_hash,
                expected_version,
                locked_at,
            ) = await self._build_snapshot_payload(
                minute=minute,
                approved_by_user_id=(
                    checker_id
                ),
                lock_reason=(
                    payload.review_comment
                ),
                snapshot_kind=(
                    snapshot_kind
                ),
            )

            if unlock_request is not None:
                await (
                    self.repository
                    .update_unlock_request(
                        unlock_request,
                        {
                            "request_status": (
                                "completed"
                            ),
                            "completed_at": (
                                locked_at
                            ),
                            "is_active": False,
                            "updated_by": (
                                checker_id
                            ),
                            "updated_at": (
                                locked_at
                            ),
                        },
                    )
                )

            snapshot = await (
                self.repository
                .create_current_snapshot(
                    minute=minute,
                    snapshot_data=(
                        snapshot_data
                    ),
                    snapshot_hash=(
                        snapshot_hash
                    ),
                    snapshot_kind=(
                        snapshot_kind
                    ),
                    template_key=(
                        self.minute_service
                        .TEMPLATE_KEY
                    ),
                    template_version=(
                        self.minute_service
                        .TEMPLATE_VERSION
                    ),
                    locked_by_user_id=(
                        checker_id
                    ),
                    approved_by_user_id=(
                        checker_id
                    ),
                    lock_reason=(
                        payload.review_comment
                    ),
                    source_unlock_request_id=(
                        unlock_request.request_id
                        if unlock_request
                        else None
                    ),
                    locked_at=locked_at,
                )
            )

            if (
                snapshot.snapshot_version
                != expected_version
            ):
                raise self._conflict(
                    "Snapshot version changed "
                    "during approval."
                )

            minute.current_unlock_request_id = (
                None
            )

            await self.repository.flush()

            await self.repository.append_event(
                minute_id=minute.minute_id,
                unlock_request_id=(
                    unlock_request.request_id
                    if unlock_request
                    else None
                ),
                snapshot_id=(
                    snapshot.snapshot_id
                ),
                event_type=(
                    "relock_approved"
                    if is_relock
                    else "lock_approved"
                ),
                from_status=from_status,
                to_status="locked",
                event_comment=(
                    payload.review_comment
                ),
                event_payload={
                    "snapshot_kind": (
                        snapshot_kind
                    ),
                    "snapshot_version": (
                        snapshot
                        .snapshot_version
                    ),
                    "snapshot_hash": (
                        snapshot.snapshot_hash
                    ),
                },
                performed_by_user_id=(
                    checker_id
                ),
                performed_at=locked_at,
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "Approval could not be completed "
                "because another workflow action "
                "was processed concurrently."
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Exit Meeting Minutes approved "
                "and locked successfully."
                if not is_relock
                else (
                    "Exit Meeting Minutes approved "
                    "and relocked successfully."
                )
            ),
            "data": await self._minute_response(
                minute_id
            ),
        }

    async def request_unlock(
        self,
        minute_id: int,
        payload: ExitMeetingUnlockRequestCreate,
        requested_by_user_id: Any,
    ) -> dict[str, Any]:
        requester_id = self._actor_id(
            requested_by_user_id
        )

        try:
            minute = (
                await self._get_minute_for_update(
                    minute_id
                )
            )

            self._ensure_active(minute)

            if (
                not minute.is_locked
                or minute.workflow_status
                != "locked"
            ):
                raise self._conflict(
                    "Only an approved locked minute "
                    "can be submitted for unlock."
                )

            unlock_request = await (
                self.repository
                .create_unlock_request(
                    minute_id=minute.minute_id,
                    request_reason=(
                        payload.request_reason
                    ),
                    edit_scope=list(
                        payload.edit_scope
                    ),
                    requested_by_user_id=(
                        requester_id
                    ),
                )
            )

            now = self._utc_now()

            await (
                self.repository
                .update_minute_workflow(
                    minute,
                    {
                        "workflow_status": (
                            "pending_unlock_approval"
                        ),
                        "current_unlock_request_id": (
                            unlock_request
                            .request_id
                        ),
                        "last_workflow_by_user_id": (
                            requester_id
                        ),
                        "last_workflow_at": now,
                        "reviewed_by_user_id": None,
                        "reviewed_at": None,
                        "review_note": None,
                        "updated_by": (
                            requester_id
                        ),
                        "updated_at": now,
                    },
                )
            )

            await self.repository.append_event(
                minute_id=minute.minute_id,
                unlock_request_id=(
                    unlock_request.request_id
                ),
                event_type=(
                    "unlock_requested"
                ),
                from_status="locked",
                to_status=(
                    "pending_unlock_approval"
                ),
                event_comment=(
                    payload.request_reason
                ),
                event_payload={
                    "edit_scope": list(
                        unlock_request.edit_scope
                    ),
                },
                performed_by_user_id=(
                    requester_id
                ),
                performed_at=now,
            )

            request_id = (
                unlock_request.request_id
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "An open unlock request already "
                "exists, or the workflow changed "
                "concurrently."
            ) from error

        except ValueError as error:
            await self.repository.rollback()

            raise self._conflict(
                str(error)
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Unlock request submitted for "
                "checker approval."
            ),
            "data": await (
                self._get_unlock_request(
                    request_id
                )
            ),
        }

    async def review_unlock_request(
        self,
        request_id: int,
        payload: ExitMeetingUnlockReviewRequest,
        reviewed_by_user_id: Any,
    ) -> dict[str, Any]:
        checker_id = self._actor_id(
            reviewed_by_user_id
        )

        try:
            lookup_request = (
                await self._get_unlock_request(
                    request_id
                )
            )

            minute = (
                await self._get_minute_for_update(
                    lookup_request.minute_id
                )
            )

            unlock_request = (
                await self
                ._get_unlock_request_for_update(
                    request_id
                )
            )

            if (
                unlock_request.minute_id
                != minute.minute_id
            ):
                raise self._conflict(
                    "Unlock request and minute "
                    "do not match."
                )

            if (
                unlock_request.request_status
                != "pending"
                or not unlock_request.is_active
            ):
                raise self._conflict(
                    "This unlock request is no "
                    "longer pending."
                )

            if (
                minute.workflow_status
                != "pending_unlock_approval"
                or not minute.is_locked
            ):
                raise self._conflict(
                    "The minute is not pending "
                    "unlock approval."
                )

            self._ensure_different_actors(
                unlock_request
                .requested_by_user_id,
                checker_id,
            )

            now = self._utc_now()

            if payload.decision == "reject":
                await (
                    self.repository
                    .update_unlock_request(
                        unlock_request,
                        {
                            "request_status": (
                                "rejected"
                            ),
                            "reviewed_by_user_id": (
                                checker_id
                            ),
                            "reviewed_at": now,
                            "review_comment": (
                                payload
                                .review_comment
                            ),
                            "is_active": False,
                            "updated_by": (
                                checker_id
                            ),
                            "updated_at": now,
                        },
                    )
                )

                await (
                    self.repository
                    .update_minute_workflow(
                        minute,
                        {
                            "workflow_status": (
                                "locked"
                            ),
                            "current_unlock_request_id": (
                                None
                            ),
                            "reviewed_by_user_id": (
                                checker_id
                            ),
                            "reviewed_at": now,
                            "review_note": (
                                payload
                                .review_comment
                            ),
                            "last_workflow_by_user_id": (
                                checker_id
                            ),
                            "last_workflow_at": now,
                            "updated_by": (
                                checker_id
                            ),
                            "updated_at": now,
                        },
                    )
                )

                await self.repository.append_event(
                    minute_id=minute.minute_id,
                    unlock_request_id=(
                        unlock_request.request_id
                    ),
                    event_type=(
                        "unlock_rejected"
                    ),
                    from_status=(
                        "pending_unlock_approval"
                    ),
                    to_status="locked",
                    event_comment=(
                        payload.review_comment
                    ),
                    performed_by_user_id=(
                        checker_id
                    ),
                    performed_at=now,
                )

                await self.repository.commit()

                return {
                    "message": (
                        "Unlock request rejected."
                    ),
                    "data": await (
                        self._get_unlock_request(
                            request_id
                        )
                    ),
                }

            approved_until = (
                payload.approved_until
            )

            if approved_until is not None:
                approved_until = (
                    self._as_utc(
                        approved_until
                    )
                )

                if approved_until <= now:
                    raise self._bad_request(
                        "Approved-until time must "
                        "be in the future."
                    )

            normalized_scope = (
                self.repository
                .normalize_edit_scope(
                    unlock_request.edit_scope
                )
            )

            await (
                self.repository
                .update_unlock_request(
                    unlock_request,
                    {
                        "request_status": (
                            "approved"
                        ),
                        "reviewed_by_user_id": (
                            checker_id
                        ),
                        "reviewed_at": now,
                        "review_comment": (
                            payload.review_comment
                        ),
                        "approved_until": (
                            approved_until
                        ),
                        "updated_by": (
                            checker_id
                        ),
                        "updated_at": now,
                    },
                )
            )

            await (
                self.repository
                .update_minute_workflow(
                    minute,
                    {
                        "workflow_status": (
                            "unlocked_for_edit"
                        ),
                        "is_locked": False,
                        "current_edit_scope": (
                            normalized_scope
                        ),
                        "edit_approved_until": (
                            approved_until
                        ),
                        "unlock_cycle_number": (
                            int(
                                minute
                                .unlock_cycle_number
                                or 0
                            )
                            + 1
                        ),
                        "reviewed_by_user_id": (
                            checker_id
                        ),
                        "reviewed_at": now,
                        "review_note": (
                            payload.review_comment
                        ),
                        "last_workflow_by_user_id": (
                            checker_id
                        ),
                        "last_workflow_at": now,
                        "updated_by": (
                            checker_id
                        ),
                        "updated_at": now,
                    },
                )
            )

            await self.repository.append_event(
                minute_id=minute.minute_id,
                unlock_request_id=(
                    unlock_request.request_id
                ),
                snapshot_id=(
                    minute.current_snapshot_id
                ),
                event_type=(
                    "unlock_approved"
                ),
                from_status=(
                    "pending_unlock_approval"
                ),
                to_status=(
                    "unlocked_for_edit"
                ),
                event_comment=(
                    payload.review_comment
                ),
                event_payload={
                    "edit_scope": (
                        normalized_scope
                    ),
                    "approved_until": (
                        approved_until.isoformat()
                        if approved_until
                        else None
                    ),
                },
                performed_by_user_id=(
                    checker_id
                ),
                performed_at=now,
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "Unlock approval could not be "
                "completed because the workflow "
                "changed concurrently."
            ) from error

        except ValueError as error:
            await self.repository.rollback()

            raise self._conflict(
                str(error)
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Unlock request approved. "
                "The minute is now editable only "
                "within the approved scope."
            ),
            "data": await (
                self._get_unlock_request(
                    request_id
                )
            ),
        }

    async def submit_for_relock(
        self,
        minute_id: int,
        payload: (
            ExitMeetingSubmitForRelockRequest
        ),
        submitted_by_user_id: Any,
    ) -> dict[str, Any]:
        actor_id = self._actor_id(
            submitted_by_user_id
        )

        try:
            minute = (
                await self._get_minute_for_update(
                    minute_id
                )
            )

            self._ensure_active(minute)

            if (
                minute.workflow_status
                != "unlocked_for_edit"
                or minute.is_locked
            ):
                raise self._conflict(
                    "Only an approved unlocked "
                    "minute can be submitted for "
                    "relock."
                )

            self._ensure_edit_window_active(
                minute
            )

            if (
                minute.current_unlock_request_id
                is None
            ):
                raise self._conflict(
                    "The minute does not have an "
                    "approved unlock request."
                )

            unlock_request = (
                await self
                ._get_unlock_request_for_update(
                    minute
                    .current_unlock_request_id
                )
            )

            if (
                unlock_request.request_status
                != "approved"
                or not unlock_request.is_active
            ):
                raise self._conflict(
                    "The related unlock request "
                    "is not currently approved."
                )

            now = self._utc_now()

            await (
                self.repository
                .update_minute_workflow(
                    minute,
                    {
                        "workflow_status": (
                            "pending_relock_approval"
                        ),
                        "submitted_by_user_id": (
                            actor_id
                        ),
                        "submitted_at": now,
                        "reviewed_by_user_id": None,
                        "reviewed_at": None,
                        "review_note": None,
                        "last_workflow_by_user_id": (
                            actor_id
                        ),
                        "last_workflow_at": now,
                        "updated_by": actor_id,
                        "updated_at": now,
                    },
                )
            )

            await self.repository.append_event(
                minute_id=minute.minute_id,
                unlock_request_id=(
                    unlock_request.request_id
                ),
                snapshot_id=(
                    minute.current_snapshot_id
                ),
                event_type=(
                    "relock_submitted"
                ),
                from_status=(
                    "unlocked_for_edit"
                ),
                to_status=(
                    "pending_relock_approval"
                ),
                event_comment=(
                    payload.submission_comment
                ),
                event_payload={
                    "edit_scope": (
                        minute.current_edit_scope
                    ),
                },
                performed_by_user_id=(
                    actor_id
                ),
                performed_at=now,
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "Relock submission could not be "
                "saved because the workflow "
                "changed concurrently."
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Updated Exit Meeting Minutes "
                "submitted for checker relock "
                "approval."
            ),
            "data": await self._minute_response(
                minute_id
            ),
        }

    async def cancel_unlock_request(
        self,
        request_id: int,
        cancelled_by_user_id: Any,
    ) -> dict[str, Any]:
        actor_id = self._actor_id(
            cancelled_by_user_id
        )

        try:
            lookup_request = (
                await self._get_unlock_request(
                    request_id
                )
            )

            minute = (
                await self._get_minute_for_update(
                    lookup_request.minute_id
                )
            )

            unlock_request = (
                await self
                ._get_unlock_request_for_update(
                    request_id
                )
            )

            if (
                unlock_request.request_status
                != "pending"
                or not unlock_request.is_active
            ):
                raise self._conflict(
                    "Only a pending unlock request "
                    "can be cancelled."
                )

            if (
                unlock_request
                .requested_by_user_id
                != actor_id
            ):
                raise self._conflict(
                    "Only the original requester "
                    "can cancel this unlock request."
                )

            if (
                minute.workflow_status
                != "pending_unlock_approval"
            ):
                raise self._conflict(
                    "The minute is no longer "
                    "pending unlock approval."
                )

            now = self._utc_now()

            await (
                self.repository
                .update_unlock_request(
                    unlock_request,
                    {
                        "request_status": (
                            "cancelled"
                        ),
                        "cancelled_at": now,
                        "is_active": False,
                        "updated_by": actor_id,
                        "updated_at": now,
                    },
                )
            )

            await (
                self.repository
                .update_minute_workflow(
                    minute,
                    {
                        "workflow_status": (
                            "locked"
                        ),
                        "current_unlock_request_id": (
                            None
                        ),
                        "last_workflow_by_user_id": (
                            actor_id
                        ),
                        "last_workflow_at": now,
                        "updated_by": actor_id,
                        "updated_at": now,
                    },
                )
            )

            await self.repository.append_event(
                minute_id=minute.minute_id,
                unlock_request_id=(
                    unlock_request.request_id
                ),
                event_type=(
                    "unlock_cancelled"
                ),
                from_status=(
                    "pending_unlock_approval"
                ),
                to_status="locked",
                performed_by_user_id=(
                    actor_id
                ),
                performed_at=now,
            )

            await self.repository.commit()

        except IntegrityError as error:
            await self.repository.rollback()

            raise self._conflict(
                "The unlock cancellation could "
                "not be saved because the workflow "
                "changed concurrently."
            ) from error

        except HTTPException:
            await self.repository.rollback()
            raise

        except Exception:
            await self.repository.rollback()
            raise

        return {
            "message": (
                "Unlock request cancelled."
            ),
            "data": await (
                self._get_unlock_request(
                    request_id
                )
            ),
        }

    async def get_workflow_summary(
        self,
        minute_id: int,
    ) -> dict[str, Any]:
        minute = await (
            self.repository.get_minute(
                minute_id
            )
        )

        if minute is None:
            raise self._not_found(
                "Exit Meeting Minutes record "
                "not found."
            )

        current_snapshot = await (
            self.repository
            .get_current_snapshot(
                minute_id
            )
        )

        current_unlock_request = None

        if (
            minute.current_unlock_request_id
            is not None
        ):
            current_unlock_request = (
                await self.repository
                .get_unlock_request(
                    minute
                    .current_unlock_request_id
                )
            )

        recent_events = await (
            self.repository.list_events(
                minute_id=minute_id,
                limit=50,
            )
        )

        return {
            "minute": (
                await self._minute_response(
                    minute_id
                )
            ),
            "current_snapshot": (
                current_snapshot
            ),
            "current_unlock_request": (
                current_unlock_request
            ),
            "recent_events": recent_events,
        }

    async def list_snapshots(
        self,
        minute_id: int,
    ) -> dict[str, Any]:
        minute = await (
            self.repository.get_minute(
                minute_id
            )
        )

        if minute is None:
            raise self._not_found(
                "Exit Meeting Minutes record "
                "not found."
            )

        items = await (
            self.repository.list_snapshots(
                minute_id
            )
        )

        return {
            "total": len(items),
            "items": items,
        }

    async def list_workflow_events(
        self,
        minute_id: int,
        limit: int = 100,
    ) -> dict[str, Any]:
        minute = await (
            self.repository.get_minute(
                minute_id
            )
        )

        if minute is None:
            raise self._not_found(
                "Exit Meeting Minutes record "
                "not found."
            )

        items = await (
            self.repository.list_events(
                minute_id=minute_id,
                limit=limit,
            )
        )

        return {
            "total": len(items),
            "items": items,
        }

    async def get_verified_snapshot_report(
        self,
        snapshot_id: int,
    ) -> dict[str, Any]:
        snapshot = await (
            self.repository.get_snapshot(
                snapshot_id
            )
        )

        if snapshot is None:
            raise self._not_found(
                "Exit Meeting snapshot "
                "not found."
            )

        snapshot_data = (
            snapshot.snapshot_data
        )

        if not isinstance(
            snapshot_data,
            dict,
        ):
            raise HTTPException(
                status_code=(
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Snapshot data is missing "
                    "or invalid."
                ),
            )

        calculated_hash = (
            self.minute_service
            ._calculate_snapshot_hash(
                snapshot_data
            )
        )

        if not hmac.compare_digest(
            snapshot.snapshot_hash,
            calculated_hash,
        ):
            raise HTTPException(
                status_code=(
                    status
                    .HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Snapshot integrity "
                    "verification failed."
                ),
            )

        return snapshot_data

    async def list_lock_review_queue(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        workflow_status: str | None = None,
    ) -> dict[str, Any]:
        items, total = await (
            self.repository
            .list_lock_review_queue(
                page=page,
                page_size=page_size,
                search=search,
                workflow_status=(
                    workflow_status
                ),
            )
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    async def list_unlock_review_queue(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        request_status: str = "pending",
    ) -> dict[str, Any]:
        items, total = await (
            self.repository
            .list_unlock_review_queue(
                page=page,
                page_size=page_size,
                search=search,
                request_status=(
                    request_status
                ),
            )
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }
