from sqlalchemy import and_, cast, func, or_, select, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_team import AuditTeam
from app.models.audit_team_member import AuditTeamMember
from app.models.employee import Employee
from app.schemas.audit_team_member import AuditTeamMemberCreate


class AuditTeamMemberRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _build_filters(
        self,
        search: str | None,
        is_active: bool | None,
        team_id: int | None,
        member_type: str | None,
        status: str | None,
    ):
        filters = []

        if search:
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    cast(AuditTeamMember.team_id, String).ilike(search_term),
                    AuditTeamMember.member_type.ilike(search_term),
                    AuditTeamMember.emp_id.ilike(search_term),
                    AuditTeamMember.team_member_role.ilike(search_term),
                    AuditTeamMember.note.ilike(search_term),
                    AuditTeamMember.br_id.ilike(search_term),
                    AuditTeamMember.status.ilike(search_term),
                )
            )

        if isinstance(is_active, bool):
            filters.append(AuditTeamMember.is_active == is_active)

        if team_id is not None:
            filters.append(AuditTeamMember.team_id == team_id)

        if member_type:
            filters.append(AuditTeamMember.member_type == member_type)

        if status:
            filters.append(AuditTeamMember.status == status)

        return filters

    def _sort_column(self, sort_by: str):
        allowed_sort_columns = {
            "team_member_id": AuditTeamMember.team_member_id,
            "team_id": AuditTeamMember.team_id,
            "member_type": AuditTeamMember.member_type,
            "emp_id": AuditTeamMember.emp_id,
            "team_member_role": AuditTeamMember.team_member_role,
            "status": AuditTeamMember.status,
            "created_at": AuditTeamMember.created_at,
            "updated_at": AuditTeamMember.updated_at,
        }

        return allowed_sort_columns.get(sort_by, AuditTeamMember.team_member_id)

    async def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        team_id: int | None,
        member_type: str | None,
        status: str | None,
        sort_by: str,
        sort_order: str,
    ) -> tuple[list[AuditTeamMember], int]:
        filters = self._build_filters(
            search=search,
            is_active=is_active,
            team_id=team_id,
            member_type=member_type,
            status=status,
        )

        where_clause = and_(*filters) if filters else None

        count_stmt = select(func.count()).select_from(AuditTeamMember)
        if where_clause is not None:
            count_stmt = count_stmt.where(where_clause)

        count_result = await self.db.execute(count_stmt)
        total = int(count_result.scalar_one() or 0)

        sort_column = self._sort_column(sort_by)
        if sort_order.lower() == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        stmt = select(AuditTeamMember).order_by(sort_column)

        if where_clause is not None:
            stmt = stmt.where(where_clause)

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, team_member_id: int) -> AuditTeamMember | None:
        result = await self.db.execute(
            select(AuditTeamMember).where(
                AuditTeamMember.team_member_id == team_member_id
            )
        )
        return result.scalar_one_or_none()

    async def get_active_team_by_id(self, team_id: int) -> AuditTeam | None:
        result = await self.db.execute(
            select(AuditTeam).where(
                AuditTeam.team_id == team_id,
                AuditTeam.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_employee_by_id(self, employee_id: int) -> Employee | None:
        result = await self.db.execute(
            select(Employee).where(
                Employee.id == employee_id,
                Employee.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditTeamMemberCreate,
        created_by: str,
    ) -> AuditTeamMember:
        item = AuditTeamMember(
            **payload.model_dump(),
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def update(
        self,
        item: AuditTeamMember,
        update_data: dict,
        updated_by: str,
    ) -> AuditTeamMember:
        for field, value in update_data.items():
            setattr(item, field, value)

        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def deactivate(
        self,
        item: AuditTeamMember,
        updated_by: str,
    ) -> AuditTeamMember:
        item.is_active = False
        item.status = "inactive"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def restore(
        self,
        item: AuditTeamMember,
        updated_by: str,
    ) -> AuditTeamMember:
        item.is_active = True
        item.status = "active"
        item.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(item)

        return item

    async def permanent_delete(self, item: AuditTeamMember) -> None:
        await self.db.delete(item)
        await self.db.commit()
