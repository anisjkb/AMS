হ্যাঁ, তোমার ধারণা **100% correct** ✅
Core Audit Business Module শুরু করার আগে **Security / RBAC / Menu Permission portion complete করা উচিত**।

কারণ Audit Universe, Audit Plan, Audit Program, Working Paper, Findings, Reports — এগুলোতে permission অনেক deep হবে:

```text
Who can view?
Who can create?
Who can edit?
Who can approve?
Who can assign?
Who can submit?
Who can review?
Who can delete?
Who can export?
```

Security foundation clear না থাকলে পরে প্রতিটি audit module-এ permission rework করতে হবে।

## Recommended next phase

এটার নাম দিই:

```text
Security & Access Control Module
```

এই module-এর মধ্যে থাকবে:

```text
1. Users Management
2. Roles Management
3. Permissions Management
4. User Role Assignment
5. Role Permission Assignment
6. Navigation Groups Management
7. Menus Management
8. Menu Permissions
9. Menu Actions
10. Menu Action Permissions
11. Permission-based Sidebar
12. Permission-based Page Action Buttons
```

তোমার listed tables ঠিকই security foundation:

```text
navigation_groups
menus
menu_actions
menu_action_permissions
menu_permissions
permissions
roles
role_permissions
user_roles
users
```

## Best development order

প্রথমে backend/frontend দুই পাশে এই order follow করব:

```text
1. Users
2. Roles
3. Permissions
4. User Roles
5. Role Permissions
6. Navigation Groups
7. Menus
8. Menu Permissions
9. Menu Actions
10. Menu Action Permissions
```

## Minimum security completion before Audit Universe

Audit Universe শুরু করার আগে অন্তত এগুলো complete থাকা দরকার:

```text
✅ User create/edit/inactive/restore
✅ Role create/edit/inactive/restore
✅ Assign roles to user
✅ Assign permissions to role
✅ Menu create/edit/order/group mapping
✅ Menu permission mapping
✅ Menu action permission mapping
✅ Frontend permission-based action buttons fully working
```

আমাদের `PageActionBar` আর row action RBAC already use হচ্ছে, কিন্তু এখন security module UI থাকলে admin নিজে permission manage করতে পারবে। তখন Audit module-এ নতুন permission add করা easy হবে।

## আমার recommendation

Core Audit Business Module এখনই শুরু না করে আগে:

```text
Security & Access Control Module
```

finish করি।

Next step: তুমি backend-এর current security files upload করো:

```text
models:
user.py
role.py
permission.py
user_role.py
role_permission.py
navigation_group.py
menu.py
menu_permission.py
menu_action.py
menu_action_permission.py

schemas:
user.py
role.py
permission.py
navigation.py/menu related schemas

repositories:
user/role/permission/navigation/menu repositories

api/v1:
users.py
roles.py
permissions.py
menus.py
navigation related route files
```

আমি আগে existing code check করব, তারপর Security module-এর clean frontend/backend plan দেব।
হ্যাঁ, তোমার ধারণা **100% correct** ✅
Core Audit Business Module শুরু করার আগে **Security / RBAC / Menu Permission portion complete করা উচিত**।

কারণ Audit Universe, Audit Plan, Audit Program, Working Paper, Findings, Reports — এগুলোতে permission অনেক deep হবে:

```text
Who can view?
Who can create?
Who can edit?
Who can approve?
Who can assign?
Who can submit?
Who can review?
Who can delete?
Who can export?
```

Security foundation clear না থাকলে পরে প্রতিটি audit module-এ permission rework করতে হবে।

## Recommended next phase

এটার নাম দিই:

```text
Security & Access Control Module
```

এই module-এর মধ্যে থাকবে:

```text
1. Users Management
2. Roles Management
3. Permissions Management
4. User Role Assignment
5. Role Permission Assignment
6. Navigation Groups Management
7. Menus Management
8. Menu Permissions
9. Menu Actions
10. Menu Action Permissions
11. Permission-based Sidebar
12. Permission-based Page Action Buttons
```

তোমার listed tables ঠিকই security foundation:

```text
navigation_groups
menus
menu_actions
menu_action_permissions
menu_permissions
permissions
roles
role_permissions
user_roles
users
```

## Best development order

প্রথমে backend/frontend দুই পাশে এই order follow করব:

```text
1. Users
2. Roles
3. Permissions
4. User Roles
5. Role Permissions
6. Navigation Groups
7. Menus
8. Menu Permissions
9. Menu Actions
10. Menu Action Permissions
```

## Minimum security completion before Audit Universe

Audit Universe শুরু করার আগে অন্তত এগুলো complete থাকা দরকার:

```text
✅ User create/edit/inactive/restore
✅ Role create/edit/inactive/restore
✅ Assign roles to user
✅ Assign permissions to role
✅ Menu create/edit/order/group mapping
✅ Menu permission mapping
✅ Menu action permission mapping
✅ Frontend permission-based action buttons fully working
```

আমাদের `PageActionBar` আর row action RBAC already use হচ্ছে, কিন্তু এখন security module UI থাকলে admin নিজে permission manage করতে পারবে। তখন Audit module-এ নতুন permission add করা easy হবে।

## আমার recommendation

Core Audit Business Module এখনই শুরু না করে আগে:

```text
Security & Access Control Module
```

finish করি।

Next step: তুমি backend-এর current security files upload করো:

```text
models:
user.py
role.py
permission.py
user_role.py
role_permission.py
navigation_group.py
menu.py
menu_permission.py
menu_action.py
menu_action_permission.py

schemas:
user.py
role.py
permission.py
navigation.py/menu related schemas

repositories:
user/role/permission/navigation/menu repositories

api/v1:
users.py
roles.py
permissions.py
menus.py
navigation related route files
```

আমি আগে existing code check করব, তারপর Security module-এর clean frontend/backend plan দেব।
হ্যাঁ, uploaded files check করে Security module-এর current status পরিষ্কার হলো ✅

## Current existing foundation

তোমার **models প্রায় সব আছে**:

```text
✅ users
✅ roles
✅ permissions
✅ user_roles
✅ role_permissions
✅ navigation_groups
✅ menus
✅ menu_permissions
✅ menu_actions
✅ menu_action_permissions
```

`Menu`, `MenuAction`, `NavigationGroup`, `Permission`, `Role`, `User`, mapping tables সব model level-এ already আছে।      

Auth login/refresh আছে, আর `/users/me` আছে।  

Dynamic navigation already permission-based কাজ করছে। Current navigation repository user role → role permission → permission key ধরে menu/action filter করছে। 

## Missing parts

এখনো Security module-এর **admin management CRUD/UI** নেই।

Missing backend parts:

```text
❌ roles CRUD API
❌ permissions CRUD API
❌ users list/create/update/inactive/restore API
❌ assign role to user API
❌ assign permission to role API
❌ navigation group CRUD API
❌ menu CRUD API
❌ menu action CRUD API
❌ menu permission mapping API
❌ menu action permission mapping API
```

Current `UserRepository` শুধু basic `get/create_user` পর্যন্ত আছে। Full list/update/inactive/restore নেই। 
Current `RBACRepository` role/permission create এবং assign support করে, কিন্তু admin CRUD/list/remove/update এখনো নেই। 
Current user schema-তে শুধু `UserMeResponse` আছে; full `UserCreate`, `UserUpdate`, `UserListResponse` নেই। 

## My recommendation

Core Audit module শুরু করার আগে Security module complete করাই best decision.

Development order হবে:

```text
1. Roles Management
2. Permissions Management
3. Users Management
4. User Role Assignment
5. Role Permission Assignment
6. Navigation Groups Management
7. Menus Management
8. Menu Actions Management
9. Menu Permission Mapping
10. Menu Action Permission Mapping
```

তবে practicalভাবে প্রথমে বানাব:

```text
Security Phase 1:
Roles + Permissions + Users + UserRole + RolePermission
```

কারণ এগুলো ছাড়া admin user নিজে permission manage করতে পারবে না।

তারপর:

```text
Security Phase 2:
Navigation Groups + Menus + Menu Actions + Menu Permission Mapping
```

## Important architecture decision

`users` table-এর ক্ষেত্রে আমি permanent delete recommend করি না। কারণ audit fields-এ `created_by`, `updated_by` future records-এর সাথে linked থাকবে। User delete করলে audit history weak হবে।

Best rule:

```text
Users: Inactive / Restore only
Roles: Inactive / Restore / Permanent delete only if no assigned users
Permissions: Inactive / Restore / Permanent delete only if no role mapping
Menus/Menu Actions: Inactive / Restore / Permanent delete only if no mapping
```

## Next step

আমরা এখন **Security Phase 1 backend** শুরু করব।

প্রথম module হিসেবে আমি recommend করছি:

```text
Roles Management
```

কারণ Role ছাড়া User Role Assignment এবং Permission Assignment হবে না।

Next আমি দেব:

```text
backend/app/schemas/role.py
backend/app/repositories/role_repository.py
backend/app/services/role/
backend/app/api/v1/roles.py
main/router include check
permission seed requirement
frontend roles page
```

Role module complete হলে Permission module, তারপর User module.
চেক করলাম ✅ Additional files দিয়েও Security CRUD এখনো নেই।

Current backend router-এ registered আছে শুধু:

```text
health
auth
users
companies
me
branches
departments
designations
employees
```

`roles`, `permissions`, `menus`, `navigation-groups`, `menu-actions`, `user-roles`, `role-permissions` — এগুলোর API router এখনো include করা নেই। 

Current `users.py`-তেও শুধু `/users/me` আছে; user list/create/update/inactive/restore API নেই। 

ভালো দিক হলো `/me/permissions` এবং `/me/navigation` আছে, তাই frontend permission-based sidebar/action already supported. 
আর master modules যেমন Company/Branch/Department/Designation/Employee সব already `require_permission(...)` দিয়ে protected আছে।

## Final check result

Existing:

```text
✅ Auth login / refresh
✅ /me/permissions
✅ /me/navigation
✅ Users model
✅ Roles model
✅ Permissions model
✅ UserRole model
✅ RolePermission model
✅ NavigationGroup model
✅ Menu model
✅ MenuAction model
✅ MenuPermission model
✅ MenuActionPermission model
✅ RBAC repository basic assign/create support
```

Missing:

```text
❌ Roles CRUD API
❌ Permissions CRUD API
❌ Users Management API
❌ User Role Assignment API
❌ Role Permission Assignment API
❌ Navigation Group CRUD API
❌ Menu CRUD API
❌ Menu Action CRUD API
❌ Menu Permission Mapping API
❌ Menu Action Permission Mapping API
❌ Frontend Security pages
```

## Best next order

আমরা এখন **Security Phase 1** শুরু করব:

```text
1. Roles Management
2. Permissions Management
3. Users Management
4. Assign Roles to User
5. Assign Permissions to Role
```

তারপর **Security Phase 2**:

```text
6. Navigation Groups
7. Menus
8. Menu Actions
9. Menu Permission Mapping
10. Menu Action Permission Mapping
```

আমার recommendation: প্রথমে **Roles Management** করি, কারণ Role ছাড়া User Role Assignment বা Role Permission Assignment clean হবে না.

Next আমি Roles module-এর backend দেব: schema, repository, service, API route, router include, তারপর frontend `/roles` page.
ঠিক আছে, তাহলে আমরা **Security Phase 1 → Roles Management backend** শুরু করছি।

তোমার `roles` model already আছে, কিন্তু API router-এ roles এখনো include করা নেই এবং current `router.py` শুধু auth/users/company/branch/department/designation/employee include করছে। 
`Role` model-এ `role_name` আর `description` আছে, তাই এখন migration লাগবে না। 

## Step 1: Role schema + repository

নিচের ২টা file create/replace করো।

```py
# E:\Audit\AMS\backend\app\schemas\role.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RoleBase(BaseModel):
    role_name: str = Field(..., min_length=2, max_length=100)
    description: str | None = None

    @field_validator("role_name")
    @classmethod
    def clean_role_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Role name is required.")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    role_name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = None

    @field_validator("role_name")
    @classmethod
    def clean_role_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Role name cannot be empty.")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role_name: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class RoleListResponse(BaseModel):
    items: list[RoleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RoleMessageResponse(BaseModel):
    message: str
    data: RoleResponse | None = None
```

```py
# E:\Audit\AMS\backend\app\repositories\role_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole


class RoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[Role], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Role.role_name.ilike(search_text),
                    Role.description.ilike(search_text),
                )
            )

        if is_active is not None:
            conditions.append(Role.is_active == is_active)

        count_stmt = select(func.count()).select_from(Role)
        query = select(Role)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": Role.id,
            "role_name": Role.role_name,
            "is_active": Role.is_active,
            "created_at": Role.created_at,
            "updated_at": Role.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Role.id)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        roles = list(result.scalars().all())

        return roles, total

    async def get_by_id(self, role_id: int) -> Role | None:
        result = await self.db.execute(
            select(Role).where(Role.id == role_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, role_name: str) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                func.lower(Role.role_name) == role_name.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        role_name: str,
        description: str | None,
        created_by: str,
    ) -> Role:
        role = Role(
            role_name=role_name,
            description=description,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def update(
        self,
        role: Role,
        role_name: str | None,
        description: str | None,
        updated_by: str,
    ) -> Role:
        if role_name is not None:
            role.role_name = role_name

        role.description = description
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def deactivate(
        self,
        role: Role,
        updated_by: str,
    ) -> Role:
        role.is_active = False
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def restore(
        self,
        role: Role,
        updated_by: str,
    ) -> Role:
        role.is_active = True
        role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role)

        return role

    async def count_user_roles(self, role_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(UserRole).where(
                UserRole.role_id == role_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_role_permissions(self, role_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(RolePermission).where(
                RolePermission.role_id == role_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, role: Role) -> None:
        await self.db.delete(role)
        await self.db.commit()
```

## Step 2: Role service

Folder না থাকলে create করো:

```powershell
New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\role
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\role\__init__.py
```

তারপর এই file create করো।

```py
# E:\Audit\AMS\backend\app\services\role\role_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.role_repository import RoleRepository
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    def __init__(self, db: AsyncSession):
        self.repository = RoleRepository(db)

    async def list_roles(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ):
        roles, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": roles,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_role(self, role_id: int):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        return role

    async def create_role(
        self,
        payload: RoleCreate,
        created_by: str,
    ):
        existing_role = await self.repository.get_by_name(payload.role_name)

        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists.",
            )

        role = await self.repository.create(
            role_name=payload.role_name,
            description=payload.description,
            created_by=created_by,
        )

        return {
            "message": "Role created successfully.",
            "data": role,
        }

    async def update_role(
        self,
        role_id: int,
        payload: RoleUpdate,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if payload.role_name is not None:
            existing_role = await self.repository.get_by_name(payload.role_name)

            if existing_role and existing_role.id != role.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role name already exists.",
                )

        updated_role = await self.repository.update(
            role=role,
            role_name=payload.role_name,
            description=payload.description,
            updated_by=updated_by,
        )

        return {
            "message": "Role updated successfully.",
            "data": updated_role,
        }

    async def deactivate_role(
        self,
        role_id: int,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if not role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is already inactive.",
            )

        updated_role = await self.repository.deactivate(
            role=role,
            updated_by=updated_by,
        )

        return {
            "message": "Role deactivated successfully.",
            "data": updated_role,
        }

    async def restore_role(
        self,
        role_id: int,
        updated_by: str,
    ):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is already active.",
            )

        updated_role = await self.repository.restore(
            role=role,
            updated_by=updated_by,
        )

        return {
            "message": "Role restored successfully.",
            "data": updated_role,
        }

    async def permanent_delete_role(self, role_id: int):
        role = await self.repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        user_role_count = await self.repository.count_user_roles(role_id)
        role_permission_count = await self.repository.count_role_permissions(role_id)

        if user_role_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role is assigned to user(s). Remove user role assignments first.",
            )

        if role_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role has permission assignments. Remove role permissions first.",
            )

        await self.repository.permanent_delete(role)

        return {
            "message": "Role permanently deleted successfully.",
            "data": None,
        }
```

## Step 3: Role API + router include

```py
# E:\Audit\AMS\backend\app\api\v1\roles.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleListResponse,
    RoleMessageResponse,
    RoleResponse,
    RoleUpdate,
)
from app.services.role.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=RoleListResponse)
async def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role.view")),
):
    service = RoleService(db)
    return await service.list_roles(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role.view")),
):
    service = RoleService(db)
    return await service.get_role(role_id)


@router.post(
    "",
    response_model=RoleMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.create")),
):
    service = RoleService(db)
    return await service.create_role(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{role_id}", response_model=RoleMessageResponse)
async def update_role(
    role_id: int,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.update")),
):
    service = RoleService(db)
    return await service.update_role(
        role_id=role_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{role_id}", response_model=RoleMessageResponse)
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.delete")),
):
    service = RoleService(db)
    return await service.deactivate_role(
        role_id=role_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{role_id}/restore", response_model=RoleMessageResponse)
async def restore_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.restore")),
):
    service = RoleService(db)
    return await service.restore_role(
        role_id=role_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{role_id}/permanent", response_model=RoleMessageResponse)
async def permanent_delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role.permanent_delete")),
):
    service = RoleService(db)
    return await service.permanent_delete_role(role_id)
```

```py
# E:\Audit\AMS\backend\app\api\v1\router.py

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.companies import router as companies_router
from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.me import router as me_router
from app.api.v1.branches import router as branches_router
from app.api.v1.departments import router as departments_router
from app.api.v1.designations import router as designations_router
from app.api.v1.employees import router as employees_router
from app.api.v1.roles import router as roles_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(companies_router)
api_router.include_router(me_router)
api_router.include_router(branches_router)
api_router.include_router(departments_router)
api_router.include_router(designations_router)
api_router.include_router(employees_router)
api_router.include_router(roles_router)
```

## Step 4: Test command

Backend terminal-এ চালাও:

```powershell
cd E:\Audit\AMS\backend
python -m compileall app
```

তারপর server restart করে Swagger/OpenAPI check:

```powershell
uvicorn main:app --reload
```

Browser:

```text
http://127.0.0.1:8000/docs
```

Expected route:

```text
GET     /api/v1/roles
GET     /api/v1/roles/{role_id}
POST    /api/v1/roles
PATCH   /api/v1/roles/{role_id}
DELETE  /api/v1/roles/{role_id}
PATCH   /api/v1/roles/{role_id}/restore
DELETE  /api/v1/roles/{role_id}/permanent
```

Role module backend pass করলে next আমরা **Role permissions seed + frontend `/roles` page** করব।
