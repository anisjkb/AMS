from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_accept import (
    AuditAcceptConsultation,
    AuditAcceptCompletion,
)

from app.repositories.audit_accept_consultation.audit_accept_consultation_repository import (
    audit_accept_consultation_repository,
)


class AuditAcceptConsultationService:


    async def assign_consultant(
        self,
        session: AsyncSession,
        audit_id: int,
        completion_id: int,
        employee_id: int,
        assigned_by: str,
    ):

        existing = await audit_accept_consultation_repository.get_by_audit(
            session,
            audit_id,
        )

        for item in existing:
            if item.consultant_employee_id == employee_id:
                return item


        consultation = AuditAcceptConsultation(
            audit_id=audit_id,
            completion_id=completion_id,
            consultant_employee_id=employee_id,
            assigned_by_user_id=assigned_by,
            status="pending",
        )


        return await audit_accept_consultation_repository.create(
            session,
            consultation,
        )


    async def get_employee_pending_requests(
        self,
        session: AsyncSession,
        employee_id: int,
    ):

        return await (
            audit_accept_consultation_repository
            .get_pending_by_employee(
                session,
                employee_id,
            )
        )


    async def get_my_requests(
        self,
        db: AsyncSession,
        user_id: str,
    ):

        from sqlalchemy import select
        from app.models.user import User

        result = await db.execute(
            select(User)
            .where(
                User.user_id == user_id
            )
        )

        user = result.scalar_one_or_none()

        if not user:
            return []

        if not user.employee_id:
            return []

        return await (
            audit_accept_consultation_repository
            .get_pending_by_employee(
                db,
                user.employee_id,
            )
        )


    async def get_management_requests(
        self,
        db: AsyncSession,
    ):

        return await (
            audit_accept_consultation_repository
            .list_management_requests(
                db,
            )
        )

    async def list_consultants(
        self,
        db: AsyncSession,
    ):

        return await (
            audit_accept_consultation_repository
            .list_consultants(
                db,
            )
        )



    async def get_review_details(
        self,
        db: AsyncSession,
        consultation_id: int,
    ):

        return await (
            audit_accept_consultation_repository
            .get_review_details(
                db,
                consultation_id,
            )
        )
    async def update_decision(
        self,
        db: AsyncSession,
        consultation_id: int,
        decision: str,
        remarks: str | None = None,
    ):

        consultation = await (
            audit_accept_consultation_repository
            .get_by_id(
                db,
                consultation_id,
            )
        )

        if not consultation:
            raise ValueError(
                "Consultation request not found"
            )

        if consultation.status == "approved":
            raise ValueError(
                "Approved consultation cannot be modified"
            )

        if consultation.status == "returned":
            raise ValueError(
                "Returned consultation cannot be modified"
            )

        await (
            audit_accept_consultation_repository
            .update_decision(
                db,
                consultation_id,
                decision,
                remarks,
            )
        )

        if decision == "approve" and consultation:

            from sqlalchemy import update

            await db.execute(
                update(AuditAcceptCompletion)
                .where(
                    AuditAcceptCompletion.completion_id
                    == consultation.completion_id
                )
                .values(
                    workflow_status="completed",
                )
            )

            await db.flush()


        return await (
            audit_accept_consultation_repository
            .get_by_id(
                db,
                consultation_id,
            )
        )


audit_accept_consultation_service = (
    AuditAcceptConsultationService()
)







