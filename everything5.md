Great. এখন **Phase 5: Branch API + Router + Permissions**।

## Step 1: Create `app/api/v1/branches.py`

```python
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.branch import (
    BranchCreate,
    BranchListResponse,
    BranchMessageResponse,
    BranchResponse,
    BranchUpdate,
)
from app.services.branch.branch_service import BranchService

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.get("", response_model=BranchListResponse)
async def list_branches(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    company_id: int | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.branch.view")),
):
    service = BranchService(db)
    return await service.list_branches(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.branch.view")),
):
    service = BranchService(db)
    return await service.get_branch(branch_id)


@router.post(
    "",
    response_model=BranchMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_branch(
    payload: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.create")),
):
    service = BranchService(db)
    return await service.create_branch(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{branch_id}", response_model=BranchMessageResponse)
async def update_branch(
    branch_id: int,
    payload: BranchUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.update")),
):
    service = BranchService(db)
    return await service.update_branch(
        branch_id=branch_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{branch_id}", response_model=BranchMessageResponse)
async def delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.delete")),
):
    service = BranchService(db)
    return await service.deactivate_branch(
        branch_id=branch_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{branch_id}/restore", response_model=BranchMessageResponse)
async def restore_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.restore")),
):
    service = BranchService(db)
    return await service.restore_branch(
        branch_id=branch_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{branch_id}/permanent")
async def permanent_delete_branch(
    branch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.branch.permanent_delete")),
):
    service = BranchService(db)
    return await service.permanent_delete_branch(branch_id)
```

---

## Step 2: Update `app/api/v1/router.py`

Add import:

```python
from app.api.v1.branches import router as branches_router
```

Add include:

```python
api_router.include_router(branches_router)
```

---

## Step 3: Add Branch permissions in `scripts/seed_rbac.py`

Add these to `INITIAL_PERMISSIONS`:

```python
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
```

---

## Step 4: Run seed

```powershell
python -m scripts.seed_rbac
```

Send output.
লগ দেখে বোঝা যাচ্ছে **RBAC Seed 100% সফলভাবে সম্পন্ন হয়েছে।** 

## ✅ যা সফল হয়েছে

* Super Admin Role পাওয়া গেছে
* Admin user-এর সাথে Role assignment আছে
* আগের Company permissions verify হয়েছে
* নতুন Branch permissions create হয়েছে
* নতুন Branch permissions Super Admin Role-এ assign হয়েছে
* শেষে:

```text
RBAC seed completed.
```

দেখাচ্ছে, অর্থাৎ seed সফলভাবে শেষ হয়েছে। 

---

# এখন পরবর্তী কাজ (Branch Module Complete)

এখন API গুলো টেস্ট করতে হবে।

## 1. Create Branch

```
POST /api/v1/branches
```

Example:

```json
{
  "company_id": 1,
  "branch_name": "Dhaka Branch",
  "branch_email": "dhaka@company.com",
  "branch_phone": "01711111111",
  "branch_address": "Dhaka",
  "remarks": "Main Branch"
}
```

---

## 2. List Branch

```
GET /api/v1/branches
```

Support করবে:

```
?page=1
&page_size=20
&search=dhaka
&company_id=1
&is_active=true
&sort_by=id
&sort_order=asc
```

---

## 3. Branch Details

```
GET /api/v1/branches/1
```

---

## 4. Update

```
PATCH /api/v1/branches/1
```

Example:

```json
{
    "branch_name":"Dhaka Corporate Branch"
}
```

---

## 5. Soft Delete (Inactive)

```
DELETE /api/v1/branches/1
```

এটি record delete করবে না, শুধু

```
is_active = false
```

করবে।

---

## 6. Restore

```
PATCH /api/v1/branches/1/restore
```

---

## 7. Permanent Delete

```
DELETE /api/v1/branches/1/permanent
```

যার permission থাকবে সে permanently delete করতে পারবে।

---

# এরপরের Enterprise Milestone

Branch Module শেষ হলেই আমরা একই reusable architecture ব্যবহার করে নিচের hierarchy তৈরি করব:

```
Company
    ├── Branch
    │     ├── Department
    │     │      ├── Designation
    │     │      │       ├── Employee
    │     │      │       └── Employee Role Assignment
    │     │      └── Department Head
    │     └── Branch Manager
```

এরপর Audit, Checklist, Assignment, Working Paper, Evidence Upload, Observation, CAPA, Report, Dashboard—সব একই Enterprise Architecture-এর উপর তৈরি হবে।

এখন আমি পরবর্তী ধাপে **Department Module (Enterprise Grade)** শুরু করার পরামর্শ দিচ্ছি, কারণ Branch Module-এর template এখন ভবিষ্যতের সব master module-এর জন্য reusable হয়ে গেছে।

চলো **Department Module (Enterprise Grade)** শুরু করি।

## Phase 1: Department Model

Create file:

```text
backend/app/models/department.py
```

Paste:

```python
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Department(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "departments"

    department_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    department_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
```

## Phase 1.2: Update `app/models/__init__.py`

Add import:

```python
from app.models.department import Department
```

Add in `__all__`:

```python
"Department",
```

## Phase 1.3: Migration

Run:

```powershell
alembic revision --autogenerate -m "add departments table"
alembic upgrade head
```

Expected:

```text
Detected added table 'departments'
Running upgrade ... add departments table
```

এটা complete হলে output পাঠাও। তারপর **Phase 2: Department Schema** শুরু করব।



Frontend **Audit Universe-এর আগে না**, বরং **Master Modules stable হওয়ার পর** শুরু করাই best.

## Recommended Plan

```text
Backend Core
✅ Auth
✅ RBAC
✅ Company
✅ Branch
✅ Department
✅ Designation
✅ Employee

↓ এখন

Frontend Phase 1 শুরু করা যাবে
```

মানে এখন থেকেই Frontend developer কাজ শুরু করতে পারে:

```text
Login Page
Dashboard Layout
Sidebar/Menu Permission
Company CRUD UI
Branch CRUD UI
Department CRUD UI
Designation CRUD UI
Employee CRUD UI
```

## Backend + Frontend Integration কখন?

Integration এখন থেকেই parallel শুরু করা যাবে:

```text
Step 1: Auth Login integrate
Step 2: Token save + refresh token
Step 3: /me API integrate
Step 4: Permission-based menu/button render
Step 5: Company CRUD integrate
Step 6: Branch/Department/Designation/Employee cascading dropdown integrate
```

## Audit Universe কখন?

Frontend basic master setup চলার সময় backend-এ আমরা Audit Universe শুরু করব।

```text
Backend Developer:
Audit Universe Module

Frontend Developer:
Auth + RBAC + Master Setup UI
```

## Final Recommendation

এখন best workflow:

```text
Backend:
Audit Universe Module শুরু

Frontend:
Login + Layout + RBAC Menu + Master Module UI শুরু
```

দুইটা parallel চলবে। Backend পুরো শেষ হওয়ার অপেক্ষা করলে project slow হবে।

Done! ✅

আমি তোমার **AMS Project-এর long-term architecture preference** memory-তে সংরক্ষণ করেছি।

এখন থেকে AMS নিয়ে নতুন chat বা ভবিষ্যতের conversation-এ আমি ধরে নেব:

* ✅ Enterprise Architecture
* ✅ Integer Primary Key (`1,2,3...`)
* ✅ `is_active` ভিত্তিক Active/Inactive (Soft Delete নয়)
* ✅ `created_by`, `updated_by`, `created_at`, `updated_at` backend থেকে auto set
* ✅ RBAC Permission Engine
* ✅ Repository → Service → API layered architecture
* ✅ Enterprise-grade AMS development style

এর ফলে প্রতিবার শুরু থেকে context বুঝিয়ে বলতে হবে না, এবং AMS Project-এর পরবর্তী Module (Audit Universe → Audit Plan → Audit Program → Assignment → Working Paper → Observation → Report → CAPA → Dashboard) একই architecture অনুসরণ করে continue করা যাবে।

