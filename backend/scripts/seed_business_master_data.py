import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.business_master import (
    BusinessIndustry,
    BusinessNature,
    BusinessSector,
)


SYSTEM_USER = "system"


BUSINESS_NATURES = [
    {
        "nature_code": "01",
        "nature_name": "Manufacturing",
        "description": "Businesses engaged in production, processing, or manufacturing activities.",
    },
    {
        "nature_code": "02",
        "nature_name": "Trading",
        "description": "Businesses engaged in wholesale, retail, distribution, or trading activities.",
    },
    {
        "nature_code": "03",
        "nature_name": "Service",
        "description": "Businesses engaged in service-based commercial activities.",
    },
]


BUSINESS_SECTORS = [
    {
        "nature_code": "01",
        "sector_code": "0101",
        "sector_name": "Textiles",
        "description": "Textile manufacturing and related activities.",
    },
    {
        "nature_code": "01",
        "sector_code": "0102",
        "sector_name": "Food & Allied",
        "description": "Food processing and allied manufacturing activities.",
    },
    {
        "nature_code": "01",
        "sector_code": "0103",
        "sector_name": "Chemicals",
        "description": "Chemical manufacturing and related industrial activities.",
    },
    {
        "nature_code": "02",
        "sector_code": "0201",
        "sector_name": "Wholesale Trade",
        "description": "Wholesale trading and distribution activities.",
    },
    {
        "nature_code": "02",
        "sector_code": "0202",
        "sector_name": "Retail Trade",
        "description": "Retail trading and sales activities.",
    },
    {
        "nature_code": "03",
        "sector_code": "0301",
        "sector_name": "IT & Software Services",
        "description": "Information technology and software service activities.",
    },
    {
        "nature_code": "03",
        "sector_code": "0302",
        "sector_name": "Transport & Logistics",
        "description": "Transport, logistics, and related service activities.",
    },
]


BUSINESS_INDUSTRIES = [
    {
        "sector_code": "0101",
        "industry_code": "0101001",
        "industry_name": "Spinning",
        "description": "Spinning industry under textiles sector.",
    },
    {
        "sector_code": "0101",
        "industry_code": "0101002",
        "industry_name": "Weaving",
        "description": "Weaving industry under textiles sector.",
    },
    {
        "sector_code": "0101",
        "industry_code": "0101003",
        "industry_name": "Garments & Apparels",
        "description": "Garments and apparels industry under textiles sector.",
    },
    {
        "sector_code": "0102",
        "industry_code": "0102001",
        "industry_name": "Food Processing",
        "description": "Food processing industry under food and allied sector.",
    },
    {
        "sector_code": "0103",
        "industry_code": "0103001",
        "industry_name": "Basic Chemicals",
        "description": "Basic chemicals industry under chemicals sector.",
    },
    {
        "sector_code": "0201",
        "industry_code": "0201001",
        "industry_name": "Consumer Goods Wholesale",
        "description": "Consumer goods wholesale industry under wholesale trade sector.",
    },
    {
        "sector_code": "0301",
        "industry_code": "0301001",
        "industry_name": "Software Development",
        "description": "Software development industry under IT and software services sector.",
    },
    {
        "sector_code": "0301",
        "industry_code": "0301002",
        "industry_name": "IT Consulting",
        "description": "IT consulting industry under IT and software services sector.",
    },
]


async def get_nature_by_code(db, nature_code: str) -> BusinessNature | None:
    result = await db.execute(
        select(BusinessNature).where(BusinessNature.nature_code == nature_code)
    )
    return result.scalar_one_or_none()


async def get_sector_by_code(db, sector_code: str) -> BusinessSector | None:
    result = await db.execute(
        select(BusinessSector).where(BusinessSector.sector_code == sector_code)
    )
    return result.scalar_one_or_none()


async def seed_business_natures(db) -> None:
    for item in BUSINESS_NATURES:
        existing = await get_nature_by_code(db, item["nature_code"])

        if existing:
            existing.nature_name = item["nature_name"]
            existing.description = item["description"]
            existing.is_active = True
            existing.updated_by = SYSTEM_USER

            print(f"Business nature updated: {item['nature_code']} - {item['nature_name']}")
            continue

        nature = BusinessNature(
            nature_code=item["nature_code"],
            nature_name=item["nature_name"],
            description=item["description"],
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )

        db.add(nature)
        print(f"Business nature created: {item['nature_code']} - {item['nature_name']}")

    await db.flush()


async def seed_business_sectors(db) -> None:
    for item in BUSINESS_SECTORS:
        nature = await get_nature_by_code(db, item["nature_code"])

        if not nature:
            raise RuntimeError(f"Business nature not found: {item['nature_code']}")

        existing = await get_sector_by_code(db, item["sector_code"])

        if existing:
            existing.nature_id = nature.id
            existing.sector_name = item["sector_name"]
            existing.description = item["description"]
            existing.is_active = True
            existing.updated_by = SYSTEM_USER

            print(f"Business sector updated: {item['sector_code']} - {item['sector_name']}")
            continue

        sector = BusinessSector(
            nature_id=nature.id,
            sector_code=item["sector_code"],
            sector_name=item["sector_name"],
            description=item["description"],
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )

        db.add(sector)
        print(f"Business sector created: {item['sector_code']} - {item['sector_name']}")

    await db.flush()


async def seed_business_industries(db) -> None:
    for item in BUSINESS_INDUSTRIES:
        sector = await get_sector_by_code(db, item["sector_code"])

        if not sector:
            raise RuntimeError(f"Business sector not found: {item['sector_code']}")

        result = await db.execute(
            select(BusinessIndustry).where(
                BusinessIndustry.industry_code == item["industry_code"]
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.sector_id = sector.id
            existing.industry_name = item["industry_name"]
            existing.description = item["description"]
            existing.is_active = True
            existing.updated_by = SYSTEM_USER

            print(
                f"Business industry updated: "
                f"{item['industry_code']} - {item['industry_name']}"
            )
            continue

        industry = BusinessIndustry(
            sector_id=sector.id,
            industry_code=item["industry_code"],
            industry_name=item["industry_name"],
            description=item["description"],
            is_active=True,
            created_by=SYSTEM_USER,
            updated_by=SYSTEM_USER,
        )

        db.add(industry)
        print(
            f"Business industry created: "
            f"{item['industry_code']} - {item['industry_name']}"
        )

    await db.flush()


async def seed_business_master_data() -> None:
    async with AsyncSessionLocal() as db:
        await seed_business_natures(db)
        await seed_business_sectors(db)
        await seed_business_industries(db)

        await db.commit()

    print("Business master data seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_business_master_data())
