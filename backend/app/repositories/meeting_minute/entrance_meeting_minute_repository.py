from __future__ import annotations

from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class EntranceMeetingMinuteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _row_to_dict(row: Any) -> dict[str, Any]:
        return dict(row._mapping)

    def _base_from_sql(self) -> str:
        return """
            from entrance_meeting_minutes emn
            join meeting_master mm on mm.meeting_id = emn.meeting_id
            left join audit_entities ae on ae.id = mm.client_id
            left join lateral (
                select
                    mp.participant_id,
                    coalesce(
                        emp.employee_name,
                        ec.contact_name,
                        atm.emp_id::text,
                        'Participant #' || mp.participant_id::text
                    ) as participant_name,
                    coalesce(atm.team_member_role, ec.designation) as designation
                from meeting_participants mp
                left join audit_team_members atm on atm.team_member_id = mp.audit_team_member_id
                left join employees emp on emp.id::text = atm.emp_id::text
                left join audit_entity_contacts ec on ec.id = mp.entity_contact_id
                where mp.participant_id = emn.chairman_participant_id
                limit 1
            ) chairman_data on true
        """

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        meeting_id: int | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[dict[str, Any]], int]:
        page = max(page, 1)
        page_size = max(min(page_size, 100), 1)
        offset = (page - 1) * page_size

        where_parts = []
        params: dict[str, Any] = {}

        if search:
            params["search"] = f"%{search.strip()}%"
            where_parts.append(
                """
                (
                    mm.meeting_name ilike :search
                    or mm.meeting_type ilike :search
                    or ae.entity_name ilike :search
                    or mm.audit_year ilike :search
                    or mm.meeting_venue ilike :search
                    or chairman_data.participant_name ilike :search
                )
                """
            )

        if isinstance(is_active, bool):
            params["is_active"] = is_active
            where_parts.append("emn.is_active = :is_active")

        if meeting_id is not None:
            params["meeting_id"] = meeting_id
            where_parts.append("emn.meeting_id = :meeting_id")

        where_sql = ""
        if where_parts:
            where_sql = "where " + " and ".join(where_parts)

        allowed_sort = {
            "minute_id": "emn.minute_id",
            "meeting_id": "emn.meeting_id",
            "meeting_name": "mm.meeting_name",
            "meeting_type": "mm.meeting_type",
            "client_name": "ae.entity_name",
            "audit_year": "mm.audit_year",
            "meeting_date": "mm.meeting_date",
            "created_at": "emn.created_at",
            "updated_at": "emn.updated_at",
        }

        sort_column = allowed_sort.get(sort_by, "emn.minute_id")
        direction = "desc" if sort_order.lower() == "desc" else "asc"
        base_from = self._base_from_sql()

        count_result = await self.db.execute(
            text(f"select count(*) {base_from} {where_sql}"),
            params,
        )
        total = int(count_result.scalar_one() or 0)

        data_result = await self.db.execute(
            text(
                f"""
                select
                    emn.minute_id,
                    emn.meeting_id,
                    emn.chairman_participant_id,
                    emn.status,
                    emn.is_active,
                    emn.created_by,
                    emn.updated_by,
                    emn.created_at,
                    emn.updated_at,
                    mm.meeting_name,
                    mm.meeting_type,
                    mm.client_id,
                    mm.client_code,
                    ae.entity_name as client_name,
                    mm.audit_year,
                    mm.meeting_date,
                    mm.audit_start_date,
                    mm.audit_end_date,
                    mm.meeting_venue,
                    mm.meeting_note1,
                    chairman_data.participant_name as chairman_name,
                    chairman_data.designation as chairman_designation
                {base_from}
                {where_sql}
                order by {sort_column} {direction}
                offset :offset
                limit :limit
                """
            ),
            {**params, "offset": offset, "limit": page_size},
        )

        return [self._row_to_dict(row) for row in data_result.fetchall()], total

    async def get_by_id(self, minute_id: int) -> dict[str, Any] | None:
        base_from = self._base_from_sql()

        result = await self.db.execute(
            text(
                f"""
                select
                    emn.minute_id,
                    emn.meeting_id,
                    emn.chairman_participant_id,
                    emn.status,
                    emn.is_active,
                    emn.created_by,
                    emn.updated_by,
                    emn.created_at,
                    emn.updated_at,
                    mm.meeting_name,
                    mm.meeting_type,
                    mm.client_id,
                    mm.client_code,
                    ae.entity_name as client_name,
                    mm.audit_year,
                    mm.meeting_date,
                    mm.audit_start_date,
                    mm.audit_end_date,
                    mm.meeting_venue,
                    mm.meeting_note1,
                    chairman_data.participant_name as chairman_name,
                    chairman_data.designation as chairman_designation
                {base_from}
                where emn.minute_id = :minute_id
                """
            ),
            {"minute_id": minute_id},
        )

        row = result.first()
        return self._row_to_dict(row) if row else None

    async def get_active_meeting(self, meeting_id: int) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                select meeting_id
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
                select participant_id
                from meeting_participants
                where participant_id = :participant_id
                  and meeting_id = :meeting_id
                  and is_active = true
                """
            ),
            {"participant_id": participant_id, "meeting_id": meeting_id},
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
                insert into entrance_meeting_minutes (
                    meeting_id,
                    chairman_participant_id,
                    status,
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
                    true,
                    :created_by,
                    :created_by,
                    now(),
                    now()
                )
                returning minute_id
                """
            ),
            {**data, "created_by": created_by},
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
        set_parts = []
        params: dict[str, Any] = {
            "minute_id": minute_id,
            "updated_by": updated_by,
        }

        for key, value in data.items():
            set_parts.append(f"{key} = :{key}")
            params[key] = value

        set_parts.append("updated_by = :updated_by")
        set_parts.append("updated_at = now()")

        await self.db.execute(
            text(
                f"""
                update entrance_meeting_minutes
                set {", ".join(set_parts)}
                where minute_id = :minute_id
                """
            ),
            params,
        )
        await self.db.commit()

        return await self.get_by_id(minute_id)

    async def update_is_active(
        self,
        minute_id: int,
        is_active: bool,
        updated_by: str | None,
    ) -> dict[str, Any] | None:
        await self.db.execute(
            text(
                """
                update entrance_meeting_minutes
                set is_active = :is_active,
                    status = case when :is_active then 'active' else 'inactive' end,
                    updated_by = :updated_by,
                    updated_at = now()
                where minute_id = :minute_id
                """
            ),
            {
                "minute_id": minute_id,
                "is_active": is_active,
                "updated_by": updated_by,
            },
        )
        await self.db.commit()

        return await self.get_by_id(minute_id)

    async def permanent_delete(self, minute_id: int) -> bool:
        result = await self.db.execute(
            text(
                """
                delete from entrance_meeting_minutes
                where minute_id = :minute_id
                returning minute_id
                """
            ),
            {"minute_id": minute_id},
        )
        await self.db.commit()

        return result.first() is not None

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
                        'Participant #' || mp.participant_id::text
                    ) as participant_name,
                    coalesce(atm.team_member_role, ec.designation) as designation,
                    mp.source_type,
                    case
                        when mp.source_type = 'internal_audit_team' then 'Internal Audit Team'
                        when mp.source_type = 'client_entity_team' then 'Client/Entity Team'
                        else mp.source_type
                    end as source_label
                from meeting_participants mp
                left join audit_team_members atm on atm.team_member_id = mp.audit_team_member_id
                left join employees emp on emp.id::text = atm.emp_id::text
                left join audit_entity_contacts ec on ec.id = mp.entity_contact_id
                where mp.meeting_id = :meeting_id
                  and mp.source_type = :source_type
                  and mp.is_active = true
                order by mp.participant_id asc
                """
            ),
            {"meeting_id": meeting_id, "source_type": source_type},
        )

        return [self._row_to_dict(row) for row in result.fetchall()]

    async def list_report_discussions(self, audit_type: str) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select id, title, description, decision
                from general_discussion
                where is_active = true
                  and lower(audit_type) = lower(:audit_type)
                order by id asc
                """
            ),
            {"audit_type": audit_type},
        )

        rows = result.fetchall()

        if not rows:
            result = await self.db.execute(
                text(
                    """
                    select id, title, description, decision
                    from general_discussion
                    where is_active = true
                    order by id asc
                    """
                )
            )
            rows = result.fetchall()

        return [self._row_to_dict(row) for row in rows]

    async def list_report_offices(self, client_id: int) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select
                    coalesce(addr_type.address_type_name, 'Office') as label,
                    concat_ws(
                        ', ',
                        nullif(addr.address_line1, ''),
                        nullif(addr.address_line2, ''),
                        nullif(addr.city, ''),
                        nullif(addr.state_region, ''),
                        nullif(addr.country, '')
                    ) as address
                from audit_entity_addresses addr
                left join audit_entity_address_types addr_type
                  on addr_type.id = addr.address_type_id
                where addr.audit_entity_id = :client_id
                  and addr.is_active = true
                order by addr.is_primary desc, addr.id asc
                """
            ),
            {"client_id": client_id},
        )

        offices = [self._row_to_dict(row) for row in result.fetchall()]

        if offices:
            return offices

        fallback_result = await self.db.execute(
            text(
                """
                select 'Office' as label, address
                from audit_entities
                where id = :client_id
                """
            ),
            {"client_id": client_id},
        )

        fallback_row = fallback_result.first()
        return [self._row_to_dict(fallback_row)] if fallback_row else []
