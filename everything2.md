চলো আগাই।

## Step 1: `app/models/permission.py` update

পুরো file replace করো:

```python
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, UUIDPrimaryKeyMixin


class Permission(UUIDPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "permissions"

    permission_key: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    resource_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    resource_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
```

---

## Step 2: Migration generate

```powershell
alembic revision --autogenerate -m "extend permission resource fields"
```

---

## Step 3: Generated migration file edit করো

নতুন migration file খুলে `upgrade()` এ এমন রাখো:

```python
def upgrade() -> None:
    op.add_column("permissions", sa.Column("resource_key", sa.String(length=100), nullable=True))
    op.add_column("permissions", sa.Column("action", sa.String(length=30), nullable=True))

    op.execute("""
        UPDATE permissions
        SET
            resource_key = CASE
                WHEN permission_key = 'company.create' THEN 'company'
                WHEN permission_key = 'company.view' THEN 'company'
                ELSE split_part(permission_key, '.', 1)
            END,
            action = CASE
                WHEN permission_key = 'company.create' THEN 'create'
                WHEN permission_key = 'company.view' THEN 'view'
                ELSE split_part(permission_key, '.', 2)
            END
        WHERE resource_key IS NULL OR action IS NULL
    """)

    op.alter_column("permissions", "resource_key", nullable=False)
    op.alter_column("permissions", "action", nullable=False)
```

`downgrade()` এ:

```python
def downgrade() -> None:
    op.drop_column("permissions", "action")
    op.drop_column("permissions", "resource_key")
```

---

## Step 4: Migration apply

```powershell
alembic upgrade head
```

---

## Step 5: `app/repositories/rbac_repository.py` update

`create_permission()` method replace করো:

```python
    async def create_permission(
        self,
        permission_key: str,
        resource_type: str,
        resource_key: str,
        action: str,
        description: str | None = None,
        created_by: str | None = None,
    ) -> Permission:
        permission = Permission(
            permission_key=permission_key,
            resource_type=resource_type,
            resource_key=resource_key,
            action=action,
            description=description,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )
        self.db.add(permission)
        await self.db.commit()
        await self.db.refresh(permission)
        return permission
```

---

## Step 6: `scripts/seed_rbac.py` replace করো

```python
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
            permission = await rbac_repo.get_permission_by_key(
                item["permission_key"]
            )

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
```

---

## Step 7: Company API permission update

File:

```text
app/api/v1/companies.py
```

Change:

```python
require_permission("company.create")
```

to:

```python
require_permission("api.company.create")
```

---

## Step 8: Create `/me/permissions`

File তৈরি করো:

```text
app/api/v1/me.py
```

```python
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user import User
from app.models.user_role import UserRole

router = APIRouter(prefix="/me", tags=["Current User"])


@router.get("/permissions")
async def my_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            Permission.permission_key,
            Permission.resource_type,
            Permission.resource_key,
            Permission.action,
        )
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(UserRole, UserRole.role_id == RolePermission.role_id)
        .where(
            UserRole.user_id == current_user.id,
            UserRole.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.is_active == True,  # noqa: E712
        )
        .order_by(Permission.resource_type, Permission.resource_key, Permission.action)
    )

    result = await db.execute(stmt)

    permissions = [
        {
            "permission_key": row.permission_key,
            "resource_type": row.resource_type,
            "resource_key": row.resource_key,
            "action": row.action,
        }
        for row in result
    ]

    return {
        "user_id": current_user.user_id,
        "permissions": permissions,
    }
```

---

## Step 9: Router update

File:

```text
app/api/v1/router.py
```

Add import:

```python
from app.api.v1.me import router as me_router
```

Add include:

```python
api_router.include_router(me_router)
```

---

## Step 10: Run

```powershell
alembic upgrade head
python -m scripts.seed_rbac
uvicorn main:app --reload
```

Then test:

```text
GET /api/v1/me/permissions
POST /api/v1/companies
```

Expected `/me/permissions` এ থাকবে:

```json
{
  "permission_key": "menu.company.view",
  "resource_type": "menu",
  "resource_key": "company",
  "action": "view"
}
```

અને

```json
{
  "permission_key": "api.company.create",
  "resource_type": "api",
  "resource_key": "company",
  "action": "create"
}
```

Output পাঠাও।


Perfect ✅

Cleanup successful. এখন AMS permission response clean:

```text
api.company.create
button.company.create
menu.company.view
```

এটাই final universal permission format.

## Current Status

* ✅ RBAC tables ready
* ✅ Super Admin role seeded
* ✅ User-role assigned
* ✅ Role-permission assigned
* ✅ `@require_permission()` working
* ✅ Protected company API working
* ✅ `/me/permissions` working
* ✅ Legacy permissions inactive

Next step: **Git commit + documentation update** so এই milestone হারিয়ে না যায়.
