from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_subject import AuditSubject
from app.schemas.audit_subject import AuditSubjectCreate, AuditSubjectUpdate


class AuditSubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        subject_type: str | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditSubject)

        if is_active is not None:
            stmt = stmt.where(AuditSubject.is_active == is_active)

        if subject_type:
            stmt = stmt.where(AuditSubject.subject_type == subject_type)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditSubject.subject_code.ilike(search_term),
                    AuditSubject.subject_name.ilike(search_term),
                    AuditSubject.reference_code.ilike(search_term),
                    AuditSubject.owner_department.ilike(search_term),
                    AuditSubject.location.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditSubject.id,
            "subject_code": AuditSubject.subject_code,
            "subject_name": AuditSubject.subject_name,
            "subject_type": AuditSubject.subject_type,
            "risk_level": AuditSubject.risk_level,
            "created_at": AuditSubject.created_at,
            "updated_at": AuditSubject.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, AuditSubject.id)

        stmt = stmt.order_by(
            desc(sort_column) if sort_order == "desc" else asc(sort_column)
        )

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        items = list(result.scalars().all())

        return total or 0, items

    async def get_by_id_any_status(
        self,
        audit_subject_id: int,
    ) -> AuditSubject | None:
        result = await self.db.execute(
            select(AuditSubject).where(AuditSubject.id == audit_subject_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        subject_code: str,
    ) -> AuditSubject | None:
        result = await self.db.execute(
            select(AuditSubject).where(AuditSubject.subject_code == subject_code)
        )
        return result.scalar_one_or_none()

    async def get_by_name_and_type(
        self,
        subject_name: str,
        subject_type: str,
    ) -> AuditSubject | None:
        result = await self.db.execute(
            select(AuditSubject).where(
                AuditSubject.subject_name == subject_name,
                AuditSubject.subject_type == subject_type,
            )
        )
        return result.scalar_one_or_none()

    async def get_last_subject(self) -> AuditSubject | None:
        result = await self.db.execute(
            select(AuditSubject).order_by(AuditSubject.id.desc()).limit(1)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditSubjectCreate,
        subject_code: str,
        created_by: str,
    ) -> AuditSubject:
        data = payload.model_dump()
        data["subject_code"] = subject_code

        subject = AuditSubject(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)

        return subject

    async def update(
        self,
        subject: AuditSubject,
        payload: AuditSubjectUpdate,
        updated_by: str,
    ) -> AuditSubject:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(subject, field, value)

        subject.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(subject)

        return subject

    async def set_active_status(
        self,
        subject: AuditSubject,
        is_active: bool,
        updated_by: str,
    ) -> AuditSubject:
        subject.is_active = is_active
        subject.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(subject)

        return subject

    async def permanent_delete(
        self,
        subject: AuditSubject,
    ) -> None:
        await self.db.delete(subject)
        await self.db.commit()
