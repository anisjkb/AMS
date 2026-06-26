import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.legal_status import LegalStatus


SYSTEM_USER = "system"


LEGAL_STATUSES = [
    ("001", "Micro-Credit Organization"),
    ("002", "NGO"),
    ("003", "Private Limited Company"),
    ("004", "Public Limited Company"),
    ("005", "One-Person Company"),
    ("006", "Partnership Firm"),
    ("007", "Cooperative Society"),
    ("008", "Foreign Company"),
    ("009", "Trade Organization"),
    ("010", "Associations"),
    ("011", "Professional Institutions"),
    ("012", "Educational Institutions"),
    ("013", "Non Profit Organization"),
    ("014", "Govt. Autonomous"),
    ("015", "Government"),
]


async def seed_legal_statuses() -> None:
    async with AsyncSessionLocal() as db:
        for code, name in LEGAL_STATUSES:
            result = await db.execute(
                select(LegalStatus).where(
                    LegalStatus.legal_status_code == code
                )
            )
            legal_status = result.scalar_one_or_none()

            if legal_status:
                legal_status.legal_status_name = name
                legal_status.is_active = True
                legal_status.updated_by = SYSTEM_USER

                print(f"Legal status updated: {code} - {name}")
                continue

            legal_status = LegalStatus(
                legal_status_code=code,
                legal_status_name=name,
                description=None,
                is_active=True,
                created_by=SYSTEM_USER,
                updated_by=SYSTEM_USER,
            )

            db.add(legal_status)

            print(f"Legal status created: {code} - {name}")

        await db.commit()

    print("Legal status seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_legal_statuses())
