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
    {
        "permission_key": "api.company.update",
        "resource_type": "api",
        "resource_key": "company",
        "action": "update",
        "description": "Update company API access",
    },
    {
        "permission_key": "button.company.update",
        "resource_type": "button",
        "resource_key": "company",
        "action": "update",
        "description": "Show update company button",
    },
    {
    "permission_key": "api.company.delete",
    "resource_type": "api",
    "resource_key": "company",
    "action": "delete",
    "description": "Deactivate company API access",
},
{
    "permission_key": "api.company.restore",
    "resource_type": "api",
    "resource_key": "company",
    "action": "restore",
    "description": "Restore company API access",
},
{
    "permission_key": "api.company.permanent_delete",
    "resource_type": "api",
    "resource_key": "company",
    "action": "permanent_delete",
    "description": "Permanent delete company API access",
},
{
    "permission_key": "button.company.delete",
    "resource_type": "button",
    "resource_key": "company",
    "action": "delete",
    "description": "Show delete company button",
},
{
    "permission_key": "button.company.restore",
    "resource_type": "button",
    "resource_key": "company",
    "action": "restore",
    "description": "Show restore company button",
},
{
    "permission_key": "button.company.permanent_delete",
    "resource_type": "button",
    "resource_key": "company",
    "action": "permanent_delete",
    "description": "Show permanent delete company button",
},
{
    "permission_key": "menu.branch.view",
    "resource_type": "menu",
    "resource_key": "branch",
    "action": "view",
    "description": "View branch menu",
},
{
    "permission_key": "api.branch.create",
    "resource_type": "api",
    "resource_key": "branch",
    "action": "create",
    "description": "Create branch API access",
},
{
    "permission_key": "api.branch.update",
    "resource_type": "api",
    "resource_key": "branch",
    "action": "update",
    "description": "Update branch API access",
},
{
    "permission_key": "api.branch.delete",
    "resource_type": "api",
    "resource_key": "branch",
    "action": "delete",
    "description": "Deactivate branch API access",
},
{
    "permission_key": "api.branch.restore",
    "resource_type": "api",
    "resource_key": "branch",
    "action": "restore",
    "description": "Restore branch API access",
},
{
    "permission_key": "api.branch.permanent_delete",
    "resource_type": "api",
    "resource_key": "branch",
    "action": "permanent_delete",
    "description": "Permanent delete branch API access",
},
{
    "permission_key": "button.branch.create",
    "resource_type": "button",
    "resource_key": "branch",
    "action": "create",
    "description": "Show create branch button",
},
{
    "permission_key": "button.branch.update",
    "resource_type": "button",
    "resource_key": "branch",
    "action": "update",
    "description": "Show update branch button",
},
{
    "permission_key": "button.branch.delete",
    "resource_type": "button",
    "resource_key": "branch",
    "action": "delete",
    "description": "Show delete branch button",
},
{
    "permission_key": "button.branch.restore",
    "resource_type": "button",
    "resource_key": "branch",
    "action": "restore",
    "description": "Show restore branch button",
},
{
    "permission_key": "button.branch.permanent_delete",
    "resource_type": "button",
    "resource_key": "branch",
    "action": "permanent_delete",
    "description": "Show permanent delete branch button",
},
{
    "permission_key": "menu.department.view",
    "resource_type": "menu",
    "resource_key": "department",
    "action": "view",
    "description": "View department menu",
},
{
    "permission_key": "api.department.create",
    "resource_type": "api",
    "resource_key": "department",
    "action": "create",
    "description": "Create department API access",
},
{
    "permission_key": "api.department.update",
    "resource_type": "api",
    "resource_key": "department",
    "action": "update",
    "description": "Update department API access",
},
{
    "permission_key": "api.department.delete",
    "resource_type": "api",
    "resource_key": "department",
    "action": "delete",
    "description": "Deactivate department API access",
},
{
    "permission_key": "api.department.restore",
    "resource_type": "api",
    "resource_key": "department",
    "action": "restore",
    "description": "Restore department API access",
},
{
    "permission_key": "api.department.permanent_delete",
    "resource_type": "api",
    "resource_key": "department",
    "action": "permanent_delete",
    "description": "Permanent delete department API access",
},
{
    "permission_key": "button.department.create",
    "resource_type": "button",
    "resource_key": "department",
    "action": "create",
    "description": "Show create department button",
},
{
    "permission_key": "button.department.update",
    "resource_type": "button",
    "resource_key": "department",
    "action": "update",
    "description": "Show update department button",
},
{
    "permission_key": "button.department.delete",
    "resource_type": "button",
    "resource_key": "department",
    "action": "delete",
    "description": "Show delete department button",
},
{
    "permission_key": "button.department.restore",
    "resource_type": "button",
    "resource_key": "department",
    "action": "restore",
    "description": "Show restore department button",
},
{
    "permission_key": "button.department.permanent_delete",
    "resource_type": "button",
    "resource_key": "department",
    "action": "permanent_delete",
    "description": "Show permanent delete department button",
},
{
    "permission_key": "menu.designation.view",
    "resource_type": "menu",
    "resource_key": "designation",
    "action": "view",
    "description": "View designation menu",
},
{
    "permission_key": "api.designation.create",
    "resource_type": "api",
    "resource_key": "designation",
    "action": "create",
    "description": "Create designation API access",
},
{
    "permission_key": "api.designation.update",
    "resource_type": "api",
    "resource_key": "designation",
    "action": "update",
    "description": "Update designation API access",
},
{
    "permission_key": "api.designation.delete",
    "resource_type": "api",
    "resource_key": "designation",
    "action": "delete",
    "description": "Deactivate designation API access",
},
{
    "permission_key": "api.designation.restore",
    "resource_type": "api",
    "resource_key": "designation",
    "action": "restore",
    "description": "Restore designation API access",
},
{
    "permission_key": "api.designation.permanent_delete",
    "resource_type": "api",
    "resource_key": "designation",
    "action": "permanent_delete",
    "description": "Permanent delete designation API access",
},
{
    "permission_key": "button.designation.create",
    "resource_type": "button",
    "resource_key": "designation",
    "action": "create",
    "description": "Show create designation button",
},
{
    "permission_key": "button.designation.update",
    "resource_type": "button",
    "resource_key": "designation",
    "action": "update",
    "description": "Show update designation button",
},
{
    "permission_key": "button.designation.delete",
    "resource_type": "button",
    "resource_key": "designation",
    "action": "delete",
    "description": "Show delete designation button",
},
{
    "permission_key": "button.designation.restore",
    "resource_type": "button",
    "resource_key": "designation",
    "action": "restore",
    "description": "Show restore designation button",
},
{
    "permission_key": "button.designation.permanent_delete",
    "resource_type": "button",
    "resource_key": "designation",
    "action": "permanent_delete",
    "description": "Show permanent delete designation button",
},
{
    "permission_key": "menu.employee.view",
    "resource_type": "menu",
    "resource_key": "employee",
    "action": "view",
    "description": "View employee menu",
},
{
    "permission_key": "api.employee.create",
    "resource_type": "api",
    "resource_key": "employee",
    "action": "create",
    "description": "Create employee API access",
},
{
    "permission_key": "api.employee.update",
    "resource_type": "api",
    "resource_key": "employee",
    "action": "update",
    "description": "Update employee API access",
},
{
    "permission_key": "api.employee.delete",
    "resource_type": "api",
    "resource_key": "employee",
    "action": "delete",
    "description": "Deactivate employee API access",
},
{
    "permission_key": "api.employee.restore",
    "resource_type": "api",
    "resource_key": "employee",
    "action": "restore",
    "description": "Restore employee API access",
},
{
    "permission_key": "api.employee.permanent_delete",
    "resource_type": "api",
    "resource_key": "employee",
    "action": "permanent_delete",
    "description": "Permanent delete employee API access",
},
{
    "permission_key": "button.employee.create",
    "resource_type": "button",
    "resource_key": "employee",
    "action": "create",
    "description": "Show create employee button",
},
{
    "permission_key": "button.employee.update",
    "resource_type": "button",
    "resource_key": "employee",
    "action": "update",
    "description": "Show update employee button",
},
{
    "permission_key": "button.employee.delete",
    "resource_type": "button",
    "resource_key": "employee",
    "action": "delete",
    "description": "Show delete employee button",
},
{
    "permission_key": "button.employee.restore",
    "resource_type": "button",
    "resource_key": "employee",
    "action": "restore",
    "description": "Show restore employee button",
},
{
    "permission_key": "button.employee.permanent_delete",
    "resource_type": "button",
    "resource_key": "employee",
    "action": "permanent_delete",
    "description": "Show permanent delete employee button",
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
