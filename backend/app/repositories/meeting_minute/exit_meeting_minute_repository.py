from __future__ import annotations

import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class ExitMeetingMinuteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _row_to_dict(row: Any) -> dict[str, Any]:
        return dict(row._mapping)

    def _base_from_sql(self) -> str:
        return """
            from exit_meeting_minutes exm
            join meeting_master mm
              on mm.meeting_id = exm.meeting_id
            left join audit_master am
              on am.audit_id = mm.audit_id
            left join audit_entities ae
              on ae.id = mm.client_id
            left join lateral (
                select
                    mp.participant_id,
                    coalesce(
                        emp.employee_name,
                        ec.contact_name,
                        atm.emp_id::text,
                        'Participant #' || mp.participant_id::text
                    ) as participant_name,
                    coalesce(
                        atm.team_member_role,
                        ec.designation
                    ) as designation
                from meeting_participants mp
                left join audit_team_members atm
                  on atm.team_member_id = mp.audit_team_member_id
                left join employees emp
                  on emp.id::text = atm.emp_id::text
                left join audit_entity_contacts ec
                  on ec.id = mp.entity_contact_id
                where mp.participant_id =
                    exm.chairman_participant_id
                limit 1
            ) chairman_data on true
        """

    def _select_columns_sql(self) -> str:
        return """
            exm.minute_id,
            exm.meeting_id,
            exm.chairman_participant_id,
            exm.status,
            exm.is_active,

            exm.is_locked,
            exm.locked_at,
            exm.locked_by_user_id,
            exm.template_key,
            exm.template_version,
            exm.snapshot_version,
            exm.snapshot_data,
            exm.snapshot_hash,

            exm.workflow_status,
            exm.workflow_version,
            exm.unlock_cycle_number,

            exm.submitted_by_user_id,
            exm.submitted_at,

            exm.reviewed_by_user_id,
            exm.reviewed_at,
            exm.review_note,

            exm.current_edit_scope,
            exm.edit_approved_until,

            exm.last_workflow_by_user_id,
            exm.last_workflow_at,

            exm.current_snapshot_id,
            exm.current_unlock_request_id,

            exm.created_by,
            exm.updated_by,
            exm.created_at,
            exm.updated_at,

            mm.meeting_name,
            mm.meeting_type,
            mm.meeting_date,
            mm.meeting_venue,
            mm.meeting_note1,

            mm.audit_id,
            am.audit_name,
            am.audit_type,
            mm.audit_year,
            mm.audit_start_date,
            mm.audit_end_date,

            mm.client_id,
            mm.client_code,
            ae.entity_name as client_name,

            chairman_data.participant_name as chairman_name,
            chairman_data.designation as chairman_designation
        """

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        is_locked: bool | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[dict[str, Any]], int]:
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
        offset = (page - 1) * page_size

        where_parts: list[str] = []
        params: dict[str, Any] = {}

        if search:
            params["search"] = f"%{search.strip()}%"
            where_parts.append(
                """
                (
                    mm.meeting_name ilike :search
                    or mm.meeting_type ilike :search
                    or am.audit_name ilike :search
                    or am.audit_type ilike :search
                    or ae.entity_name ilike :search
                    or mm.client_code ilike :search
                    or mm.audit_year ilike :search
                    or chairman_data.participant_name ilike :search
                )
                """
            )

        if isinstance(is_active, bool):
            params["is_active"] = is_active
            where_parts.append("exm.is_active = :is_active")

        if meeting_id is not None:
            params["meeting_id"] = meeting_id
            where_parts.append("exm.meeting_id = :meeting_id")

        if isinstance(is_locked, bool):
            params["is_locked"] = is_locked
            where_parts.append("exm.is_locked = :is_locked")

        where_sql = ""
        if where_parts:
            where_sql = "where " + " and ".join(where_parts)

        allowed_sort = {
            "minute_id": "exm.minute_id",
            "meeting_id": "exm.meeting_id",
            "meeting_name": "mm.meeting_name",
            "meeting_type": "mm.meeting_type",
            "audit_name": "am.audit_name",
            "audit_type": "am.audit_type",
            "client_name": "ae.entity_name",
            "audit_year": "mm.audit_year",
            "meeting_date": "mm.meeting_date",
            "is_locked": "exm.is_locked",
            "workflow_status": "exm.workflow_status",
            "locked_at": "exm.locked_at",
            "created_at": "exm.created_at",
            "updated_at": "exm.updated_at",
        }

        sort_column = allowed_sort.get(
            sort_by,
            "exm.minute_id",
        )
        direction = (
            "desc"
            if sort_order.lower() == "desc"
            else "asc"
        )

        base_from = self._base_from_sql()

        count_result = await self.db.execute(
            text(
                f"""
                select count(*)
                {base_from}
                {where_sql}
                """
            ),
            params,
        )

        total = int(count_result.scalar_one() or 0)

        data_result = await self.db.execute(
            text(
                f"""
                select
                    {self._select_columns_sql()}
                {base_from}
                {where_sql}
                order by {sort_column} {direction}
                offset :offset
                limit :limit
                """
            ),
            {
                **params,
                "offset": offset,
                "limit": page_size,
            },
        )

        return [
            self._row_to_dict(row)
            for row in data_result.fetchall()
        ], total

    async def get_by_id(
        self,
        minute_id: int,
    ) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                f"""
                select
                    {self._select_columns_sql()}
                {self._base_from_sql()}
                where exm.minute_id = :minute_id
                """
            ),
            {"minute_id": minute_id},
        )

        row = result.first()
        return self._row_to_dict(row) if row else None

    async def get_active_meeting(
        self,
        meeting_id: int,
    ) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                select
                    meeting_id,
                    meeting_name,
                    meeting_type,
                    audit_id,
                    client_id
                from meeting_master
                where meeting_id = :meeting_id
                  and is_active = true
                """
            ),
            {"meeting_id": meeting_id},
        )

        row = result.first()
        return self._row_to_dict(row) if row else None

    async def get_active_participant_for_meeting(
        self,
        participant_id: int,
        meeting_id: int,
    ) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                select
                    participant_id,
                    meeting_id,
                    source_type
                from meeting_participants
                where participant_id = :participant_id
                  and meeting_id = :meeting_id
                  and is_active = true
                """
            ),
            {
                "participant_id": participant_id,
                "meeting_id": meeting_id,
            },
        )

        row = result.first()
        return self._row_to_dict(row) if row else None

    async def create(
        self,
        data: dict[str, Any],
        created_by: str | None,
    ) -> dict[str, Any]:
        result = await self.db.execute(
            text(
                """
                insert into exit_meeting_minutes (
                    meeting_id,
                    chairman_participant_id,
                    status,
                    is_locked,
                    snapshot_version,
                    workflow_status,
                    workflow_version,
                    unlock_cycle_number,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                values (
                    :meeting_id,
                    :chairman_participant_id,
                    :status,
                    false,
                    1,
                    'draft',
                    1,
                    0,
                    true,
                    :created_by,
                    :created_by,
                    now(),
                    now()
                )
                returning minute_id
                """
            ),
            {
                **data,
                "created_by": created_by,
            },
        )

        minute_id = int(result.scalar_one())
        await self.db.commit()

        item = await self.get_by_id(minute_id)
        return item or {}

    async def update(
        self,
        minute_id: int,
        data: dict[str, Any],
        updated_by: str | None,
    ) -> dict[str, Any] | None:
        allowed_fields = {
            "meeting_id",
            "chairman_participant_id",
            "status",
            "is_active",
        }

        safe_data = {
            key: value
            for key, value in data.items()
            if key in allowed_fields
        }

        if not safe_data:
            return await self.get_by_id(minute_id)

        set_parts: list[str] = []
        params: dict[str, Any] = {
            "minute_id": minute_id,
            "updated_by": updated_by,
        }

        for key, value in safe_data.items():
            set_parts.append(f"{key} = :{key}")
            params[key] = value

        set_parts.append("updated_by = :updated_by")
        set_parts.append("updated_at = now()")

        result = await self.db.execute(
            text(
                f"""
                update exit_meeting_minutes
                set {", ".join(set_parts)}
                where minute_id = :minute_id
                  and is_locked = false
                  and workflow_status in (
                    'draft',
                    'changes_requested',
                    'unlocked_for_edit'
                  )
                returning minute_id
                """
            ),
            params,
        )

        updated = result.first()
        await self.db.commit()

        if not updated:
            return None

        return await self.get_by_id(minute_id)

    async def update_is_active(
        self,
        minute_id: int,
        is_active: bool,
        updated_by: str | None,
    ) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                update exit_meeting_minutes
                set
                    is_active = :is_active,
                    status = case
                        when :is_active then 'active'
                        else 'inactive'
                    end,
                    updated_by = :updated_by,
                    updated_at = now()
                where minute_id = :minute_id
                  and is_locked = false
                  and workflow_status in (
                    'draft',
                    'changes_requested'
                  )
                returning minute_id
                """
            ),
            {
                "minute_id": minute_id,
                "is_active": is_active,
                "updated_by": updated_by,
            },
        )

        updated = result.first()
        await self.db.commit()

        if not updated:
            return None

        return await self.get_by_id(minute_id)

    async def permanent_delete(
        self,
        minute_id: int,
    ) -> bool:
        result = await self.db.execute(
            text(
                """
                delete from exit_meeting_minutes
                where minute_id = :minute_id
                  and is_locked = false
                  and workflow_status in (
                    'draft',
                    'changes_requested'
                  )
                returning minute_id
                """
            ),
            {"minute_id": minute_id},
        )

        deleted = result.first()
        await self.db.commit()

        return deleted is not None

    async def lock_with_snapshot(
        self,
        minute_id: int,
        snapshot_data: dict[str, Any],
        snapshot_hash: str,
        locked_by_user_id: str | None,
        template_key: str,
        template_version: str,
        snapshot_version: int,
    ) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                update exit_meeting_minutes
                set
                    is_locked = true,
                    locked_at = now(),
                    locked_by_user_id = :locked_by_user_id,
                    template_key = :template_key,
                    template_version = :template_version,
                    snapshot_version = :snapshot_version,
                    snapshot_data =
                        cast(:snapshot_data as jsonb),
                    snapshot_hash = :snapshot_hash,
                    updated_by = :locked_by_user_id,
                    updated_at = now()
                where minute_id = :minute_id
                  and is_locked = false
                returning minute_id
                """
            ),
            {
                "minute_id": minute_id,
                "locked_by_user_id": locked_by_user_id,
                "template_key": template_key,
                "template_version": template_version,
                "snapshot_version": snapshot_version,
                "snapshot_data": json.dumps(
                    snapshot_data,
                    ensure_ascii=False,
                    default=str,
                ),
                "snapshot_hash": snapshot_hash,
            },
        )

        locked = result.first()
        await self.db.commit()

        if not locked:
            return None

        return await self.get_by_id(minute_id)

    async def list_report_participants(
        self,
        meeting_id: int,
        source_type: str,
    ) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select
                    mp.participant_id,
                    coalesce(
                        emp.employee_name,
                        ec.contact_name,
                        atm.emp_id::text,
                        'Participant #' ||
                            mp.participant_id::text
                    ) as participant_name,
                    coalesce(
                        atm.team_member_role,
                        ec.designation
                    ) as designation,
                    mp.source_type,
                    case
                        when mp.source_type =
                            'internal_audit_team'
                            then 'Internal Audit Team'
                        when mp.source_type =
                            'client_entity_team'
                            then 'Client/Entity Team'
                        else mp.source_type
                    end as source_label
                from meeting_participants mp
                left join audit_team_members atm
                  on atm.team_member_id =
                    mp.audit_team_member_id
                left join employees emp
                  on emp.id::text = atm.emp_id::text
                left join audit_entity_contacts ec
                  on ec.id = mp.entity_contact_id
                where mp.meeting_id = :meeting_id
                  and mp.source_type = :source_type
                  and mp.is_active = true
                order by mp.participant_id asc
                """
            ),
            {
                "meeting_id": meeting_id,
                "source_type": source_type,
            },
        )

        return [
            self._row_to_dict(row)
            for row in result.fetchall()
        ]

    async def list_report_visit_dates(
        self,
        audit_id: int,
    ) -> list[Any]:
        result = await self.db.execute(
            text(
                """
                select distinct visit_date
                from audit_visit_info
                where audit_id = :audit_id
                  and is_active = true
                  and visit_date is not null
                order by visit_date asc
                """
            ),
            {"audit_id": audit_id},
        )

        return [
            row.visit_date
            for row in result.fetchall()
        ]

    async def list_report_findings(
        self,
        audit_id: int,
    ) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select
                    avo.visit_observation_id,
                    avo.visit_id,
                    avi.visit_date,
                    avo.discussion_point,
                    avo.observation_discussion,
                    avo.observation_decision
                from audit_visit_observations avo
                left join audit_visit_info avi
                  on avi.visit_id = avo.visit_id
                where coalesce(
                    avo.audit_id,
                    avi.audit_id
                ) = :audit_id
                  and avo.is_active = true
                order by
                    avi.visit_date asc nulls last,
                    avo.visit_observation_id asc
                """
            ),
            {"audit_id": audit_id},
        )

        return [
            self._row_to_dict(row)
            for row in result.fetchall()
        ]
