from sqlalchemy import select, update, func
import sqlalchemy as sa

from app.models.employee import Employee
from app.models.designation import Designation
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_accept import (
    AuditAcceptConsultation,
    AuditAcceptCompletion,
    AuditAcceptTemplate,
    AuditAcceptResponse,
    AuditAcceptItem,
)

from app.models.audit_master import AuditMaster
from app.models.company import Company
from app.models.audit_entity import AuditEntity


class AuditAcceptConsultationRepository:

    async def create(
        self,
        session: AsyncSession,
        consultation: AuditAcceptConsultation,
    ):
        session.add(consultation)

        await session.flush()

        await session.refresh(
            consultation
        )

        return consultation


    async def get_by_id(
        self,
        session: AsyncSession,
        consultation_id: int,
    ):

        result = await session.execute(
            select(
                AuditAcceptConsultation
            ).where(
                AuditAcceptConsultation.consultation_id
                == consultation_id
            )
        )

        return result.scalar_one_or_none()


    async def get_pending_by_employee(
        self,
        session: AsyncSession,
        employee_id: int,
    ):

        result = await session.execute(
            select(
                AuditAcceptConsultation
            )
            .where(
                AuditAcceptConsultation
                .consultant_employee_id
                == employee_id
            )
            .where(
                AuditAcceptConsultation.status
                .in_(
                    [
                        "pending",
                        "in_review",
                        "approved",
                        "returned",
                    ]
                )
            )
        )

        return result.scalars().all()


    async def get_by_audit(
        self,
        session: AsyncSession,
        audit_id: int,
    ):

        result = await session.execute(
            select(
                AuditAcceptConsultation
            )
            .where(
                AuditAcceptConsultation.audit_id
                == audit_id
            )
        )

        return result.scalars().all()


    async def update_decision(
        self,
        session: AsyncSession,
        consultation_id: int,
        decision: str,
        remarks: str | None,
    ):

        if decision == "return" and not remarks:
            raise ValueError(
                "Remarks required when returning consultation."
            )

        await session.execute(
            update(
                AuditAcceptConsultation
            )
            .where(
                AuditAcceptConsultation
                .consultation_id
                == consultation_id
            )
            .values(
                decision=decision,
                remarks=remarks,
                status="approved"
                if decision == "approve"
                else "returned",
                reviewed_at=sa.func.now(),
            )
        )

        await session.flush()




    async def get_review_details(
        self,
        session: AsyncSession,
        consultation_id: int,
    ):

        result = await session.execute(
            select(
                AuditAcceptConsultation,
                AuditAcceptCompletion,
                AuditMaster.audit_name,
                AuditMaster.audit_type,
                AuditMaster.audit_year,
                Company.company_name,
                Employee.employee_name,
                Designation.designation_name,
            )
            .join(
                AuditAcceptCompletion,
                AuditAcceptCompletion.completion_id
                ==
                AuditAcceptConsultation.completion_id,
            )
            .join(
                AuditMaster,
                AuditMaster.audit_id
                ==
                AuditAcceptConsultation.audit_id,
            )
            .join(
                Company,
                Company.id
                ==
                AuditMaster.client_id,
            )
            .join(
                Employee,
                Employee.id
                ==
                AuditAcceptConsultation.consultant_employee_id,
            )
            .outerjoin(
                Designation,
                Designation.id
                ==
                Employee.designation_id,
            )
            .where(
                AuditAcceptConsultation.consultation_id
                ==
                consultation_id
            )
        )

        row=result.first()

        if not row:
            return None


        consultation=row[0]
        completion=row[1]


        response_result = await session.execute(
            select(
                func.count(AuditAcceptResponse.response_id),
            )
            .where(
                AuditAcceptResponse.audit_id
                ==
                consultation.audit_id
            )
        )

        total_questions=response_result.scalar() or 0


        yes_result = await session.execute(
            select(
                func.count(AuditAcceptResponse.response_id),
            )
            .where(
                AuditAcceptResponse.audit_id
                ==
                consultation.audit_id
            )
            .where(
                AuditAcceptResponse.answer_value=="yes"
            )
        )

        yes_count=yes_result.scalar() or 0



        questions_result = await session.execute(
            select(
                AuditAcceptItem.item_id,
                AuditAcceptItem.item_no,
                AuditAcceptItem.title,
                AuditAcceptItem.content,
                AuditAcceptResponse.answer_value,
            )
            .join(
                AuditAcceptResponse,
                AuditAcceptResponse.item_id
                ==
                AuditAcceptItem.item_id,
            )
            .where(
                AuditAcceptResponse.audit_id
                ==
                consultation.audit_id
            )
            .where(
                AuditAcceptItem.item_type
                ==
                "question"
            )
            .order_by(
                AuditAcceptItem.sort_order
            )
        )


        questions = [
            {
                "item_id": row.item_id,
                "item_no": row.item_no,
                "title": row.title,
                "content": row.content,
                "answer_value": row.answer_value,
            }
            for row in questions_result.all()
        ]
        return {

            "consultation_id":
                consultation.consultation_id,

            "audit_id":
                consultation.audit_id,

            "client_name":
                row.company_name,

            "audit_name":
                row.audit_name,

            "audit_type":
                row.audit_type,

            "audit_year":
                row.audit_year,


            "consultant_name":
                row.employee_name,

            "designation_name":
                row.designation_name,


            "status":
                consultation.status,

            "decision":
                consultation.decision,

            "remarks":
                consultation.remarks,

            "reviewed_at":
                consultation.reviewed_at,


            "workflow_status":
                completion.workflow_status,

            "acceptance_decision":
                completion.acceptance_decision,

            "safeguards_text":
                completion.safeguards_text,

            "conclusion_remarks":
                completion.conclusion_remarks,


            "questions": questions,

            "question_summary":{
                "total_questions":
                    total_questions,

                "yes_count":
                    yes_count,

                "no_count":
                    total_questions - yes_count,
            }
        }

    async def list_management_requests(
        self,
        session: AsyncSession,
    ):

        result = await session.execute(
            select(
                AuditAcceptConsultation,
                AuditMaster.audit_name,
                AuditEntity.entity_name,
                Employee.employee_name,
                Designation.designation_name,
            )
            .join(
                AuditMaster,
                AuditMaster.audit_id ==
                AuditAcceptConsultation.audit_id,
            )
            .join(
                AuditEntity,
                AuditEntity.id ==
                AuditMaster.client_id,
            )
            .join(
                Employee,
                Employee.id ==
                AuditAcceptConsultation.consultant_employee_id,
            )
            .outerjoin(
                Designation,
                Designation.id ==
                Employee.designation_id,
            )
            .where(
                AuditAcceptConsultation.status.in_(
                    [
                        "pending",
                        "in_review",
                        "approved",
                        "returned",
                    ]
                )
            )
            .order_by(
                AuditAcceptConsultation.consultation_id.desc()
            )
        )

        items=[]

        for row in result.all():

            response_result = await session.execute(
                select(
                    func.count(
                        AuditAcceptResponse.response_id
                    )
                )
                .where(
                    AuditAcceptResponse.audit_id
                    ==
                    row[0].audit_id
                )
            )

            total_questions = response_result.scalar() or 0


            yes_result = await session.execute(
                select(
                    func.count(
                        AuditAcceptResponse.response_id
                    )
                )
                .where(
                    AuditAcceptResponse.audit_id
                    ==
                    row[0].audit_id
                )
                .where(
                    AuditAcceptResponse.answer_value
                    ==
                    "yes"
                )
            )

            yes_count = yes_result.scalar() or 0


            items.append(
                {
                    "consultation_id": row[0].consultation_id,
                    "audit_id": row[0].audit_id,
                    "audit_name": row[1],
                    "client_name": row[2],
                    "completion_id": row[0].completion_id,
                    "consultant_employee_id": row[0].consultant_employee_id,
                    "consultant_name": row[3],
                    "designation_name": row[4],
                    "status": row[0].status,
                    "assigned_by_user_id": row[0].assigned_by_user_id,
                    "remarks": row[0].remarks,

                    "question_summary":{
                        "total_questions": total_questions,
                        "yes_count": yes_count,
                        "no_count": total_questions - yes_count,
                    }
                }
            )

        return items

    async def list_consultants(
        self,
        session: AsyncSession,
    ):

        result = await session.execute(
            select(
                Employee.id,
                Employee.employee_name,
                Designation.designation_name,
            )
            .outerjoin(
                Designation,
                Designation.id == Employee.designation_id,
            )
            .where(
                Employee.is_active.is_(True)
            )
            .order_by(
                Employee.employee_name
            )
        )

        return [
            {
                "id": row.id,
                "employee_name": row.employee_name,
                "designation_name": row[4],
            }
            for row in result
        ]

audit_accept_consultation_repository = (
    AuditAcceptConsultationRepository()
)




























