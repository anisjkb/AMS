চলো `CompanyService` Enterprise style-এ ভাগ করি।

## Target structure

```text
app/services/company/
│
├── __init__.py
├── company_service.py
├── list_company.py
├── get_company.py
├── create_company.py
├── update_company.py
├── delete_company.py
├── restore_company.py
├── permanent_delete_company.py
└── helpers.py
```

## Step 1: Folder তৈরি করো

```powershell
mkdir app\services\company
New-Item app\services\company\__init__.py
```

---

## Step 2: `app/services/company/helpers.py`

```python
from app.models.company import Company
from app.repositories.company_repository import CompanyRepository


async def company_with_user_names(
    company: Company,
    company_repo: CompanyRepository,
) -> dict:
    return {
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
        "created_by_name": await company_repo.get_user_full_name_by_user_id(
            company.created_by
        ),
        "updated_by_name": await company_repo.get_user_full_name_by_user_id(
            company.updated_by
        ),
    }


async def generate_company_code(company_repo: CompanyRepository) -> str:
    last_company = await company_repo.get_last_company()

    if not last_company:
        return "COM00001"

    next_id = last_company.id + 1
    return f"COM{next_id:05d}"
```

---

## Step 3: `app/services/company/list_company.py`

```python
from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def list_companies_service(
    company_repo: CompanyRepository,
    page: int,
    page_size: int,
    search: str | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, companies = await company_repo.list_paginated(
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
        "items": [
            await company_with_user_names(company, company_repo)
            for company in companies
        ],
    }
```

---

## Step 4: `app/services/company/get_company.py`

```python
from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def get_company_service(
    company_repo: CompanyRepository,
    company_id: int,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return await company_with_user_names(company, company_repo)
```

---

## Step 5: `app/services/company/create_company.py`

```python
from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate
from app.services.company.helpers import company_with_user_names, generate_company_code


async def create_company_service(
    company_repo: CompanyRepository,
    payload: CompanyCreate,
    created_by: str,
):
    company_code = payload.company_code

    if not company_code:
        company_code = await generate_company_code(company_repo)

    existing_code = await company_repo.get_by_code(company_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company code already exists",
        )

    existing_name = await company_repo.get_by_name(payload.company_name)
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name already exists",
        )

    if payload.company_email:
        existing_email = await company_repo.get_by_email(payload.company_email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company email already exists",
            )

    if payload.company_phone:
        existing_phone = await company_repo.get_by_phone(payload.company_phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company phone already exists",
            )

    company = await company_repo.create(
        payload=payload,
        company_code=company_code,
        created_by=created_by,
    )

    return {
        "message": "Company created successfully",
        "data": await company_with_user_names(company, company_repo),
    }
```

---

## Step 6: `app/services/company/update_company.py`

```python
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyUpdate
from app.services.company.helpers import company_with_user_names


async def update_company_service(
    company_repo: CompanyRepository,
    company_id: int,
    payload: CompanyUpdate,
    updated_by: str,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if payload.company_name and payload.company_name != company.company_name:
        existing_name = await company_repo.get_by_name(payload.company_name)
        if existing_name:
            raise HTTPException(status_code=400, detail="Company name already exists")

    if payload.company_email and payload.company_email != company.company_email:
        existing_email = await company_repo.get_by_email(payload.company_email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Company email already exists")

    if payload.company_phone and payload.company_phone != company.company_phone:
        existing_phone = await company_repo.get_by_phone(payload.company_phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Company phone already exists")

    updated_company = await company_repo.update(
        company=company,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Company updated successfully",
        "data": await company_with_user_names(updated_company, company_repo),
    }
```

---

## Step 7: `app/services/company/delete_company.py`

```python
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def deactivate_company_service(
    company_repo: CompanyRepository,
    company_id: int,
    updated_by: str,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company = await company_repo.set_active_status(
        company=company,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Company deleted successfully",
        "data": await company_with_user_names(company, company_repo),
    }
```

---

## Step 8: `app/services/company/restore_company.py`

```python
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository
from app.services.company.helpers import company_with_user_names


async def restore_company_service(
    company_repo: CompanyRepository,
    company_id: int,
    updated_by: str,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    company = await company_repo.set_active_status(
        company=company,
        is_active=True,
        updated_by=updated_by,
    )

    return {
        "message": "Company restored successfully",
        "data": await company_with_user_names(company, company_repo),
    }
```

---

## Step 9: `app/services/company/permanent_delete_company.py`

```python
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository


async def permanent_delete_company_service(
    company_repo: CompanyRepository,
    company_id: int,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    has_child = await company_repo.has_child_records(company_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await company_repo.permanent_delete(company)

    return {
        "message": "Company permanently deleted successfully",
    }
```

---

## Step 10: `app/services/company/company_service.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.services.company.create_company import create_company_service
from app.services.company.delete_company import deactivate_company_service
from app.services.company.get_company import get_company_service
from app.services.company.list_company import list_companies_service
from app.services.company.permanent_delete_company import (
    permanent_delete_company_service,
)
from app.services.company.restore_company import restore_company_service
from app.services.company.update_company import update_company_service


class CompanyService:
    def __init__(self, db: AsyncSession):
        self.company_repo = CompanyRepository(db)

    async def list_companies(
        self,
        page: int,
        page_size: int,
        search: str | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        return await list_companies_service(
            company_repo=self.company_repo,
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_company(self, company_id: int):
        return await get_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
        )

    async def create_company(
        self,
        payload: CompanyCreate,
        created_by: str,
    ):
        return await create_company_service(
            company_repo=self.company_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_company(
        self,
        company_id: int,
        payload: CompanyUpdate,
        updated_by: str,
    ):
        return await update_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_company(
        self,
        company_id: int,
        updated_by: str,
    ):
        return await deactivate_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            updated_by=updated_by,
        )

    async def restore_company(
        self,
        company_id: int,
        updated_by: str,
    ):
        return await restore_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
            updated_by=updated_by,
        )

    async def permanent_delete_company(self, company_id: int):
        return await permanent_delete_company_service(
            company_repo=self.company_repo,
            company_id=company_id,
        )
```

---

## Step 11: Import path update

File:

```text
app/api/v1/companies.py
```

এই import:

```python
from app.services.company_service import CompanyService
```

replace করো:

```python
from app.services.company.company_service import CompanyService
```

---

## Step 12: পুরনো file রাখবে না

পুরনো file:

```text
app/services/company_service.py
```

delete করো।

---

## Step 13: Test

```powershell
uvicorn main:app --reload
```

Swagger থেকে test করো:

```text
GET /companies
POST /companies
PATCH /companies/{id}
DELETE /companies/{id}
PATCH /companies/{id}/restore
DELETE /companies/{id}/permanent
```

Done হলে বলো।
Excellent! 🎉

এখন থেকে AMS-এর **Company Module Enterprise Architecture v1.0** সম্পূর্ণ হলো।

---

# ✅ Current AMS Status

```text
Authentication                  ✅
JWT Access Token                ✅
JWT Refresh Token               ✅

RBAC Engine                     ✅
Role                            ✅
Permission                      ✅
UserRole                        ✅
RolePermission                  ✅

Permission Decorator            ✅

Company Model                   ✅
Company Schema                  ✅
Company Repository              ✅
Company Service                 ✅

Company Create                  ✅
Company List                    ✅
Company Details                 ✅
Company Update                  ✅
Company Delete                  ✅
Company Restore                 ✅
Company Permanent Delete        ✅

Pagination                      ✅
Search                          ✅
Sorting                         ✅

Auto Company Code               ✅
Duplicate Validation            ✅
Audit Fields                    ✅
created_by_name                 ✅
updated_by_name                 ✅

Enterprise Service Split        ✅
```

---

# 🚀 এখন পরবর্তী Milestone

আমি Company-এর architecture আর পরিবর্তন করব না।

এখন একই reusable pattern ব্যবহার করে:

```text
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
```

তৈরি করব।

---

# আমি Branch Module-এর জন্য Final Database Design propose করছি

```text
branches
────────────────────────

id

branch_code
branch_name

company_id

branch_email
branch_phone

branch_address

remarks

is_active

created_by
updated_by

created_at
updated_at
```

FK

```text
company_id
    ↓
companies.id
```

---

# Branch Permission Matrix

```text
menu.branch.view

api.branch.create
api.branch.update
api.branch.delete
api.branch.restore
api.branch.permanent_delete

button.branch.create
button.branch.update
button.branch.delete
button.branch.restore
button.branch.permanent_delete
```

---

# Branch CRUD

```text
GET     /branches

GET     /branches/{id}

POST    /branches

PATCH   /branches/{id}

DELETE  /branches/{id}

PATCH   /branches/{id}/restore

DELETE  /branches/{id}/permanent
```

---

# Pagination

```text
?page=1

&page_size=20

&search=

&company_id=

&is_active=

&sort_by=

&sort_order=
```

---

# Branch Auto Code

Backend generate করবে:

```text
BR00001
BR00002
BR00003
```

Frontend পাঠাবে না।

---

# Child Check

Permanent Delete allow হবে না যদি:

```text
Branch
     │
     ├── Department Exists
     ├── Employee Exists
     └── Audit Exists
```

---

# ⭐ Atlas Master Architecture (LOCKED)

এখন থেকে **Company, Branch, Department, Designation, Employee, Audit**—সব module **একই reusable template** follow করবে:

```text
models/
schemas/
repositories/
services/
    module/
        helpers.py
        create.py
        update.py
        list.py
        get.py
        delete.py
        restore.py
        permanent_delete.py
        service.py
api/
permissions/
seed/
migration/
tests/
```

এই architecture follow করলে AMS সহজেই **ERP-grade**, **multi-company**, **enterprise RBAC**, এবং **future microservice migration**-এর জন্য প্রস্তুত থাকবে।

চমৎকার। এখন থেকে আমরা **copy-paste coding না করে reusable architecture** follow করব।

# 🚀 Milestone: Branch Module (Enterprise Grade)

Branch Module হবে Company Module-এর **100% reusable clone**, শুধু entity change হবে।

---

# Phase 1: Branch Model

## File

```text
backend/app/models/branch.py
```

```python
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import (
    ActiveStatusMixin,
    AuditMixin,
    Base,
    IntegerPrimaryKeyMixin,
)


class Branch(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "branches"

    branch_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    branch_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id"),
        nullable=False,
        index=True,
    )

    branch_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    branch_phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    branch_address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
```

---

# Step 2

## app/models/**init**.py

add

```python
from app.models.branch import Branch
```

and

```python
__all__ = [
    ...
    "Branch",
]
```

---

# Step 3

## app/db/base.py

No change.

Already reusable.

---

# Step 4

Migration

```powershell
alembic revision --autogenerate -m "add branches table"
```

then

```powershell
alembic upgrade head
```

---

# Phase 2

তারপর আমরা বানাবো

```text
schemas/branch.py
```

with

```text
BranchCreate

BranchUpdate

BranchResponse

BranchListResponse

BranchMessageResponse
```

---

# Phase 3

Repository

```text
repositories/
        branch_repository.py
```

with

```text
list

search

pagination

sort

duplicate check

restore

delete

permanent delete

child check
```

---

# Phase 4

Enterprise Service Split

```text
services/branch/

        helpers.py

        create_branch.py

        update_branch.py

        list_branch.py

        get_branch.py

        delete_branch.py

        restore_branch.py

        permanent_delete_branch.py

        branch_service.py
```

---

# Phase 5

Swagger APIs

```text
GET /branches

GET /branches/{id}

POST /branches

PATCH /branches/{id}

DELETE /branches/{id}

PATCH /branches/{id}/restore

DELETE /branches/{id}/permanent
```

---

# Phase 6

RBAC

```text
menu.branch.view

api.branch.create
api.branch.update
api.branch.delete
api.branch.restore
api.branch.permanent_delete

button.branch.create
button.branch.update
button.branch.delete
button.branch.restore
button.branch.permanent_delete
```

---

# ⭐ Atlas Enterprise Advice

এখন থেকে **Company, Branch, Department, Designation, Employee**—প্রতিটি module-এ একই reusable template ব্যবহার করো।

আরও একটি architecture lock করার পরামর্শ দিচ্ছি:

```text
Company
    │
    ├── Branch
    │      │
    │      ├── Department
    │      │      │
    │      │      ├── Designation
    │      │      │      │
    │      │      │      └── Employee
```

অর্থাৎ **Employee সরাসরি Company-এর সাথে link হবে না**; সে সবসময় **Company → Branch → Department → Designation** hierarchy-এর মাধ্যমে relate হবে। এতে data integrity বজায় থাকবে এবং ভবিষ্যতে multi-company ও enterprise reporting অনেক সহজ হবে।

চলো **Phase 2: Branch Schemas** শুরু করি।

## Create file

```text
backend/app/schemas/branch.py
```

Paste:

```python
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class BranchBase(BaseModel):
    branch_name: str = Field(..., max_length=255)
    company_id: int
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None


class BranchCreate(BranchBase):
    branch_code: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = None
    company_id: int | None = None
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None


class BranchResponse(BranchBase):
    id: int
    branch_code: str
    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class BranchListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BranchResponse]


class BranchMessageResponse(BaseModel):
    message: str
    data: BranchResponse | None = None
```

## Schema logic

* `branch_code` optional, backend auto-generate করবে: `BR00001`
* `company_id` required for create
* `created_by`, `updated_by`, date fields frontend পাঠাবে না
* Response-এ `created_by_name`, `updated_by_name` থাকবে

Done হলে বলো, তারপর **Phase 3: Branch Repository** শুরু করব।

Great. এখন **Phase 4: Branch Enterprise Service Split**।

## Step 1: Folder তৈরি করো

```powershell
mkdir app\services\branch
New-Item app\services\branch\__init__.py
```

---

## Step 2: `app/services/branch/helpers.py`

```python
from app.models.branch import Branch
from app.repositories.branch_repository import BranchRepository


async def branch_with_user_names(
    branch: Branch,
    branch_repo: BranchRepository,
) -> dict:
    return {
        "id": branch.id,
        "branch_code": branch.branch_code,
        "branch_name": branch.branch_name,
        "company_id": branch.company_id,
        "branch_email": branch.branch_email,
        "branch_phone": branch.branch_phone,
        "branch_address": branch.branch_address,
        "remarks": branch.remarks,
        "is_active": branch.is_active,
        "created_by": branch.created_by,
        "updated_by": branch.updated_by,
        "created_at": branch.created_at,
        "updated_at": branch.updated_at,
        "created_by_name": await branch_repo.get_user_full_name_by_user_id(
            branch.created_by
        ),
        "updated_by_name": await branch_repo.get_user_full_name_by_user_id(
            branch.updated_by
        ),
    }


async def generate_branch_code(branch_repo: BranchRepository) -> str:
    last_branch = await branch_repo.get_last_branch()

    if not last_branch:
        return "BR00001"

    next_id = last_branch.id + 1
    return f"BR{next_id:05d}"
```

---

## Step 3: `app/services/branch/list_branch.py`

```python
from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def list_branches_service(
    branch_repo: BranchRepository,
    page: int,
    page_size: int,
    search: str | None,
    company_id: int | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
):
    total, branches = await branch_repo.list_paginated(
        page=page,
        page_size=page_size,
        search=search,
        company_id=company_id,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            await branch_with_user_names(branch, branch_repo)
            for branch in branches
        ],
    }
```

---

## Step 4: `app/services/branch/get_branch.py`

```python
from fastapi import HTTPException, status

from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def get_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )

    return await branch_with_user_names(branch, branch_repo)
```

---

## Step 5: `app/services/branch/create_branch.py`

```python
from fastapi import HTTPException, status

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchCreate
from app.services.branch.helpers import branch_with_user_names, generate_branch_code


async def create_branch_service(
    branch_repo: BranchRepository,
    payload: BranchCreate,
    created_by: str,
):
    company = await branch_repo.get_company_by_id(payload.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company not found or inactive",
        )

    branch_code = payload.branch_code

    if not branch_code:
        branch_code = await generate_branch_code(branch_repo)

    existing_code = await branch_repo.get_by_code(branch_code)
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch code already exists",
        )

    existing_name = await branch_repo.get_by_name_and_company(
        branch_name=payload.branch_name,
        company_id=payload.company_id,
    )
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch name already exists under this company",
        )

    if payload.branch_email:
        existing_email = await branch_repo.get_by_email(payload.branch_email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch email already exists",
            )

    if payload.branch_phone:
        existing_phone = await branch_repo.get_by_phone(payload.branch_phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Branch phone already exists",
            )

    branch = await branch_repo.create(
        payload=payload,
        branch_code=branch_code,
        created_by=created_by,
    )

    return {
        "message": "Branch created successfully",
        "data": await branch_with_user_names(branch, branch_repo),
    }
```

---

## Step 6: `app/services/branch/update_branch.py`

```python
from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchUpdate
from app.services.branch.helpers import branch_with_user_names


async def update_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
    payload: BranchUpdate,
    updated_by: str,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    target_company_id = (
        payload.company_id if payload.company_id is not None else branch.company_id
    )

    if payload.company_id is not None:
        company = await branch_repo.get_company_by_id(payload.company_id)
        if not company:
            raise HTTPException(status_code=400, detail="Company not found or inactive")

    if payload.branch_name and (
        payload.branch_name != branch.branch_name
        or target_company_id != branch.company_id
    ):
        existing_name = await branch_repo.get_by_name_and_company(
            branch_name=payload.branch_name,
            company_id=target_company_id,
        )
        if existing_name:
            raise HTTPException(
                status_code=400,
                detail="Branch name already exists under this company",
            )

    if payload.branch_email and payload.branch_email != branch.branch_email:
        existing_email = await branch_repo.get_by_email(payload.branch_email)
        if existing_email:
            raise HTTPException(status_code=400, detail="Branch email already exists")

    if payload.branch_phone and payload.branch_phone != branch.branch_phone:
        existing_phone = await branch_repo.get_by_phone(payload.branch_phone)
        if existing_phone:
            raise HTTPException(status_code=400, detail="Branch phone already exists")

    updated_branch = await branch_repo.update(
        branch=branch,
        payload=payload,
        updated_by=updated_by,
    )

    return {
        "message": "Branch updated successfully",
        "data": await branch_with_user_names(updated_branch, branch_repo),
    }
```

---

## Step 7: `app/services/branch/delete_branch.py`

```python
from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def deactivate_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
    updated_by: str,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    branch = await branch_repo.set_active_status(
        branch=branch,
        is_active=False,
        updated_by=updated_by,
    )

    return {
        "message": "Branch deleted successfully",
        "data": await branch_with_user_names(branch, branch_repo),
    }
```

---

## Step 8: `app/services/branch/restore_branch.py`

```python
from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository
from app.services.branch.helpers import branch_with_user_names


async def restore_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
    updated_by: str,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    branch = await branch_repo.set_active_status(
        branch=branch,
        is_active=True,
        updated_by=updated_by,
    )

    return {
        "message": "Branch restored successfully",
        "data": await branch_with_user_names(branch, branch_repo),
    }
```

---

## Step 9: `app/services/branch/permanent_delete_branch.py`

```python
from fastapi import HTTPException

from app.repositories.branch_repository import BranchRepository


async def permanent_delete_branch_service(
    branch_repo: BranchRepository,
    branch_id: int,
):
    branch = await branch_repo.get_by_id_any_status(branch_id)

    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    has_child = await branch_repo.has_child_records(branch_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await branch_repo.permanent_delete(branch)

    return {
        "message": "Branch permanently deleted successfully",
    }
```

---

## Step 10: `app/services/branch/branch_service.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchCreate, BranchUpdate
from app.services.branch.create_branch import create_branch_service
from app.services.branch.delete_branch import deactivate_branch_service
from app.services.branch.get_branch import get_branch_service
from app.services.branch.list_branch import list_branches_service
from app.services.branch.permanent_delete_branch import (
    permanent_delete_branch_service,
)
from app.services.branch.restore_branch import restore_branch_service
from app.services.branch.update_branch import update_branch_service


class BranchService:
    def __init__(self, db: AsyncSession):
        self.branch_repo = BranchRepository(db)

    async def list_branches(
        self,
        page: int,
        page_size: int,
        search: str | None,
        company_id: int | None,
        is_active: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        return await list_branches_service(
            branch_repo=self.branch_repo,
            page=page,
            page_size=page_size,
            search=search,
            company_id=company_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

    async def get_branch(self, branch_id: int):
        return await get_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
        )

    async def create_branch(
        self,
        payload: BranchCreate,
        created_by: str,
    ):
        return await create_branch_service(
            branch_repo=self.branch_repo,
            payload=payload,
            created_by=created_by,
        )

    async def update_branch(
        self,
        branch_id: int,
        payload: BranchUpdate,
        updated_by: str,
    ):
        return await update_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            payload=payload,
            updated_by=updated_by,
        )

    async def deactivate_branch(
        self,
        branch_id: int,
        updated_by: str,
    ):
        return await deactivate_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            updated_by=updated_by,
        )

    async def restore_branch(
        self,
        branch_id: int,
        updated_by: str,
    ):
        return await restore_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
            updated_by=updated_by,
        )

    async def permanent_delete_branch(self, branch_id: int):
        return await permanent_delete_branch_service(
            branch_repo=self.branch_repo,
            branch_id=branch_id,
        )
```

Done হলে বলো, তারপর **Phase 5: Branch API + Router + Permissions** দিব।
