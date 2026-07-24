from datetime import date, datetime
from typing import Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_accept import (
    AuditAcceptItem,
    AuditAcceptResponse,
    AuditAcceptTemplate,
)
from app.models.audit_entity import AuditEntity
from app.models.audit_master import AuditMaster


class AuditAcceptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def list_active_audit_options(self) -> list[dict]:
        result = await self.db.execute(
            select(
                AuditMaster.audit_id,
                AuditMaster.audit_year,
                AuditMaster.client_id,
                AuditEntity.entity_name.label("client_name"),
                AuditMaster.audit_name,
                AuditMaster.audit_type,
            )
            .join(
                AuditEntity,
                AuditEntity.id == AuditMaster.client_id,
            )
            .where(
                AuditMaster.is_active.is_(True),
                AuditMaster.status == "active",
                AuditEntity.is_active.is_(True),
            )
            .order_by(
                AuditMaster.audit_year.desc(),
                AuditEntity.entity_name.asc(),
                AuditMaster.audit_name.asc().nullslast(),
                AuditMaster.audit_id.asc(),
            )
        )

        return [
            dict(row)
            for row in result.mappings().all()
        ]


    async def get_audit_context(
        self,
        audit_id: int,
    ) -> tuple[AuditMaster, AuditEntity] | None:
        result = await self.db.execute(
            select(
                AuditMaster,
                AuditEntity,
            )
            .join(
                AuditEntity,
                AuditEntity.id == AuditMaster.client_id,
            )
            .where(
                AuditMaster.audit_id == audit_id,
                AuditMaster.is_active.is_(True),
                AuditEntity.is_active.is_(True),
            )
        )

        row = result.first()

        if row is None:
            return None

        return row[0], row[1]

    async def get_active_template(
        self,
        as_of_date: date,
    ) -> AuditAcceptTemplate | None:
        result = await self.db.execute(
            select(AuditAcceptTemplate)
            .where(
                AuditAcceptTemplate.is_active.is_(True),
                or_(
                    AuditAcceptTemplate.effective_from.is_(None),
                    AuditAcceptTemplate.effective_from
                    <= as_of_date,
                ),
                or_(
                    AuditAcceptTemplate.effective_to.is_(None),
                    AuditAcceptTemplate.effective_to
                    >= as_of_date,
                ),
            )
            .order_by(
                AuditAcceptTemplate.effective_from
                .desc()
                .nullslast(),
                AuditAcceptTemplate.template_id.desc(),
            )
            .limit(1)
        )

        return result.scalar_one_or_none()

    async def get_active_template_by_id(
        self,
        template_id: int,
    ) -> AuditAcceptTemplate | None:
        result = await self.db.execute(
            select(AuditAcceptTemplate).where(
                AuditAcceptTemplate.template_id
                == template_id,
                AuditAcceptTemplate.is_active.is_(True),
            )
        )

        return result.scalar_one_or_none()

    async def list_items_with_responses(
        self,
        audit_id: int,
        template_id: int,
    ) -> list[dict]:
        response_join = and_(
            AuditAcceptResponse.audit_id == audit_id,
            AuditAcceptResponse.template_id == template_id,
            AuditAcceptResponse.item_id
            == AuditAcceptItem.item_id,
            AuditAcceptResponse.is_active.is_(True),
        )

        result = await self.db.execute(
            select(
                AuditAcceptItem,
                AuditAcceptResponse.response_id,
                AuditAcceptResponse.answer_value,
                AuditAcceptResponse.updated_at.label(
                    "response_updated_at"
                ),
            )
            .outerjoin(
                AuditAcceptResponse,
                response_join,
            )
            .where(
                AuditAcceptItem.template_id == template_id,
                AuditAcceptItem.is_active.is_(True),
            )
            .order_by(
                AuditAcceptItem.sort_order.asc(),
                AuditAcceptItem.item_id.asc(),
            )
        )

        rows: list[dict] = []

        for row in result.all():
            rows.append(
                {
                    "item": row[0],
                    "response_id": row[1],
                    "answer_value": row[2],
                    "response_updated_at": row[3],
                }
            )

        return rows

    async def get_active_items_by_ids(
        self,
        template_id: int,
        item_ids: Sequence[int],
    ) -> list[AuditAcceptItem]:
        if not item_ids:
            return []

        result = await self.db.execute(
            select(AuditAcceptItem).where(
                AuditAcceptItem.template_id == template_id,
                AuditAcceptItem.item_id.in_(item_ids),
                AuditAcceptItem.is_active.is_(True),
            )
        )

        return list(result.scalars().all())

    async def get_existing_responses(
        self,
        audit_id: int,
        template_id: int,
        item_ids: Sequence[int],
    ) -> dict[int, AuditAcceptResponse]:
        if not item_ids:
            return {}

        result = await self.db.execute(
            select(AuditAcceptResponse).where(
                AuditAcceptResponse.audit_id == audit_id,
                AuditAcceptResponse.template_id
                == template_id,
                AuditAcceptResponse.item_id.in_(item_ids),
            )
        )

        return {
            response.item_id: response
            for response in result.scalars().all()
        }

    async def save_answers(
        self,
        audit_id: int,
        template_id: int,
        answers: dict[int, str | None],
        updated_by: str,
    ) -> int:
        item_ids = list(answers)

        existing_responses = (
            await self.get_existing_responses(
                audit_id=audit_id,
                template_id=template_id,
                item_ids=item_ids,
            )
        )

        current_time = datetime.utcnow()

        for item_id, answer_value in answers.items():
            response = existing_responses.get(item_id)

            if response is None:
                response = AuditAcceptResponse(
                    audit_id=audit_id,
                    template_id=template_id,
                    item_id=item_id,
                    answer_value=answer_value,
                    is_active=True,
                    created_by=updated_by,
                    updated_by=updated_by,
                    created_at=current_time,
                    updated_at=current_time,
                )

                self.db.add(response)
                continue

            response.answer_value = answer_value
            response.is_active = True
            response.updated_by = updated_by
            response.updated_at = current_time

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return len(answers)
