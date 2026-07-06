from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class MeetingParticipantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _row_to_dict(row) -> dict[str, Any]:
        return dict(row._mapping)

    def _select_sql(self, where_sql: str = "") -> str:
        return f"""
            select
                mp.participant_id,
                mp.meeting_id,
                mm.meeting_name,
                mm.meeting_type_id,
                mm.meeting_type,
                mm.client_id,
                mm.client_code,
                mp.source_type,
                case
                    when mp.source_type = 'internal_audit_team' then 'Internal Audit Team'
                    when mp.source_type = 'client_entity_team' then 'Client/Entity Team'
                    else mp.source_type
                end as source_label,
                mp.audit_team_id,
                at.team_name as audit_team_name,
                mp.audit_team_member_id,
                mp.entity_contact_id,
                case
                    when mp.source_type = 'internal_audit_team'
                        then coalesce(e.employee_name, atm.emp_id, '-')
                    when mp.source_type = 'client_entity_team'
                        then coalesce(aec.contact_name, '-')
                    else '-'
                end as participant_name,
                case
                    when mp.source_type = 'internal_audit_team'
                        then coalesce(atm.team_member_role, '-')
                    when mp.source_type = 'client_entity_team'
                        then coalesce(aec.designation, '-')
                    else '-'
                end as designation,
                mp.is_active,
                mp.created_by,
                mp.updated_by,
                mp.created_at,
                mp.updated_at
            from meeting_participants mp
            join meeting_master mm on mm.meeting_id = mp.meeting_id
            left join audit_teams at on at.team_id = mp.audit_team_id
            left join audit_team_members atm on atm.team_member_id = mp.audit_team_member_id
            left join employees e
              on atm.emp_id is not null
             and atm.emp_id ~ '^[0-9]+$'
             and e.id = atm.emp_id::integer
            left join audit_entity_contacts aec on aec.id = mp.entity_contact_id
            {where_sql}
        """

    async def list_participants(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[int, list[dict[str, Any]]]:
        conditions: list[str] = []
        params: dict[str, Any] = {}

        if is_active is not None:
            conditions.append("mp.is_active = :is_active")
            params["is_active"] = is_active

        if search:
            conditions.append(
                """
                (
                    mm.meeting_name ilike :search
                    or mm.meeting_type ilike :search
                    or mm.client_code ilike :search
                    or at.team_name ilike :search
                    or aec.contact_name ilike :search
                    or aec.designation ilike :search
                    or atm.team_member_role ilike :search
                    or e.employee_name ilike :search
                )
                """
            )
            params["search"] = f"%{search.strip()}%"

        where_sql = ""
        if conditions:
            where_sql = "where " + " and ".join(conditions)

        count_sql = f"""
            select count(*) as total
            from meeting_participants mp
            join meeting_master mm on mm.meeting_id = mp.meeting_id
            left join audit_teams at on at.team_id = mp.audit_team_id
            left join audit_team_members atm on atm.team_member_id = mp.audit_team_member_id
            left join employees e
              on atm.emp_id is not null
             and atm.emp_id ~ '^[0-9]+$'
             and e.id = atm.emp_id::integer
            left join audit_entity_contacts aec on aec.id = mp.entity_contact_id
            {where_sql}
        """

        total_result = await self.db.execute(text(count_sql), params)
        total = int(total_result.scalar() or 0)

        sort_columns = {
            "participant_id": "mp.participant_id",
            "meeting_name": "mm.meeting_name",
            "meeting_type": "mm.meeting_type",
            "source_type": "mp.source_type",
            "created_at": "mp.created_at",
        }
        order_column = sort_columns.get(sort_by, "mp.participant_id")
        order_direction = "asc" if sort_order.lower() == "asc" else "desc"

        offset = (page - 1) * page_size
        params["limit"] = page_size
        params["offset"] = offset

        list_sql = (
            self._select_sql(where_sql)
            + f" order by {order_column} {order_direction} limit :limit offset :offset"
        )

        result = await self.db.execute(text(list_sql), params)
        return total, [self._row_to_dict(row) for row in result.fetchall()]

    async def get_by_id(self, participant_id: int) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(self._select_sql("where mp.participant_id = :participant_id")),
            {"participant_id": participant_id},
        )
        row = result.first()
        return self._row_to_dict(row) if row else None

    async def get_meeting(self, meeting_id: int) -> dict[str, Any] | None:
        result = await self.db.execute(
            text(
                """
                select meeting_id, meeting_name, meeting_type_id, meeting_type, client_id, client_code
                from meeting_master
                where meeting_id = :meeting_id
                  and is_active = true
                """
            ),
            {"meeting_id": meeting_id},
        )
        row = result.first()
        return self._row_to_dict(row) if row else None

    async def list_internal_team_options(self) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select
                    t.team_id,
                    t.team_name,
                    count(m.team_member_id)::int as member_count
                from audit_teams t
                join audit_team_members m
                  on m.team_id = t.team_id
                 and m.is_active = true
                 and lower(m.status) = 'active'
                where t.is_active = true
                  and lower(t.status) = 'active'
                group by t.team_id, t.team_name
                order by t.team_name asc
                """
            )
        )
        return [self._row_to_dict(row) for row in result.fetchall()]

    async def list_entity_contact_options(self, meeting_id: int) -> list[dict[str, Any]]:
        result = await self.db.execute(
            text(
                """
                select
                    c.id,
                    c.audit_entity_id,
                    c.contact_name,
                    c.designation,
                    c.department,
                    c.email,
                    c.mobile
                from meeting_master mm
                join audit_entity_contacts c
                  on c.audit_entity_id = mm.client_id
                 and c.is_active = true
                where mm.meeting_id = :meeting_id
                  and mm.is_active = true
                order by c.contact_name asc
                """
            ),
            {"meeting_id": meeting_id},
        )
        return [self._row_to_dict(row) for row in result.fetchall()]

    async def create_from_internal_team(
        self,
        meeting_id: int,
        audit_team_id: int,
        created_by: str | None,
    ) -> list[dict[str, Any]]:
        members_result = await self.db.execute(
            text(
                """
                select team_member_id, team_id
                from audit_team_members
                where team_id = :audit_team_id
                  and is_active = true
                  and lower(status) = 'active'
                order by team_member_id
                """
            ),
            {"audit_team_id": audit_team_id},
        )
        members = [self._row_to_dict(row) for row in members_result.fetchall()]

        created_items: list[dict[str, Any]] = []

        for member in members:
            existing = await self.db.execute(
                text(
                    """
                    select participant_id
                    from meeting_participants
                    where meeting_id = :meeting_id
                      and source_type = 'internal_audit_team'
                      and audit_team_member_id = :audit_team_member_id
                    limit 1
                    """
                ),
                {
                    "meeting_id": meeting_id,
                    "audit_team_member_id": member["team_member_id"],
                },
            )
            if existing.first():
                continue

            insert_result = await self.db.execute(
                text(
                    """
                    insert into meeting_participants (
                        meeting_id,
                        source_type,
                        audit_team_id,
                        audit_team_member_id,
                        entity_contact_id,
                        is_active,
                        created_by,
                        updated_by,
                        created_at,
                        updated_at
                    )
                    values (
                        :meeting_id,
                        'internal_audit_team',
                        :audit_team_id,
                        :audit_team_member_id,
                        null,
                        true,
                        :created_by,
                        :created_by,
                        now(),
                        now()
                    )
                    returning participant_id
                    """
                ),
                {
                    "meeting_id": meeting_id,
                    "audit_team_id": audit_team_id,
                    "audit_team_member_id": member["team_member_id"],
                    "created_by": created_by,
                },
            )
            participant_id = int(insert_result.scalar_one())
            item = await self.get_by_id(participant_id)
            if item:
                created_items.append(item)

        await self.db.commit()
        return created_items

    async def create_from_entity_contact(
        self,
        meeting_id: int,
        entity_contact_id: int,
        created_by: str | None,
    ) -> list[dict[str, Any]]:
        contact_result = await self.db.execute(
            text(
                """
                select c.id
                from meeting_master mm
                join audit_entity_contacts c
                  on c.audit_entity_id = mm.client_id
                 and c.is_active = true
                where mm.meeting_id = :meeting_id
                  and c.id = :entity_contact_id
                limit 1
                """
            ),
            {"meeting_id": meeting_id, "entity_contact_id": entity_contact_id},
        )
        if not contact_result.first():
            return []

        existing = await self.db.execute(
            text(
                """
                select participant_id
                from meeting_participants
                where meeting_id = :meeting_id
                  and source_type = 'client_entity_team'
                  and entity_contact_id = :entity_contact_id
                limit 1
                """
            ),
            {"meeting_id": meeting_id, "entity_contact_id": entity_contact_id},
        )
        if existing.first():
            return []

        insert_result = await self.db.execute(
            text(
                """
                insert into meeting_participants (
                    meeting_id,
                    source_type,
                    audit_team_id,
                    audit_team_member_id,
                    entity_contact_id,
                    is_active,
                    created_by,
                    updated_by,
                    created_at,
                    updated_at
                )
                values (
                    :meeting_id,
                    'client_entity_team',
                    null,
                    null,
                    :entity_contact_id,
                    true,
                    :created_by,
                    :created_by,
                    now(),
                    now()
                )
                returning participant_id
                """
            ),
            {
                "meeting_id": meeting_id,
                "entity_contact_id": entity_contact_id,
                "created_by": created_by,
            },
        )
        participant_id = int(insert_result.scalar_one())
        await self.db.commit()

        item = await self.get_by_id(participant_id)
        return [item] if item else []

    async def update_is_active(
        self,
        participant_id: int,
        is_active: bool,
        updated_by: str | None,
    ) -> dict[str, Any] | None:
        await self.db.execute(
            text(
                """
                update meeting_participants
                set is_active = :is_active,
                    updated_by = :updated_by,
                    updated_at = now()
                where participant_id = :participant_id
                """
            ),
            {
                "participant_id": participant_id,
                "is_active": is_active,
                "updated_by": updated_by,
            },
        )
        await self.db.commit()
        return await self.get_by_id(participant_id)

    async def permanent_delete(self, participant_id: int) -> bool:
        result = await self.db.execute(
            text(
                """
                delete from meeting_participants
                where participant_id = :participant_id
                returning participant_id
                """
            ),
            {"participant_id": participant_id},
        )
        await self.db.commit()
        return result.first() is not None
