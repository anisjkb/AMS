import asyncio

from sqlalchemy import text

from app.db.session import engine


async def check_database():
    async with engine.begin() as conn:
        result = await conn.execute(
            text(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema='public'
                ORDER BY table_name;
                """
            )
        )

        print("\n========== DATABASE TABLES ==========\n")

        tables = result.fetchall()

        for table in tables:
            print(table[0])

        print(f"\nTotal Tables : {len(tables)}")
        print("\nDatabase Connection OK ✅")


if __name__ == "__main__":
    asyncio.run(check_database())