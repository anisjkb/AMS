import asyncio

from sqlalchemy import text

from app.db.session import engine


async def check_users():
    async with engine.begin() as conn:
        result = await conn.execute(text("""
                SELECT user_id, email, full_name, is_superuser
                FROM users
                ORDER BY created_at;
            """))

        print("Users:")
        for row in result:
            print(row)


if __name__ == "__main__":
    asyncio.run(check_users())
