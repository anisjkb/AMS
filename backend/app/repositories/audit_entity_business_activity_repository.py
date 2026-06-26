from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_entity import AuditEntity
from app.models.audit_entity_business_activity import AuditEntityBusinessActivity
from app.models.business_master import (
    BusinessIndustry,
    BusinessNature,
    BusinessSector,
)
from app.schemas.audit_entity_business_activity import (
    AuditEntityBusinessActivityCreate,
    AuditEntityBusinessActivityUpdate,
)


class AuditEntityBusinessActivityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        audit_entity_id: int | None,
        business_nature_id: int | None,
        business_sector_id: int | None,
        business_industry_id: int | None,
        is_primary: bool | None,
        risk_rating: str | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(AuditEntityBusinessActivity)

        if is_active is not None:
            stmt = stmt.where(AuditEntityBusinessActivity.is_active == is_active)

        if audit_entity_id is not None:
            stmt = stmt.where(
                AuditEntityBusinessActivity.audit_entity_id == audit_entity_id
            )

        if business_nature_id is not None:
            stmt = stmt.where(
                AuditEntityBusinessActivity.business_nature_id
                == business_nature_id
            )

        if business_sector_id is not None:
            stmt = stmt.where(
                AuditEntityBusinessActivity.business_sector_id
                == business_sector_id
            )

        if business_industry_id is not None:
            stmt = stmt.where(
                AuditEntityBusinessActivity.business_industry_id
                == business_industry_id
            )

        if is_primary is not None:
            stmt = stmt.where(AuditEntityBusinessActivity.is_primary == is_primary)

        if risk_rating:
            stmt = stmt.where(AuditEntityBusinessActivity.risk_rating == risk_rating)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    AuditEntityBusinessActivity.activity_code.ilike(search_term),
                    AuditEntityBusinessActivity.activity_name.ilike(search_term),
                    AuditEntityBusinessActivity.description.ilike(search_term),
                    AuditEntityBusinessActivity.remarks.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": AuditEntityBusinessActivity.id,
            "activity_code": AuditEntityBusinessActivity.activity_code,
            "activity_name": AuditEntityBusinessActivity.activity_name,
            "risk_rating": AuditEntityBusinessActivity.risk_rating,
            "revenue_percentage": AuditEntityBusinessActivity.revenue_percentage,
            "created_at": AuditEntityBusinessActivity.created_at,
            "updated_at": AuditEntityBusinessActivity.updated_at,
        }

        sort_column = allowed_sort_fields.get(
            sort_by,
            AuditEntityBusinessActivity.id,
        )

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
        activity_id: int,
    ) -> AuditEntityBusinessActivity | None:
        result = await self.db.execute(
            select(AuditEntityBusinessActivity).where(
                AuditEntityBusinessActivity.id == activity_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self,
        activity_code: str,
    ) -> AuditEntityBusinessActivity | None:
        result = await self.db.execute(
            select(AuditEntityBusinessActivity).where(
                AuditEntityBusinessActivity.activity_code == activity_code
            )
        )
        return result.scalar_one_or_none()

    async def get_by_entity_and_industry(
        self,
        audit_entity_id: int,
        business_industry_id: int,
        exclude_id: int | None = None,
    ) -> AuditEntityBusinessActivity | None:
        stmt = select(AuditEntityBusinessActivity).where(
            AuditEntityBusinessActivity.audit_entity_id == audit_entity_id,
            AuditEntityBusinessActivity.business_industry_id
            == business_industry_id,
        )

        if exclude_id is not None:
            stmt = stmt.where(AuditEntityBusinessActivity.id != exclude_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_last_activity(self) -> AuditEntityBusinessActivity | None:
        result = await self.db.execute(
            select(AuditEntityBusinessActivity)
            .order_by(AuditEntityBusinessActivity.id.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_audit_entity_by_id(
        self,
        audit_entity_id: int,
    ) -> AuditEntity | None:
        result = await self.db.execute(
            select(AuditEntity).where(AuditEntity.id == audit_entity_id)
        )
        return result.scalar_one_or_none()

    async def get_business_nature_by_id(
        self,
        business_nature_id: int,
    ) -> BusinessNature | None:
        result = await self.db.execute(
            select(BusinessNature).where(BusinessNature.id == business_nature_id)
        )
        return result.scalar_one_or_none()

    async def get_business_sector_by_id(
        self,
        business_sector_id: int,
    ) -> BusinessSector | None:
        result = await self.db.execute(
            select(BusinessSector).where(BusinessSector.id == business_sector_id)
        )
        return result.scalar_one_or_none()

    async def get_business_industry_by_id(
        self,
        business_industry_id: int,
    ) -> BusinessIndustry | None:
        result = await self.db.execute(
            select(BusinessIndustry).where(
                BusinessIndustry.id == business_industry_id
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        payload: AuditEntityBusinessActivityCreate,
        activity_code: str,
        created_by: str,
    ) -> AuditEntityBusinessActivity:
        data = payload.model_dump()
        data["activity_code"] = activity_code

        activity = AuditEntityBusinessActivity(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(activity)
        await self.db.commit()
        await self.db.refresh(activity)

        return activity

    async def update(
        self,
        activity: AuditEntityBusinessActivity,
        payload: AuditEntityBusinessActivityUpdate,
        updated_by: str,
    ) -> AuditEntityBusinessActivity:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "is_primary" and value is None:
                continue

            setattr(activity, field, value)

        activity.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(activity)

        return activity

    async def set_active_status(
        self,
        activity: AuditEntityBusinessActivity,
        is_active: bool,
        updated_by: str,
    ) -> AuditEntityBusinessActivity:
        activity.is_active = is_active
        activity.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(activity)

        return activity

    async def permanent_delete(
        self,
        activity: AuditEntityBusinessActivity,
    ) -> None:
        await self.db.delete(activity)
        await self.db.commit()

    async def set_other_activities_non_primary(
        self,
        audit_entity_id: int,
        exclude_id: int,
        updated_by: str,
    ) -> None:
        result = await self.db.execute(
            select(AuditEntityBusinessActivity).where(
                AuditEntityBusinessActivity.audit_entity_id == audit_entity_id,
                AuditEntityBusinessActivity.id != exclude_id,
                AuditEntityBusinessActivity.is_primary.is_(True),
            )
        )
        activities = list(result.scalars().all())

        for activity in activities:
            activity.is_primary = False
            activity.updated_by = updated_by

        await self.db.commit()

    async def sync_audit_entity_primary_business(
        self,
        audit_entity_id: int,
        business_nature_id: int | None,
        business_sector_id: int | None,
        business_industry_id: int | None,
        industry_name: str | None,
        updated_by: str,
    ) -> None:
        entity = await self.get_audit_entity_by_id(audit_entity_id)

        if not entity:
            return

        entity.business_nature_id = business_nature_id
        entity.business_sector_id = business_sector_id
        entity.business_industry_id = business_industry_id
        entity.industry = industry_name
        entity.updated_by = updated_by

        await self.db.commit()
