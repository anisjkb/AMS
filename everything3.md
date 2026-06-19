হ্যাঁ, এই approach-টাই এখন তোমার AMS-এর জন্য **সবচেয়ে simple এবং practical** হবে।

## Final Standard রাখি

```text
✅ Integer PK: id = 1,2,3...
✅ created_by = login user_id string, example: "admin"
✅ updated_by = login user_id string, example: "admin"
✅ API response: created_by_name
✅ API response: updated_by_name
```

Example:

```json
{
  "id": 1,
  "company_name": "ABC Ltd",
  "created_by": "admin",
  "created_by_name": "AMS Super Admin",
  "updated_by": "admin",
  "updated_by_name": "AMS Super Admin"
}
```

এটা clean, readable, এবং তোমার requirement-এর সাথে perfectly match করে।

## এখন কী করতে হবে

### 1. Failed migration file delete করো

এই file delete করো:

```text
backend/alembic/versions/c5a163bd5137_change_audit_user_fields_to_integer.py
```

কারণ আমরা আর `created_by/updated_by` integer করব না।

### 2. `app/db/base.py` আগের মতো String রাখো

`AuditMixin` হবে:

```python
class AuditMixin:
    created_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    updated_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
```

### 3. Company create/update এ ব্যবহার করবে

```python
created_by=current_user.user_id
updated_by=current_user.user_id
```

না:

```python
current_user.id
```

## Final Decision Locked

```text
id = integer primary key
user_id = login id
created_by = login user_id string
updated_by = login user_id string
created_by_name = API join/display
updated_by_name = API join/display
```

এটাই রাখি। এখন Company CRUD + pagination + search + active/inactive toggle এই standard অনুযায়ী করব।
আমি AMS-এর জন্য **Enterprise Roadmap Lock** করছি।

# Phase-2 : Company Module (100%)

```text
Company
│
├── Model
├── Schema
├── Repository
├── Service
├── API
├── Permission
├── Pagination
├── Search
├── Active/Inactive
├── Validation
└── Swagger
```

শেষ হলে:

```text
Branch
↓
Department
↓
Designation
↓
Employee
```

একই architecture follow করবে।

---

# Company Module Final API Design

## 1. List Companies

```
GET /api/v1/companies
```

Permission:

```
menu.company.view
```

Supports:

```
?page=1
&page_size=20
&search=abc
&is_active=true
&sort_by=company_name
&sort_order=asc
```

Example:

```
GET /api/v1/companies?page=1&page_size=10&search=abc
```

Response

```json
{
    "total": 125,
    "page": 1,
    "page_size": 10,
    "items": [
        {
            "id": 1,
            "company_code": "COM001",
            "company_name": "ABC Ltd",
            "is_active": true,
            "created_by": "admin",
            "created_by_name": "AMS Super Admin",
            "updated_by": "admin",
            "updated_by_name": "AMS Super Admin"
        }
    ]
}
```

---

# 2. Company Details

```
GET /api/v1/companies/{id}
```

Permission

```
menu.company.view
```

Returns single company.

---

# 3. Create Company

```
POST /api/v1/companies
```

Permission

```
api.company.create
```

Request

```json
{
    "company_code":"COM001",
    "company_name":"ABC Ltd",
    "company_short_name":"ABC",
    "company_email":"info@abc.com",
    "company_phone":"0170000000"
}
```

Repository automatically sets

```
created_by=current_user.user_id
updated_by=current_user.user_id
created_at
updated_at
```

Frontend never sends these.

---

# 4. Update Company

```
PATCH /api/v1/companies/{id}
```

Permission

```
api.company.update
```

Automatically

```
updated_by=current_user.user_id
updated_at=now()
```

---

# 5. Active/Inactive Toggle

Instead of Delete

```
PATCH /api/v1/companies/{id}/toggle-status
```

Permission

```
api.company.toggle_status
```

Toggle:

```
True → False

False → True
```

No delete.

ERP standard.

---

# 6. Search

Supports

```
company_code

company_name

company_short_name

email

phone
```

Single query

```
search=abc
```

should search all.

---

# 7. Pagination

```
?page=2&page_size=20
```

Default

```
page=1

page_size=20
```

Maximum

```
page_size=100
```

---

# 8. Sorting

```
sort_by=company_name

sort_by=company_code

sort_by=created_at
```

```
sort_order=asc

sort_order=desc
```

---

# 9. Duplicate Validation

Reject if

```
company_code exists

company_name exists
```

HTTP

```
400
```

---

# 10. Response Audit Info

Every response should include

```json
{
    "created_by":"admin",
    "created_by_name":"AMS Super Admin",

    "updated_by":"admin",
    "updated_by_name":"AMS Super Admin"
}
```

The name can be resolved by joining `users.user_id = companies.created_by`.

---

# Permission Matrix

```
menu.company.view

api.company.create

api.company.update

api.company.toggle_status

button.company.create

button.company.update

button.company.toggle_status
```

---

# After Company Module

The exact same architecture will be reused:

```
Company
        │
        ▼
Branch
        │
        ▼
Department
        │
        ▼
Designation
        │
        ▼
Employee
        │
        ▼
Audit Planning
        │
        ▼
Audit Execution
        │
        ▼
Findings
        │
        ▼
Reports
```

## ⭐ Atlas Enterprise Recommendation

আমি আরও একটি standard এখনই lock করার পরামর্শ দিচ্ছি:

```
Every Module

Model
Schema
Repository
Service
API
Permission
Seed
Migration
Tests
```

এবং **Delete API কখনও থাকবে না**।

সব business entity (Company, Branch, Department, Designation, Employee) শুধুমাত্র `is_active=True/False` দ্বারা Active/Inactive হবে। এতে audit trail অক্ষুণ্ণ থাকবে এবং ভবিষ্যতের ERP-grade reporting ও compliance অনেক সহজ হবে।

চমৎকার! 🎉

তাহলে AMS-এর **Core Architecture Specification v1.0** এখন থেকে **LOCKED**।

# 🔒 AMS Architecture (Locked)

## Database Standard

```text
Primary Key
────────────
id = Integer Auto Increment (1,2,3...)
```

Business Identifier:

```text
user_id
company_code
branch_code
department_code
designation_code
employee_code
audit_no
```

Human readable হবে।

---

# Audit Fields

```text
created_by = login user_id (string)

updated_by = login user_id (string)

created_at

updated_at
```

API Response:

```json
{
    "created_by": "admin",
    "created_by_name": "AMS Super Admin",

    "updated_by": "admin",
    "updated_by_name": "AMS Super Admin"
}
```

---

# Delete Policy (LOCKED)

### Delete

Permission:

```text
button.company.delete

api.company.delete
```

Behavior:

```text
is_active=False
```

No physical delete.

---

### Restore

```text
is_active=True
```

Permission:

```text
api.company.restore
button.company.restore
```

---

### Permanent Delete

Permission:

```text
button.company.permanent_delete

api.company.permanent_delete
```

Allowed only when:

```text
No Child Records

AND

Permission Exists

AND

Confirmation Passed
```

Otherwise:

```json
{
    "detail":"Cannot permanently delete. Child records exist."
}
```

---

# Every Module Structure

```text
models/

schemas/

repositories/

services/

api/

migration/

seed/

tests/
```

No exception.

---

# Every Module Permission Structure

```text
menu.company.view

api.company.create
api.company.update
api.company.delete
api.company.restore
api.company.permanent_delete

button.company.create
button.company.update
button.company.delete
button.company.restore
button.company.permanent_delete
```

একই pattern Branch, Department, Designation, Employee, Audit, Report—সব module-এ follow হবে।

---

# AMS Development Roadmap

```text
✅ Authentication
✅ JWT
✅ Refresh Token
✅ RBAC
✅ Permission Engine
✅ Protected APIs
✅ Company Table

────────────────────

🔄 Company CRUD
    ├── List
    ├── Details
    ├── Create
    ├── Update
    ├── Delete
    ├── Restore
    ├── Permanent Delete
    ├── Pagination
    ├── Search
    ├── Sorting
    └── Validation

↓

Branch Module

↓

Department Module

↓

Designation Module

↓

Employee Module

↓

Audit Planning

↓

Audit Execution

↓

Findings

↓

Reports

↓

Dashboard

↓

Notification

↓

Workflow Approval

↓

Production Deployment
```

## ⭐ আমার শেষ পরামর্শ

এখন থেকে **architecture change না করে feature development**-এ ফোকাস করো।

আগামী milestone হবে:

> **Company Module (Enterprise CRUD + Search + Pagination + Delete + Restore + Permanent Delete + Permission Integration + Swagger Testing)**

এটা শেষ হলে একই reusable pattern ব্যবহার করে **Branch → Department → Designation → Employee** module খুব দ্রুত তৈরি করা যাবে।

চলো **Company Module Enterprise CRUD** এগিয়ে নেই।

প্রথমে নিশ্চিত করো:

## Step 0: Failed migration clean

এই file থাকলে delete করো:

```text
backend/alembic/versions/c5a163bd5137_change_audit_user_fields_to_integer.py
```

`app/db/base.py`-এ `created_by`, `updated_by` অবশ্যই `String(100)` থাকবে, integer না।

---

## Step 1: `company_repository.py` replace করো

File:

```text
backend/app/repositories/company_repository.py
```

পুরোটা replace:

```python
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate


class CompanyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        stmt = select(Company)

        if is_active is not None:
            stmt = stmt.where(Company.is_active == is_active)

        if search:
            search_term = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Company.company_code.ilike(search_term),
                    Company.company_name.ilike(search_term),
                    Company.company_short_name.ilike(search_term),
                    Company.company_email.ilike(search_term),
                    Company.company_phone.ilike(search_term),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.db.scalar(count_stmt)

        allowed_sort_fields = {
            "id": Company.id,
            "company_code": Company.company_code,
            "company_name": Company.company_name,
            "created_at": Company.created_at,
            "updated_at": Company.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Company.id)
        stmt = stmt.order_by(desc(sort_column) if sort_order == "desc" else asc(sort_column))

        offset = (page - 1) * page_size
        stmt = stmt.offset(offset).limit(page_size)

        result = await self.db.execute(stmt)
        return total or 0, list(result.scalars().all())

    async def get_by_id_any_status(self, company_id: int) -> Company | None:
        result = await self.db.execute(select(Company).where(Company.id == company_id))
        return result.scalar_one_or_none()

    async def get_by_code(self, company_code: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_code == company_code)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, company_name: str) -> Company | None:
        result = await self.db.execute(
            select(Company).where(Company.company_name == company_name)
        )
        return result.scalar_one_or_none()

    async def create(self, payload: CompanyCreate, created_by: str) -> Company:
        company = Company(
            **payload.model_dump(),
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )
        self.db.add(company)
        await self.db.commit()
        await self.db.refresh(company)
        return company

    async def update(self, company: Company, payload: CompanyUpdate, updated_by: str) -> Company:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(company, field, value)

        company.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(company)
        return company

    async def set_active_status(
        self,
        company: Company,
        is_active: bool,
        updated_by: str,
    ) -> Company:
        company.is_active = is_active
        company.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(company)
        return company

    async def permanent_delete(self, company: Company) -> None:
        await self.db.delete(company)
        await self.db.commit()

    async def get_user_full_name_by_user_id(self, user_id: str | None) -> str | None:
        if not user_id:
            return None

        result = await self.db.execute(
            select(User.full_name).where(User.user_id == user_id)
        )
        return result.scalar_one_or_none()
```

---

## Step 2: `company_service.py` replace করো

File:

```text
backend/app/services/company_service.py
```

```python
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyUpdate


class CompanyService:
    def __init__(self, db: AsyncSession):
        self.company_repo = CompanyRepository(db)

    async def _with_user_names(self, company: Company) -> dict:
        data = {
            "id": company.id,
            "company_code": company.company_code,
            "company_name": company.company_name,
            "company_short_name": company.company_short_name,
            "company_email": company.company_email,
            "company_phone": company.company_phone,
            "company_address": company.company_address,
            "website": company.website,
            "tax_number": company.tax_number,
            "trade_license": company.trade_license,
            "remarks": company.remarks,
            "is_active": company.is_active,
            "created_by": company.created_by,
            "updated_by": company.updated_by,
            "created_at": company.created_at,
            "updated_at": company.updated_at,
            "created_by_name": await self.company_repo.get_user_full_name_by_user_id(company.created_by),
            "updated_by_name": await self.company_repo.get_user_full_name_by_user_id(company.updated_by),
        }
        return data

    async def list_companies(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        total, companies = await self.company_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": [await self._with_user_names(company) for company in companies],
        }

    async def get_company(self, company_id: int):
        company = await self.company_repo.get_by_id_any_status(company_id)

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )

        return await self._with_user_names(company)

    async def create_company(self, payload: CompanyCreate, created_by: str):
        existing_code = await self.company_repo.get_by_code(payload.company_code)
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company code already exists",
            )

        existing_name = await self.company_repo.get_by_name(payload.company_name)
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company name already exists",
            )

        company = await self.company_repo.create(payload=payload, created_by=created_by)
        return await self._with_user_names(company)

    async def update_company(
        self,
        company_id: int,
        payload: CompanyUpdate,
        updated_by: str,
    ):
        company = await self.company_repo.get_by_id_any_status(company_id)

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )

        updated_company = await self.company_repo.update(
            company=company,
            payload=payload,
            updated_by=updated_by,
        )

        return await self._with_user_names(updated_company)

    async def deactivate_company(self, company_id: int, updated_by: str):
        company = await self.company_repo.get_by_id_any_status(company_id)

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        company = await self.company_repo.set_active_status(
            company=company,
            is_active=False,
            updated_by=updated_by,
        )
        return await self._with_user_names(company)

    async def restore_company(self, company_id: int, updated_by: str):
        company = await self.company_repo.get_by_id_any_status(company_id)

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        company = await self.company_repo.set_active_status(
            company=company,
            is_active=True,
            updated_by=updated_by,
        )
        return await self._with_user_names(company)

    async def permanent_delete_company(self, company_id: int):
        company = await self.company_repo.get_by_id_any_status(company_id)

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        await self.company_repo.permanent_delete(company)
        return {"message": "Company permanently deleted successfully"}
```

এই দুইটা file update করে বলো **done**। তারপর আমি schema + API endpoint final version দেব।

Great.

## Step 3: `app/schemas/company.py` replace করো

```python
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class CompanyBase(BaseModel):
    company_code: str = Field(..., max_length=50)
    company_name: str = Field(..., max_length=255)
    company_short_name: str | None = None
    company_email: EmailStr | None = None
    company_phone: str | None = None
    company_address: str | None = None
    website: str | None = None
    tax_number: str | None = None
    trade_license: str | None = None
    remarks: str | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    company_name: str | None = None
    company_short_name: str | None = None
    company_email: EmailStr | None = None
    company_phone: str | None = None
    company_address: str | None = None
    website: str | None = None
    tax_number: str | None = None
    trade_license: str | None = None
    remarks: str | None = None


class CompanyResponse(CompanyBase):
    id: int
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None
    created_at: datetime
    updated_at: datetime


class CompanyListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[CompanyResponse]
```

## Step 4: `app/api/v1/companies.py` replace করো

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyUpdate,
)
from app.services.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.list_companies(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.get_company(company_id)


@router.post("", response_model=CompanyResponse)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.create")),
):
    service = CompanyService(db)
    return await service.create_company(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.update")),
):
    service = CompanyService(db)
    return await service.update_company(
        company_id=company_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{company_id}", response_model=CompanyResponse)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.delete")),
):
    service = CompanyService(db)
    return await service.deactivate_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{company_id}/restore", response_model=CompanyResponse)
async def restore_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.restore")),
):
    service = CompanyService(db)
    return await service.restore_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{company_id}/permanent")
async def permanent_delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.permanent_delete")),
):
    service = CompanyService(db)
    return await service.permanent_delete_company(company_id)
```

## Step 5: `scripts/seed_rbac.py` permission add করো

`INITIAL_PERMISSIONS` এ এগুলো add করো:

```python
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
```

Then run:

```powershell
python -m scripts.seed_rbac
```

Send output.

দারুণ! 🎉

Log দেখে নিশ্চিত হওয়া যাচ্ছে যে **RBAC Permission Seed 100% সফল হয়েছে।** 

## নতুন Permissions সফলভাবে তৈরি হয়েছে

```text
✅ api.company.delete
✅ api.company.restore
✅ api.company.permanent_delete

✅ button.company.delete
✅ button.company.restore
✅ button.company.permanent_delete
```

এবং এগুলো **Super Admin Role**-এর সাথে assign হয়েছে। 

---

# AMS Current Status

```text
Authentication             ✅
JWT Login                  ✅
Refresh Token              ✅
RBAC                       ✅
Permission Engine          ✅
Role Assignment            ✅
Permission Assignment      ✅

Company Model              ✅
Company Schema             ✅
Company Repository         ✅
Company Service            ✅

Company Create             ✅
Company Update             ✅
Company Delete             ✅
Company Restore            ✅
Company Permanent Delete   ✅

Pagination Logic           ✅
Search Logic               ✅
Sorting Logic              ✅
```

---

# 🚀 Next Milestone (Company Module Finish)

এখন আমরা Company Module-কে সম্পূর্ণ Enterprise Grade করব:

```text
GET    /companies
GET    /companies/{id}
POST   /companies
PATCH  /companies/{id}
DELETE /companies/{id}
PATCH  /companies/{id}/restore
DELETE /companies/{id}/permanent
```

এর সাথে থাকবে:

* ✅ Pagination
* ✅ Search
* ✅ Sort
* ✅ Duplicate Validation
* ✅ Permission Check
* ✅ Swagger Test

---

# এরপরের Roadmap

```text
Company  ✅
    │
    ▼
Branch
    │
    ▼
Department
    │
    ▼
Designation
    │
    ▼
Employee
    │
    ▼
Audit Plan
    │
    ▼
Audit Execution
    │
    ▼
Findings
    │
    ▼
Reports
```

---

## ⭐ Atlas Recommendation

এখন Company Module শেষ না করে Branch Module-এ যাওয়া উচিত হবে না।

আমার পরামর্শ:

1. **Company CRUD API সম্পূর্ণ test করো (Swagger থেকে)।**
2. List API-তে Pagination/Search/Sorting verify করো।
3. Delete → Restore → Permanent Delete flow verify করো।
4. `created_by_name` / `updated_by_name` response verify করো।

এরপর আমরা **Branch Module** শুরু করব, এবং Company-এর architecture **copy-reuse** করে Branch → Department → Designation → Employee module তৈরি করব। এতে পুরো AMS codebase অত্যন্ত clean, reusable এবং enterprise-grade থাকবে।

দারুণ কাজ! 👏

আমি পুরো Swagger output review করেছি। **Company Module-এর Enterprise CRUD সফলভাবে কাজ করছে।** 

# ✅ Completed Features

## Authentication

* ✅ Login
* ✅ JWT Access Token
* ✅ Refresh Token

## Company Module

* ✅ Create Company
* ✅ List Company
* ✅ Details Company
* ✅ Update Company
* ✅ Soft Delete (Inactive)
* ✅ Restore
* ✅ Permanent Delete

## Extra Features

* ✅ Pagination
* ✅ Search
* ✅ Sort
* ✅ RBAC Permission Check
* ✅ created_by
* ✅ updated_by
* ✅ created_by_name
* ✅ updated_by_name

এটা এখন Enterprise Grade foundation-এর মতো দেখাচ্ছে। 

---

# তবে আমি ৭টি Improvement এখনই করতে বলব

## ① HTTP Status Code

Create API এখন:

```
200 OK
```

দিচ্ছে।

এটা হওয়া উচিত:

```
201 Created
```

```python
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=CompanyResponse,
)
```

---

## ② Update API

বর্তমানে:

```
PATCH
```

ঠিক আছে।

কিন্তু Response-এ একটি message যোগ করলে ভালো হয়:

```json
{
    "message":"Company updated successfully",
    "data":{...}
}
```

---

## ③ Delete API

বর্তমানে

```
DELETE
```

return করছে পুরো object।

আমি recommend করি:

```json
{
    "message":"Company deactivated successfully"
}
```

অথবা

```json
{
    "message":"Company deleted successfully",
    "id":1
}
```

---

## ④ Restore API

একইভাবে:

```json
{
    "message":"Company restored successfully"
}
```

---

## ⑤ Permanent Delete

এখন:

```
Company permanently deleted successfully
```

দিচ্ছে।

Perfect.

কিন্তু Child Record check যোগ করতে হবে।

Future:

```
Branch exists?

Department exists?

Employee exists?
```

তাহলে reject করবে।

---

## ⑥ Duplicate Validation

Company Name duplicate check আছে।

আমি আরও যোগ করতাম:

```
company_email unique

company_phone unique

company_code unique
```

Enterprise standard.

---

## ⑦ Company Code Auto Generate

বর্তমানে:

```
COM001
```

Frontend পাঠাচ্ছে।

আমি recommend করি Backend generate করবে:

```
COM00001

COM00002

COM00003
```

Frontend শুধু Name দিবে।

ERP standard।

---

# AMS Progress

```
Authentication              100%

RBAC                        100%

Permission Engine           100%

Company Module              98%
```

---

# এখন পরবর্তী Milestone

```
Company Module Finish
        │
        ▼
Branch Module
        │
        ▼
Department Module
        │
        ▼
Designation Module
        │
        ▼
Employee Module
```

---

# ⭐ আমার Strong Recommendation

**Branch Module শুরু করার আগে Company Module-এ আরও ৩টি feature যোগ করি:**

* ✅ Company Code Auto Generator (`COM00001`, `COM00002`...)
* ✅ Unique Email & Phone Validation
* ✅ Child Record Check before Permanent Delete

এগুলো যোগ হলে **Company Module 100% Enterprise Ready** হবে, তারপর একই reusable architecture দিয়ে **Branch → Department → Designation → Employee** module খুব দ্রুত তৈরি করা যাবে।


