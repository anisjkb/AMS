import asyncio

from app.db.session import AsyncSessionLocal
from app.repositories.rbac_repository import RBACRepository
from app.repositories.user_repository import UserRepository

INITIAL_PERMISSIONS = [
    {
        "permission_key": "menu.company.view",
        "resource_type": "menu",
        "resource_key": "company",
        "action": "view",
        "description": "View company menu",
    },
    {
        "permission_key": "button.company.create",
        "resource_type": "button",
        "resource_key": "company",
        "action": "create",
        "description": "Show create company button",
    },
    {
        "permission_key": "api.company.create",
        "resource_type": "api",
        "resource_key": "company",
        "action": "create",
        "description": "Create company API access",
    },
]


async def seed_rbac():
    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        rbac_repo = RBACRepository(db)

        super_admin = await user_repo.get_by_user_id("admin")

        if not super_admin:
            print("Super admin user not found.")
            return

        role = await rbac_repo.get_role_by_name("Super Admin")

        if not role:
            role = await rbac_repo.create_role(
                role_name="Super Admin",
                description="Full system access",
                created_by="system",
            )
            print("Super Admin role created.")
        else:
            print("Super Admin role already exists.")

        await rbac_repo.assign_role_to_user(
            user=super_admin,
            role=role,
            created_by="system",
        )

        print("Super Admin role assigned to admin user.")

        for item in INITIAL_PERMISSIONS:
            permission = await rbac_repo.get_permission_by_key(item["permission_key"])

            if not permission:
                permission = await rbac_repo.create_permission(
                    permission_key=item["permission_key"],
                    resource_type=item["resource_type"],
                    resource_key=item["resource_key"],
                    action=item["action"],
                    description=item["description"],
                    created_by="system",
                )
                print(f"Permission created: {item['permission_key']}")
            else:
                print(f"Permission already exists: {item['permission_key']}")

            await rbac_repo.assign_permission_to_role(
                role=role,
                permission=permission,
                created_by="system",
            )

        print("RBAC seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_rbac())
