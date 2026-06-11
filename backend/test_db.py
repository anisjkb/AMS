import asyncio

from sqlalchemy import text

from app.db.session import engine


async def clean_legacy_permissions():
    async with engine.begin() as conn:
        await conn.execute(text("""
                UPDATE permissions
                SET is_active = false,
                    updated_by = 'system',
                    updated_at = NOW()
                WHERE permission_key IN ('company.create', 'company.view');
            """))

        result = await conn.execute(text("""
                SELECT permission_key, resource_type, resource_key, action, is_active
                FROM permissions
                ORDER BY permission_key;
            """))

        for row in result:
            print(row)


if __name__ == "__main__":
    asyncio.run(clean_legacy_permissions())
