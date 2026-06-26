ChatGPT Plus


























Pasted text(77).txt
Document
Done! ✅

আমি AMS সম্পর্কিত দীর্ঘমেয়াদী Project Context memory-তে update করে দিয়েছি।

এখন থেকে AMS নিয়ে নতুন chat বা ভবিষ্যতের conversation-এ আমি এই established architecture ধরে এগোবো, যেমন:

* ✅ Enterprise Layered Architecture (Repository → Service → API)
* ✅ Integer Primary Keys
* ✅ Active/Inactive status model
* ✅ Backend-managed audit fields (created_by, updated_by, created_at, updated_at)
* ✅ RBAC-based permission system
* ✅ Dynamic database-driven navigation (navigation_groups, menus, menu_actions)
* ✅ Enterprise frontend/backend integration approach

এতে প্রতিবার শুরু থেকে AMS-এর architecture বুঝিয়ে বলতে হবে না, এবং পরবর্তী development আরও ধারাবাহিকভাবে এগিয়ে নেওয়া যাবে।


AMS Call your memory, read attached file and নেক্সট শুরু করো 


Pasted text(78).txt
Document


Pasted text(79).txt
Document

মেনু সব কোথায় গেল এক্সেস নাই?


Step 6: Test successful next কর: Company CRUD API integration + Enterprise table + Right Drawer Create Form.


কোম্পানি সবকিছু কোথায় গেল এরকম সাদা হয়ে গেল কেন?



Pasted text(80).txt
Document

image(232).png
image(233).png
image(234).png
এই সকল চেঞ্জ গুলা আমি পরে করব. এগুলা করার আগে ডাটাবেজে ডাটা গুলা চেক করে দেখো. কিছু field blank and some ফিল্ডে value আছে কেন?


নতুন এড করা field গুলা দেখাচ্ছে না কেন


Pasted text(81).txt
Document

কোম্পানি ক্রিয়েট done কিন্তু সাকসেসফুল মেসেজ দিবে না এবং টেবিলে দেখাবে না?


INFO:     127.0.0.1:53936 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:53936 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53938 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62682 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62683 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:62684 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62685 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:52625 - "PUT /api/v1/companies/2 HTTP/1.1" 405 Method Not Allowed

When try to Update Company যাচ্ছি তখন এই error দিচ্ছে


Pasted code.ts
TypeScript
src\app\companies\page.tsx ফুল কোড আপডেট করে দাও

image(239).png
image(240).png
 GET /api/companies 200 in 1216ms (next.js: 81ms, application-code: 1135ms)
 PATCH /api/companies/2 200 in 1780ms (next.js: 824ms, application-code: 957ms)
 GET /api/companies 200 in 840ms (next.js: 3ms, application-code: 837ms)
 PATCH /api/companies/2 200 in 1613ms (next.js: 18ms, application-code: 1595ms)
 GET /api/companies 200 in 1135ms (next.js: 10ms, application-code: 1125ms)

INFO:     127.0.0.1:53128 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53127 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:53130 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53129 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:54930 - "PATCH /api/v1/companies/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54930 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:60947 - "PATCH /api/v1/companies/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60947 - "GET /api/v1/companies HTTP/1.1" 200 OK

But inactive হচ্ছে না

Branch Module frontend CRUD শুরু করার আগে উপরের Edit, Delete,Restore, Permanent Delete, Export, Import এবং নিচের Filter বাটনের কাজ কি বিষয়গুলো ক্লিয়ার হওয়া দরকার?

image(245).png
image(246).png
দ্বিতীয় image চেক করো it seems bigger এটাকে full পেজের (image-1) সাথে মানানসই কর যাতে দেখতে সুন্দর লাগে


Pasted code(1).ts
TypeScript
provide full updated code:
E:\Audit\AMS\frontend\src\app\companies\page.tsx


Pasted code(2).ts
TypeScript
provide full updated code-E:\Audit\AMS\frontend\src\app\branches\page.tsx

image(248).png
image(249).png
Shows Inactive সাকসেসফুল কিন্তু but actually ইন একটিভ হচ্ছে না why?


branch.py
Python

branch_repository.py
Python

update_branch.py
Python

INFO:     127.0.0.1:56749 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56752 - "DELETE /api/v1/branches/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56752 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56753 - "DELETE /api/v1/branches/2/permanent HTTP/1.1" 200 OK
INFO:     127.0.0.1:56753 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63728 - "GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:63729 - "GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized

কেন এরকম আসবে and কেন code দেখা যাবে ফ্রন্ট end-এ?


## Error Type
Console Error

## Error Message
[object Object]


    at createBranch (src/services/branch.ts:51:11)
    at async handleSubmit (src/components/branches/BranchForm.tsx:120:9)

## Code Frame
  49 |   if (!response.ok) {
  50 |     const error = await response.json();
> 51 |     throw new Error(error.detail || error.message || "Failed to create br...
     |           ^
  52 |   }
  53 |
  54 |   return response.json();

Next.js version: 16.2.9 (Turbopack)

INFO:     127.0.0.1:59854 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59855 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:63032 - "POST /api/v1/branches HTTP/1.1" 422 Unprocessable Entity



department.py
Python

departments.py
Python

department_repository.py
Python

create_department.py
Python

update_department.py
Python

delete_department.py
Python

restore_department.py
Python

permanent_delete_department.py
Python
files গুলো verify কর

INFO:     127.0.0.1:61064 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59897 - "POST /api/v1/departments HTTP/1.1" 201 Created
INFO:     127.0.0.1:59897 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK

But Short Name	Email	Phone	Address empty? এগুলা কি হলো?

Payload-এ এগুলো আছে কিনা দেখো


POST /api/auth/login 200 in 1617ms (next.js: 3ms, application-code: 1613ms)
 GET /dashboard 200 in 60ms (next.js: 6ms, proxy.ts: 5ms, application-code: 49ms)
 GET /api/me/navigation 200 in 887ms (next.js: 15ms, application-code: 872ms)
 GET /api/me/navigation 200 in 887ms (next.js: 5ms, application-code: 881ms)
 GET /departments 200 in 38ms (next.js: 4ms, proxy.ts: 6ms, application-code: 28ms)
 GET /api/departments?page_size=100 200 in 917ms (next.js: 4ms, application-code: 913ms)
 GET /api/branches?page_size=100 200 in 988ms (next.js: 5ms, application-code: 983ms)
 GET /api/companies 200 in 1043ms (next.js: 3ms, application-code: 1040ms)
 GET /api/departments?page_size=100 200 in 680ms (next.js: 4ms, application-code: 676ms)
 GET /api/companies 200 in 821ms (next.js: 4ms, application-code: 818ms)
 GET /api/branches?page_size=100 200 in 994ms (next.js: 3ms, application-code: 991ms)
 POST /api/departments 201 in 1674ms (next.js: 3ms, application-code: 1671ms)
 GET /api/departments?page_size=100 200 in 749ms (next.js: 3ms, application-code: 746ms)

INFO:     127.0.0.1:61976 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:61976 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:50625 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:57811 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57814 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57812 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:57816 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57817 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:57818 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56612 - "POST /api/v1/departments HTTP/1.1" 201 Created
INFO:     127.0.0.1:56612 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK

(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [15184] using StatReload
INFO:     Started server process [19864]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:58486 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:58485 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58483 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58484 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:61028 - "PATCH /api/v1/departments/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:61028 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:49976 - "POST /api/v1/departments HTTP/1.1" 201 Created
INFO:     127.0.0.1:49976 - "GET /api/v1/departments?page_size=100 HTTP/1.1" 200 OK

GET /api/branches?page_size=100 200 in 988ms (next.js: 5ms, application-code: 983ms)
 GET /api/companies 200 in 1043ms (next.js: 3ms, application-code: 1040ms)
 GET /api/departments?page_size=100 200 in 680ms (next.js: 4ms, application-code: 676ms)
 GET /api/companies 200 in 821ms (next.js: 4ms, application-code: 818ms)
 GET /api/branches?page_size=100 200 in 994ms (next.js: 3ms, application-code: 991ms)
 POST /api/departments 201 in 1674ms (next.js: 3ms, application-code: 1671ms)
 GET /api/departments?page_size=100 200 in 749ms (next.js: 3ms, application-code: 746ms)
 GET /departments 200 in 100ms (next.js: 29ms, proxy.ts: 4ms, application-code: 67ms)
 GET /api/me/navigation 200 in 2.1s (next.js: 11ms, application-code: 2.1s)
 GET /api/branches?page_size=100 200 in 2.3s (next.js: 19ms, application-code: 2.3s)
 GET /api/departments?page_size=100 200 in 2.3s (next.js: 7ms, application-code: 2.3s)
 GET /api/companies 200 in 2.3s (next.js: 12ms, application-code: 2.3s)
 PATCH /api/departments/2 200 in 2.2s (next.js: 858ms, application-code: 1388ms)
 GET /api/departments?page_size=100 200 in 666ms (next.js: 2ms, application-code: 664ms)
 POST /api/departments 201 in 1530ms (next.js: 2ms, application-code: 1527ms)
 GET /api/departments?page_size=100 200 in 788ms (next.js: 3ms, application-code: 785ms)



helpers.py
Python

list_department.py
Python
চেক করো পাঠালাম

done


designation.py
Python

designation_repository.py
Python

helpers(1).py
Python

list_designation.py
Python

create_designation.py
Python

update_designation.py
Python

delete_designation.py
Python

restore_designation.py
Python

permanent_delete_designation.py
Python


designation(2).py
Python

designations(1).py
Python


employees.py
Python

employee.py
Python

employee(1).py
Python

employee_repository.py
Python

create_employee.py
Python

delete_employee.py
Python

employee_service.py
Python

get_employee.py
Python

helpers(2).py
Python

list_employee.py
Python

permanent_delete_employee.py
Python

restore_employee.py
Python

update_employee.py
Python


menu.py
Python

menu_action.py
Python

menu_action_permission.py
Python

menu_permission.py
Python

navigation_group.py
Python

permission.py
Python

role.py
Python

role_permission.py
Python

user.py
Python

user_role.py
Python

auth.py
Python

navigation.py
Python

user(1).py
Python

navigation_repository.py
Python

rbac_repository.py
Python

user_repository.py
Python

auth(1).py
Python

users.py
Python
যেগুলা আছে সবগুলা up করলাম। যেগুলা তোমার রিকোয়ারমেন্ট আপ করতে পারেনি এগুলা নাই ক্রিয়েট করতে হবে।


auth(2).py
Python

branches.py
Python

companies.py
Python

departments(1).py
Python

designations(2).py
Python

employees(1).py
Python

health.py
Python

me.py
Python

router.py
Python

users(1).py
Python
এডিশনাল দিলাম আবার চেক করো

Thought for 10s
Excellent ✅ Permission backend import-level সব clean.

Confirmed:

✅ Existing PermissionService intact
✅ New PermissionManagementService import OK
✅ PermissionRepository import OK
✅ Permission API routes registered
Routes registered correctly:

/permissions
/permissions/{permission_id}
/permissions/{permission_id}/restore
/permissions/{permission_id}/permanent
এখন full backend compile check করো:

python -m compileall app
তারপর backend restart করো:

uvicorn main:app --reload
Swagger open:

http://127.0.0.1:8000/docs
তারপর Permissions section থেকে create test করো।

Payload:

{
  "permission_key": "api.test.create",
  "resource_type": "api",
  "resource_key": "test",
  "action": "create",
  "description": "Temporary test permission"
}
Expected log:

POST /api/v1/permissions 201 Created
তারপর এই order-এ test করো:

GET /api/v1/permissions
GET /api/v1/permissions/{id}
PATCH /api/v1/permissions/{id}
DELETE /api/v1/permissions/{id}
PATCH /api/v1/permissions/{id}/restore
DELETE /api/v1/permissions/{id}/permanent
সব pass হলে Permissions Management Backend complete হবে।


pass

Thought for 11s
Excellent ✅ Permissions Management Backend passed.

Security Phase 1 progress এখন:

✅ Roles Management Backend
✅ Permissions Management Backend
⏳ Users Management Backend
⏳ User Role Assignment
⏳ Role Permission Assignment
Next module হবে Users Management Backend.

এখানে একটা important decision:

Existing user_repository.py আছে,
তাই নতুন duplicate repository বানাব না।
Existing UserRepository extend করব।
Current users.py API-তে শুধু /users/me আছে, full user management নেই। তাই এখন add করব:

GET     /api/v1/users
GET     /api/v1/users/{user_id}
POST    /api/v1/users
PATCH   /api/v1/users/{user_id}
DELETE  /api/v1/users/{user_id}
PATCH   /api/v1/users/{user_id}/restore
Users-এর ক্ষেত্রে আমি permanent delete দেব না। কারণ future audit records-এ created_by, updated_by, reviewer, approver, auditor reference থাকবে। User permanently delete করলে audit history weak হয়ে যাবে।

Next step: আমি এখন Users Management Backend code দেব — schema update, existing repository extend, user service, users API replace.


Users Management Backend code দাও

Thought for 42s
ঠিক আছে। এখন Users Management Backend করব।

Important: users table/model already আছে, তাই migration লাগবে না। Existing User model-এ user_id, email, full_name, hashed_password, is_superuser আছে। 


Current user_repository.py শুধু basic get/create পর্যন্ত আছে, তাই এটাকে extend করব। 


Current api/v1/users.py-তে শুধু /users/me আছে, তাই full management route দিয়ে replace করব। 


Step 1: Replace schemas/user.py and repositories/user_repository.py
# E:\Audit\AMS\backend\app\schemas\user.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserMeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime


class UserCreate(BaseModel):
    user_id: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    email: EmailStr | None = None
    is_superuser: bool = False

    @field_validator("user_id", "full_name", "password")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field is required.")

        return value


class UserUpdate(BaseModel):
    user_id: str | None = Field(default=None, min_length=3, max_length=100)
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    email: EmailStr | None = None
    is_superuser: bool | None = None
    is_active: bool | None = None

    @field_validator("user_id", "full_name", "password")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserMessageResponse(BaseModel):
    message: str
    data: UserResponse | None = None
# E:\Audit\AMS\backend\app\repositories\user_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ) -> tuple[list[User], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    User.user_id.ilike(search_text),
                    User.full_name.ilike(search_text),
                    User.email.ilike(search_text),
                )
            )

        if is_active is not None:
            conditions.append(User.is_active == is_active)

        if is_superuser is not None:
            conditions.append(User.is_superuser == is_superuser)

        count_stmt = select(func.count()).select_from(User)
        query = select(User)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": User.id,
            "user_id": User.user_id,
            "full_name": User.full_name,
            "email": User.email,
            "is_active": User.is_active,
            "is_superuser": User.is_superuser,
            "created_at": User.created_at,
            "updated_at": User.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, User.id)
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
        users = list(result.scalars().all())

        return users, total

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.user_id == user_id,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user_id_any_status(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                func.lower(User.user_id) == user_id.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                User.email == email,
                User.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_email_any_status(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                func.lower(User.email) == email.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        user_id: str,
        full_name: str,
        hashed_password: str,
        email: str | None = None,
        is_superuser: bool = False,
        created_by: str | None = None,
    ) -> User:
        user = User(
            user_id=user_id,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            is_superuser=is_superuser,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def update(
        self,
        user: User,
        update_data: dict,
        updated_by: str,
    ) -> User:
        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def deactivate(
        self,
        user: User,
        updated_by: str,
    ) -> User:
        user.is_active = False
        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def restore(
        self,
        user: User,
        updated_by: str,
    ) -> User:
        user.is_active = True
        user.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def count_active_superusers(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(User).where(
                User.is_superuser == True,  # noqa: E712
                User.is_active == True,  # noqa: E712
            )
        )
        return int(result.scalar_one() or 0)
Step 2: Create User Management Service
Folder না থাকলে create করো:

New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\user
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\user\__init__.py
তারপর এই file create করো।

# E:\Audit\AMS\backend\app\services\user\user_service.py

from math import ceil

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    async def list_users(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
        sort_by: str = "id",
        sort_order: str = "asc",
    ):
        users, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            is_active=is_active,
            is_superuser=is_superuser,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_user(self, user_id: int):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        return user

    async def create_user(
        self,
        payload: UserCreate,
        created_by: str,
    ):
        existing_user = await self.repository.get_by_user_id_any_status(
            payload.user_id
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID already exists.",
            )

        if payload.email:
            existing_email = await self.repository.get_by_email_any_status(
                payload.email
            )

            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

        user = await self.repository.create_user(
            user_id=payload.user_id,
            full_name=payload.full_name,
            email=str(payload.email) if payload.email else None,
            hashed_password=self.hash_password(payload.password),
            is_superuser=payload.is_superuser,
            created_by=created_by,
        )

        return {
            "message": "User created successfully.",
            "data": user,
        }

    async def update_user(
        self,
        user_id: int,
        payload: UserUpdate,
        current_user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "user_id" in update_data:
            existing_user = await self.repository.get_by_user_id_any_status(
                update_data["user_id"]
            )

            if existing_user and existing_user.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User ID already exists.",
                )

        if "email" in update_data and update_data["email"]:
            existing_email = await self.repository.get_by_email_any_status(
                update_data["email"]
            )

            if existing_email and existing_email.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

            update_data["email"] = str(update_data["email"])

        if "password" in update_data:
            update_data["hashed_password"] = self.hash_password(
                update_data.pop("password")
            )

        if user.id == current_user_id and update_data.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )

        if user.id == current_user_id and update_data.get("is_superuser") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own superuser access.",
            )

        if (
            user.is_superuser
            and update_data.get("is_superuser") is False
            and await self.repository.count_active_superusers() <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        if (
            user.is_superuser
            and update_data.get("is_active") is False
            and await self.repository.count_active_superusers() <= 1
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        updated_user = await self.repository.update(
            user=user,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "User updated successfully.",
            "data": updated_user,
        }

    async def deactivate_user(
        self,
        user_id: int,
        current_user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already inactive.",
            )

        if user.id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )

        if user.is_superuser and await self.repository.count_active_superusers() <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one active superuser must remain.",
            )

        updated_user = await self.repository.deactivate(
            user=user,
            updated_by=updated_by,
        )

        return {
            "message": "User deactivated successfully.",
            "data": updated_user,
        }

    async def restore_user(
        self,
        user_id: int,
        updated_by: str,
    ):
        user = await self.repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already active.",
            )

        updated_user = await self.repository.restore(
            user=user,
            updated_by=updated_by,
        )

        return {
            "message": "User restored successfully.",
            "data": updated_user,
        }
Step 3: Replace api/v1/users.py
router.py already users router include করছে, তাই router.py change লাগবে না। 


# E:\Audit\AMS\backend\app\api\v1\users.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserListResponse,
    UserMeResponse,
    UserMessageResponse,
    UserResponse,
    UserUpdate,
)
from app.services.user.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    is_superuser: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user.view")),
):
    service = UserService(db)
    return await service.list_users(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        is_superuser=is_superuser,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user.view")),
):
    service = UserService(db)
    return await service.get_user(user_id)


@router.post(
    "",
    response_model=UserMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.create")),
):
    service = UserService(db)
    return await service.create_user(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{user_id}", response_model=UserMessageResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.update")),
):
    service = UserService(db)
    return await service.update_user(
        user_id=user_id,
        payload=payload,
        current_user_id=current_user.id,
        updated_by=current_user.user_id,
    )


@router.delete("/{user_id}", response_model=UserMessageResponse)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.delete")),
):
    service = UserService(db)
    return await service.deactivate_user(
        user_id=user_id,
        current_user_id=current_user.id,
        updated_by=current_user.user_id,
    )


@router.patch("/{user_id}/restore", response_model=UserMessageResponse)
async def restore_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user.restore")),
):
    service = UserService(db)
    return await service.restore_user(
        user_id=user_id,
        updated_by=current_user.user_id,
    )
Step 4: Verify
Run:

cd E:\Audit\AMS\backend
python -m compileall app
python -c "from app.api.v1.users import router; print([r.path for r in router.routes])"
Expected:

['/users/me', '/users', '/users/{user_id}', '/users', '/users/{user_id}', '/users/{user_id}', '/users/{user_id}/restore']
Then restart:

uvicorn main:app --reload
Swagger test payload for create:

{
  "user_id": "audituser1",
  "full_name": "Audit User One",
  "password": "User@12345",
  "email": "audituser1@example.com",
  "is_superuser": false
}
Expected logs:

GET /api/v1/users 200 OK
POST /api/v1/users 201 Created
GET /api/v1/users/{id} 200 OK
PATCH /api/v1/users/{id} 200 OK
DELETE /api/v1/users/{id} 200 OK
PATCH /api/v1/users/{id}/restore 200 OK

INFO:     127.0.0.1:56975 - "POST /api/v1/users HTTP/1.1" 201 Created

Thought for a few seconds
Excellent ✅ Users Management Backend create test passed.

Confirmed:

POST /api/v1/users 201 Created
মানে:

✅ User create endpoint working
✅ Password hashing working
✅ UserRepository extended correctly
✅ UserService working
✅ Permission guard passed
✅ DB insert successful
এখন বাকি Users CRUD test করো:

GET /api/v1/users
GET /api/v1/users/{user_id}
PATCH /api/v1/users/{user_id}
DELETE /api/v1/users/{user_id}
PATCH /api/v1/users/{user_id}/restore
PATCH payload example:

{
  "full_name": "Audit User Updated",
  "email": "audituser1.updated@example.com",
  "is_superuser": false
}
Expected logs:

GET /api/v1/users 200 OK
GET /api/v1/users/2 200 OK
PATCH /api/v1/users/2 200 OK
DELETE /api/v1/users/2 200 OK
PATCH /api/v1/users/2/restore 200 OK
Users module-এ permanent delete রাখছি না — এটা ঠিক আছে, কারণ audit history future-এ user reference ধরে রাখবে।


all tested

Thought for 10s
Excellent ✅ Users Management Backend fully complete.

Security Phase 1 progress now:

✅ Roles Management Backend
✅ Permissions Management Backend
✅ Users Management Backend
⏳ User Role Assignment Backend
⏳ Role Permission Assignment Backend
এখন next best step হলো:

User Role Assignment Backend
কারণ এখন আমাদের user আছে, role আছে — এখন কোন user কোন role পাবে সেটা manage করতে হবে।

এরপর করব:

Role Permission Assignment Backend
তখন role-এর মধ্যে permissions assign হবে। তারপর final flow হবে:

User → Role → Permissions → Menu / API Access
So next আমি দেব:

app/schemas/user_role.py
app/repositories/user_role_repository.py
app/services/user_role/user_role_service.py
app/api/v1/user_roles.py
router.py include
আর endpoint হবে:

GET    /api/v1/user-roles/users/{user_id}/roles
POST   /api/v1/user-roles
DELETE /api/v1/user-roles/{user_role_id}
Ready হলে বলো, আমি User Role Assignment Backend code দিচ্ছি.



role(1).py
Python

role_repository.py
Python

permission_repository.py
Python

role_repository(1).py
Python

user_repository(1).py
Python

role_service.py
Python

auth_service.py
Python

permission_service.py
Python

roles.py
Python

router(1).py
Python

users(2).py
Python
কোন ফাইল চেক করবা কিনা? existing file এখানে দিলাম যাতে ডুপ্লিকেট না হয়।আর এগুলা কেনই বা ব্যবহার হচ্ছে?

Thought for 13s
হ্যাঁ, এই files দেওয়া ঠিক হয়েছে ✅
Security module-এ duplicate এড়ানোর জন্য existing files check করা জরুরি। আমি check করে দেখলাম—তোমার Role, Permission, User management-এর অনেক অংশ already ঠিকভাবে তৈরি হয়ে গেছে।

Existing files কেন ব্যবহার হচ্ছে?
1. schemas/role.py
এটা API request/response validate করার জন্য। Role create/update/list response এখানে define করা আছে। তাই Role API-তে আলাদা করে validation লিখতে হয় না। 


2. repositories/role_repository.py
এটা roles table-এর database কাজ করে: list, search, get, create, update, deactivate, restore, permanent delete। এছাড়া role কোনো user/permission-এর সাথে assigned আছে কিনা সেটাও check করে। তাই Role CRUD-এর জন্য এটা দরকার। 


3. repositories/permission_repository.py
এটা permissions table-এর CRUD করে এবং permission কোথাও assigned আছে কিনা check করে—RolePermission, MenuPermission, MenuActionPermission সব জায়গায় dependency check আছে। তাই Permission delete করার আগে safe validation হবে। 


4. repositories/user_repository.py
এটা User list/create/update/inactive/restore-এর জন্য use হচ্ছে। Auth login-ও এই repository ব্যবহার করে user খুঁজে বের করে। তাই User Management এবং Auth—দুই জায়গাতেই এটা central file। 


5. services/role/role_service.py
এটা business rule handle করে। যেমন duplicate role name prevent করা, role না থাকলে 404 দেওয়া, role assigned থাকলে permanent delete block করা। Repository শুধু DB কাজ করে, Service decision নেয়। 


6. services/auth_service.py
এটা login/refresh token-এর জন্য। Login করার সময় UserRepository.get_by_user_id() দিয়ে user খুঁজে, password verify করে, access/refresh token generate করে। তাই এটা Security module-এর login foundation। 


7. services/permission_service.py
এটা Permission CRUD না। এটা permission checking service। require_permission(...) guard যখন check করে user-এর permission আছে কিনা, তখন এই service/RBACRepository flow use হয়। তাই এটা untouched থাকবে। 


8. api/v1/roles.py
এটা Role API endpoints expose করছে: list, get, create, update, delete, restore, permanent delete। প্রতিটা endpoint require_permission(...) দিয়ে protected। 


9. api/v1/router.py
এখানে routers include করা হয়। এখন roles এবং permissions router already include করা আছে। তাই /api/v1/roles এবং /api/v1/permissions backend route active হচ্ছে। 


10. api/v1/users.py
এখানে Users Management API আছে: /users/me, list, get, create, update, inactive, restore। তাই Users Management Backend already done. 


Duplicate আছে কিনা?
Uploaded files-এর মধ্যে role_repository.py এবং role_repository(1).py একই ধরনের duplicate copy মনে হচ্ছে। Actual project folder-এ শুধু এইটা থাকা উচিত:

E:\Audit\AMS\backend\app\repositories\role_repository.py
role_repository(1).py যদি project folder-এ accidentally থাকে, সেটা রাখা দরকার নেই। কিন্তু uploaded file হিসেবে থাকলে সমস্যা নেই।

এখন User Role Assignment-এর জন্য কী করব?
আমরা existing UserRepository আর RoleRepository reuse করব। নতুন করে user বা role repository বানাব না।

শুধু নতুন assignment-specific files লাগবে:

app/schemas/user_role.py
app/repositories/user_role_repository.py
app/services/user_role/user_role_service.py
app/api/v1/user_roles.py
router.py include
এগুলা দরকার কারণ user_roles table manage করার জন্য আলাদা API লাগবে:

GET    /api/v1/user-roles/users/{user_id}/roles
POST   /api/v1/user-roles
DELETE /api/v1/user-roles/{user_role_id}
Final decision:

✅ Role files থাকবে
✅ Permission files থাকবে
✅ User files থাকবে
✅ Auth/Permission checking service untouched থাকবে
✅ UserRole Assignment-এর জন্য only new user_role management files বানাব
❌ duplicate repository/service বানাব না

Final decision এগিয়ে যাও

Thought for 37s
ঠিক আছে, এগিয়ে যাচ্ছি ✅
এখন আমরা User Role Assignment Backend করব।

এখানে নতুন user/role repository বানাব না। Existing UserRepository এবং RoleRepository reuse করব, কারণ এগুলো already user/role read-check করার জন্য আছে। 

 


user_roles model/table already আছে, তাই migration লাগবে না। 


Step 1: Schema + Repository
এই ২টা file create করো।

# E:\Audit\AMS\backend\app\schemas\user_role.py

from datetime import datetime

from pydantic import BaseModel, Field


class UserRoleAssignRequest(BaseModel):
    user_id: int = Field(..., gt=0)
    role_id: int = Field(..., gt=0)


class UserRoleResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    user_login_id: str
    user_full_name: str
    role_name: str
    role_description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class UserRoleListResponse(BaseModel):
    items: list[UserRoleResponse]
    total: int


class UserRoleMessageResponse(BaseModel):
    message: str
    data: UserRoleResponse | None = None
# E:\Audit\AMS\backend\app\repositories\user_role_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role
from app.models.user import User
from app.models.user_role import UserRole


class UserRoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_response_dict(
        self,
        user_role: UserRole,
        user: User,
        role: Role,
    ) -> dict:
        return {
            "id": user_role.id,
            "user_id": user_role.user_id,
            "role_id": user_role.role_id,
            "user_login_id": user.user_id,
            "user_full_name": user.full_name,
            "role_name": role.role_name,
            "role_description": role.description,
            "is_active": user_role.is_active,
            "created_by": user_role.created_by,
            "updated_by": user_role.updated_by,
            "created_at": user_role.created_at,
            "updated_at": user_role.updated_at,
        }

    async def list_roles_for_user(
        self,
        user_id: int,
        is_active: bool | None = True,
    ) -> list[dict]:
        query = (
            select(UserRole, User, Role)
            .join(User, User.id == UserRole.user_id)
            .join(Role, Role.id == UserRole.role_id)
            .where(UserRole.user_id == user_id)
            .order_by(Role.role_name.asc())
        )

        if is_active is not None:
            query = query.where(UserRole.is_active == is_active)

        result = await self.db.execute(query)
        rows = result.all()

        return [
            self._to_response_dict(
                user_role=row[0],
                user=row[1],
                role=row[2],
            )
            for row in rows
        ]

    async def get_existing_any_status(
        self,
        user_id: int,
        role_id: int,
    ) -> UserRole | None:
        result = await self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_details(
        self,
        user_role_id: int,
    ) -> dict | None:
        result = await self.db.execute(
            select(UserRole, User, Role)
            .join(User, User.id == UserRole.user_id)
            .join(Role, Role.id == UserRole.role_id)
            .where(UserRole.id == user_role_id)
        )

        row = result.first()

        if not row:
            return None

        return self._to_response_dict(
            user_role=row[0],
            user=row[1],
            role=row[2],
        )

    async def get_by_id_any_status(
        self,
        user_role_id: int,
    ) -> UserRole | None:
        result = await self.db.execute(
            select(UserRole).where(UserRole.id == user_role_id)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        user_id: int,
        role_id: int,
        created_by: str,
    ) -> UserRole:
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(user_role)
        await self.db.commit()
        await self.db.refresh(user_role)

        return user_role

    async def restore(
        self,
        user_role: UserRole,
        updated_by: str,
    ) -> UserRole:
        user_role.is_active = True
        user_role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user_role)

        return user_role

    async def deactivate(
        self,
        user_role: UserRole,
        updated_by: str,
    ) -> UserRole:
        user_role.is_active = False
        user_role.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(user_role)

        return user_role
Step 2: Service
Folder create করো:

New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\user_role
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\user_role\__init__.py
তারপর service file create করো।

# E:\Audit\AMS\backend\app\services\user_role\user_role_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.repositories.user_role_repository import UserRoleRepository
from app.schemas.user_role import UserRoleAssignRequest


class UserRoleService:
    def __init__(self, db: AsyncSession):
        self.user_repository = UserRepository(db)
        self.role_repository = RoleRepository(db)
        self.user_role_repository = UserRoleRepository(db)

    async def list_roles_for_user(
        self,
        user_id: int,
        is_active: bool | None = True,
    ):
        user = await self.user_repository.get_by_id_any_status(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        items = await self.user_role_repository.list_roles_for_user(
            user_id=user_id,
            is_active=is_active,
        )

        return {
            "items": items,
            "total": len(items),
        }

    async def assign_role_to_user(
        self,
        payload: UserRoleAssignRequest,
        created_by: str,
    ):
        user = await self.user_repository.get_by_id_any_status(payload.user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign role to inactive user.",
            )

        role = await self.role_repository.get_by_id(payload.role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if not role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign inactive role.",
            )

        existing_user_role = (
            await self.user_role_repository.get_existing_any_status(
                user_id=payload.user_id,
                role_id=payload.role_id,
            )
        )

        if existing_user_role and existing_user_role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role is already assigned to this user.",
            )

        if existing_user_role and not existing_user_role.is_active:
            restored_user_role = await self.user_role_repository.restore(
                user_role=existing_user_role,
                updated_by=created_by,
            )

            data = await self.user_role_repository.get_by_id_with_details(
                restored_user_role.id
            )

            return {
                "message": "Role assignment restored successfully.",
                "data": data,
            }

        user_role = await self.user_role_repository.create(
            user_id=payload.user_id,
            role_id=payload.role_id,
            created_by=created_by,
        )

        data = await self.user_role_repository.get_by_id_with_details(
            user_role.id
        )

        return {
            "message": "Role assigned to user successfully.",
            "data": data,
        }

    async def remove_role_from_user(
        self,
        user_role_id: int,
        current_user_id: int,
        updated_by: str,
    ):
        user_role = await self.user_role_repository.get_by_id_any_status(
            user_role_id
        )

        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User role assignment not found.",
            )

        if not user_role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role assignment is already inactive.",
            )

        if user_role.user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove role assignment from your own account.",
            )

        updated_user_role = await self.user_role_repository.deactivate(
            user_role=user_role,
            updated_by=updated_by,
        )

        data = await self.user_role_repository.get_by_id_with_details(
            updated_user_role.id
        )

        return {
            "message": "Role removed from user successfully.",
            "data": data,
        }
Step 3: API + router include
এই API file create করো।

# E:\Audit\AMS\backend\app\api\v1\user_roles.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.user_role import (
    UserRoleAssignRequest,
    UserRoleListResponse,
    UserRoleMessageResponse,
)
from app.services.user_role.user_role_service import UserRoleService

router = APIRouter(prefix="/user-roles", tags=["User Roles"])


@router.get(
    "/users/{user_id}/roles",
    response_model=UserRoleListResponse,
)
async def list_roles_for_user(
    user_id: int,
    is_active: bool | None = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.user_role.view")),
):
    service = UserRoleService(db)
    return await service.list_roles_for_user(
        user_id=user_id,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=UserRoleMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_role_to_user(
    payload: UserRoleAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user_role.assign")),
):
    service = UserRoleService(db)
    return await service.assign_role_to_user(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{user_role_id}",
    response_model=UserRoleMessageResponse,
)
async def remove_role_from_user(
    user_role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.user_role.remove")),
):
    service = UserRoleService(db)
    return await service.remove_role_from_user(
        user_role_id=user_role_id,
        current_user_id=current_user.id,
        updated_by=current_user.user_id,
    )
E:\Audit\AMS\backend\app\api\v1\router.py-তে import add করো:

from app.api.v1.user_roles import router as user_roles_router
তারপর bottom-এ include করো:

api_router.include_router(user_roles_router)
Step 4: Verify
Run করো:

cd E:\Audit\AMS\backend
python -m compileall app
python -c "from app.api.v1.user_roles import router; print([r.path for r in router.routes])"
Expected:

['/user-roles/users/{user_id}/roles', '/user-roles', '/user-roles/{user_role_id}']
Server restart:

uvicorn main:app --reload
Swagger test:

POST /api/v1/user-roles
Payload:

{
  "user_id": 2,
  "role_id": 1
}
তারপর:

GET /api/v1/user-roles/users/2/roles
DELETE /api/v1/user-roles/{user_role_id}
POST /api/v1/user-roles
শেষের POST আবার করলে inactive assignment restore হবে, duplicate row create হবে না।


done

Thought for 6s
Good ✅ এখন User Role Assignment Backend verify করো।

Backend root থেকে run করো:

cd E:\Audit\AMS\backend
python -m compileall app
python -c "from app.api.v1.user_roles import router; print([r.path for r in router.routes])"
Expected:

['/user-roles/users/{user_id}/roles', '/user-roles', '/user-roles/{user_role_id}']
তারপর backend restart:

uvicorn main:app --reload
Swagger open:

http://127.0.0.1:8000/docs
Test order:

1. POST /api/v1/user-roles
2. GET /api/v1/user-roles/users/{user_id}/roles
3. DELETE /api/v1/user-roles/{user_role_id}
4. POST /api/v1/user-roles again
POST payload example:

{
  "user_id": 2,
  "role_id": 1
}
Expected logs:

POST /api/v1/user-roles 201 Created
GET /api/v1/user-roles/users/2/roles 200 OK
DELETE /api/v1/user-roles/{id} 200 OK
POST /api/v1/user-roles 201 Created
শেষের POST করলে আগের inactive assignment restore হবে, duplicate row create হবে না।

যদি 403 Forbidden আসে, তাহলে menu.user_role.view, api.user_role.assign, api.user_role.remove permission seed/assign করতে হবে।


INFO:     127.0.0.1:50441 - "GET /openapi.json HTTP/1.1" 200 OK
INFO:     127.0.0.1:61059 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:49858 - "POST /api/v1/user-roles HTTP/1.1" 403 Forbidden
INFO:     127.0.0.1:60563 - "GET /api/v1/user-roles/users/1/roles?is_active=true HTTP/1.1" 403 Forbidden
INFO:     127.0.0.1:61047 - "GET /api/v1/user-roles/users/2/roles?is_active=true HTTP/1.1" 403 Forbidden

Thought for 38s
এটা code bug না ✅
403 Forbidden এসেছে কারণ নতুন user-roles endpoints-এর permission এখনো DB-তে seed/assigned হয়নি।

তোমার existing security flow এমন:

API endpoint → require_permission("permission_key") → PermissionService → RBACRepository → user role permission check
PermissionService-এ superuser হলে bypass করে, আর superuser না হলে role-permission check করে। 


তোমার Roles/Users API-তেও একই require_permission(...) pattern use হচ্ছে। 

 


তাই এখন শুধু এই ৩টা permission seed + admin/security role-এ assign করতে হবে:

menu.user_role.view
api.user_role.assign
api.user_role.remove
Step 1: Seed script create করো
Create file:

E:\Audit\AMS\backend\scripts\seed_user_role_permissions.py
এই code paste করো:

# E:\Audit\AMS\backend\scripts\seed_user_role_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


USER_ROLE_PERMISSIONS = [
    {
        "permission_key": "menu.user_role.view",
        "resource_type": "menu",
        "resource_key": "user_role",
        "action": "view",
        "description": "Can view user role assignments.",
    },
    {
        "permission_key": "api.user_role.assign",
        "resource_type": "api",
        "resource_key": "user_role",
        "action": "assign",
        "description": "Can assign roles to users.",
    },
    {
        "permission_key": "api.user_role.remove",
        "resource_type": "api",
        "resource_key": "user_role",
        "action": "remove",
        "description": "Can remove roles from users.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.user.view",
    "api.user.create",
    "api.user.update",
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(
    db,
    role_id: int,
    permission_id: int,
) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_user_role_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in USER_ROLE_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            print("Create or identify an admin role first, then assign these permissions manually.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("User role permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_user_role_permissions())
Step 2: Run করো
cd E:\Audit\AMS\backend
python -m scripts.seed_user_role_permissions
Expected output এমন হবে:

Permission created/exist: menu.user_role.view
Permission created/exist: api.user_role.assign
Permission created/exist: api.user_role.remove
Target role IDs: [...]
Role permission assigned/exist...
User role permissions seed completed.
Step 3: Test again
Backend restart না করলেও usually কাজ করবে, কারণ permission DB থেকে check হয়। তারপরও clean করার জন্য server restart করতে পারো।

uvicorn main:app --reload
তারপর Swagger থেকে আবার test করো:

POST /api/v1/user-roles
GET /api/v1/user-roles/users/1/roles
GET /api/v1/user-roles/users/2/roles
Expected:

201 Created
200 OK
200 OK
যদি script output-এ No target security/admin role found আসে, তাহলে তোমার current logged-in user কোন role পেয়েছে সেটা আগে list করতে হবে।


INFO:     127.0.0.1:60844 - "GET /docs HTTP/1.1" 200 OK
INFO:     127.0.0.1:60844 - "GET /openapi.json HTTP/1.1" 200 OK
INFO:     127.0.0.1:64139 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:60349 - "POST /api/v1/user-roles HTTP/1.1" 201 Created
INFO:     127.0.0.1:52359 - "GET /api/v1/user-roles/users/2/roles?is_active=true HTTP/1.1" 200 OK

Thought for a few seconds
Excellent ✅ User Role Assignment Backend now working.

Confirmed:

✅ POST /api/v1/user-roles 201 Created
✅ GET /api/v1/user-roles/users/2/roles 200 OK
মানে:

✅ Permission seed worked
✅ user role assign endpoint working
✅ user role list endpoint working
✅ Role assigned to user successfully
✅ RBAC guard passed
এখন শুধু final test বাকি:

DELETE /api/v1/user-roles/{user_role_id}
POST /api/v1/user-roles again
প্রথমে GET /api/v1/user-roles/users/2/roles response থেকে id নিবা। ওই id হলো user_role_id.

তারপর:

DELETE /api/v1/user-roles/{user_role_id}
Expected:

200 OK
Role removed from user successfully.
তারপর একই payload দিয়ে আবার assign করো:

{
  "user_id": 2,
  "role_id": 1
}
Expected:

201 Created
Role assignment restored successfully.
সব pass হলে User Role Assignment Backend complete হবে। Next module হবে Role Permission Assignment Backend.


go for Next module Role Permission Assignment Backend

Thought for 18s
ঠিক আছে ✅ এখন Role Permission Assignment Backend শুরু করছি।

এখানে duplicate করব না:

Existing RoleRepository reuse হবে role খুঁজতে/check করতে। 


Existing PermissionRepository reuse হবে permission খুঁজতে/check করতে। 


Existing role_permissions model/table already আছে, তাই migration লাগবে না। 


Endpoints হবে:

GET    /api/v1/role-permissions/roles/{role_id}/permissions
POST   /api/v1/role-permissions
DELETE /api/v1/role-permissions/{role_permission_id}
Step 1: Schema + Repository
Create these files:

# E:\Audit\AMS\backend\app\schemas\role_permission.py

from datetime import datetime

from pydantic import BaseModel, Field


class RolePermissionAssignRequest(BaseModel):
    role_id: int = Field(..., gt=0)
    permission_id: int = Field(..., gt=0)


class RolePermissionResponse(BaseModel):
    id: int
    role_id: int
    permission_id: int
    role_name: str
    permission_key: str
    resource_type: str
    resource_key: str
    action: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class RolePermissionListResponse(BaseModel):
    items: list[RolePermissionResponse]
    total: int


class RolePermissionMessageResponse(BaseModel):
    message: str
    data: RolePermissionResponse | None = None
# E:\Audit\AMS\backend\app\repositories\role_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


class RolePermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_response_dict(
        self,
        role_permission: RolePermission,
        role: Role,
        permission: Permission,
    ) -> dict:
        return {
            "id": role_permission.id,
            "role_id": role_permission.role_id,
            "permission_id": role_permission.permission_id,
            "role_name": role.role_name,
            "permission_key": permission.permission_key,
            "resource_type": permission.resource_type,
            "resource_key": permission.resource_key,
            "action": permission.action,
            "description": permission.description,
            "is_active": role_permission.is_active,
            "created_by": role_permission.created_by,
            "updated_by": role_permission.updated_by,
            "created_at": role_permission.created_at,
            "updated_at": role_permission.updated_at,
        }

    async def list_permissions_for_role(
        self,
        role_id: int,
        is_active: bool | None = True,
    ) -> list[dict]:
        query = (
            select(RolePermission, Role, Permission)
            .join(Role, Role.id == RolePermission.role_id)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .where(RolePermission.role_id == role_id)
            .order_by(
                Permission.resource_type.asc(),
                Permission.resource_key.asc(),
                Permission.action.asc(),
            )
        )

        if is_active is not None:
            query = query.where(RolePermission.is_active == is_active)

        result = await self.db.execute(query)
        rows = result.all()

        return [
            self._to_response_dict(
                role_permission=row[0],
                role=row[1],
                permission=row[2],
            )
            for row in rows
        ]

    async def get_existing_any_status(
        self,
        role_id: int,
        permission_id: int,
    ) -> RolePermission | None:
        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id,
                RolePermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(
        self,
        role_permission_id: int,
    ) -> RolePermission | None:
        result = await self.db.execute(
            select(RolePermission).where(RolePermission.id == role_permission_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_details(
        self,
        role_permission_id: int,
    ) -> dict | None:
        result = await self.db.execute(
            select(RolePermission, Role, Permission)
            .join(Role, Role.id == RolePermission.role_id)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .where(RolePermission.id == role_permission_id)
        )

        row = result.first()

        if not row:
            return None

        return self._to_response_dict(
            role_permission=row[0],
            role=row[1],
            permission=row[2],
        )

    async def create(
        self,
        role_id: int,
        permission_id: int,
        created_by: str,
    ) -> RolePermission:
        role_permission = RolePermission(
            role_id=role_id,
            permission_id=permission_id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(role_permission)
        await self.db.commit()
        await self.db.refresh(role_permission)

        return role_permission

    async def restore(
        self,
        role_permission: RolePermission,
        updated_by: str,
    ) -> RolePermission:
        role_permission.is_active = True
        role_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role_permission)

        return role_permission

    async def deactivate(
        self,
        role_permission: RolePermission,
        updated_by: str,
    ) -> RolePermission:
        role_permission.is_active = False
        role_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(role_permission)

        return role_permission
Step 2: Service + API + Router include
Create folder first:

New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\role_permission
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\role_permission\__init__.py
Then create these files:

# E:\Audit\AMS\backend\app\services\role_permission\role_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.permission_repository import PermissionRepository
from app.repositories.role_permission_repository import RolePermissionRepository
from app.repositories.role_repository import RoleRepository
from app.schemas.role_permission import RolePermissionAssignRequest


class RolePermissionService:
    def __init__(self, db: AsyncSession):
        self.role_repository = RoleRepository(db)
        self.permission_repository = PermissionRepository(db)
        self.role_permission_repository = RolePermissionRepository(db)

    async def list_permissions_for_role(
        self,
        role_id: int,
        is_active: bool | None = True,
    ):
        role = await self.role_repository.get_by_id(role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        items = await self.role_permission_repository.list_permissions_for_role(
            role_id=role_id,
            is_active=is_active,
        )

        return {
            "items": items,
            "total": len(items),
        }

    async def assign_permission_to_role(
        self,
        payload: RolePermissionAssignRequest,
        created_by: str,
    ):
        role = await self.role_repository.get_by_id(payload.role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found.",
            )

        if not role.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign permission to inactive role.",
            )

        permission = await self.permission_repository.get_by_id(
            payload.permission_id
        )

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign inactive permission.",
            )

        existing_role_permission = (
            await self.role_permission_repository.get_existing_any_status(
                role_id=payload.role_id,
                permission_id=payload.permission_id,
            )
        )

        if existing_role_permission and existing_role_permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is already assigned to this role.",
            )

        if existing_role_permission and not existing_role_permission.is_active:
            restored_role_permission = await self.role_permission_repository.restore(
                role_permission=existing_role_permission,
                updated_by=created_by,
            )

            data = await self.role_permission_repository.get_by_id_with_details(
                restored_role_permission.id
            )

            return {
                "message": "Role permission assignment restored successfully.",
                "data": data,
            }

        role_permission = await self.role_permission_repository.create(
            role_id=payload.role_id,
            permission_id=payload.permission_id,
            created_by=created_by,
        )

        data = await self.role_permission_repository.get_by_id_with_details(
            role_permission.id
        )

        return {
            "message": "Permission assigned to role successfully.",
            "data": data,
        }

    async def remove_permission_from_role(
        self,
        role_permission_id: int,
        updated_by: str,
    ):
        role_permission = await self.role_permission_repository.get_by_id_any_status(
            role_permission_id
        )

        if not role_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role permission assignment not found.",
            )

        if not role_permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This role permission assignment is already inactive.",
            )

        updated_role_permission = await self.role_permission_repository.deactivate(
            role_permission=role_permission,
            updated_by=updated_by,
        )

        data = await self.role_permission_repository.get_by_id_with_details(
            updated_role_permission.id
        )

        return {
            "message": "Permission removed from role successfully.",
            "data": data,
        }
# E:\Audit\AMS\backend\app\api\v1\role_permissions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.role_permission import (
    RolePermissionAssignRequest,
    RolePermissionListResponse,
    RolePermissionMessageResponse,
)
from app.services.role_permission.role_permission_service import (
    RolePermissionService,
)

router = APIRouter(prefix="/role-permissions", tags=["Role Permissions"])


@router.get(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionListResponse,
)
async def list_permissions_for_role(
    role_id: int,
    is_active: bool | None = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.role_permission.view")),
):
    service = RolePermissionService(db)
    return await service.list_permissions_for_role(
        role_id=role_id,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=RolePermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_role(
    payload: RolePermissionAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role_permission.assign")),
):
    service = RolePermissionService(db)
    return await service.assign_permission_to_role(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{role_permission_id}",
    response_model=RolePermissionMessageResponse,
)
async def remove_permission_from_role(
    role_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.role_permission.remove")),
):
    service = RolePermissionService(db)
    return await service.remove_permission_from_role(
        role_permission_id=role_permission_id,
        updated_by=current_user.user_id,
    )
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add this import
from app.api.v1.role_permissions import router as role_permissions_router

# Add this include at the bottom
api_router.include_router(role_permissions_router)
Step 3: Seed permissions for this module
এই module test করতে current admin/security role-এর মধ্যে নিচের permission লাগবে:

menu.role_permission.view
api.role_permission.assign
api.role_permission.remove
Create script:

E:\Audit\AMS\backend\scripts\seed_role_permission_permissions.py
# E:\Audit\AMS\backend\scripts\seed_role_permission_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


ROLE_PERMISSION_PERMISSIONS = [
    {
        "permission_key": "menu.role_permission.view",
        "resource_type": "menu",
        "resource_key": "role_permission",
        "action": "view",
        "description": "Can view role permission assignments.",
    },
    {
        "permission_key": "api.role_permission.assign",
        "resource_type": "api",
        "resource_key": "role_permission",
        "action": "assign",
        "description": "Can assign permissions to roles.",
    },
    {
        "permission_key": "api.role_permission.remove",
        "resource_type": "api",
        "resource_key": "role_permission",
        "action": "remove",
        "description": "Can remove permissions from roles.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.role.view",
    "api.role.create",
    "api.role.update",
    "menu.permission.view",
    "api.permission.create",
    "api.permission.update",
    "menu.user_role.view",
    "api.user_role.assign",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(
    db,
    role_id: int,
    permission_id: int,
) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_role_permission_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in ROLE_PERMISSION_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            print("Create or identify an admin role first, then assign these permissions manually.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Role permission permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_role_permission_permissions())
Run:

cd E:\Audit\AMS\backend
python -m scripts.seed_role_permission_permissions
Step 4: Verify
Run:

cd E:\Audit\AMS\backend
python -m compileall app
python -c "from app.api.v1.role_permissions import router; print([r.path for r in router.routes])"
Expected:

['/role-permissions/roles/{role_id}/permissions', '/role-permissions', '/role-permissions/{role_permission_id}']
Restart backend:

uvicorn main:app --reload
Swagger test order:

POST /api/v1/role-permissions
GET /api/v1/role-permissions/roles/{role_id}/permissions
DELETE /api/v1/role-permissions/{role_permission_id}
POST /api/v1/role-permissions again
POST payload example:

{
  "role_id": 1,
  "permission_id": 1
}
Last POST করলে inactive assignment restore হবে, duplicate row create হবে না।


INFO:     127.0.0.1:60162 - "GET /openapi.json HTTP/1.1" 200 OK
INFO:     127.0.0.1:55708 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:61489 - "POST /api/v1/role-permissions HTTP/1.1" 400 Bad Request

400
Undocumented
Error: Bad Request

Response body
Download
{
  "detail": "This permission is already assigned to this role."
} 

Thought for 10s
এই 400 Bad Request problem না ✅
এটা আসলে correct validation কাজ করছে।

Response:

{
  "detail": "This permission is already assigned to this role."
}
মানে তুমি যেই payload দিয়েছো:

{
  "role_id": 1,
  "permission_id": 1
}
এই permission already ওই role-এর সাথে active assigned আছে। তাই duplicate row create না করে backend block করেছে। এটা expected behavior.

এখন কী test করবে
প্রথমে list endpoint test করো:

GET /api/v1/role-permissions/roles/1/permissions
Expected:

200 OK
এই response থেকে id নিবে। ওই id হলো role_permission_id.

কিন্তু সাবধান: যদি role_id=1 তোমার admin/security role হয়, তাহলে ওই role permission delete করে test করো না। নিজের admin permission remove করলে পরে access issue হতে পারে।

Safe test করার best way
একটা test role আর test permission দিয়ে test করো:

1. POST /api/v1/roles
   role_name: RP Test Role

2. POST /api/v1/permissions
   permission_key: api.rp_test.view
   resource_type: api
   resource_key: rp_test
   action: view

3. POST /api/v1/role-permissions
   role_id: new test role id
   permission_id: new test permission id

4. GET /api/v1/role-permissions/roles/{test_role_id}/permissions

5. DELETE /api/v1/role-permissions/{role_permission_id}

6. POST /api/v1/role-permissions again
Last POST করলে inactive assignment restore হবে, duplicate row create হবে না।

So current result:

✅ Duplicate prevention working
✅ Role Permission Assignment service working
এখন শুধু safe test role দিয়ে full assign → list → remove → restore flow test করো।


okay done এগিয়ে যাও

Thought for 30s
ঠিক আছে ✅
Security Phase 1 backend complete ধরে এখন আমরা Security Phase 2 শুরু করছি।

Next module:

Navigation Groups Management Backend
Important: existing schemas/navigation.py touch করব না, কারণ সেটা /me/navigation sidebar response-এর জন্য used হচ্ছে। Existing NavigationGroup model already আছে, তাই migration লাগবে না। Model-এ group_key, group_title, group_icon, parent_group_id, sort_order, is_collapsible, is_visible, group_badge, group_color, group_permission_key আছে। 


Step 1: Schema + Repository
এই ২টা file create করো।

# E:\Audit\AMS\backend\app\schemas\navigation_group.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NavigationGroupBase(BaseModel):
    group_key: str = Field(..., min_length=2, max_length=100)
    group_title: str = Field(..., min_length=2, max_length=150)
    group_icon: str | None = Field(default=None, max_length=100)
    parent_group_id: int | None = Field(default=None, gt=0)
    sort_order: int = 0
    is_collapsible: bool = True
    is_visible: bool = True
    group_badge: str | None = Field(default=None, max_length=50)
    group_color: str | None = Field(default=None, max_length=50)
    group_permission_key: str | None = Field(default=None, max_length=150)

    @field_validator("group_key", "group_title")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field is required.")

        return value

    @field_validator(
        "group_icon",
        "group_badge",
        "group_color",
        "group_permission_key",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class NavigationGroupCreate(NavigationGroupBase):
    pass


class NavigationGroupUpdate(BaseModel):
    group_key: str | None = Field(default=None, min_length=2, max_length=100)
    group_title: str | None = Field(default=None, min_length=2, max_length=150)
    group_icon: str | None = Field(default=None, max_length=100)
    parent_group_id: int | None = Field(default=None, gt=0)
    sort_order: int | None = None
    is_collapsible: bool | None = None
    is_visible: bool | None = None
    group_badge: str | None = Field(default=None, max_length=50)
    group_color: str | None = Field(default=None, max_length=50)
    group_permission_key: str | None = Field(default=None, max_length=150)

    @field_validator("group_key", "group_title")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator(
        "group_icon",
        "group_badge",
        "group_color",
        "group_permission_key",
    )
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class NavigationGroupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    group_key: str
    group_title: str
    group_icon: str | None = None
    parent_group_id: int | None = None
    sort_order: int
    is_collapsible: bool
    is_visible: bool
    group_badge: str | None = None
    group_color: str | None = None
    group_permission_key: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class NavigationGroupListResponse(BaseModel):
    items: list[NavigationGroupResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class NavigationGroupMessageResponse(BaseModel):
    message: str
    data: NavigationGroupResponse | None = None
# E:\Audit\AMS\backend\app\repositories\navigation_group_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.navigation_group import NavigationGroup


class NavigationGroupRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        parent_group_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[NavigationGroup], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    NavigationGroup.group_key.ilike(search_text),
                    NavigationGroup.group_title.ilike(search_text),
                    NavigationGroup.group_icon.ilike(search_text),
                    NavigationGroup.group_badge.ilike(search_text),
                    NavigationGroup.group_color.ilike(search_text),
                    NavigationGroup.group_permission_key.ilike(search_text),
                )
            )

        if parent_group_id is not None:
            conditions.append(NavigationGroup.parent_group_id == parent_group_id)

        if is_visible is not None:
            conditions.append(NavigationGroup.is_visible == is_visible)

        if is_active is not None:
            conditions.append(NavigationGroup.is_active == is_active)

        count_stmt = select(func.count()).select_from(NavigationGroup)
        query = select(NavigationGroup)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": NavigationGroup.id,
            "group_key": NavigationGroup.group_key,
            "group_title": NavigationGroup.group_title,
            "sort_order": NavigationGroup.sort_order,
            "is_visible": NavigationGroup.is_visible,
            "is_active": NavigationGroup.is_active,
            "created_at": NavigationGroup.created_at,
            "updated_at": NavigationGroup.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, NavigationGroup.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, NavigationGroup.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, group_id: int) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(
                NavigationGroup.id == group_id,
                NavigationGroup.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, group_id: int) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(NavigationGroup.id == group_id)
        )
        return result.scalar_one_or_none()

    async def get_by_key(self, group_key: str) -> NavigationGroup | None:
        result = await self.db.execute(
            select(NavigationGroup).where(
                func.lower(NavigationGroup.group_key) == group_key.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        data: dict,
        created_by: str,
    ) -> NavigationGroup:
        group = NavigationGroup(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(group)
        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def update(
        self,
        group: NavigationGroup,
        update_data: dict,
        updated_by: str,
    ) -> NavigationGroup:
        for field, value in update_data.items():
            setattr(group, field, value)

        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def deactivate(
        self,
        group: NavigationGroup,
        updated_by: str,
    ) -> NavigationGroup:
        group.is_active = False
        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def restore(
        self,
        group: NavigationGroup,
        updated_by: str,
    ) -> NavigationGroup:
        group.is_active = True
        group.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def count_child_groups(self, group_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(NavigationGroup).where(
                NavigationGroup.parent_group_id == group_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menus(self, group_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Menu).where(
                Menu.navigation_group_id == group_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, group: NavigationGroup) -> None:
        await self.db.delete(group)
        await self.db.commit()
Step 2: Service + API + Router include
Create folder:

New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\navigation_group
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\navigation_group\__init__.py
তারপর এই files create করো।

# E:\Audit\AMS\backend\app\services\navigation_group\navigation_group_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.navigation_group_repository import NavigationGroupRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.navigation_group import NavigationGroupCreate, NavigationGroupUpdate


class NavigationGroupService:
    def __init__(self, db: AsyncSession):
        self.repository = NavigationGroupRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_permission_key(self, permission_key: str | None) -> None:
        if permission_key is None:
            return

        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group permission key is inactive.",
            )

    async def _validate_parent_group(
        self,
        parent_group_id: int | None,
        current_group_id: int | None = None,
    ) -> None:
        if parent_group_id is None:
            return

        if current_group_id is not None and parent_group_id == current_group_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group cannot be its own parent.",
            )

        parent_group = await self.repository.get_by_id(parent_group_id)

        if not parent_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent navigation group not found or inactive.",
            )

        if current_group_id is None:
            return

        current_parent_id = parent_group.parent_group_id

        while current_parent_id is not None:
            if current_parent_id == current_group_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent group. This would create a navigation group cycle.",
                )

            parent = await self.repository.get_by_id_any_status(current_parent_id)

            if not parent:
                break

            current_parent_id = parent.parent_group_id

    async def list_navigation_groups(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        parent_group_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            parent_group_id=parent_group_id,
            is_visible=is_visible,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_navigation_group(self, group_id: int):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        return group

    async def create_navigation_group(
        self,
        payload: NavigationGroupCreate,
        created_by: str,
    ):
        existing_group = await self.repository.get_by_key(payload.group_key)

        if existing_group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group key already exists.",
            )

        await self._validate_parent_group(payload.parent_group_id)
        await self._validate_permission_key(payload.group_permission_key)

        data = payload.model_dump()

        group = await self.repository.create(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Navigation group created successfully.",
            "data": group,
        }

    async def update_navigation_group(
        self,
        group_id: int,
        payload: NavigationGroupUpdate,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "group_key" in update_data:
            existing_group = await self.repository.get_by_key(
                update_data["group_key"]
            )

            if existing_group and existing_group.id != group.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Navigation group key already exists.",
                )

        if "parent_group_id" in update_data:
            await self._validate_parent_group(
                parent_group_id=update_data["parent_group_id"],
                current_group_id=group.id,
            )

        if "group_permission_key" in update_data:
            await self._validate_permission_key(update_data["group_permission_key"])

        updated_group = await self.repository.update(
            group=group,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group updated successfully.",
            "data": updated_group,
        }

    async def deactivate_navigation_group(
        self,
        group_id: int,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        if not group.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group is already inactive.",
            )

        updated_group = await self.repository.deactivate(
            group=group,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group deactivated successfully.",
            "data": updated_group,
        }

    async def restore_navigation_group(
        self,
        group_id: int,
        updated_by: str,
    ):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        if group.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group is already active.",
            )

        updated_group = await self.repository.restore(
            group=group,
            updated_by=updated_by,
        )

        return {
            "message": "Navigation group restored successfully.",
            "data": updated_group,
        }

    async def permanent_delete_navigation_group(self, group_id: int):
        group = await self.repository.get_by_id_any_status(group_id)

        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Navigation group not found.",
            )

        child_group_count = await self.repository.count_child_groups(group_id)
        menu_count = await self.repository.count_menus(group_id)

        if child_group_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This navigation group has child group(s). Remove them first.",
            )

        if menu_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This navigation group has menu(s). Remove menus first.",
            )

        await self.repository.permanent_delete(group)

        return {
            "message": "Navigation group permanently deleted successfully.",
            "data": None,
        }
# E:\Audit\AMS\backend\app\api\v1\navigation_groups.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.navigation_group import (
    NavigationGroupCreate,
    NavigationGroupListResponse,
    NavigationGroupMessageResponse,
    NavigationGroupResponse,
    NavigationGroupUpdate,
)
from app.services.navigation_group.navigation_group_service import (
    NavigationGroupService,
)

router = APIRouter(prefix="/navigation-groups", tags=["Navigation Groups"])


@router.get("", response_model=NavigationGroupListResponse)
async def list_navigation_groups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    parent_group_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.navigation_group.view")),
):
    service = NavigationGroupService(db)
    return await service.list_navigation_groups(
        page=page,
        page_size=page_size,
        search=search,
        parent_group_id=parent_group_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{group_id}", response_model=NavigationGroupResponse)
async def get_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.navigation_group.view")),
):
    service = NavigationGroupService(db)
    return await service.get_navigation_group(group_id)


@router.post(
    "",
    response_model=NavigationGroupMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_navigation_group(
    payload: NavigationGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.create")),
):
    service = NavigationGroupService(db)
    return await service.create_navigation_group(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{group_id}", response_model=NavigationGroupMessageResponse)
async def update_navigation_group(
    group_id: int,
    payload: NavigationGroupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.update")),
):
    service = NavigationGroupService(db)
    return await service.update_navigation_group(
        group_id=group_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{group_id}", response_model=NavigationGroupMessageResponse)
async def delete_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.delete")),
):
    service = NavigationGroupService(db)
    return await service.deactivate_navigation_group(
        group_id=group_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{group_id}/restore", response_model=NavigationGroupMessageResponse)
async def restore_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.navigation_group.restore")),
):
    service = NavigationGroupService(db)
    return await service.restore_navigation_group(
        group_id=group_id,
        updated_by=current_user.user_id,
    )


@router.delete(
    "/{group_id}/permanent",
    response_model=NavigationGroupMessageResponse,
)
async def permanent_delete_navigation_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.navigation_group.permanent_delete")
    ),
):
    service = NavigationGroupService(db)
    return await service.permanent_delete_navigation_group(group_id)
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add import
from app.api.v1.navigation_groups import router as navigation_groups_router

# Add include at the bottom
api_router.include_router(navigation_groups_router)
Step 3: Seed permission for Navigation Groups
Create:

E:\Audit\AMS\backend\scripts\seed_navigation_group_permissions.py
# E:\Audit\AMS\backend\scripts\seed_navigation_group_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


NAVIGATION_GROUP_PERMISSIONS = [
    {
        "permission_key": "menu.navigation_group.view",
        "resource_type": "menu",
        "resource_key": "navigation_group",
        "action": "view",
        "description": "Can view navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.create",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "create",
        "description": "Can create navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.update",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "update",
        "description": "Can update navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.delete",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "delete",
        "description": "Can deactivate navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.restore",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "restore",
        "description": "Can restore navigation groups.",
    },
    {
        "permission_key": "api.navigation_group.permanent_delete",
        "resource_type": "api",
        "resource_key": "navigation_group",
        "action": "permanent_delete",
        "description": "Can permanently delete navigation groups.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
    "menu.user.view",
    "api.user.create",
    "menu.user_role.view",
    "api.user_role.assign",
    "menu.role_permission.view",
    "api.role_permission.assign",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_navigation_group_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in NAVIGATION_GROUP_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Navigation group permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_navigation_group_permissions())
Run:

cd E:\Audit\AMS\backend
python -m scripts.seed_navigation_group_permissions
Then verify:

python -m compileall app
python -c "from app.api.v1.navigation_groups import router; print([r.path for r in router.routes])"
Expected:

['/navigation-groups', '/navigation-groups/{group_id}', '/navigation-groups', '/navigation-groups/{group_id}', '/navigation-groups/{group_id}', '/navigation-groups/{group_id}/restore', '/navigation-groups/{group_id}/permanent']
Test payload:

{
  "group_key": "security",
  "group_title": "Security",
  "group_icon": "Shield",
  "parent_group_id": null,
  "sort_order": 10,
  "is_collapsible": true,
  "is_visible": true,
  "group_badge": null,
  "group_color": "blue",
  "group_permission_key": null
}
Expected:

POST /api/v1/navigation-groups 201 Created
GET /api/v1/navigation-groups 200 OK
PATCH /api/v1/navigation-groups/{id} 200 OK
DELETE /api/v1/navigation-groups/{id} 200 OK
PATCH /api/v1/navigation-groups/{id}/restore 200 OK
DELETE /api/v1/navigation-groups/{id}/permanent 200 OK

(.venv) PS E:\Audit\AMS\backend> python -c "from app.api.v1.navigation_groups import router; print([r.path for r in router.routes])"
['/navigation-groups', '/navigation-groups/{group_id}', '/navigation-groups', '/navigation-groups/{group_id}', '/navigation-groups/{group_id}', '/navigation-groups/{group_id}/restore', '/navigation-groups/{group_id}/permanent']
(.venv) PS E:\Audit\AMS\backend> 

Thought for a few seconds
Perfect ✅ navigation-groups routes registered হয়েছে।

Confirmed:

✅ GET     /navigation-groups
✅ GET     /navigation-groups/{group_id}
✅ POST    /navigation-groups
✅ PATCH   /navigation-groups/{group_id}
✅ DELETE  /navigation-groups/{group_id}
✅ PATCH   /navigation-groups/{group_id}/restore
✅ DELETE  /navigation-groups/{group_id}/permanent
এখন next ২টা কাজ করো।

1. Seed run করা না থাকলে run করো
cd E:\Audit\AMS\backend
python -m scripts.seed_navigation_group_permissions
2. Backend restart করে Swagger test করো
uvicorn main:app --reload
Swagger:

http://127.0.0.1:8000/docs
Test payload:

{
  "group_key": "security_test",
  "group_title": "Security Test",
  "group_icon": "Shield",
  "parent_group_id": null,
  "sort_order": 10,
  "is_collapsible": true,
  "is_visible": true,
  "group_badge": null,
  "group_color": "blue",
  "group_permission_key": null
}
Test order:

POST /api/v1/navigation-groups
GET /api/v1/navigation-groups
GET /api/v1/navigation-groups/{id}
PATCH /api/v1/navigation-groups/{id}
DELETE /api/v1/navigation-groups/{id}
PATCH /api/v1/navigation-groups/{id}/restore
DELETE /api/v1/navigation-groups/{id}/permanent
Expected logs:

POST /api/v1/navigation-groups 201 Created
GET /api/v1/navigation-groups 200 OK
PATCH /api/v1/navigation-groups/{id} 200 OK
DELETE /api/v1/navigation-groups/{id} 200 OK
PATCH /api/v1/navigation-groups/{id}/restore 200 OK
DELETE /api/v1/navigation-groups/{id}/permanent 200 OK
Pass হলে next module হবে Menus Management Backend.


Done এগিয়ে যাও

Thought for 9s
Done হলে ✅ এখন Security Phase 2 → Menus Management Backend শুরু করছি।

Existing Menu model already আছে, তাই migration লাগবে না। Model fields হলো navigation_group_id, parent_menu_id, menu_key, menu_title, route_path, icon, permission_key, sort_order, menu_level, is_expandable, is_visible। 


Existing /me/navigation sidebar এই menus table থেকেই menu read করে permission filter করে। 


Step 1: Schema + Repository
Create these files:

# E:\Audit\AMS\backend\app\schemas\menu.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MenuBase(BaseModel):
    navigation_group_id: int | None = Field(default=None, gt=0)
    parent_menu_id: int | None = Field(default=None, gt=0)
    menu_key: str = Field(..., min_length=2, max_length=100)
    menu_title: str = Field(..., min_length=2, max_length=150)
    route_path: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=100)
    permission_key: str | None = Field(default=None, max_length=150)
    sort_order: int = 0
    menu_level: int = Field(default=1, ge=1, le=5)
    is_expandable: bool = False
    is_visible: bool = True

    @field_validator("menu_key", "menu_title")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("route_path", "icon", "permission_key")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuCreate(MenuBase):
    pass


class MenuUpdate(BaseModel):
    navigation_group_id: int | None = Field(default=None, gt=0)
    parent_menu_id: int | None = Field(default=None, gt=0)
    menu_key: str | None = Field(default=None, min_length=2, max_length=100)
    menu_title: str | None = Field(default=None, min_length=2, max_length=150)
    route_path: str | None = Field(default=None, max_length=255)
    icon: str | None = Field(default=None, max_length=100)
    permission_key: str | None = Field(default=None, max_length=150)
    sort_order: int | None = None
    menu_level: int | None = Field(default=None, ge=1, le=5)
    is_expandable: bool | None = None
    is_visible: bool | None = None

    @field_validator("menu_key", "menu_title")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("route_path", "icon", "permission_key")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    navigation_group_id: int | None = None
    parent_menu_id: int | None = None
    menu_key: str
    menu_title: str
    route_path: str | None = None
    icon: str | None = None
    permission_key: str | None = None
    sort_order: int
    menu_level: int
    is_expandable: bool
    is_visible: bool
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuListResponse(BaseModel):
    items: list[MenuResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MenuMessageResponse(BaseModel):
    message: str
    data: MenuResponse | None = None
# E:\Audit\AMS\backend\app\repositories\menu_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.menu_permission import MenuPermission


class MenuRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        navigation_group_id: int | None = None,
        parent_menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[Menu], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Menu.menu_key.ilike(search_text),
                    Menu.menu_title.ilike(search_text),
                    Menu.route_path.ilike(search_text),
                    Menu.icon.ilike(search_text),
                    Menu.permission_key.ilike(search_text),
                )
            )

        if navigation_group_id is not None:
            conditions.append(Menu.navigation_group_id == navigation_group_id)

        if parent_menu_id is not None:
            conditions.append(Menu.parent_menu_id == parent_menu_id)

        if is_visible is not None:
            conditions.append(Menu.is_visible == is_visible)

        if is_active is not None:
            conditions.append(Menu.is_active == is_active)

        count_stmt = select(func.count()).select_from(Menu)
        query = select(Menu)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": Menu.id,
            "menu_key": Menu.menu_key,
            "menu_title": Menu.menu_title,
            "sort_order": Menu.sort_order,
            "menu_level": Menu.menu_level,
            "is_visible": Menu.is_visible,
            "is_active": Menu.is_active,
            "created_at": Menu.created_at,
            "updated_at": Menu.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, Menu.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, Menu.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(
            select(Menu).where(
                Menu.id == menu_id,
                Menu.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, menu_id: int) -> Menu | None:
        result = await self.db.execute(select(Menu).where(Menu.id == menu_id))
        return result.scalar_one_or_none()

    async def get_by_key(self, menu_key: str) -> Menu | None:
        result = await self.db.execute(
            select(Menu).where(
                func.lower(Menu.menu_key) == menu_key.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict, created_by: str) -> Menu:
        menu = Menu(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(menu)
        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def update(
        self,
        menu: Menu,
        update_data: dict,
        updated_by: str,
    ) -> Menu:
        for field, value in update_data.items():
            setattr(menu, field, value)

        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def deactivate(self, menu: Menu, updated_by: str) -> Menu:
        menu.is_active = False
        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def restore(self, menu: Menu, updated_by: str) -> Menu:
        menu.is_active = True
        menu.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu)

        return menu

    async def count_child_menus(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Menu).where(
                Menu.parent_menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_actions(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuAction).where(
                MenuAction.menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def count_menu_permissions(self, menu_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuPermission).where(
                MenuPermission.menu_id == menu_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, menu: Menu) -> None:
        await self.db.delete(menu)
        await self.db.commit()
Step 2: Service + API + Router include
Create folder:

New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\menu
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\menu\__init__.py
Then create these files:

# E:\Audit\AMS\backend\app\services\menu\menu_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_repository import MenuRepository
from app.repositories.navigation_group_repository import NavigationGroupRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu import MenuCreate, MenuUpdate


class MenuService:
    def __init__(self, db: AsyncSession):
        self.repository = MenuRepository(db)
        self.navigation_group_repository = NavigationGroupRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_navigation_group(
        self,
        navigation_group_id: int | None,
    ) -> None:
        if navigation_group_id is None:
            return

        group = await self.navigation_group_repository.get_by_id(
            navigation_group_id
        )

        if not group:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Navigation group not found or inactive.",
            )

    async def _validate_permission_key(self, permission_key: str | None) -> None:
        if permission_key is None:
            return

        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu permission key is inactive.",
            )

    async def _validate_parent_menu(
        self,
        parent_menu_id: int | None,
        current_menu_id: int | None = None,
    ) -> None:
        if parent_menu_id is None:
            return

        if current_menu_id is not None and parent_menu_id == current_menu_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu cannot be its own parent.",
            )

        parent_menu = await self.repository.get_by_id(parent_menu_id)

        if not parent_menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent menu not found or inactive.",
            )

        if current_menu_id is None:
            return

        current_parent_id = parent_menu.parent_menu_id

        while current_parent_id is not None:
            if current_parent_id == current_menu_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent menu. This would create a menu cycle.",
                )

            parent = await self.repository.get_by_id_any_status(current_parent_id)

            if not parent:
                break

            current_parent_id = parent.parent_menu_id

    async def list_menus(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        navigation_group_id: int | None = None,
        parent_menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            navigation_group_id=navigation_group_id,
            parent_menu_id=parent_menu_id,
            is_visible=is_visible,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_menu(self, menu_id: int):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        return menu

    async def create_menu(
        self,
        payload: MenuCreate,
        created_by: str,
    ):
        existing_menu = await self.repository.get_by_key(payload.menu_key)

        if existing_menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu key already exists.",
            )

        await self._validate_navigation_group(payload.navigation_group_id)
        await self._validate_parent_menu(payload.parent_menu_id)
        await self._validate_permission_key(payload.permission_key)

        data = payload.model_dump()

        menu = await self.repository.create(
            data=data,
            created_by=created_by,
        )

        return {
            "message": "Menu created successfully.",
            "data": menu,
        }

    async def update_menu(
        self,
        menu_id: int,
        payload: MenuUpdate,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        if "menu_key" in update_data:
            existing_menu = await self.repository.get_by_key(
                update_data["menu_key"]
            )

            if existing_menu and existing_menu.id != menu.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Menu key already exists.",
                )

        if "navigation_group_id" in update_data:
            await self._validate_navigation_group(
                update_data["navigation_group_id"]
            )

        if "parent_menu_id" in update_data:
            await self._validate_parent_menu(
                parent_menu_id=update_data["parent_menu_id"],
                current_menu_id=menu.id,
            )

        if "permission_key" in update_data:
            await self._validate_permission_key(update_data["permission_key"])

        updated_menu = await self.repository.update(
            menu=menu,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Menu updated successfully.",
            "data": updated_menu,
        }

    async def deactivate_menu(
        self,
        menu_id: int,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        if not menu.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu is already inactive.",
            )

        updated_menu = await self.repository.deactivate(
            menu=menu,
            updated_by=updated_by,
        )

        return {
            "message": "Menu deactivated successfully.",
            "data": updated_menu,
        }

    async def restore_menu(
        self,
        menu_id: int,
        updated_by: str,
    ):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        if menu.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu is already active.",
            )

        updated_menu = await self.repository.restore(
            menu=menu,
            updated_by=updated_by,
        )

        return {
            "message": "Menu restored successfully.",
            "data": updated_menu,
        }

    async def permanent_delete_menu(self, menu_id: int):
        menu = await self.repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        child_menu_count = await self.repository.count_child_menus(menu_id)
        menu_action_count = await self.repository.count_menu_actions(menu_id)
        menu_permission_count = await self.repository.count_menu_permissions(menu_id)

        if child_menu_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has child menu(s). Remove them first.",
            )

        if menu_action_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has menu action(s). Remove actions first.",
            )

        if menu_permission_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu has permission mapping(s). Remove mappings first.",
            )

        await self.repository.permanent_delete(menu)

        return {
            "message": "Menu permanently deleted successfully.",
            "data": None,
        }
# E:\Audit\AMS\backend\app\api\v1\menus.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu import (
    MenuCreate,
    MenuListResponse,
    MenuMessageResponse,
    MenuResponse,
    MenuUpdate,
)
from app.services.menu.menu_service import MenuService

router = APIRouter(prefix="/menus", tags=["Menus"])


@router.get("", response_model=MenuListResponse)
async def list_menus(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    navigation_group_id: int | None = None,
    parent_menu_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.list_menus(
        page=page,
        page_size=page_size,
        search=search,
        navigation_group_id=navigation_group_id,
        parent_menu_id=parent_menu_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{menu_id}", response_model=MenuResponse)
async def get_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu.view")),
):
    service = MenuService(db)
    return await service.get_menu(menu_id)


@router.post(
    "",
    response_model=MenuMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu(
    payload: MenuCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.create")),
):
    service = MenuService(db)
    return await service.create_menu(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{menu_id}", response_model=MenuMessageResponse)
async def update_menu(
    menu_id: int,
    payload: MenuUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.update")),
):
    service = MenuService(db)
    return await service.update_menu(
        menu_id=menu_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}", response_model=MenuMessageResponse)
async def delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.delete")),
):
    service = MenuService(db)
    return await service.deactivate_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{menu_id}/restore", response_model=MenuMessageResponse)
async def restore_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.restore")),
):
    service = MenuService(db)
    return await service.restore_menu(
        menu_id=menu_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{menu_id}/permanent", response_model=MenuMessageResponse)
async def permanent_delete_menu(
    menu_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu.permanent_delete")),
):
    service = MenuService(db)
    return await service.permanent_delete_menu(menu_id)
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add import
from app.api.v1.menus import router as menus_router

# Add include at the bottom
api_router.include_router(menus_router)
Step 3: Seed permissions + verify
Create:

E:\Audit\AMS\backend\scripts\seed_menu_permissions.py
# E:\Audit\AMS\backend\scripts\seed_menu_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


MENU_PERMISSIONS = [
    {
        "permission_key": "menu.menu.view",
        "resource_type": "menu",
        "resource_key": "menu",
        "action": "view",
        "description": "Can view menus.",
    },
    {
        "permission_key": "api.menu.create",
        "resource_type": "api",
        "resource_key": "menu",
        "action": "create",
        "description": "Can create menus.",
    },
    {
        "permission_key": "api.menu.update",
        "resource_type": "api",
        "resource_key": "menu",
        "action": "update",
        "description": "Can update menus.",
    },
    {
        "permission_key": "api.menu.delete",
        "resource_type": "api",
        "resource_key": "menu",
        "action": "delete",
        "description": "Can deactivate menus.",
    },
    {
        "permission_key": "api.menu.restore",
        "resource_type": "api",
        "resource_key": "menu",
        "action": "restore",
        "description": "Can restore menus.",
    },
    {
        "permission_key": "api.menu.permanent_delete",
        "resource_type": "api",
        "resource_key": "menu",
        "action": "permanent_delete",
        "description": "Can permanently delete menus.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.navigation_group.view",
    "api.navigation_group.create",
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
    "menu.user.view",
    "api.user.create",
    "menu.role_permission.view",
    "api.role_permission.assign",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )
        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_menu_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in MENU_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Menu permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_menu_permissions())
Run:

cd E:\Audit\AMS\backend
python -m scripts.seed_menu_permissions
python -m compileall app
python -c "from app.api.v1.menus import router; print([r.path for r in router.routes])"
Expected:

['/menus', '/menus/{menu_id}', '/menus', '/menus/{menu_id}', '/menus/{menu_id}', '/menus/{menu_id}/restore', '/menus/{menu_id}/permanent']
Test payload:

{
  "navigation_group_id": null,
  "parent_menu_id": null,
  "menu_key": "security_test_menu",
  "menu_title": "Security Test Menu",
  "route_path": "/security-test",
  "icon": "Shield",
  "permission_key": null,
  "sort_order": 10,
  "menu_level": 1,
  "is_expandable": false,
  "is_visible": true
}
Expected:

POST /api/v1/menus 201 Created
GET /api/v1/menus 200 OK
PATCH /api/v1/menus/{id} 200 OK
DELETE /api/v1/menus/{id} 200 OK
PATCH /api/v1/menus/{id}/restore 200 OK
DELETE /api/v1/menus/{id}/permanent 200 OK

(.venv) PS E:\Audit\AMS\backend> python -m scripts.seed_menu_permissions           
Permission created: menu.menu.view               
Permission created: api.menu.create
Permission created: api.menu.update
Permission created: api.menu.delete
Permission created: api.menu.restore

এগিয়ে যাও
Permission created: api.menu.permanent_delete
Target role IDs: [1]
Role permission assigned: role_id=1, permission_id=79
Role permission assigned: role_id=1, permission_id=80
Role permission assigned: role_id=1, permission_id=81
Role permission assigned: role_id=1, permission_id=82
Role permission assigned: role_id=1, permission_id=83
Role permission assigned: role_id=1, permission_id=84
Menu permissions seed completed.
(.venv) PS E:\Audit\AMS\backend> python -m compileall app               
Listing 'app'...
Listing 'app\\api'...
Listing 'app\\api\\v1'...
Compiling 'app\\api\\v1\\menus.py'...
Compiling 'app\\api\\v1\\router.py'...
Listing 'app\\core'...
Listing 'app\\db'...
Listing 'app\\middleware'...
Listing 'app\\models'...
Listing 'app\\repositories'...
Compiling 'app\\repositories\\menu_repository.py'...
Listing 'app\\schemas'...
Compiling 'app\\schemas\\menu.py'...
Listing 'app\\services'...
Listing 'app\\services\\branch'...
Listing 'app\\services\\company'...
Listing 'app\\services\\department'...
Listing 'app\\services\\designation'...
Listing 'app\\services\\employee'...
Listing 'app\\services\\menu'...
Compiling 'app\\services\\menu\\__init__.py'...
Compiling 'app\\services\\menu\\menu_service.py'...
Listing 'app\\services\\navigation_group'...
Listing 'app\\services\\permission'...
Listing 'app\\services\\role'...
Listing 'app\\services\\role_permission'...
Listing 'app\\services\\user'...
Listing 'app\\services\\user_role'...
(.venv) PS E:\Audit\AMS\backend> python -c "from app.api.v1.menus import router; print([r.path for r in router.routes])"
['/menus', '/menus/{menu_id}', '/menus', '/menus/{menu_id}', '/menus/{menu_id}', '/menus/{menu_id}/restore', '/menus/{menu_id}/permanent']
(.venv) PS E:\Audit\AMS\backend> 

Thought for 10s
Perfect ✅ Menu Management files compile + route registration clean.

Now next module: Menu Actions Management Backend.

MenuAction model already আছে, তাই migration লাগবে না। এতে menu_id, action_key, action_title, permission_key, button_color, button_icon, sort_order, is_visible আছে। 


Endpoints হবে:

GET     /api/v1/menu-actions
GET     /api/v1/menu-actions/{action_id}
POST    /api/v1/menu-actions
PATCH   /api/v1/menu-actions/{action_id}
DELETE  /api/v1/menu-actions/{action_id}
PATCH   /api/v1/menu-actions/{action_id}/restore
DELETE  /api/v1/menu-actions/{action_id}/permanent
Step 1: Schema + Repository
# E:\Audit\AMS\backend\app\schemas\menu_action.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MenuActionBase(BaseModel):
    menu_id: int = Field(..., gt=0)
    action_key: str = Field(..., min_length=2, max_length=100)
    action_title: str = Field(..., min_length=2, max_length=100)
    permission_key: str = Field(..., min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int = 0
    is_visible: bool = True

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionCreate(MenuActionBase):
    pass


class MenuActionUpdate(BaseModel):
    menu_id: int | None = Field(default=None, gt=0)
    action_key: str | None = Field(default=None, min_length=2, max_length=100)
    action_title: str | None = Field(default=None, min_length=2, max_length=100)
    permission_key: str | None = Field(default=None, min_length=3, max_length=150)
    button_color: str | None = Field(default=None, max_length=50)
    button_icon: str | None = Field(default=None, max_length=100)
    sort_order: int | None = None
    is_visible: bool | None = None

    @field_validator("action_key", "action_title", "permission_key")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")
        return value

    @field_validator("button_color", "button_icon")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class MenuActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_id: int
    action_key: str
    action_title: str
    permission_key: str
    button_color: str | None = None
    button_icon: str | None = None
    sort_order: int
    is_visible: bool
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuActionListResponse(BaseModel):
    items: list[MenuActionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MenuActionMessageResponse(BaseModel):
    message: str
    data: MenuActionResponse | None = None
# E:\Audit\AMS\backend\app\repositories\menu_action_repository.py

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission


class MenuActionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ) -> tuple[list[MenuAction], int]:
        conditions = []

        if search:
            search_text = f"%{search.strip()}%"
            conditions.append(
                or_(
                    MenuAction.action_key.ilike(search_text),
                    MenuAction.action_title.ilike(search_text),
                    MenuAction.permission_key.ilike(search_text),
                    MenuAction.button_color.ilike(search_text),
                    MenuAction.button_icon.ilike(search_text),
                )
            )

        if menu_id is not None:
            conditions.append(MenuAction.menu_id == menu_id)

        if is_visible is not None:
            conditions.append(MenuAction.is_visible == is_visible)

        if is_active is not None:
            conditions.append(MenuAction.is_active == is_active)

        count_stmt = select(func.count()).select_from(MenuAction)
        query = select(MenuAction)

        if conditions:
            count_stmt = count_stmt.where(*conditions)
            query = query.where(*conditions)

        allowed_sort_fields = {
            "id": MenuAction.id,
            "menu_id": MenuAction.menu_id,
            "action_key": MenuAction.action_key,
            "action_title": MenuAction.action_title,
            "sort_order": MenuAction.sort_order,
            "is_visible": MenuAction.is_visible,
            "is_active": MenuAction.is_active,
            "created_at": MenuAction.created_at,
            "updated_at": MenuAction.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, MenuAction.sort_order)
        order_expression = (
            sort_column.desc()
            if sort_order.lower() == "desc"
            else sort_column.asc()
        )

        query = (
            query.order_by(order_expression, MenuAction.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        total_result = await self.db.execute(count_stmt)
        total = int(total_result.scalar_one() or 0)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.id == action_id,
                MenuAction.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(self, action_id: int) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(MenuAction.id == action_id)
        )
        return result.scalar_one_or_none()

    async def get_by_menu_and_action_key(
        self,
        menu_id: int,
        action_key: str,
    ) -> MenuAction | None:
        result = await self.db.execute(
            select(MenuAction).where(
                MenuAction.menu_id == menu_id,
                func.lower(MenuAction.action_key) == action_key.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, data: dict, created_by: str) -> MenuAction:
        action = MenuAction(
            **data,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(action)
        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def update(
        self,
        action: MenuAction,
        update_data: dict,
        updated_by: str,
    ) -> MenuAction:
        for field, value in update_data.items():
            setattr(action, field, value)

        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def deactivate(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = False
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def restore(self, action: MenuAction, updated_by: str) -> MenuAction:
        action.is_active = True
        action.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def count_menu_action_permissions(self, action_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MenuActionPermission).where(
                MenuActionPermission.menu_action_id == action_id
            )
        )
        return int(result.scalar_one() or 0)

    async def permanent_delete(self, action: MenuAction) -> None:
        await self.db.delete(action)
        await self.db.commit()
Step 2: Service + API + Router
New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\menu_action
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\menu_action\__init__.py
# E:\Audit\AMS\backend\app\services\menu_action\menu_action_service.py

from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_action_repository import MenuActionRepository
from app.repositories.menu_repository import MenuRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu_action import MenuActionCreate, MenuActionUpdate


class MenuActionService:
    def __init__(self, db: AsyncSession):
        self.repository = MenuActionRepository(db)
        self.menu_repository = MenuRepository(db)
        self.permission_repository = PermissionRepository(db)

    async def _validate_menu(self, menu_id: int) -> None:
        menu = await self.menu_repository.get_by_id(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu not found or inactive.",
            )

    async def _validate_permission_key(self, permission_key: str) -> None:
        permission = await self.permission_repository.get_by_key(permission_key)

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action permission key does not exist.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action permission key is inactive.",
            )

    async def list_menu_actions(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        menu_id: int | None = None,
        is_visible: bool | None = None,
        is_active: bool | None = None,
        sort_by: str = "sort_order",
        sort_order: str = "asc",
    ):
        items, total = await self.repository.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            menu_id=menu_id,
            is_visible=is_visible,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total else 0,
        }

    async def get_menu_action(self, action_id: int):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        return action

    async def create_menu_action(
        self,
        payload: MenuActionCreate,
        created_by: str,
    ):
        await self._validate_menu(payload.menu_id)
        await self._validate_permission_key(payload.permission_key)

        existing_action = await self.repository.get_by_menu_and_action_key(
            menu_id=payload.menu_id,
            action_key=payload.action_key,
        )

        if existing_action:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action key already exists for this menu.",
            )

        action = await self.repository.create(
            data=payload.model_dump(),
            created_by=created_by,
        )

        return {
            "message": "Menu action created successfully.",
            "data": action,
        }

    async def update_menu_action(
        self,
        action_id: int,
        payload: MenuActionUpdate,
        updated_by: str,
    ):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        update_data = payload.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided.",
            )

        target_menu_id = update_data.get("menu_id", action.menu_id)
        target_action_key = update_data.get("action_key", action.action_key)

        if "menu_id" in update_data:
            await self._validate_menu(update_data["menu_id"])

        if "permission_key" in update_data:
            await self._validate_permission_key(update_data["permission_key"])

        if "menu_id" in update_data or "action_key" in update_data:
            existing_action = await self.repository.get_by_menu_and_action_key(
                menu_id=target_menu_id,
                action_key=target_action_key,
            )

            if existing_action and existing_action.id != action.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Action key already exists for this menu.",
                )

        updated_action = await self.repository.update(
            action=action,
            update_data=update_data,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action updated successfully.",
            "data": updated_action,
        }

    async def deactivate_menu_action(self, action_id: int, updated_by: str):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        if not action.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action is already inactive.",
            )

        updated_action = await self.repository.deactivate(
            action=action,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action deactivated successfully.",
            "data": updated_action,
        }

    async def restore_menu_action(self, action_id: int, updated_by: str):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        if action.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Menu action is already active.",
            )

        updated_action = await self.repository.restore(
            action=action,
            updated_by=updated_by,
        )

        return {
            "message": "Menu action restored successfully.",
            "data": updated_action,
        }

    async def permanent_delete_menu_action(self, action_id: int):
        action = await self.repository.get_by_id_any_status(action_id)

        if not action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        mapping_count = await self.repository.count_menu_action_permissions(action_id)

        if mapping_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu action has permission mapping(s). Remove mappings first.",
            )

        await self.repository.permanent_delete(action)

        return {
            "message": "Menu action permanently deleted successfully.",
            "data": None,
        }
# E:\Audit\AMS\backend\app\api\v1\menu_actions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_action import (
    MenuActionCreate,
    MenuActionListResponse,
    MenuActionMessageResponse,
    MenuActionResponse,
    MenuActionUpdate,
)
from app.services.menu_action.menu_action_service import MenuActionService

router = APIRouter(prefix="/menu-actions", tags=["Menu Actions"])


@router.get("", response_model=MenuActionListResponse)
async def list_menu_actions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    menu_id: int | None = None,
    is_visible: bool | None = None,
    is_active: bool | None = None,
    sort_by: str = "sort_order",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_action.view")),
):
    service = MenuActionService(db)
    return await service.list_menu_actions(
        page=page,
        page_size=page_size,
        search=search,
        menu_id=menu_id,
        is_visible=is_visible,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{action_id}", response_model=MenuActionResponse)
async def get_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_action.view")),
):
    service = MenuActionService(db)
    return await service.get_menu_action(action_id)


@router.post(
    "",
    response_model=MenuActionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu_action(
    payload: MenuActionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.create")),
):
    service = MenuActionService(db)
    return await service.create_menu_action(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{action_id}", response_model=MenuActionMessageResponse)
async def update_menu_action(
    action_id: int,
    payload: MenuActionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.update")),
):
    service = MenuActionService(db)
    return await service.update_menu_action(
        action_id=action_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{action_id}", response_model=MenuActionMessageResponse)
async def delete_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.delete")),
):
    service = MenuActionService(db)
    return await service.deactivate_menu_action(
        action_id=action_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{action_id}/restore", response_model=MenuActionMessageResponse)
async def restore_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_action.restore")),
):
    service = MenuActionService(db)
    return await service.restore_menu_action(
        action_id=action_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{action_id}/permanent", response_model=MenuActionMessageResponse)
async def permanent_delete_menu_action(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action.permanent_delete")
    ),
):
    service = MenuActionService(db)
    return await service.permanent_delete_menu_action(action_id)
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add import
from app.api.v1.menu_actions import router as menu_actions_router

# Add include at the bottom
api_router.include_router(menu_actions_router)
Step 3: Seed + Verify
# E:\Audit\AMS\backend\scripts\seed_menu_action_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


MENU_ACTION_PERMISSIONS = [
    {
        "permission_key": "menu.menu_action.view",
        "resource_type": "menu",
        "resource_key": "menu_action",
        "action": "view",
        "description": "Can view menu actions.",
    },
    {
        "permission_key": "api.menu_action.create",
        "resource_type": "api",
        "resource_key": "menu_action",
        "action": "create",
        "description": "Can create menu actions.",
    },
    {
        "permission_key": "api.menu_action.update",
        "resource_type": "api",
        "resource_key": "menu_action",
        "action": "update",
        "description": "Can update menu actions.",
    },
    {
        "permission_key": "api.menu_action.delete",
        "resource_type": "api",
        "resource_key": "menu_action",
        "action": "delete",
        "description": "Can deactivate menu actions.",
    },
    {
        "permission_key": "api.menu_action.restore",
        "resource_type": "api",
        "resource_key": "menu_action",
        "action": "restore",
        "description": "Can restore menu actions.",
    },
    {
        "permission_key": "api.menu_action.permanent_delete",
        "resource_type": "api",
        "resource_key": "menu_action",
        "action": "permanent_delete",
        "description": "Can permanently delete menu actions.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.menu.view",
    "api.menu.create",
    "menu.navigation_group.view",
    "api.navigation_group.create",
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )
        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_menu_action_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in MENU_ACTION_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Menu action permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_menu_action_permissions())
cd E:\Audit\AMS\backend
python -m scripts.seed_menu_action_permissions
python -m compileall app
python -c "from app.api.v1.menu_actions import router; print([r.path for r in router.routes])"
Expected:

['/menu-actions', '/menu-actions/{action_id}', '/menu-actions', '/menu-actions/{action_id}', '/menu-actions/{action_id}', '/menu-actions/{action_id}/restore', '/menu-actions/{action_id}/permanent']
Test payload:

{
  "menu_id": 1,
  "action_key": "test_action",
  "action_title": "Test Action",
  "permission_key": "api.test.create",
  "button_color": "blue",
  "button_icon": "Plus",
  "sort_order": 10,
  "is_visible": true
}
Note: permission_key অবশ্যই existing active permission হতে হবে। Test করার জন্য api.test.create না থাকলে আগে Permissions API দিয়ে create করে নাও, অথবা existing কোনো api.* permission key use করো।


(.venv) PS E:\Audit\AMS\backend> python -m scripts.seed_menu_action_permissions    
Permission created: menu.menu_action.view
Permission created: api.menu_action.create
Permission created: api.menu_action.update
Permission created: api.menu_action.delete
Permission created: api.menu_action.restore
Permission created: api.menu_action.permanent_delete
Target role IDs: [1]
Role permission assigned: role_id=1, permission_id=85
Role permission assigned: role_id=1, permission_id=86
Role permission assigned: role_id=1, permission_id=87
Role permission assigned: role_id=1, permission_id=88
Role permission assigned: role_id=1, permission_id=89
Role permission assigned: role_id=1, permission_id=90
Menu action permissions seed completed.
(.venv) PS E:\Audit\AMS\backend> python -m compileall
Listing 'E:\\Audit\\AMS\\backend'...                                
Compiling 'E:\\Audit\\AMS\\backend\\test_db.py'...
Listing 'C:\\Python311-latest\\python311.zip'...
Can't list 'C:\\Python311-latest\\python311.zip'
Listing 'C:\\Python311-latest\\DLLs'...
Listing 'C:\\Python311-latest\\Lib'...
Compiling 'C:\\Python311-latest\\Lib\\__hello__.py'...
Compiling 'C:\\Python311-latest\\Lib\\_aix_support.py'...
Compiling 'C:\\Python311-latest\\Lib\\_bootsubprocess.py'...
Compiling 'C:\\Python311-latest\\Lib\\_collections_abc.py'...
Compiling 'C:\\Python311-latest\\Lib\\_osx_support.py'...
Compiling 'C:\\Python311-latest\\Lib\\_py_abc.py'...
Compiling 'C:\\Python311-latest\\Lib\\_pydecimal.py'...
Compiling 'C:\\Python311-latest\\Lib\\_pyio.py'...
Compiling 'C:\\Python311-latest\\Lib\\_sitebuiltins.py'...
Compiling 'C:\\Python311-latest\\Lib\\_threading_local.py'...
Compiling 'C:\\Python311-latest\\Lib\\abc.py'...
Compiling 'C:\\Python311-latest\\Lib\\aifc.py'...
Compiling 'C:\\Python311-latest\\Lib\\antigravity.py'...
Compiling 'C:\\Python311-latest\\Lib\\asynchat.py'...
Compiling 'C:\\Python311-latest\\Lib\\asyncore.py'...
Compiling 'C:\\Python311-latest\\Lib\\bdb.py'...
Compiling 'C:\\Python311-latest\\Lib\\cProfile.py'...
Compiling 'C:\\Python311-latest\\Lib\\cgi.py'...
Compiling 'C:\\Python311-latest\\Lib\\cgitb.py'...
Compiling 'C:\\Python311-latest\\Lib\\chunk.py'...
Compiling 'C:\\Python311-latest\\Lib\\cmd.py'...
Compiling 'C:\\Python311-latest\\Lib\\code.py'...
Compiling 'C:\\Python311-latest\\Lib\\codecs.py'...
Compiling 'C:\\Python311-latest\\Lib\\codeop.py'...
Compiling 'C:\\Python311-latest\\Lib\\doctest.py'...
Compiling 'C:\\Python311-latest\\Lib\\fileinput.py'...
Compiling 'C:\\Python311-latest\\Lib\\ftplib.py'...
Compiling 'C:\\Python311-latest\\Lib\\genericpath.py'...
Compiling 'C:\\Python311-latest\\Lib\\getopt.py'...
Compiling 'C:\\Python311-latest\\Lib\\graphlib.py'...
Compiling 'C:\\Python311-latest\\Lib\\imaplib.py'...
Compiling 'C:\\Python311-latest\\Lib\\imghdr.py'...
Compiling 'C:\\Python311-latest\\Lib\\imp.py'...
Compiling 'C:\\Python311-latest\\Lib\\io.py'...
Compiling 'C:\\Python311-latest\\Lib\\mailbox.py'...
Compiling 'C:\\Python311-latest\\Lib\\mailcap.py'...
Compiling 'C:\\Python311-latest\\Lib\\modulefinder.py'...
Compiling 'C:\\Python311-latest\\Lib\\nntplib.py'...
Compiling 'C:\\Python311-latest\\Lib\\ntpath.py'...
Compiling 'C:\\Python311-latest\\Lib\\os.py'...
Compiling 'C:\\Python311-latest\\Lib\\pdb.py'...
Compiling 'C:\\Python311-latest\\Lib\\pickletools.py'...
Compiling 'C:\\Python311-latest\\Lib\\pipes.py'...
Compiling 'C:\\Python311-latest\\Lib\\poplib.py'...
Compiling 'C:\\Python311-latest\\Lib\\posixpath.py'...
Compiling 'C:\\Python311-latest\\Lib\\profile.py'...
Compiling 'C:\\Python311-latest\\Lib\\pstats.py'...
Compiling 'C:\\Python311-latest\\Lib\\pty.py'...
Compiling 'C:\\Python311-latest\\Lib\\pyclbr.py'...
Compiling 'C:\\Python311-latest\\Lib\\pydoc.py'...
Compiling 'C:\\Python311-latest\\Lib\\rlcompleter.py'...
Compiling 'C:\\Python311-latest\\Lib\\runpy.py'...
Compiling 'C:\\Python311-latest\\Lib\\sched.py'...
Compiling 'C:\\Python311-latest\\Lib\\shelve.py'...
Compiling 'C:\\Python311-latest\\Lib\\site.py'...
Compiling 'C:\\Python311-latest\\Lib\\smtpd.py'...
Compiling 'C:\\Python311-latest\\Lib\\smtplib.py'...
Compiling 'C:\\Python311-latest\\Lib\\sndhdr.py'...
Compiling 'C:\\Python311-latest\\Lib\\sre_compile.py'...
Compiling 'C:\\Python311-latest\\Lib\\sre_constants.py'...
Compiling 'C:\\Python311-latest\\Lib\\sre_parse.py'...
Compiling 'C:\\Python311-latest\\Lib\\stat.py'...
Compiling 'C:\\Python311-latest\\Lib\\statistics.py'...
Compiling 'C:\\Python311-latest\\Lib\\sunau.py'...
Compiling 'C:\\Python311-latest\\Lib\\symtable.py'...
Compiling 'C:\\Python311-latest\\Lib\\tabnanny.py'...
Compiling 'C:\\Python311-latest\\Lib\\telnetlib.py'...
Compiling 'C:\\Python311-latest\\Lib\\this.py'...
Compiling 'C:\\Python311-latest\\Lib\\trace.py'...
Compiling 'C:\\Python311-latest\\Lib\\tracemalloc.py'...
Compiling 'C:\\Python311-latest\\Lib\\tty.py'...
Compiling 'C:\\Python311-latest\\Lib\\turtle.py'...
Compiling 'C:\\Python311-latest\\Lib\\uu.py'...
Compiling 'C:\\Python311-latest\\Lib\\wave.py'...
Compiling 'C:\\Python311-latest\\Lib\\webbrowser.py'...
Compiling 'C:\\Python311-latest\\Lib\\xdrlib.py'...
Compiling 'C:\\Python311-latest\\Lib\\zipapp.py'...
Compiling 'C:\\Python311-latest\\Lib\\zipimport.py'...
Listing 'C:\\Python311-latest'...
Listing 'E:\\Audit\\AMS\\backend\\.venv'...
Listing 'E:\\Audit\\AMS\\backend\\.venv\\Lib\\site-packages'...
(.venv) PS E:\Audit\AMS\backend> python -c "from app.api.v1.menu_actions import router; print([r.path for r in router.routes])"
['/menu-actions', '/menu-actions/{action_id}', '/menu-actions', '/menu-actions/{action_id}', '/menu-actions/{action_id}', '/menu-actions/{action_id}/restore', '/menu-actions/{action_id}/permanent']
(.venv) PS E:\Audit\AMS\backend> 

Thought for 10s
Good ✅ Menu Action permission seed successful, routes registered clean.

এই line-টা সমস্যা না:

Can't list 'C:\\Python311-latest\\python311.zip'
কারণ তুমি চালিয়েছো:

python -m compileall
এটা পুরো Python environment, stdlib, venv সব compile করতে শুরু করেছে। আমাদের project check করার correct command হলো:

python -m compileall app
তুমি routes already confirm করেছো:

/menu-actions
/menu-actions/{action_id}
/menu-actions/{action_id}/restore
/menu-actions/{action_id}/permanent
এখন Swagger থেকে Menu Actions CRUD test করো।

Test payload:

{
  "menu_id": 1,
  "action_key": "test_action",
  "action_title": "Test Action",
  "permission_key": "api.test.create",
  "button_color": "blue",
  "button_icon": "Plus",
  "sort_order": 10,
  "is_visible": true
}
api.test.create না থাকলে existing কোনো active permission key use করো, যেমন:

api.menu.create
Expected logs:

POST /api/v1/menu-actions 201 Created
GET /api/v1/menu-actions 200 OK
PATCH /api/v1/menu-actions/{id} 200 OK
DELETE /api/v1/menu-actions/{id} 200 OK
PATCH /api/v1/menu-actions/{id}/restore 200 OK
DELETE /api/v1/menu-actions/{id}/permanent 200 OK
Pass হলে next module হবে:

Menu Permission Mapping Backend
তারপর শেষ module:

Menu Action Permission Mapping Backend

এগিয়ে যাও

Thought for 23s
ঠিক আছে ✅ এখন Menu Permission Mapping Backend করছি।

menu_permissions table/model already আছে: menu_id + permission_id mapping করে। তাই migration লাগবে না। 


এটা দরকার হবে menu-level multiple permission mapping manage করার জন্য। Current sidebar এখনো menus.permission_key direct field use করে, কিন্তু এই mapping table থাকলে future-এ এক menu-তে multiple permission support করা যাবে।

Endpoints হবে:

GET    /api/v1/menu-permissions/menus/{menu_id}/permissions
POST   /api/v1/menu-permissions
DELETE /api/v1/menu-permissions/{menu_permission_id}
Step 1: Schema + Repository
Create these files:

# E:\Audit\AMS\backend\app\schemas\menu_permission.py

from datetime import datetime

from pydantic import BaseModel, Field


class MenuPermissionAssignRequest(BaseModel):
    menu_id: int = Field(..., gt=0)
    permission_id: int = Field(..., gt=0)


class MenuPermissionResponse(BaseModel):
    id: int
    menu_id: int
    permission_id: int
    menu_key: str
    menu_title: str
    permission_key: str
    resource_type: str
    resource_key: str
    action: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuPermissionListResponse(BaseModel):
    items: list[MenuPermissionResponse]
    total: int


class MenuPermissionMessageResponse(BaseModel):
    message: str
    data: MenuPermissionResponse | None = None
# E:\Audit\AMS\backend\app\repositories\menu_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import Menu
from app.models.menu_permission import MenuPermission
from app.models.permission import Permission


class MenuPermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_response_dict(
        self,
        menu_permission: MenuPermission,
        menu: Menu,
        permission: Permission,
    ) -> dict:
        return {
            "id": menu_permission.id,
            "menu_id": menu_permission.menu_id,
            "permission_id": menu_permission.permission_id,
            "menu_key": menu.menu_key,
            "menu_title": menu.menu_title,
            "permission_key": permission.permission_key,
            "resource_type": permission.resource_type,
            "resource_key": permission.resource_key,
            "action": permission.action,
            "description": permission.description,
            "is_active": menu_permission.is_active,
            "created_by": menu_permission.created_by,
            "updated_by": menu_permission.updated_by,
            "created_at": menu_permission.created_at,
            "updated_at": menu_permission.updated_at,
        }

    async def list_permissions_for_menu(
        self,
        menu_id: int,
        is_active: bool | None = True,
    ) -> list[dict]:
        query = (
            select(MenuPermission, Menu, Permission)
            .join(Menu, Menu.id == MenuPermission.menu_id)
            .join(Permission, Permission.id == MenuPermission.permission_id)
            .where(MenuPermission.menu_id == menu_id)
            .order_by(
                Permission.resource_type.asc(),
                Permission.resource_key.asc(),
                Permission.action.asc(),
            )
        )

        if is_active is not None:
            query = query.where(MenuPermission.is_active == is_active)

        result = await self.db.execute(query)
        rows = result.all()

        return [
            self._to_response_dict(
                menu_permission=row[0],
                menu=row[1],
                permission=row[2],
            )
            for row in rows
        ]

    async def get_existing_any_status(
        self,
        menu_id: int,
        permission_id: int,
    ) -> MenuPermission | None:
        result = await self.db.execute(
            select(MenuPermission).where(
                MenuPermission.menu_id == menu_id,
                MenuPermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(
        self,
        menu_permission_id: int,
    ) -> MenuPermission | None:
        result = await self.db.execute(
            select(MenuPermission).where(MenuPermission.id == menu_permission_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_details(
        self,
        menu_permission_id: int,
    ) -> dict | None:
        result = await self.db.execute(
            select(MenuPermission, Menu, Permission)
            .join(Menu, Menu.id == MenuPermission.menu_id)
            .join(Permission, Permission.id == MenuPermission.permission_id)
            .where(MenuPermission.id == menu_permission_id)
        )

        row = result.first()

        if not row:
            return None

        return self._to_response_dict(
            menu_permission=row[0],
            menu=row[1],
            permission=row[2],
        )

    async def create(
        self,
        menu_id: int,
        permission_id: int,
        created_by: str,
    ) -> MenuPermission:
        menu_permission = MenuPermission(
            menu_id=menu_id,
            permission_id=permission_id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(menu_permission)
        await self.db.commit()
        await self.db.refresh(menu_permission)

        return menu_permission

    async def restore(
        self,
        menu_permission: MenuPermission,
        updated_by: str,
    ) -> MenuPermission:
        menu_permission.is_active = True
        menu_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_permission)

        return menu_permission

    async def deactivate(
        self,
        menu_permission: MenuPermission,
        updated_by: str,
    ) -> MenuPermission:
        menu_permission.is_active = False
        menu_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_permission)

        return menu_permission
Step 2: Service + API + Router
New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\menu_permission
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\menu_permission\__init__.py
# E:\Audit\AMS\backend\app\services\menu_permission\menu_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_permission_repository import MenuPermissionRepository
from app.repositories.menu_repository import MenuRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu_permission import MenuPermissionAssignRequest


class MenuPermissionService:
    def __init__(self, db: AsyncSession):
        self.menu_repository = MenuRepository(db)
        self.permission_repository = PermissionRepository(db)
        self.menu_permission_repository = MenuPermissionRepository(db)

    async def list_permissions_for_menu(
        self,
        menu_id: int,
        is_active: bool | None = True,
    ):
        menu = await self.menu_repository.get_by_id_any_status(menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found.",
            )

        items = await self.menu_permission_repository.list_permissions_for_menu(
            menu_id=menu_id,
            is_active=is_active,
        )

        return {
            "items": items,
            "total": len(items),
        }

    async def assign_permission_to_menu(
        self,
        payload: MenuPermissionAssignRequest,
        created_by: str,
    ):
        menu = await self.menu_repository.get_by_id(payload.menu_id)

        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found or inactive.",
            )

        permission = await self.permission_repository.get_by_id(
            payload.permission_id
        )

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign inactive permission.",
            )

        existing_menu_permission = (
            await self.menu_permission_repository.get_existing_any_status(
                menu_id=payload.menu_id,
                permission_id=payload.permission_id,
            )
        )

        if existing_menu_permission and existing_menu_permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is already assigned to this menu.",
            )

        if existing_menu_permission and not existing_menu_permission.is_active:
            restored_menu_permission = await self.menu_permission_repository.restore(
                menu_permission=existing_menu_permission,
                updated_by=created_by,
            )

            data = await self.menu_permission_repository.get_by_id_with_details(
                restored_menu_permission.id
            )

            return {
                "message": "Menu permission assignment restored successfully.",
                "data": data,
            }

        menu_permission = await self.menu_permission_repository.create(
            menu_id=payload.menu_id,
            permission_id=payload.permission_id,
            created_by=created_by,
        )

        data = await self.menu_permission_repository.get_by_id_with_details(
            menu_permission.id
        )

        return {
            "message": "Permission assigned to menu successfully.",
            "data": data,
        }

    async def remove_permission_from_menu(
        self,
        menu_permission_id: int,
        updated_by: str,
    ):
        menu_permission = await self.menu_permission_repository.get_by_id_any_status(
            menu_permission_id
        )

        if not menu_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu permission assignment not found.",
            )

        if not menu_permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu permission assignment is already inactive.",
            )

        updated_menu_permission = await self.menu_permission_repository.deactivate(
            menu_permission=menu_permission,
            updated_by=updated_by,
        )

        data = await self.menu_permission_repository.get_by_id_with_details(
            updated_menu_permission.id
        )

        return {
            "message": "Permission removed from menu successfully.",
            "data": data,
        }
# E:\Audit\AMS\backend\app\api\v1\menu_permissions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_permission import (
    MenuPermissionAssignRequest,
    MenuPermissionListResponse,
    MenuPermissionMessageResponse,
)
from app.services.menu_permission.menu_permission_service import (
    MenuPermissionService,
)

router = APIRouter(prefix="/menu-permissions", tags=["Menu Permissions"])


@router.get(
    "/menus/{menu_id}/permissions",
    response_model=MenuPermissionListResponse,
)
async def list_permissions_for_menu(
    menu_id: int,
    is_active: bool | None = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.menu_permission.view")),
):
    service = MenuPermissionService(db)
    return await service.list_permissions_for_menu(
        menu_id=menu_id,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=MenuPermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_menu(
    payload: MenuPermissionAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_permission.assign")),
):
    service = MenuPermissionService(db)
    return await service.assign_permission_to_menu(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{menu_permission_id}",
    response_model=MenuPermissionMessageResponse,
)
async def remove_permission_from_menu(
    menu_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.menu_permission.remove")),
):
    service = MenuPermissionService(db)
    return await service.remove_permission_from_menu(
        menu_permission_id=menu_permission_id,
        updated_by=current_user.user_id,
    )
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add import
from app.api.v1.menu_permissions import router as menu_permissions_router

# Add include at the bottom
api_router.include_router(menu_permissions_router)
Step 3: Seed + Verify
Create:

E:\Audit\AMS\backend\scripts\seed_menu_permission_mapping_permissions.py
# E:\Audit\AMS\backend\scripts\seed_menu_permission_mapping_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


MENU_PERMISSION_MAPPING_PERMISSIONS = [
    {
        "permission_key": "menu.menu_permission.view",
        "resource_type": "menu",
        "resource_key": "menu_permission",
        "action": "view",
        "description": "Can view menu permission mappings.",
    },
    {
        "permission_key": "api.menu_permission.assign",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "assign",
        "description": "Can assign permissions to menus.",
    },
    {
        "permission_key": "api.menu_permission.remove",
        "resource_type": "api",
        "resource_key": "menu_permission",
        "action": "remove",
        "description": "Can remove permissions from menus.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.menu.view",
    "api.menu.create",
    "menu.menu_action.view",
    "api.menu_action.create",
    "menu.navigation_group.view",
    "api.navigation_group.create",
    "menu.role.view",
    "api.role.create",
    "menu.permission.view",
    "api.permission.create",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_menu_permission_mapping_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in MENU_PERMISSION_MAPPING_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Menu permission mapping permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_menu_permission_mapping_permissions())
Run:

cd E:\Audit\AMS\backend
python -m scripts.seed_menu_permission_mapping_permissions
python -m compileall app
python -c "from app.api.v1.menu_permissions import router; print([r.path for r in router.routes])"
Expected:

['/menu-permissions/menus/{menu_id}/permissions', '/menu-permissions', '/menu-permissions/{menu_permission_id}']
Test order:

POST /api/v1/menu-permissions
GET /api/v1/menu-permissions/menus/{menu_id}/permissions
DELETE /api/v1/menu-permissions/{menu_permission_id}
POST /api/v1/menu-permissions again
Payload example:

{
  "menu_id": 1,
  "permission_id": 1
}
Last POST করলে inactive assignment restore হবে, duplicate row create হবে না।


(.venv) PS E:\Audit\AMS\backend> python -m scripts.seed_menu_permission_mapping_permissions                                    
Permission created: menu.menu_permission.view
Permission created: api.menu_permission.assign
Permission created: api.menu_permission.remove
Target role IDs: [1]
Role permission assigned: role_id=1, permission_id=91
Role permission assigned: role_id=1, permission_id=92
Role permission assigned: role_id=1, permission_id=93
Menu permission mapping permissions seed completed.
(.venv) PS E:\Audit\AMS\backend> python -m compileall app
Listing 'app'...
Listing 'app\\api'...
Listing 'app\\api\\v1'...
Compiling 'app\\api\\v1\\menu_permissions.py'...
Compiling 'app\\api\\v1\\router.py'...
Listing 'app\\core'...
Listing 'app\\db'...
Listing 'app\\middleware'...
Listing 'app\\models'...
Listing 'app\\repositories'...
Compiling 'app\\repositories\\menu_permission_repository.py'...
Listing 'app\\schemas'...
Compiling 'app\\schemas\\menu_permission.py'...
Listing 'app\\services'...
Listing 'app\\services\\branch'...
Listing 'app\\services\\company'...
Listing 'app\\services\\department'...
Listing 'app\\services\\designation'...
Listing 'app\\services\\employee'...
Listing 'app\\services\\menu'...
Listing 'app\\services\\menu_action'...
Listing 'app\\services\\menu_permission'...
Compiling 'app\\services\\menu_permission\\__init__.py'...
Compiling 'app\\services\\menu_permission\\menu_permission_service.py'...
Listing 'app\\services\\navigation_group'...
Listing 'app\\services\\permission'...
Listing 'app\\services\\role'...
Listing 'app\\services\\role_permission'...
Listing 'app\\services\\user'...
Listing 'app\\services\\user_role'...
(.venv) PS E:\Audit\AMS\backend> python -c "from app.api.v1.menu_permissions import router; print([r.path for r in router.routes])"
['/menu-permissions/menus/{menu_id}/permissions', '/menu-permissions', '/menu-permissions/{menu_permission_id}']
(.venv) PS E:\Audit\AMS\backend> 

Thought for 9s
Perfect ✅ Menu Permission Mapping Backend compile + route registration clean.

Confirmed:

✅ Permission seed completed
✅ python -m compileall app passed
✅ /menu-permissions routes registered
Now last Security Phase 2 backend module:

Menu Action Permission Mapping Backend
menu_action_permissions table/model already আছে, তাই migration লাগবে না। এটা menu_action_id + permission_id mapping রাখে। 


Step 1: Schema + Repository
Create these files:

# E:\Audit\AMS\backend\app\schemas\menu_action_permission.py

from datetime import datetime

from pydantic import BaseModel, Field


class MenuActionPermissionAssignRequest(BaseModel):
    menu_action_id: int = Field(..., gt=0)
    permission_id: int = Field(..., gt=0)


class MenuActionPermissionResponse(BaseModel):
    id: int
    menu_action_id: int
    permission_id: int
    menu_id: int
    action_key: str
    action_title: str
    action_permission_key: str
    permission_key: str
    resource_type: str
    resource_key: str
    action: str
    description: str | None = None
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MenuActionPermissionListResponse(BaseModel):
    items: list[MenuActionPermissionResponse]
    total: int


class MenuActionPermissionMessageResponse(BaseModel):
    message: str
    data: MenuActionPermissionResponse | None = None
# E:\Audit\AMS\backend\app\repositories\menu_action_permission_repository.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu_action import MenuAction
from app.models.menu_action_permission import MenuActionPermission
from app.models.permission import Permission


class MenuActionPermissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_response_dict(
        self,
        menu_action_permission: MenuActionPermission,
        menu_action: MenuAction,
        permission: Permission,
    ) -> dict:
        return {
            "id": menu_action_permission.id,
            "menu_action_id": menu_action_permission.menu_action_id,
            "permission_id": menu_action_permission.permission_id,
            "menu_id": menu_action.menu_id,
            "action_key": menu_action.action_key,
            "action_title": menu_action.action_title,
            "action_permission_key": menu_action.permission_key,
            "permission_key": permission.permission_key,
            "resource_type": permission.resource_type,
            "resource_key": permission.resource_key,
            "action": permission.action,
            "description": permission.description,
            "is_active": menu_action_permission.is_active,
            "created_by": menu_action_permission.created_by,
            "updated_by": menu_action_permission.updated_by,
            "created_at": menu_action_permission.created_at,
            "updated_at": menu_action_permission.updated_at,
        }

    async def list_permissions_for_menu_action(
        self,
        menu_action_id: int,
        is_active: bool | None = True,
    ) -> list[dict]:
        query = (
            select(MenuActionPermission, MenuAction, Permission)
            .join(MenuAction, MenuAction.id == MenuActionPermission.menu_action_id)
            .join(Permission, Permission.id == MenuActionPermission.permission_id)
            .where(MenuActionPermission.menu_action_id == menu_action_id)
            .order_by(
                Permission.resource_type.asc(),
                Permission.resource_key.asc(),
                Permission.action.asc(),
            )
        )

        if is_active is not None:
            query = query.where(MenuActionPermission.is_active == is_active)

        result = await self.db.execute(query)
        rows = result.all()

        return [
            self._to_response_dict(
                menu_action_permission=row[0],
                menu_action=row[1],
                permission=row[2],
            )
            for row in rows
        ]

    async def get_existing_any_status(
        self,
        menu_action_id: int,
        permission_id: int,
    ) -> MenuActionPermission | None:
        result = await self.db.execute(
            select(MenuActionPermission).where(
                MenuActionPermission.menu_action_id == menu_action_id,
                MenuActionPermission.permission_id == permission_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_any_status(
        self,
        menu_action_permission_id: int,
    ) -> MenuActionPermission | None:
        result = await self.db.execute(
            select(MenuActionPermission).where(
                MenuActionPermission.id == menu_action_permission_id
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_with_details(
        self,
        menu_action_permission_id: int,
    ) -> dict | None:
        result = await self.db.execute(
            select(MenuActionPermission, MenuAction, Permission)
            .join(MenuAction, MenuAction.id == MenuActionPermission.menu_action_id)
            .join(Permission, Permission.id == MenuActionPermission.permission_id)
            .where(MenuActionPermission.id == menu_action_permission_id)
        )

        row = result.first()

        if not row:
            return None

        return self._to_response_dict(
            menu_action_permission=row[0],
            menu_action=row[1],
            permission=row[2],
        )

    async def create(
        self,
        menu_action_id: int,
        permission_id: int,
        created_by: str,
    ) -> MenuActionPermission:
        menu_action_permission = MenuActionPermission(
            menu_action_id=menu_action_id,
            permission_id=permission_id,
            is_active=True,
            created_by=created_by,
            updated_by=created_by,
        )

        self.db.add(menu_action_permission)
        await self.db.commit()
        await self.db.refresh(menu_action_permission)

        return menu_action_permission

    async def restore(
        self,
        menu_action_permission: MenuActionPermission,
        updated_by: str,
    ) -> MenuActionPermission:
        menu_action_permission.is_active = True
        menu_action_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_action_permission)

        return menu_action_permission

    async def deactivate(
        self,
        menu_action_permission: MenuActionPermission,
        updated_by: str,
    ) -> MenuActionPermission:
        menu_action_permission.is_active = False
        menu_action_permission.updated_by = updated_by

        await self.db.commit()
        await self.db.refresh(menu_action_permission)

        return menu_action_permission
Step 2: Service + API + Router
New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\menu_action_permission
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\menu_action_permission\__init__.py
# E:\Audit\AMS\backend\app\services\menu_action_permission\menu_action_permission_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.menu_action_permission_repository import (
    MenuActionPermissionRepository,
)
from app.repositories.menu_action_repository import MenuActionRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.menu_action_permission import (
    MenuActionPermissionAssignRequest,
)


class MenuActionPermissionService:
    def __init__(self, db: AsyncSession):
        self.menu_action_repository = MenuActionRepository(db)
        self.permission_repository = PermissionRepository(db)
        self.menu_action_permission_repository = MenuActionPermissionRepository(db)

    async def list_permissions_for_menu_action(
        self,
        menu_action_id: int,
        is_active: bool | None = True,
    ):
        menu_action = await self.menu_action_repository.get_by_id_any_status(
            menu_action_id
        )

        if not menu_action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found.",
            )

        items = (
            await self.menu_action_permission_repository.list_permissions_for_menu_action(
                menu_action_id=menu_action_id,
                is_active=is_active,
            )
        )

        return {
            "items": items,
            "total": len(items),
        }

    async def assign_permission_to_menu_action(
        self,
        payload: MenuActionPermissionAssignRequest,
        created_by: str,
    ):
        menu_action = await self.menu_action_repository.get_by_id(
            payload.menu_action_id
        )

        if not menu_action:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action not found or inactive.",
            )

        permission = await self.permission_repository.get_by_id(
            payload.permission_id
        )

        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found.",
            )

        if not permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot assign inactive permission.",
            )

        existing_mapping = (
            await self.menu_action_permission_repository.get_existing_any_status(
                menu_action_id=payload.menu_action_id,
                permission_id=payload.permission_id,
            )
        )

        if existing_mapping and existing_mapping.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This permission is already assigned to this menu action.",
            )

        if existing_mapping and not existing_mapping.is_active:
            restored_mapping = await self.menu_action_permission_repository.restore(
                menu_action_permission=existing_mapping,
                updated_by=created_by,
            )

            data = await self.menu_action_permission_repository.get_by_id_with_details(
                restored_mapping.id
            )

            return {
                "message": "Menu action permission assignment restored successfully.",
                "data": data,
            }

        menu_action_permission = await self.menu_action_permission_repository.create(
            menu_action_id=payload.menu_action_id,
            permission_id=payload.permission_id,
            created_by=created_by,
        )

        data = await self.menu_action_permission_repository.get_by_id_with_details(
            menu_action_permission.id
        )

        return {
            "message": "Permission assigned to menu action successfully.",
            "data": data,
        }

    async def remove_permission_from_menu_action(
        self,
        menu_action_permission_id: int,
        updated_by: str,
    ):
        menu_action_permission = (
            await self.menu_action_permission_repository.get_by_id_any_status(
                menu_action_permission_id
            )
        )

        if not menu_action_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu action permission assignment not found.",
            )

        if not menu_action_permission.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This menu action permission assignment is already inactive.",
            )

        updated_mapping = await self.menu_action_permission_repository.deactivate(
            menu_action_permission=menu_action_permission,
            updated_by=updated_by,
        )

        data = await self.menu_action_permission_repository.get_by_id_with_details(
            updated_mapping.id
        )

        return {
            "message": "Permission removed from menu action successfully.",
            "data": data,
        }
# E:\Audit\AMS\backend\app\api\v1\menu_action_permissions.py

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.menu_action_permission import (
    MenuActionPermissionAssignRequest,
    MenuActionPermissionListResponse,
    MenuActionPermissionMessageResponse,
)
from app.services.menu_action_permission.menu_action_permission_service import (
    MenuActionPermissionService,
)

router = APIRouter(
    prefix="/menu-action-permissions",
    tags=["Menu Action Permissions"],
)


@router.get(
    "/menu-actions/{menu_action_id}/permissions",
    response_model=MenuActionPermissionListResponse,
)
async def list_permissions_for_menu_action(
    menu_action_id: int,
    is_active: bool | None = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("menu.menu_action_permission.view")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.list_permissions_for_menu_action(
        menu_action_id=menu_action_id,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=MenuActionPermissionMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def assign_permission_to_menu_action(
    payload: MenuActionPermissionAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action_permission.assign")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.assign_permission_to_menu_action(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.delete(
    "/{menu_action_permission_id}",
    response_model=MenuActionPermissionMessageResponse,
)
async def remove_permission_from_menu_action(
    menu_action_permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_permission("api.menu_action_permission.remove")
    ),
):
    service = MenuActionPermissionService(db)
    return await service.remove_permission_from_menu_action(
        menu_action_permission_id=menu_action_permission_id,
        updated_by=current_user.user_id,
    )
# E:\Audit\AMS\backend\app\api\v1\router.py

# Add import
from app.api.v1.menu_action_permissions import (
    router as menu_action_permissions_router,
)

# Add include at the bottom
api_router.include_router(menu_action_permissions_router)
Step 3: Seed + Verify
# E:\Audit\AMS\backend\scripts\seed_menu_action_permission_mapping_permissions.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.permission import Permission
from app.models.role import Role
from app.models.role_permission import RolePermission


SYSTEM_USER = "system"


MENU_ACTION_PERMISSION_MAPPING_PERMISSIONS = [
    {
        "permission_key": "menu.menu_action_permission.view",
        "resource_type": "menu",
        "resource_key": "menu_action_permission",
        "action": "view",
        "description": "Can view menu action permission mappings.",
    },
    {
        "permission_key": "api.menu_action_permission.assign",
        "resource_type": "api",
        "resource_key": "menu_action_permission",
        "action": "assign",
        "description": "Can assign permissions to menu actions.",
    },
    {
        "permission_key": "api.menu_action_permission.remove",
        "resource_type": "api",
        "resource_key": "menu_action_permission",
        "action": "remove",
        "description": "Can remove permissions from menu actions.",
    },
]


BASE_SECURITY_PERMISSION_KEYS = [
    "menu.menu_action.view",
    "api.menu_action.create",
    "menu.menu_permission.view",
    "api.menu_permission.assign",
    "menu.menu.view",
    "api.menu.create",
    "menu.permission.view",
    "api.permission.create",
]


async def get_or_create_permission(db, permission_data: dict) -> Permission:
    result = await db.execute(
        select(Permission).where(
            Permission.permission_key == permission_data["permission_key"]
        )
    )
    permission = result.scalar_one_or_none()

    if permission:
        if not permission.is_active:
            permission.is_active = True
            permission.updated_by = SYSTEM_USER
            await db.commit()
            await db.refresh(permission)

        print(f"Permission exists: {permission.permission_key}")
        return permission

    permission = Permission(
        permission_key=permission_data["permission_key"],
        resource_type=permission_data["resource_type"],
        resource_key=permission_data["resource_key"],
        action=permission_data["action"],
        description=permission_data["description"],
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(permission)
    await db.commit()
    await db.refresh(permission)

    print(f"Permission created: {permission.permission_key}")
    return permission


async def find_target_role_ids(db) -> set[int]:
    role_ids: set[int] = set()

    result = await db.execute(
        select(Role.id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.is_active == True,  # noqa: E712
            RolePermission.is_active == True,  # noqa: E712
            Permission.permission_key.in_(BASE_SECURITY_PERMISSION_KEYS),
        )
    )

    for role_id in result.scalars().all():
        role_ids.add(int(role_id))

    admin_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%admin%"),
        )
    )

    for role_id in admin_result.scalars().all():
        role_ids.add(int(role_id))

    super_result = await db.execute(
        select(Role.id).where(
            Role.is_active == True,  # noqa: E712
            Role.role_name.ilike("%super%"),
        )
    )

    for role_id in super_result.scalars().all():
        role_ids.add(int(role_id))

    return role_ids


async def assign_permission_to_role(db, role_id: int, permission_id: int) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id,
        )
    )
    role_permission = result.scalar_one_or_none()

    if role_permission:
        if not role_permission.is_active:
            role_permission.is_active = True
            role_permission.updated_by = SYSTEM_USER
            await db.commit()
            print(
                f"Role permission restored: role_id={role_id}, permission_id={permission_id}"
            )
        else:
            print(
                f"Role permission exists: role_id={role_id}, permission_id={permission_id}"
            )

        return

    role_permission = RolePermission(
        role_id=role_id,
        permission_id=permission_id,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(role_permission)
    await db.commit()

    print(f"Role permission assigned: role_id={role_id}, permission_id={permission_id}")


async def seed_menu_action_permission_mapping_permissions():
    async with AsyncSessionLocal() as db:
        permissions: list[Permission] = []

        for permission_data in MENU_ACTION_PERMISSION_MAPPING_PERMISSIONS:
            permission = await get_or_create_permission(db, permission_data)
            permissions.append(permission)

        role_ids = await find_target_role_ids(db)

        if not role_ids:
            print("No target security/admin role found.")
            return

        print(f"Target role IDs: {sorted(role_ids)}")

        for role_id in sorted(role_ids):
            for permission in permissions:
                await assign_permission_to_role(
                    db=db,
                    role_id=role_id,
                    permission_id=permission.id,
                )

        print("Menu action permission mapping permissions seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_menu_action_permission_mapping_permissions())
cd E:\Audit\AMS\backend
python -m scripts.seed_menu_action_permission_mapping_permissions
python -m compileall app
python -c "from app.api.v1.menu_action_permissions import router; print([r.path for r in router.routes])"
Expected:

['/menu-action-permissions/menu-actions/{menu_action_id}/permissions', '/menu-action-permissions', '/menu-action-permissions/{menu_action_permission_id}']
Swagger test order:

POST /api/v1/menu-action-permissions
GET /api/v1/menu-action-permissions/menu-actions/{menu_action_id}/permissions
DELETE /api/v1/menu-action-permissions/{menu_action_permission_id}
POST /api/v1/menu-action-permissions again
Payload example:

{
  "menu_action_id": 1,
  "permission_id": 1
}
Last POST করলে inactive assignment restore হবে, duplicate row create হবে না।


(.venv) PS E:\Audit\AMS\backend> python -m scripts.seed_menu_action_permission_mapping_permissions                                 
Permission created: menu.menu_action_permission.view
Permission created: api.menu_action_permission.assign
Permission created: api.menu_action_permission.remove
Target role IDs: [1]
Role permission assigned: role_id=1, permission_id=94
Role permission assigned: role_id=1, permission_id=95
Role permission assigned: role_id=1, permission_id=96
Menu action permission mapping permissions seed completed.
(.venv) PS E:\Audit\AMS\backend> python -m compileall app
Listing 'app'...
Listing 'app\\api'...
Listing 'app\\api\\v1'...
Compiling 'app\\api\\v1\\menu_action_permissions.py'...
Compiling 'app\\api\\v1\\router.py'...
Listing 'app\\core'...
Listing 'app\\db'...
Listing 'app\\middleware'...
Listing 'app\\models'...
Listing 'app\\repositories'...
Compiling 'app\\repositories\\menu_action_permission_repository.py'...
Listing 'app\\schemas'...
Compiling 'app\\schemas\\menu_action_permission.py'...
Listing 'app\\services'...
Listing 'app\\services\\branch'...
Listing 'app\\services\\company'...
Listing 'app\\services\\department'...
Listing 'app\\services\\designation'...
Listing 'app\\services\\employee'...
Listing 'app\\services\\menu'...
Listing 'app\\services\\menu_action'...
Listing 'app\\services\\menu_action_permission'...
Compiling 'app\\services\\menu_action_permission\\__init__.py'...
Compiling 'app\\services\\menu_action_permission\\menu_action_permission_service.py'...
Listing 'app\\services\\menu_permission'...
Listing 'app\\services\\navigation_group'...
Listing 'app\\services\\permission'...
Listing 'app\\services\\role'...
Listing 'app\\services\\role_permission'...
Listing 'app\\services\\user'...
Listing 'app\\services\\user_role'...
(.venv) PS E:\Audit\AMS\backend> python -c "from app.api.v1.menu_action_permissions import router; print([r.path for r in router.routes])"
['/menu-action-permissions/menu-actions/{menu_action_id}/permissions', '/menu-action-permissions', '/menu-action-permissions/{menu_action_permission_id}']
(.venv) PS E:\Audit\AMS\backend> 

Thought for 12s
Perfect ✅ Menu Action Permission Mapping Backend compile + route registration clean.

Confirmed:

✅ Seed completed
✅ python -m compileall app passed
✅ Routes registered:
   /menu-action-permissions/menu-actions/{menu_action_id}/permissions
   /menu-action-permissions
   /menu-action-permissions/{menu_action_permission_id}
এখন Security Phase 2 backend status:

✅ Navigation Groups Management Backend
✅ Menus Management Backend
✅ Menu Actions Management Backend
✅ Menu Permission Mapping Backend
✅ Menu Action Permission Mapping Backend
So Security Backend Foundation Complete ✅

এখন শুধু Swagger থেকে last mapping test করলে পুরো backend security phase confirmed হবে:

POST /api/v1/menu-action-permissions
GET /api/v1/menu-action-permissions/menu-actions/{menu_action_id}/permissions
DELETE /api/v1/menu-action-permissions/{menu_action_permission_id}
POST /api/v1/menu-action-permissions again
Payload example:

{
  "menu_action_id": 1,
  "permission_id": 1
}
যদি 400 already assigned আসে, সেটা problem না—মানে duplicate prevention কাজ করছে।

Next best step: Frontend Security Management Pages শুরু করা।
Order হবে:

1. Roles Page
2. Permissions Page
3. Users Page
4. User Role Assignment UI
5. Role Permission Assignment UI
6. Navigation Groups Page
7. Menus Page
8. Menu Actions Page
9. Menu Permission Mapping UI
10. Menu Action Permission Mapping UI

Frontend Security Management Pages শুরু কর

Thought for 4s
middleware.ts খুঁজতে frontend folder-এ গিয়ে এই command দাও:

cd E:\Audit\AMS\frontend
Get-ChildItem -Recurse -Filter middleware.ts
যদি file থাকে, output এমন আসবে:

Directory: E:\Audit\AMS\frontend\src

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----                              ...     middleware.ts
তাহলে file path হবে:

E:\Audit\AMS\frontend\src\middleware.ts
VS Code থেকে সহজে খুঁজতে:

cd E:\Audit\AMS\frontend
code src\middleware.ts
যদি বলে file নাই, তাহলে create করো:

cd E:\Audit\AMS\frontend
New-Item -ItemType File -Force src\middleware.ts
code src\middleware.ts
তারপর current middleware code থাকলে আমাকে paste করো, আমি বলে দেব কোথায় /security/:path* add করতে হবে।


PS E:\Audit\AMS\frontend> Get-ChildItem -Recurse -Filter middleware.ts             
PS E:\Audit\AMS\frontend> 

Thought for 8s
মানে তোমার project-এ এখন middleware.ts নেই। সমস্যা না ✅
এখন নতুন করে create করো।

PowerShell:

cd E:\Audit\AMS\frontend
New-Item -ItemType File -Force src\middleware.ts
code src\middleware.ts
তারপর এই code paste করো:

// E:\Audit\AMS\frontend\src\middleware.ts

import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/security"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && accessToken) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/security/:path*", "/login"],
};
তারপর run করো:

npm run build
এরপর browser-এ test করো:

http://localhost:3000/security/roles
এখন login না থাকলে /login এ পাঠাবে, login থাকলে page open হবে।


[{
	"resource": "/e:/Audit/AMS/frontend/src/app/security/roles/page.tsx",
	"owner": "eslint5",
	"code": {
		"value": "react-hooks/immutability",
		"target": {
			"$mid": 1,
			"path": "/reference/eslint-plugin-react-hooks/lints/immutability",
			"scheme": "https",
			"authority": "react.dev"
		}
	},
	"severity": 8,
	"message": "Error: Cannot access variable before it is declared\n\nshowError is accessed before it is declared, which prevents the earlier access from updating when this value changes over time.\n\nE:\\Audit\\AMS\\frontend\\src\\app\\security\\roles\\page.tsx:51:7\n  49 |       console.error(\"Failed to load roles:\", error);\n  50 |       setRoles([]);\n> 51 |       showError(error instanceof Error ? error.message : \"Failed to load roles.\");\n     |       ^^^^^^^^^ showError accessed before it is declared\n  52 |     } finally {\n  53 |       setLoading(false);\n  54 |     }\n\nE:\\Audit\\AMS\\frontend\\src\\app\\security\\roles\\page.tsx:85:3\n  83 |   };\n  84 |\n> 85 |   const showError = (message: string) => {\n     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 86 |     setErrorMessage(message);\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 87 |     setSuccessMessage(\"\");\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 88 |\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 89 |     setTimeout(() => {\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 90 |       setErrorMessage(\"\");\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 91 |     }, 4000);\n     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 92 |   };\n     | ^^^^^ showError is declared here\n  93 |\n  94 |   const handleCreate = () => {\n  95 |     setEditingRole(null);",
	"source": "eslint",
	"startLineNumber": 51,
	"startColumn": 7,
	"endLineNumber": 51,
	"endColumn": 16,
	"modelVersionId": 9,
	"origin": "extHost1"
},{
	"resource": "/e:/Audit/AMS/frontend/src/app/security/roles/page.tsx",
	"owner": "eslint5",
	"code": {
		"value": "react-hooks/set-state-in-effect",
		"target": {
			"$mid": 1,
			"path": "/reference/eslint-plugin-react-hooks/lints/set-state-in-effect",
			"scheme": "https",
			"authority": "react.dev"
		}
	},
	"severity": 8,
	"message": "Error: Calling setState synchronously within an effect can trigger cascading renders\n\nEffects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:\n* Update external systems with the latest state from React.\n* Subscribe for updates from some external system, calling setState in a callback function when external state changes.\n\nCalling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).\n\nE:\\Audit\\AMS\\frontend\\src\\app\\security\\roles\\page.tsx:58:5\n  56 |\n  57 |   useEffect(() => {\n> 58 |     loadRoles();\n     |     ^^^^^^^^^ Avoid calling setState() directly within an effect\n  59 |   }, []);\n  60 |\n  61 |   const filteredRoles = roles.filter((role) => {",
	"source": "eslint",
	"startLineNumber": 58,
	"startColumn": 5,
	"endLineNumber": 58,
	"endColumn": 14,
	"modelVersionId": 9,
	"origin": "extHost1"
},{
	"resource": "/e:/Audit/AMS/frontend/src/app/security/roles/page.tsx",
	"owner": "eslint5",
	"code": {
		"value": "react-hooks/exhaustive-deps",
		"target": {
			"$mid": 1,
			"path": "/facebook/react/issues/14920",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 4,
	"message": "React Hook useEffect has a missing dependency: 'loadRoles'. Either include it or remove the dependency array.",
	"source": "eslint",
	"startLineNumber": 59,
	"startColumn": 6,
	"endLineNumber": 59,
	"endColumn": 8,
	"modelVersionId": 9,
	"origin": "extHost1"
}]

Thought for 21s
এই ৩টা error-এর কারণ:

showError আগে call হয়েছে, পরে declare হয়েছে
useEffect এর ভিতরে loadRoles() call করায় React lint ধরছে
loadRoles dependency missing
Best fix: page.tsx full replace করো।

// E:\Audit\AMS\frontend\src\app\security\roles\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Search, ShieldCheck } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import RoleForm from "@/components/roles/RoleForm";
import RoleRowActions from "@/components/roles/RoleRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  deactivateRole,
  getRoles,
  permanentlyDeleteRole,
  restoreRole,
} from "@/services/role";
import type { Role } from "@/types/role";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadRoles = useCallback(
    async (showPageLoading = true) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const data = await getRoles();
        setRoles(data);
      } catch (error) {
        console.error("Failed to load roles:", error);
        setRoles([]);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [showError]
  );

  useEffect(() => {
    let isMounted = true;

    void getRoles()
      .then((data) => {
        if (!isMounted) return;
        setRoles(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load roles:", error);
        setRoles([]);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const filteredRoles = roles.filter((role) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      role.role_name.toLowerCase().includes(keyword) ||
      role.description?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && role.is_active) ||
      (statusFilter === "inactive" && !role.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRole(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingRole);

    setDrawerOpen(false);
    setEditingRole(null);

    showSuccess(
      wasEditing
        ? "Role updated successfully."
        : "Role created successfully."
    );

    void loadRoles(false);
  };

  const openConfirm = (role: Role, action: ConfirmAction) => {
    setSelectedRole(role);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedRole(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedRole || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateRole(selectedRole.id);
        showSuccess("Role marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreRole(selectedRole.id);
        showSuccess("Role restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteRole(selectedRole.id);
        showSuccess("Role permanently deleted successfully.");
      }

      setSelectedRole(null);
      setConfirmAction(null);
      await loadRoles(false);
    } catch (error) {
      console.error("Role action failed:", error);
      showError(error instanceof Error ? error.message : "Role action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Role as Inactive?";
    if (confirmAction === "restore") return "Restore Role?";
    if (confirmAction === "permanent_delete") return "Permanently Delete Role?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedRole) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedRole.role_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedRole.role_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedRole.role_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-800 to-cyan-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Role Management</h1>
              <p className="mt-1 text-blue-100">
                Manage security roles with RBAC-based access control.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="role"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Roles</h2>
              <p className="text-sm text-slate-500">
                Create, update, inactive, restore and permanently delete roles.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search role."
                  className="ml-2 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Filter size={17} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="ml-2 bg-transparent text-sm font-bold text-slate-600 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-225 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Role Name</th>
                  <th className="px-5 py-4 font-bold">Description</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading roles...
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No role data found. Click Create to add first role.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role, index) => (
                    <tr
                      key={role.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !role.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {role.role_name}
                      </td>

                      <td className="max-w-md px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {role.description || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            role.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {role.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(role.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <RoleRowActions
                          role={role}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingRole ? "Edit Role" : "Create Role"}
        onClose={handleCloseDrawer}
      >
        <RoleForm
          key={editingRole ? `edit-role-${editingRole.id}` : "create-role"}
          initialData={editingRole}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedRole)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function RolesPage() {
  return <RolesContent />;
}
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
আরেকটা কথা: তুমি python -m compileall ভুল করে পুরো environment compile করেছিলে, frontend-এ কিন্তু এই command লাগবে না। Frontend check হবে শুধু:

npm run lint
npm run build

[{
	"resource": "/e:/Audit/AMS/frontend/src/components/roles/RoleForm.tsx",
	"owner": "eslint5",
	"code": {
		"value": "react-hooks/set-state-in-effect",
		"target": {
			"$mid": 1,
			"path": "/reference/eslint-plugin-react-hooks/lints/set-state-in-effect",
			"scheme": "https",
			"authority": "react.dev"
		}
	},
	"severity": 8,
	"message": "Error: Calling setState synchronously within an effect can trigger cascading renders\n\nEffects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:\n* Update external systems with the latest state from React.\n* Subscribe for updates from some external system, calling setState in a callback function when external state changes.\n\nCalling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).\n\nE:\\Audit\\AMS\\frontend\\src\\components\\roles\\RoleForm.tsx:27:5\n  25 |\n  26 |   useEffect(() => {\n> 27 |     setRoleName(initialData?.role_name || \"\");\n     |     ^^^^^^^^^^^ Avoid calling setState() directly within an effect\n  28 |     setDescription(initialData?.description || \"\");\n  29 |     setErrorMessage(\"\");\n  30 |   }, [initialData]);",
	"source": "eslint",
	"startLineNumber": 27,
	"startColumn": 5,
	"endLineNumber": 27,
	"endColumn": 16,
	"modelVersionId": 12,
	"origin": "extHost1"
}]

image(266).png
security/roles  কোথায়?

Thought for 16s
/security/roles page আছে ✅ কিন্তু sidebar-এ দেখা যাচ্ছে না, কারণ তোমার sidebar dynamic DB navigation থেকে আসে। আমরা frontend route বানিয়েছি, কিন্তু database-এর navigation_groups + menus table-এ Security → Roles menu seed করিনি।

এখন তুমি browser address bar-এ সরাসরি লিখে open করতে পারো:

http://localhost:3000/security/roles
Sidebar-এ দেখাতে হলে নিচের seed script চালাও।

Security Sidebar Seed Script
Create file:

E:\Audit\AMS\backend\scripts\seed_security_frontend_navigation.py
# E:\Audit\AMS\backend\scripts\seed_security_frontend_navigation.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "system"


async def get_or_create_security_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(NavigationGroup.group_key == "security")
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = "Security"
        group.group_icon = "ShieldCheck"
        group.sort_order = 20
        group.is_collapsible = True
        group.is_visible = True
        group.group_color = "blue"
        group.group_permission_key = None
        group.is_active = True
        group.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(group)

        print("Security navigation group exists/updated.")
        return group

    group = NavigationGroup(
        group_key="security",
        group_title="Security",
        group_icon="ShieldCheck",
        parent_group_id=None,
        sort_order=20,
        is_collapsible=True,
        is_visible=True,
        group_badge=None,
        group_color="blue",
        group_permission_key=None,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.commit()
    await db.refresh(group)

    print("Security navigation group created.")
    return group


async def get_or_create_role_menu(db, group_id: int) -> Menu:
    result = await db.execute(select(Menu).where(Menu.menu_key == "role"))
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = "Roles"
        menu.route_path = "/security/roles"
        menu.icon = "ShieldCheck"
        menu.permission_key = "menu.role.view"
        menu.sort_order = 10
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(menu)

        print("Role menu exists/updated.")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key="role",
        menu_title="Roles",
        route_path="/security/roles",
        icon="ShieldCheck",
        permission_key="menu.role.view",
        sort_order=10,
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.commit()
    await db.refresh(menu)

    print("Role menu created.")
    return menu


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_key: str,
    action_title: str,
    permission_key: str,
    button_color: str,
    button_icon: str,
    sort_order: int,
) -> None:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_key,
        )
    )
    action = result.scalar_one_or_none()

    if action:
        action.action_title = action_title
        action.permission_key = permission_key
        action.button_color = button_color
        action.button_icon = button_icon
        action.sort_order = sort_order
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        await db.commit()

        print(f"Menu action exists/updated: {action_key}")
        return

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_key,
        action_title=action_title,
        permission_key=permission_key,
        button_color=button_color,
        button_icon=button_icon,
        sort_order=sort_order,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.commit()

    print(f"Menu action created: {action_key}")


async def seed_security_frontend_navigation():
    async with AsyncSessionLocal() as db:
        security_group = await get_or_create_security_group(db)
        role_menu = await get_or_create_role_menu(db, security_group.id)

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="create",
            action_title="Create",
            permission_key="api.role.create",
            button_color="blue",
            button_icon="Plus",
            sort_order=10,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="update",
            action_title="Update",
            permission_key="api.role.update",
            button_color="amber",
            button_icon="Edit3",
            sort_order=20,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="delete",
            action_title="Inactive",
            permission_key="api.role.delete",
            button_color="orange",
            button_icon="XCircle",
            sort_order=30,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="restore",
            action_title="Restore",
            permission_key="api.role.restore",
            button_color="emerald",
            button_icon="RotateCcw",
            sort_order=40,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=role_menu.id,
            action_key="permanent_delete",
            action_title="Permanent Delete",
            permission_key="api.role.permanent_delete",
            button_color="red",
            button_icon="Trash2",
            sort_order=50,
        )

        print("Security frontend navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_security_frontend_navigation())
Run করো:

cd E:\Audit\AMS\backend
python -m scripts.seed_security_frontend_navigation
তারপর:

1. Logout
2. Login again
3. Dashboard refresh করো
তখন sidebar-এ Security → Roles দেখা যাওয়ার কথা।


(.venv) PS E:\Audit\AMS\backend> python -m scripts.seed_security_frontend_navigation    
Security navigation group created.                
Role menu created.
Menu action created: create
Menu action created: update
Menu action created: delete
Menu action created: restore
Menu action created: permanent_delete
Security frontend navigation seed completed.
(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload                          
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [2108] using StatReload
INFO:     Started server process [16112]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:64093 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:64093 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53688 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:50661 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:50662 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:50664 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:50663 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:49776 - "POST /api/v1/roles HTTP/1.1" 201 Created
INFO:     127.0.0.1:49776 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:52799 - "PATCH /api/v1/roles/3 HTTP/1.1" 200 OK
INFO:     127.0.0.1:52799 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:52800 - "DELETE /api/v1/roles/3 HTTP/1.1" 200 OK
INFO:     127.0.0.1:52800 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:52800 - "PATCH /api/v1/roles/3/restore HTTP/1.1" 200 OK
INFO:     127.0.0.1:52800 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:61085 - "POST /api/v1/roles HTTP/1.1" 201 Created
INFO:     127.0.0.1:61085 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:53236 - "DELETE /api/v1/roles/4/permanent HTTP/1.1" 200 OK
INFO:     127.0.0.1:53236 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK

Thought for 23s
Excellent ✅ Logs দেখে confirm: ```text ✅ Security → Roles sidebar seed done ✅ /security/roles page API working ✅ Create Role working ✅ Update Role working ✅ Inactive Role working ✅ Restore Role working ✅ Permanent Delete working ``` এখন শুরু করছি **Frontend Security Page 02: Permissions Page**. --- ## Step 1: Create files :::writing{variant="standard" id="62091"} ```powershell cd E:\Audit\AMS\frontend New-Item -ItemType File -Force src\types\permission.ts New-Item -ItemType File -Force src\services\permission.ts New-Item -ItemType Directory -Force src\components\permissions New-Item -ItemType File -Force src\components\permissions\PermissionForm.tsx New-Item -ItemType File -Force src\components\permissions\PermissionRowActions.tsx New-Item -ItemType Directory -Force src\app\security\permissions New-Item -ItemType File -Force src\app\security\permissions\page.tsx ``` ::: --- ## Step 2: Type + Service :::writing{variant="standard" id="25749"} ```ts // E:\Audit\AMS\frontend\src\types\permission.ts export type Permission = { id: number; permission_key: string; resource_type: string; resource_key: string; action: string; description: string | null; is_active: boolean; created_by: string | null; updated_by: string | null; created_at: string; updated_at: string; }; export type PermissionListResponse = { items: Permission[]; total: number; page: number; page_size: number; total_pages: number; }; export type PermissionPayload = { permission_key: string; resource_type: string; resource_key: string; action: string; description?: string | null; }; export type PermissionMessageResponse = { message: string; data: Permission | null; }; ``` ```ts // E:\Audit\AMS\frontend\src\services\permission.ts import type { Permission, PermissionListResponse, PermissionMessageResponse, PermissionPayload, } from "@/types/permission"; const getErrorMessage = async (response: Response) => { try { const data = await response.json(); if (typeof data.detail === "string") { return data.detail; } if (typeof data.message === "string") { return data.message; } return "Request failed. Please try again."; } catch { return "Request failed. Please try again."; } }; const requestJson = async <T>( url: string, options: RequestInit = {} ): Promise<T> => { const response = await fetch(url, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...(options.headers || {}), }, }); if (!response.ok) { throw new Error(await getErrorMessage(response)); } return response.json(); }; export const getPermissions = async (): Promise<Permission[]> => { const data = await requestJson<PermissionListResponse>( "/api/backend/permissions?page=1&page_size=200&sort_by=id&sort_order=asc" ); return data.items; }; export const createPermission = async ( payload: PermissionPayload ): Promise<PermissionMessageResponse> => { return requestJson<PermissionMessageResponse>("/api/backend/permissions", { method: "POST", body: JSON.stringify(payload), }); }; export const updatePermission = async ( permissionId: number, payload: PermissionPayload ): Promise<PermissionMessageResponse> => { return requestJson<PermissionMessageResponse>( `/api/backend/permissions/${permissionId}`, { method: "PATCH", body: JSON.stringify(payload), } ); }; export const deactivatePermission = async ( permissionId: number ): Promise<PermissionMessageResponse> => { return requestJson<PermissionMessageResponse>( `/api/backend/permissions/${permissionId}`, { method: "DELETE", } ); }; export const restorePermission = async ( permissionId: number ): Promise<PermissionMessageResponse> => { return requestJson<PermissionMessageResponse>( `/api/backend/permissions/${permissionId}/restore`, { method: "PATCH", } ); }; export const permanentlyDeletePermission = async ( permissionId: number ): Promise<PermissionMessageResponse> => { return requestJson<PermissionMessageResponse>( `/api/backend/permissions/${permissionId}/permanent`, { method: "DELETE", } ); }; ``` ::: --- ## Step 3: Components + Page + Sidebar Seed :::writing{variant="standard" id="83416"} ```tsx // E:\Audit\AMS\frontend\src\components\permissions\PermissionForm.tsx "use client"; import { useState } from "react"; import { createPermission, updatePermission } from "@/services/permission"; import type { Permission } from "@/types/permission"; type PermissionFormProps = { initialData?: Permission | null; onSuccess: () => void; onCancel: () => void; }; export default function PermissionForm({ initialData, onSuccess, onCancel, }: PermissionFormProps) { const [permissionKey, setPermissionKey] = useState( initialData?.permission_key || "" ); const [resourceType, setResourceType] = useState( initialData?.resource_type || "api" ); const [resourceKey, setResourceKey] = useState( initialData?.resource_key || "" ); const [action, setAction] = useState(initialData?.action || ""); const [description, setDescription] = useState( initialData?.description || "" ); const [saving, setSaving] = useState(false); const [errorMessage, setErrorMessage] = useState(""); const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if ( !permissionKey.trim() || !resourceType.trim() || !resourceKey.trim() || !action.trim() ) { setErrorMessage("Permission key, resource type, resource key and action are required."); return; } try { setSaving(true); setErrorMessage(""); const payload = { permission_key: permissionKey.trim(), resource_type: resourceType.trim(), resource_key: resourceKey.trim(), action: action.trim(), description: description.trim() || null, }; if (initialData) { await updatePermission(initialData.id, payload); } else { await createPermission(payload); } onSuccess(); } catch (error) { setErrorMessage( error instanceof Error ? error.message : "Permission save failed." ); } finally { setSaving(false); } }; return ( <form onSubmit={handleSubmit} className="space-y-5"> {errorMessage && ( <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"> {errorMessage} </div> )} <div> <label className="mb-2 block text-sm font-bold text-slate-700"> Permission Key <span className="text-red-500">*</span> </label> <input value={permissionKey} onChange={(event) => setPermissionKey(event.target.value)} placeholder="Example: api.audit.create" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> </div> <div className="grid gap-4 md:grid-cols-2"> <div> <label className="mb-2 block text-sm font-bold text-slate-700"> Resource Type <span className="text-red-500">*</span> </label> <select value={resourceType} onChange={(event) => setResourceType(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" > <option value="api">api</option> <option value="menu">menu</option> <option value="button">button</option> <option value="module">module</option> </select> </div> <div> <label className="mb-2 block text-sm font-bold text-slate-700"> Action <span className="text-red-500">*</span> </label> <input value={action} onChange={(event) => setAction(event.target.value)} placeholder="create, update, delete, view" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> </div> </div> <div> <label className="mb-2 block text-sm font-bold text-slate-700"> Resource Key <span className="text-red-500">*</span> </label> <input value={resourceKey} onChange={(event) => setResourceKey(event.target.value)} placeholder="Example: audit, role, permission" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> </div> <div> <label className="mb-2 block text-sm font-bold text-slate-700"> Description </label> <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Write short permission description." rows={4} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /> </div> <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5"> <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50" > Cancel </button> <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50" > {saving ? "Saving..." : initialData ? "Update Permission" : "Create Permission"} </button> </div> </form> ); } ``` ```tsx // E:\Audit\AMS\frontend\src\components\permissions\PermissionRowActions.tsx "use client"; import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react"; import type { Permission } from "@/types/permission"; type PermissionRowActionsProps = { permission: Permission; onEdit: (permission: Permission) => void; onInactive: (permission: Permission) => void; onRestore: (permission: Permission) => void; onPermanentDelete: (permission: Permission) => void; }; export default function PermissionRowActions({ permission, onEdit, onInactive, onRestore, onPermanentDelete, }: PermissionRowActionsProps) { return ( <div className="flex items-center justify-end gap-2"> <button type="button" onClick={() => onEdit(permission)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700" title="Edit" > <Edit3 size={16} /> </button> {permission.is_active ? ( <button type="button" onClick={() => onInactive(permission)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700" title="Mark inactive" > <XCircle size={16} /> </button> ) : ( <button type="button" onClick={() => onRestore(permission)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" title="Restore" > <RotateCcw size={16} /> </button> )} <button type="button" onClick={() => onPermanentDelete(permission)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700" title="Permanent delete" > <Trash2 size={16} /> </button> </div> ); } ``` ```tsx // E:\Audit\AMS\frontend\src\app\security\permissions\page.tsx "use client"; import { useCallback, useEffect, useState } from "react"; import { Filter, KeyRound, Search } from "lucide-react"; import ConfirmModal from "@/components/common/ConfirmModal"; import PageActionBar from "@/components/common/PageActionBar"; import RightDrawer from "@/components/common/RightDrawer"; import DashboardLayout from "@/components/layout/DashboardLayout"; import PermissionForm from "@/components/permissions/PermissionForm"; import PermissionRowActions from "@/components/permissions/PermissionRowActions"; import { deactivatePermission, getPermissions, permanentlyDeletePermission, restorePermission, } from "@/services/permission"; import type { Permission } from "@/types/permission"; type ConfirmAction = "inactive" | "restore" | "permanent_delete"; type ConfirmVariant = "danger" | "warning" | "success"; type StatusFilter = "all" | "active" | "inactive"; function PermissionsContent() { const [permissions, setPermissions] = useState<Permission[]>([]); const [loading, setLoading] = useState(true); const [drawerOpen, setDrawerOpen] = useState(false); const [successMessage, setSuccessMessage] = useState(""); const [errorMessage, setErrorMessage] = useState(""); const [searchTerm, setSearchTerm] = useState(""); const [statusFilter, setStatusFilter] = useState<StatusFilter>("all"); const [editingPermission, setEditingPermission] = useState<Permission | null>(null); const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null); const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>( null ); const [confirmLoading, setConfirmLoading] = useState(false); const showSuccess = useCallback((message: string) => { setSuccessMessage(message); setErrorMessage(""); setTimeout(() => { setSuccessMessage(""); }, 3000); }, []); const showError = useCallback((message: string) => { setErrorMessage(message); setSuccessMessage(""); setTimeout(() => { setErrorMessage(""); }, 4000); }, []); const refreshPermissions = useCallback( async (showPageLoading = false) => { try { if (showPageLoading) { setLoading(true); } const data = await getPermissions(); setPermissions(data); } catch (error) { console.error("Failed to load permissions:", error); setPermissions([]); showError( error instanceof Error ? error.message : "Failed to load permissions." ); } finally { if (showPageLoading) { setLoading(false); } } }, [showError] ); useEffect(() => { let isMounted = true; void getPermissions() .then((data) => { if (!isMounted) return; setPermissions(data); }) .catch((error) => { if (!isMounted) return; console.error("Failed to load permissions:", error); setPermissions([]); showError( error instanceof Error ? error.message : "Failed to load permissions." ); }) .finally(() => { if (!isMounted) return; setLoading(false); }); return () => { isMounted = false; }; }, [showError]); const filteredPermissions = permissions.filter((permission) => { const keyword = searchTerm.toLowerCase(); const descriptionText = permission.description || ""; const matchesSearch = permission.permission_key.toLowerCase().includes(keyword) || permission.resource_type.toLowerCase().includes(keyword) || permission.resource_key.toLowerCase().includes(keyword) || permission.action.toLowerCase().includes(keyword) || descriptionText.toLowerCase().includes(keyword); const matchesStatus = statusFilter === "all" || (statusFilter === "active" && permission.is_active) || (statusFilter === "inactive" && !permission.is_active); return matchesSearch && matchesStatus; }); const handleCreate = () => { setEditingPermission(null); setDrawerOpen(true); }; const handleEdit = (permission: Permission) => { setEditingPermission(permission); setDrawerOpen(true); }; const handleExport = () => { showSuccess("Export feature will be implemented in the next phase."); }; const handleImport = () => { showSuccess("Import feature will be implemented in the next phase."); }; const handleCloseDrawer = () => { setDrawerOpen(false); setEditingPermission(null); }; const handleSuccess = () => { const wasEditing = Boolean(editingPermission); setDrawerOpen(false); setEditingPermission(null); showSuccess( wasEditing ? "Permission updated successfully." : "Permission created successfully." ); void refreshPermissions(false); }; const openConfirm = (permission: Permission, action: ConfirmAction) => { setSelectedPermission(permission); setConfirmAction(action); }; const closeConfirm = () => { if (confirmLoading) return; setSelectedPermission(null); setConfirmAction(null); }; const handleConfirmAction = async () => { if (!selectedPermission || !confirmAction) { return; } try { setConfirmLoading(true); if (confirmAction === "inactive") { await deactivatePermission(selectedPermission.id); showSuccess("Permission marked as inactive successfully."); } if (confirmAction === "restore") { await restorePermission(selectedPermission.id); showSuccess("Permission restored successfully."); } if (confirmAction === "permanent_delete") { await permanentlyDeletePermission(selectedPermission.id); showSuccess("Permission permanently deleted successfully."); } setSelectedPermission(null); setConfirmAction(null); await refreshPermissions(false); } catch (error) { console.error("Permission action failed:", error); showError( error instanceof Error ? error.message : "Permission action failed." ); } finally { setConfirmLoading(false); } }; const getConfirmTitle = () => { if (confirmAction === "inactive") return "Mark Permission as Inactive?"; if (confirmAction === "restore") return "Restore Permission?"; if (confirmAction === "permanent_delete") { return "Permanently Delete Permission?"; } return ""; }; const getConfirmMessage = () => { if (!selectedPermission) return ""; if (confirmAction === "inactive") { return `Are you sure you want to mark "${selectedPermission.permission_key}" as inactive?`; } if (confirmAction === "restore") { return `Are you sure you want to restore "${selectedPermission.permission_key}"?`; } if (confirmAction === "permanent_delete") { return `Are you sure you want to permanently delete "${selectedPermission.permission_key}"? This action cannot be undone.`; } return ""; }; const getConfirmLabel = () => { if (confirmAction === "inactive") return "Mark Inactive"; if (confirmAction === "restore") return "Restore"; if (confirmAction === "permanent_delete") return "Permanent Delete"; return "Confirm"; }; const getConfirmVariant = (): ConfirmVariant => { if (confirmAction === "restore") return "success"; if (confirmAction === "inactive") return "warning"; return "danger"; }; return ( <DashboardLayout> <div className="space-y-6"> <section className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-800 to-blue-700 p-8 text-white shadow-xl"> <div className="flex items-center gap-4"> <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15"> <KeyRound size={34} /> </div> <div> <h1 className="text-3xl font-black">Permission Management</h1> <p className="mt-1 text-blue-100"> Manage API, menu, button and module permissions for RBAC. </p> </div> </div> </section> <PageActionBar menuKey="permission" onCreate={handleCreate} onExport={handleExport} onImport={handleImport} /> {successMessage && ( <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700"> {successMessage} </div> )} {errorMessage && ( <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"> {errorMessage} </div> )} <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"> <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"> <div> <h2 className="text-xl font-black text-slate-900">Permissions</h2> <p className="text-sm text-slate-500"> Create, update, inactive, restore and permanently delete permissions. </p> </div> <div className="flex flex-col gap-3 sm:flex-row"> <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"> <Search size={17} className="text-slate-400" /> <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search permission." className="ml-2 bg-transparent text-sm outline-none" /> </div> <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2"> <Filter size={17} className="text-slate-400" /> <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter) } className="ml-2 bg-transparent text-sm font-bold text-slate-600 outline-none" > <option value="all">All Status</option> <option value="active">Active</option> <option value="inactive">Inactive</option> </select> </div> </div> </div> <div className="overflow-x-auto rounded-2xl border border-slate-200"> <table className="min-w-[1100px] w-full text-left text-sm"> <thead className="bg-slate-50 text-slate-500"> <tr> <th className="px-5 py-4 font-bold">SL</th> <th className="px-5 py-4 font-bold">Permission Key</th> <th className="px-5 py-4 font-bold">Resource</th> <th className="px-5 py-4 font-bold">Action</th> <th className="px-5 py-4 font-bold">Status</th> <th className="px-5 py-4 font-bold">Created At</th> <th className="px-5 py-4 text-right font-bold">Action</th> </tr> </thead> <tbody> {loading ? ( <tr> <td colSpan={7} className="px-5 py-16 text-center text-slate-400" > Loading permissions... </td> </tr> ) : filteredPermissions.length === 0 ? ( <tr> <td colSpan={7} className="px-5 py-16 text-center text-slate-400" > No permission data found. Click Create to add first permission. </td> </tr> ) : ( filteredPermissions.map((permission, index) => ( <tr key={permission.id} className={`border-t border-slate-100 hover:bg-slate-50 ${ !permission.is_active ? "bg-slate-50 opacity-70" : "" }`} > <td className="px-5 py-4 font-semibold text-slate-600"> {index + 1} </td> <td className="px-5 py-4"> <div className="font-bold text-slate-900"> {permission.permission_key} </div> <div className="mt-1 text-xs text-slate-500"> {permission.description || "-"} </div> </td> <td className="px-5 py-4"> <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"> {permission.resource_type} </span> <div className="mt-2 text-sm font-semibold text-slate-700"> {permission.resource_key} </div> </td> <td className="px-5 py-4 font-bold text-slate-700"> {permission.action} </td> <td className="px-5 py-4"> <span className={`rounded-full px-3 py-1 text-xs font-bold ${ permission.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-700" }`} > {permission.is_active ? "Active" : "Inactive"} </span> </td> <td className="px-5 py-4 text-slate-600"> {new Date(permission.created_at).toLocaleDateString()} </td> <td className="px-5 py-4 text-right"> <PermissionRowActions permission={permission} onEdit={handleEdit} onInactive={(selected) => openConfirm(selected, "inactive") } onRestore={(selected) => openConfirm(selected, "restore") } onPermanentDelete={(selected) => openConfirm(selected, "permanent_delete") } /> </td> </tr> )) )} </tbody> </table> </div> </section> </div> <RightDrawer open={drawerOpen} title={editingPermission ? "Edit Permission" : "Create Permission"} onClose={handleCloseDrawer} > <PermissionForm key={ editingPermission ? `edit-permission-${editingPermission.id}` : "create-permission" } initialData={editingPermission} onSuccess={handleSuccess} onCancel={handleCloseDrawer} /> </RightDrawer> <ConfirmModal open={Boolean(confirmAction && selectedPermission)} title={getConfirmTitle()} message={getConfirmMessage()} confirmLabel={getConfirmLabel()} variant={getConfirmVariant()} loading={confirmLoading} onConfirm={handleConfirmAction} onClose={closeConfirm} /> </DashboardLayout> ); } export default function PermissionsPage() { return <PermissionsContent />; } ``` ::: --- ## Step 4: Add Permissions page to sidebar Create backend script: ```text E:\Audit\AMS\backend\scripts\seed_permission_frontend_navigation.py ``` Use this code: ```py # E:\Audit\AMS\backend\scripts\seed_permission_frontend_navigation.py import asyncio from sqlalchemy import select from app.db.session import AsyncSessionLocal from app.models.menu import Menu from app.models.menu_action import MenuAction from app.models.navigation_group import NavigationGroup SYSTEM_USER = "system" async def get_security_group(db) -> NavigationGroup: result = await db.execute( select(NavigationGroup).where(NavigationGroup.group_key == "security") ) group = result.scalar_one_or_none() if group: group.is_active = True group.is_visible = True group.updated_by = SYSTEM_USER await db.commit() await db.refresh(group) return group group = NavigationGroup( group_key="security", group_title="Security", group_icon="ShieldCheck", parent_group_id=None, sort_order=20, is_collapsible=True, is_visible=True, group_badge=None, group_color="blue", group_permission_key=None, is_active=True, created_by=SYSTEM_USER, updated_by=SYSTEM_USER, ) db.add(group) await db.commit() await db.refresh(group) return group async def get_or_create_permission_menu(db, group_id: int) -> Menu: result = await db.execute(select(Menu).where(Menu.menu_key == "permission")) menu = result.scalar_one_or_none() if menu: menu.navigation_group_id = group_id menu.parent_menu_id = None menu.menu_title = "Permissions" menu.route_path = "/security/permissions" menu.icon = "KeyRound" menu.permission_key = "menu.permission.view" menu.sort_order = 20 menu.menu_level = 1 menu.is_expandable = False menu.is_visible = True menu.is_active = True menu.updated_by = SYSTEM_USER await db.commit() await db.refresh(menu) print("Permission menu exists/updated.") return menu menu = Menu( navigation_group_id=group_id, parent_menu_id=None, menu_key="permission", menu_title="Permissions", route_path="/security/permissions", icon="KeyRound", permission_key="menu.permission.view", sort_order=20, menu_level=1, is_expandable=False, is_visible=True, is_active=True, created_by=SYSTEM_USER, updated_by=SYSTEM_USER, ) db.add(menu) await db.commit() await db.refresh(menu) print("Permission menu created.") return menu async def get_or_create_menu_action( db, menu_id: int, action_key: str, action_title: str, permission_key: str, button_color: str, button_icon: str, sort_order: int, ) -> None: result = await db.execute( select(MenuAction).where( MenuAction.menu_id == menu_id, MenuAction.action_key == action_key, ) ) action = result.scalar_one_or_none() if action: action.action_title = action_title action.permission_key = permission_key action.button_color = button_color action.button_icon = button_icon action.sort_order = sort_order action.is_visible = True action.is_active = True action.updated_by = SYSTEM_USER await db.commit() print(f"Menu action exists/updated: {action_key}") return action = MenuAction( menu_id=menu_id, action_key=action_key, action_title=action_title, permission_key=permission_key, button_color=button_color, button_icon=button_icon, sort_order=sort_order, is_visible=True, is_active=True, created_by=SYSTEM_USER, updated_by=SYSTEM_USER, ) db.add(action) await db.commit() print(f"Menu action created: {action_key}") async def seed_permission_frontend_navigation(): async with AsyncSessionLocal() as db: security_group = await get_security_group(db) permission_menu = await get_or_create_permission_menu( db=db, group_id=security_group.id, ) await get_or_create_menu_action( db=db, menu_id=permission_menu.id, action_key="create", action_title="Create", permission_key="api.permission.create", button_color="blue", button_icon="Plus", sort_order=10, ) await get_or_create_menu_action( db=db, menu_id=permission_menu.id, action_key="update", action_title="Update", permission_key="api.permission.update", button_color="amber", button_icon="Edit3", sort_order=20, ) await get_or_create_menu_action( db=db, menu_id=permission_menu.id, action_key="delete", action_title="Inactive", permission_key="api.permission.delete", button_color="orange", button_icon="XCircle", sort_order=30, ) await get_or_create_menu_action( db=db, menu_id=permission_menu.id, action_key="restore", action_title="Restore", permission_key="api.permission.restore", button_color="emerald", button_icon="RotateCcw", sort_order=40, ) await get_or_create_menu_action( db=db, menu_id=permission_menu.id, action_key="permanent_delete", action_title="Permanent Delete", permission_key="api.permission.permanent_delete", button_color="red", button_icon="Trash2", sort_order=50, ) print("Permission frontend navigation seed completed.") if __name__ == "__main__": asyncio.run(seed_permission_frontend_navigation()) ``` Run: ```powershell cd E:\Audit\AMS\backend python -m scripts.seed_permission_frontend_navigation ``` Then frontend check: ```powershell cd E:\Audit\AMS\frontend npm run lint npm run build ``` Test URL: ```text http://localhost:3000/security/permissions ``` Sidebar refresh না হলে logout → login again.

Frontend Security Page 02: Permissions Page code আবার প্রদান কর আগে যেভাবে দিয়েছো কিছু বোঝা যাচ্ছে না

Thought for 15s
ঠিক আছে। নিচে Permissions Page একদম পরিষ্কারভাবে আবার দিলাম। মোট ৫টা frontend file লাগবে।

প্রথমে file create করো।

cd E:\Audit\AMS\frontend

New-Item -ItemType File -Force src\types\permission.ts
New-Item -ItemType File -Force src\services\permission.ts

New-Item -ItemType Directory -Force src\components\permissions
New-Item -ItemType File -Force src\components\permissions\PermissionForm.tsx
New-Item -ItemType File -Force src\components\permissions\PermissionRowActions.tsx

New-Item -ItemType Directory -Force src\app\security\permissions
New-Item -ItemType File -Force src\app\security\permissions\page.tsx
1. src\types\permission.ts
// E:\Audit\AMS\frontend\src\types\permission.ts

export type Permission = {
  id: number;
  permission_key: string;
  resource_type: string;
  resource_key: string;
  action: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PermissionListResponse = {
  items: Permission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type PermissionPayload = {
  permission_key: string;
  resource_type: string;
  resource_key: string;
  action: string;
  description?: string | null;
};

export type PermissionMessageResponse = {
  message: string;
  data: Permission | null;
};
// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  Permission,
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const getPermissions = async (): Promise<Permission[]> => {
  const data = await requestJson<PermissionListResponse>(
    "/api/backend/permissions?page=1&page_size=200&sort_by=id&sort_order=asc"
  );

  return data.items;
};

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
2. Components
// E:\Audit\AMS\frontend\src\components\permissions\PermissionForm.tsx

"use client";

import { useState } from "react";

import { createPermission, updatePermission } from "@/services/permission";
import type { Permission } from "@/types/permission";

type PermissionFormProps = {
  initialData?: Permission | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PermissionForm({
  initialData,
  onSuccess,
  onCancel,
}: PermissionFormProps) {
  const [permissionKey, setPermissionKey] = useState(
    initialData?.permission_key || ""
  );
  const [resourceType, setResourceType] = useState(
    initialData?.resource_type || "api"
  );
  const [resourceKey, setResourceKey] = useState(
    initialData?.resource_key || ""
  );
  const [action, setAction] = useState(initialData?.action || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !permissionKey.trim() ||
      !resourceType.trim() ||
      !resourceKey.trim() ||
      !action.trim()
    ) {
      setErrorMessage(
        "Permission key, resource type, resource key and action are required."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        permission_key: permissionKey.trim(),
        resource_type: resourceType.trim(),
        resource_key: resourceKey.trim(),
        action: action.trim(),
        description: description.trim() || null,
      };

      if (initialData) {
        await updatePermission(initialData.id, payload);
      } else {
        await createPermission(payload);
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Permission save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Permission Key <span className="text-red-500">*</span>
        </label>

        <input
          value={permissionKey}
          onChange={(event) => setPermissionKey(event.target.value)}
          placeholder="Example: api.audit.create"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Resource Type <span className="text-red-500">*</span>
          </label>

          <select
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="api">api</option>
            <option value="menu">menu</option>
            <option value="button">button</option>
            <option value="module">module</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Action <span className="text-red-500">*</span>
          </label>

          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="create, update, delete, view"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Resource Key <span className="text-red-500">*</span>
        </label>

        <input
          value={resourceKey}
          onChange={(event) => setResourceKey(event.target.value)}
          placeholder="Example: audit, role, permission"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Write short permission description."
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : initialData
              ? "Update Permission"
              : "Create Permission"}
        </button>
      </div>
    </form>
  );
}
// E:\Audit\AMS\frontend\src\components\permissions\PermissionRowActions.tsx

"use client";

import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react";

import type { Permission } from "@/types/permission";

type PermissionRowActionsProps = {
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onInactive: (permission: Permission) => void;
  onRestore: (permission: Permission) => void;
  onPermanentDelete: (permission: Permission) => void;
};

export default function PermissionRowActions({
  permission,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: PermissionRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(permission)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Edit3 size={16} />
      </button>

      {permission.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(permission)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark inactive"
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRestore(permission)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onPermanentDelete(permission)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
        title="Permanent delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
3. Page file
src\app\security\permissions\page.tsx এই code দিয়ে full replace করো।

// E:\Audit\AMS\frontend\src\app\security\permissions\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, KeyRound, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PermissionForm from "@/components/permissions/PermissionForm";
import PermissionRowActions from "@/components/permissions/PermissionRowActions";

import {
  deactivatePermission,
  getPermissions,
  permanentlyDeletePermission,
  restorePermission,
} from "@/services/permission";
import type { Permission } from "@/types/permission";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function PermissionsContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const refreshPermissions = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const data = await getPermissions();
        setPermissions(data);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        setPermissions([]);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [showError]
  );

  useEffect(() => {
    let isMounted = true;

    void getPermissions()
      .then((data) => {
        if (!isMounted) return;
        setPermissions(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load permissions:", error);
        setPermissions([]);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const filteredPermissions = permissions.filter((permission) => {
    const keyword = searchTerm.toLowerCase();
    const descriptionText = permission.description || "";

    const matchesSearch =
      permission.permission_key.toLowerCase().includes(keyword) ||
      permission.resource_type.toLowerCase().includes(keyword) ||
      permission.resource_key.toLowerCase().includes(keyword) ||
      permission.action.toLowerCase().includes(keyword) ||
      descriptionText.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && permission.is_active) ||
      (statusFilter === "inactive" && !permission.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setEditingPermission(null);
    setDrawerOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingPermission(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingPermission);

    setDrawerOpen(false);
    setEditingPermission(null);

    showSuccess(
      wasEditing
        ? "Permission updated successfully."
        : "Permission created successfully."
    );

    void refreshPermissions(false);
  };

  const openConfirm = (permission: Permission, action: ConfirmAction) => {
    setSelectedPermission(permission);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedPermission(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedPermission || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivatePermission(selectedPermission.id);
        showSuccess("Permission marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restorePermission(selectedPermission.id);
        showSuccess("Permission restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeletePermission(selectedPermission.id);
        showSuccess("Permission permanently deleted successfully.");
      }

      setSelectedPermission(null);
      setConfirmAction(null);
      await refreshPermissions(false);
    } catch (error) {
      console.error("Permission action failed:", error);
      showError(
        error instanceof Error ? error.message : "Permission action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Permission as Inactive?";
    if (confirmAction === "restore") return "Restore Permission?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Permission?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedPermission) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedPermission.permission_key}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedPermission.permission_key}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedPermission.permission_key}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-800 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <KeyRound size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Permission Management</h1>
              <p className="mt-1 text-blue-100">
                Manage API, menu, button and module permissions for RBAC.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="permission"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Permissions</h2>
              <p className="text-sm text-slate-500">
                Create, update, inactive, restore and permanently delete permissions.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search permission."
                  className="ml-2 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Filter size={17} className="text-slate-400" />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="ml-2 bg-transparent text-sm font-bold text-slate-600 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Permission Key</th>
                  <th className="px-5 py-4 font-bold">Resource</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading permissions...
                    </td>
                  </tr>
                ) : filteredPermissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No permission data found. Click Create to add first permission.
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !permission.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {permission.permission_key}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {permission.description || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {permission.resource_type}
                        </span>

                        <div className="mt-2 text-sm font-semibold text-slate-700">
                          {permission.resource_key}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        {permission.action}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            permission.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {permission.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <PermissionRowActions
                          permission={permission}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingPermission ? "Edit Permission" : "Create Permission"}
        onClose={handleCloseDrawer}
      >
        <PermissionForm
          key={
            editingPermission
              ? `edit-permission-${editingPermission.id}`
              : "create-permission"
          }
          initialData={editingPermission}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedPermission)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function PermissionsPage() {
  return <PermissionsContent />;
}
শেষে run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Build pass হলে বলো, তারপর আমি Permissions sidebar seed script আলাদা করে পরিষ্কারভাবে দেব।


PS E:\Audit\AMS\frontend> npm run lint                                         
               
> frontend@0.1.0 lint
> eslint

PS E:\Audit\AMS\frontend> npm run build

> frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 3.1s
✓ Finished TypeScript in 3.8s    
✓ Collecting page data using 7 workers in 962ms    
✓ Generating static pages using 7 workers (21/21) in 456ms
✓ Finalizing page optimization in 22ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/backend/[...path]
├ ƒ /api/branches
├ ƒ /api/branches/[id]
├ ƒ /api/branches/[id]/inactive
├ ƒ /api/companies
├ ƒ /api/companies/[id]
├ ƒ /api/departments
├ ƒ /api/departments/[id]
├ ƒ /api/departments/[id]/inactive
├ ƒ /api/departments/[id]/restore
├ ƒ /api/designations
├ ƒ /api/designations/[id]
├ ƒ /api/designations/[id]/inactive
├ ƒ /api/designations/[id]/restore
├ ƒ /api/employees
├ ƒ /api/employees/[id]
├ ƒ /api/employees/[id]/inactive
├ ƒ /api/employees/[id]/photo
├ ƒ /api/employees/[id]/restore
├ ƒ /api/me/navigation
├ ○ /branches
├ ○ /companies
├ ○ /dashboard
├ ○ /departments
├ ○ /designations
├ ○ /employees
├ ○ /login
├ ○ /security/permissions
└ ○ /security/roles


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

PS E:\Audit\AMS\frontend> 

Thought for 8s
Perfect ✅ Permissions Page build passed.

Confirmed:

✅ /security/permissions route created
✅ npm run lint passed
✅ npm run build passed
এখন Permissions page sidebar-এ দেখানোর জন্য seed script দিচ্ছি।

Step 1: Backend seed file create করো
cd E:\Audit\AMS\backend

New-Item -ItemType File -Force scripts\seed_permission_frontend_navigation.py
code scripts\seed_permission_frontend_navigation.py
Step 2: এই code paste করো
# E:\Audit\AMS\backend\scripts\seed_permission_frontend_navigation.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "system"


async def get_or_create_security_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(NavigationGroup.group_key == "security")
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = "Security"
        group.group_icon = "ShieldCheck"
        group.sort_order = 20
        group.is_collapsible = True
        group.is_visible = True
        group.group_color = "blue"
        group.group_permission_key = None
        group.is_active = True
        group.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(group)

        print("Security navigation group exists/updated.")
        return group

    group = NavigationGroup(
        group_key="security",
        group_title="Security",
        group_icon="ShieldCheck",
        parent_group_id=None,
        sort_order=20,
        is_collapsible=True,
        is_visible=True,
        group_badge=None,
        group_color="blue",
        group_permission_key=None,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.commit()
    await db.refresh(group)

    print("Security navigation group created.")
    return group


async def get_or_create_permission_menu(db, group_id: int) -> Menu:
    result = await db.execute(
        select(Menu).where(Menu.menu_key == "permission")
    )
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = "Permissions"
        menu.route_path = "/security/permissions"
        menu.icon = "KeyRound"
        menu.permission_key = "menu.permission.view"
        menu.sort_order = 20
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(menu)

        print("Permission menu exists/updated.")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key="permission",
        menu_title="Permissions",
        route_path="/security/permissions",
        icon="KeyRound",
        permission_key="menu.permission.view",
        sort_order=20,
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.commit()
    await db.refresh(menu)

    print("Permission menu created.")
    return menu


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_key: str,
    action_title: str,
    permission_key: str,
    button_color: str,
    button_icon: str,
    sort_order: int,
) -> None:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_key,
        )
    )
    action = result.scalar_one_or_none()

    if action:
        action.action_title = action_title
        action.permission_key = permission_key
        action.button_color = button_color
        action.button_icon = button_icon
        action.sort_order = sort_order
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        await db.commit()

        print(f"Menu action exists/updated: {action_key}")
        return

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_key,
        action_title=action_title,
        permission_key=permission_key,
        button_color=button_color,
        button_icon=button_icon,
        sort_order=sort_order,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.commit()

    print(f"Menu action created: {action_key}")


async def seed_permission_frontend_navigation():
    async with AsyncSessionLocal() as db:
        security_group = await get_or_create_security_group(db)
        permission_menu = await get_or_create_permission_menu(
            db=db,
            group_id=security_group.id,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=permission_menu.id,
            action_key="create",
            action_title="Create",
            permission_key="api.permission.create",
            button_color="blue",
            button_icon="Plus",
            sort_order=10,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=permission_menu.id,
            action_key="update",
            action_title="Update",
            permission_key="api.permission.update",
            button_color="amber",
            button_icon="Edit3",
            sort_order=20,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=permission_menu.id,
            action_key="delete",
            action_title="Inactive",
            permission_key="api.permission.delete",
            button_color="orange",
            button_icon="XCircle",
            sort_order=30,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=permission_menu.id,
            action_key="restore",
            action_title="Restore",
            permission_key="api.permission.restore",
            button_color="emerald",
            button_icon="RotateCcw",
            sort_order=40,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=permission_menu.id,
            action_key="permanent_delete",
            action_title="Permanent Delete",
            permission_key="api.permission.permanent_delete",
            button_color="red",
            button_icon="Trash2",
            sort_order=50,
        )

        print("Permission frontend navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_permission_frontend_navigation())
Step 3: Run করো
cd E:\Audit\AMS\backend
python -m scripts.seed_permission_frontend_navigation
তারপর:

1. Backend restart করো
2. Frontend refresh করো
3. দরকার হলে Logout → Login again
Expected sidebar:

Security
 ├─ Roles
 └─ Permissions
Direct URL:

http://localhost:3000/security/permissions

[{
	"resource": "/E:/Audit/AMS/frontend/scripts/seed_permission_frontend_navigation.py",
	"owner": "Pylance",
	"code": {
		"value": "reportMissingImports",
		"target": {
			"$mid": 1,
			"path": "/microsoft/pylance-release/blob/main/docs/diagnostics/reportMissingImports.md",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 8,
	"message": "Import \"app.db.session\" could not be resolved",
	"source": "Pylance",
	"startLineNumber": 7,
	"startColumn": 6,
	"endLineNumber": 7,
	"endColumn": 20,
	"modelVersionId": 23,
	"origin": "extHost1"
},{
	"resource": "/E:/Audit/AMS/frontend/scripts/seed_permission_frontend_navigation.py",
	"owner": "Pylance",
	"code": {
		"value": "reportMissingImports",
		"target": {
			"$mid": 1,
			"path": "/microsoft/pylance-release/blob/main/docs/diagnostics/reportMissingImports.md",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 8,
	"message": "Import \"app.models.menu\" could not be resolved",
	"source": "Pylance",
	"startLineNumber": 8,
	"startColumn": 6,
	"endLineNumber": 8,
	"endColumn": 21,
	"modelVersionId": 23,
	"origin": "extHost1"
},{
	"resource": "/E:/Audit/AMS/frontend/scripts/seed_permission_frontend_navigation.py",
	"owner": "Pylance",
	"code": {
		"value": "reportMissingImports",
		"target": {
			"$mid": 1,
			"path": "/microsoft/pylance-release/blob/main/docs/diagnostics/reportMissingImports.md",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 8,
	"message": "Import \"app.models.menu_action\" could not be resolved",
	"source": "Pylance",
	"startLineNumber": 9,
	"startColumn": 6,
	"endLineNumber": 9,
	"endColumn": 28,
	"modelVersionId": 23,
	"origin": "extHost1"
},{
	"resource": "/E:/Audit/AMS/frontend/scripts/seed_permission_frontend_navigation.py",
	"owner": "Pylance",
	"code": {
		"value": "reportMissingImports",
		"target": {
			"$mid": 1,
			"path": "/microsoft/pylance-release/blob/main/docs/diagnostics/reportMissingImports.md",
			"scheme": "https",
			"authority": "github.com"
		}
	},
	"severity": 8,
	"message": "Import \"app.models.navigation_group\" could not be resolved",
	"source": "Pylance",
	"startLineNumber": 10,
	"startColumn": 6,
	"endLineNumber": 10,
	"endColumn": 33,
	"modelVersionId": 23,
	"origin": "extHost1"
}]

Thought for 5s
Problem clear ✅ তুমি seed file ভুল জায়গায় create করেছো।

তুমি বানিয়েছো এখানে:

E:\Audit\AMS\frontend\scripts\seed_permission_frontend_navigation.py
কিন্তু এটা backend script, তাই থাকা উচিত এখানে:

E:\Audit\AMS\backend\scripts\seed_permission_frontend_navigation.py
Frontend project-এর ভিতরে app.db.session, app.models.menu নেই, তাই Pylance import error দেখাচ্ছে।

Fix করো
PowerShell-এ এটা run করো:

cd E:\Audit\AMS

# ভুল জায়গার file delete
Remove-Item -Force frontend\scripts\seed_permission_frontend_navigation.py -ErrorAction SilentlyContinue

# backend scripts folder ensure
New-Item -ItemType Directory -Force backend\scripts

# correct backend file create/open
New-Item -ItemType File -Force backend\scripts\seed_permission_frontend_navigation.py
code backend\scripts\seed_permission_frontend_navigation.py
তারপর আগের দেওয়া Python code এই correct file-এ paste করো।

Run করবে backend folder থেকে:

cd E:\Audit\AMS\backend
python -m scripts.seed_permission_frontend_navigation
VS Code-এও যেন backend interpreter use হয়:

E:\Audit\AMS\backend\.venv\Scripts\python.exe
এখন Pylance error চলে যাবে, কারণ file backend project-এর ভিতরে থাকবে।


Thought for 6s
Perfect ✅ Permissions sidebar seed completed.

Now expected sidebar:

Security
 ├─ Roles
 └─ Permissions
এখন করো:

1. Frontend refresh
2. দরকার হলে Logout → Login again
3. Open: http://localhost:3000/security/permissions
Backend log-এ এইগুলো আসা উচিত:

GET /api/v1/me/navigation 200 OK
GET /api/v1/permissions?page=1&page_size=200&sort_by=id&sort_order=asc 200 OK
Permissions page test order:

1. Create Permission
2. Edit Permission
3. Mark Inactive
4. Restore
5. Permanent Delete
Test create payload idea:

permission_key: api.test_permission.create
resource_type: api
resource_key: test_permission
action: create
description: Test permission from frontend
সব pass হলে next শুরু করব:

Frontend Security Page 03: Users Page

(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [8048] using StatReload
INFO:     Started server process [16056]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:52204 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:52204 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:52206 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62440 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62441 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62440 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:62441 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:62442 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62443 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62444 - "GET /api/v1/permissions?page=1&page_size=200&sort_by=id&sort_order=asc HTTP/1.1" 422 Unprocessable Entity
INFO:     127.0.0.1:62446 - "GET /api/v1/permissions?page=1&page_size=200&sort_by=id&sort_order=asc HTTP/1.1" 422 Unprocessable Entity

PS E:\Audit\AMS\frontend> npm run dev

> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.20.80.1:3000
- Environments: .env.local
✓ Ready in 537ms

 GET /login 200 in 453ms (next.js: 95ms, proxy.ts: 159ms, application-code: 200ms)
 GET /login 200 in 83ms (next.js: 8ms, proxy.ts: 6ms, application-code: 68ms)
 POST /api/auth/login 200 in 1673ms (next.js: 95ms, application-code: 1578ms)
 GET /dashboard 200 in 106ms (next.js: 41ms, proxy.ts: 8ms, application-code: 57ms)
 GET /api/me/navigation 200 in 1223ms (next.js: 56ms, application-code: 1168ms)
 GET /api/me/navigation 200 in 1353ms (next.js: 65ms, application-code: 1288ms)
 GET /security/roles 200 in 81ms (next.js: 38ms, proxy.ts: 4ms, application-code: 39ms)
 GET /api/me/navigation 200 in 464ms (next.js: 12ms, application-code: 452ms)
 GET /api/me/navigation 200 in 539ms (next.js: 6ms, application-code: 533ms)
 GET /api/backend/roles?page=1&page_size=100&sort_by=id&sort_order=asc 200 in 1257ms (next.js: 743ms, application-code: 514ms)
 GET /api/backend/roles?page=1&page_size=100&sort_by=id&sort_order=asc 200 in 1193ms (next.js: 675ms, application-code: 518ms)
 GET /security/permissions 200 in 71ms (next.js: 31ms, proxy.ts: 6ms, application-code: 34ms)
 GET /api/me/navigation 200 in 577ms (next.js: 9ms, application-code: 568ms)
 GET /api/me/navigation 200 in 584ms (next.js: 17ms, application-code: 567ms)
 GET /api/backend/permissions?page=1&page_size=200&sort_by=id&sort_order=asc 422 in 629ms (next.js: 11ms, application-code: 618ms)
 GET /api/backend/permissions?page=1&page_size=200&sort_by=id&sort_order=asc 422 in 657ms (next.js: 3ms, application-code: 654ms)
[browser] Failed to load permissions: Error: Request failed. Please try again.
    at requestJson (src/services/permission.ts:43:11)
    at async getPermissions (src/services/permission.ts:50:16)
  41 |
  42 |   if (!response.ok) {
> 43 |     throw new Error(await getErrorMessage(response));
     |           ^
  44 |   }
  45 |
  46 |   return response.json(); (src/app/security/permissions/page.tsx:98:17)

Thought for 10s
Problem clear ✅ Backend problem না।
422 Unprocessable Entity এসেছে কারণ frontend থেকে পাঠানো হচ্ছে:

page_size=200
কিন্তু backend সম্ভবত maximum page_size=100 allow করছে। Roles page-এ তুমি 100 দিয়েছিলে, তাই working.

এখন শুধু এই file update করো:

E:\Audit\AMS\frontend\src\services\permission.ts
Full replace:

// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  Permission,
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg || "Validation error")
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const getPermissions = async (): Promise<Permission[]> => {
  const data = await requestJson<PermissionListResponse>(
    "/api/backend/permissions?page=1&page_size=100&sort_by=id&sort_order=asc"
  );

  return data.items;
};

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
তারপর frontend restart করো:

cd E:\Audit\AMS\frontend
npm run dev
Browser refresh করো:

http://localhost:3000/security/permissions
Expected backend log:

GET /api/v1/permissions?page=1&page_size=100&sort_by=id&sort_order=asc 200 OK
এই same rule মনে রাখলাম: future list services-এ page_size=100 এর বেশি দেব না।


[{
	"resource": "/e:/Audit/AMS/frontend/src/services/permission.ts",
	"owner": "typescript",
	"code": "7006",
	"severity": 8,
	"message": "Parameter 'item' implicitly has an 'any' type.",
	"source": "ts",
	"startLineNumber": 20,
	"startColumn": 15,
	"endLineNumber": 20,
	"endColumn": 19,
	"modelVersionId": 12,
	"origin": "extHost1"
}]

Thought for a couple of seconds
এই TypeScript error এসেছে কারণ data.detail.map((item) => ...)-এ item এর type দেওয়া হয়নি।
permission.ts full replace করো এই version দিয়ে।

// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  Permission,
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const getPermissions = async (): Promise<Permission[]> => {
  const data = await requestJson<PermissionListResponse>(
    "/api/backend/permissions?page=1&page_size=100&sort_by=id&sort_order=asc"
  );

  return data.items;
};

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
এই type pattern-টাও মনে রাখলাম—future service file-এ any না রেখে explicit API error type দেব।


page_size=200 কি এটা কেন দরকার ? এটা hardcoded কেন এটা ডায়নামিক করা যাবে না?

Thought for 12s
হ্যাঁ, dynamic করা যাবে—এটাই best practice ✅

page_size দরকার কারণ backend list API pagination করে। একবারে সব permission load করলে ভবিষ্যতে ৫০০০/১০০০০ permission হলে page slow হবে। তাই backend বলে: “এক page-এ কয়টা data দিব?” — সেটাই page_size.

তোমার error হয়েছিল কারণ frontend 200 পাঠাচ্ছিল, কিন্তু backend max probably 100 allow করে। তাই 422.

Hardcoded করা ঠিক না। আমরা এখন service-টা dynamic করব।

Update: src\services\permission.ts
এই file full replace করো:

// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type PermissionListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const getPermissions = async (
  params: PermissionListParams = {}
): Promise<PermissionListResponse> => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const sortBy = params.sortBy ?? "id";
  const sortOrder = params.sortOrder ?? "asc";

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return requestJson<PermissionListResponse>(
    `/api/backend/permissions?${searchParams.toString()}`
  );
};

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
এখন page.tsx-এ ছোট change লাগবে
আগে ছিল:

const data = await getPermissions();
setPermissions(data);
এখন হবে:

const data = await getPermissions({
  page: 1,
  pageSize: 100,
});

setPermissions(data.items);
মানে getPermissions() এখন full paginated response দিবে, শুধু array না।

এই rule future সব page-এ follow করব:

✅ page/pageSize dynamic params
✅ max page size guard
✅ no hardcoded URL string with page_size=200
✅ backend limit cross করবে না

image(288).png
image(289).png
একবারে লোড না করে 10,20,30,40,..,n টা এইভাবে frontend থেকে সিলেক্ট করে দিবে সেটা ভালো না? সার্চ পার্মিশনের আগে এই dropdown field বসবে এবং রিপোর্টের শেষে নেক্সট নেক্সট দিয়েও যাওয়া যাবে এভাবে। করলে কেমন হয়? এরা সব টেমপ্লেটের (Company, Branch, Designation, Employee, all others) জন্য হবে। একটা common templet থাকলে মনে হয় ভালো হবে তাহলে সব পেজে বার বার করা লাগবে না।

Thought for 37s
ঠিক আছে ✅ এখন Permissions Page-এ common enterprise pagination pattern apply করছি।

Pattern হবে:

Show: [10/20/30/40/50/100/All] entries   Search: [________]   Status: [All/Active/Inactive]

Table...

Showing 1 to 10 of 95 records        First | Previous | 1 | 2 | 3 | Next | Last
এখন ৪টা file update/create করো।

1. Common pagination type
Create:

E:\Audit\AMS\frontend\src\types\pagination.ts
// E:\Audit\AMS\frontend\src\types\pagination.ts

export type PageSizeOption = 10 | 20 | 30 | 40 | 50 | 100 | "all";

export type StatusFilter = "all" | "active" | "inactive";

export type PaginationParams = {
  page?: number;
  pageSize?: Exclude<PageSizeOption, "all">;
  search?: string;
  status?: StatusFilter;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  10,
  20,
  30,
  40,
  50,
  100,
  "all",
];
2. Common toolbar component
Create:

E:\Audit\AMS\frontend\src\components\common\DataTableToolbar.tsx
// E:\Audit\AMS\frontend\src\components\common\DataTableToolbar.tsx

"use client";

import { Filter, Search } from "lucide-react";

import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
  type StatusFilter,
} from "@/types/pagination";

type DataTableToolbarProps = {
  pageSize: PageSizeOption;
  searchTerm: string;
  statusFilter: StatusFilter;
  searchPlaceholder?: string;
  onPageSizeChange: (pageSize: PageSizeOption) => void;
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (status: StatusFilter) => void;
};

export default function DataTableToolbar({
  pageSize,
  searchTerm,
  statusFilter,
  searchPlaceholder = "Search...",
  onPageSizeChange,
  onSearchChange,
  onStatusChange,
}: DataTableToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-600">Show:</span>

        <select
          value={String(pageSize)}
          onChange={(event) => {
            const value = event.target.value;
            onPageSizeChange(value === "all" ? "all" : Number(value) as PageSizeOption);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={String(option)} value={String(option)}>
              {option === "all" ? "All" : option}
            </option>
          ))}
        </select>

        <span className="text-sm font-bold text-slate-600">entries</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={17} className="text-slate-400" />

          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="ml-2 w-60 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Filter size={17} className="text-slate-400" />

          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
            className="ml-2 bg-transparent text-sm font-bold text-slate-600 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
3. Common pagination component
Create:

E:\Audit\AMS\frontend\src\components\common\DataTablePagination.tsx
// E:\Audit\AMS\frontend\src\components\common\DataTablePagination.tsx

"use client";

import type { PageSizeOption } from "@/types/pagination";

type DataTablePaginationProps = {
  page: number;
  pageSize: PageSizeOption;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const getVisiblePages = (page: number, totalPages: number) => {
  const pages: number[] = [];

  if (totalPages <= 3) {
    for (let item = 1; item <= totalPages; item += 1) {
      pages.push(item);
    }

    return pages;
  }

  if (page <= 2) {
    return [1, 2, 3];
  }

  if (page >= totalPages - 1) {
    return [totalPages - 2, totalPages - 1, totalPages];
  }

  return [page - 1, page, page + 1];
};

export default function DataTablePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  const isAllMode = pageSize === "all";
  const numericPageSize = isAllMode ? total : pageSize;

  const showingFrom = total === 0 ? 0 : (page - 1) * numericPageSize + 1;
  const showingTo =
    total === 0 ? 0 : Math.min(page * numericPageSize, total);

  const visiblePages = getVisiblePages(page, totalPages);
  const isFirstDisabled = page <= 1 || isAllMode || totalPages <= 1;
  const isLastDisabled = page >= totalPages || isAllMode || totalPages <= 1;

  return (
    <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm font-semibold text-slate-600">
        Showing{" "}
        <span className="font-black text-slate-900">{showingFrom}</span> to{" "}
        <span className="font-black text-slate-900">{showingTo}</span> of{" "}
        <span className="font-black text-slate-900">{total}</span> records
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isFirstDisabled}
          onClick={() => onPageChange(1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          First
        </button>

        <button
          type="button"
          disabled={isFirstDisabled}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {visiblePages.map((item) => (
          <button
            key={item}
            type="button"
            disabled={isAllMode}
            onClick={() => onPageChange(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-black ${
              item === page
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          disabled={isLastDisabled}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

        <button
          type="button"
          disabled={isLastDisabled}
          onClick={() => onPageChange(totalPages)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  );
}
4. Update src\services\permission.ts
// E:\Audit\AMS\frontend\src\services\permission.ts

import type {
  Permission,
  PermissionListResponse,
  PermissionMessageResponse,
  PermissionPayload,
} from "@/types/permission";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type PermissionListParams = PaginationParams & {
  status?: StatusFilter;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const buildPermissionSearchParams = (params: PermissionListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  return searchParams;
};

export const getPermissions = async (
  params: PermissionListParams = {}
): Promise<PermissionListResponse> => {
  const searchParams = buildPermissionSearchParams(params);

  return requestJson<PermissionListResponse>(
    `/api/backend/permissions?${searchParams.toString()}`
  );
};

export const getAllPermissions = async (
  params: PermissionListParams = {}
): Promise<PermissionListResponse> => {
  const firstPage = await getPermissions({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Permission[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getPermissions({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createPermission = async (
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>("/api/backend/permissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updatePermission = async (
  permissionId: number,
  payload: PermissionPayload
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivatePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}`,
    {
      method: "DELETE",
    }
  );
};

export const restorePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeletePermission = async (
  permissionId: number
): Promise<PermissionMessageResponse> => {
  return requestJson<PermissionMessageResponse>(
    `/api/backend/permissions/${permissionId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
এখন বলো, আমি next message-এ src\app\security\permissions\page.tsx full updated code দেব এই common toolbar + pagination use করে।


image(290).png
Existing "Search permission" and Dropdown ঠিক থাকবে তো?

Thought for 7s
হ্যাঁ ✅ Existing “Search permission” আর “Status dropdown” ঠিক থাকবে।

শুধু এর সাথে বাম পাশে নতুন Show entries dropdown add হবে:

Show: [10/20/30/40/50/100/All] entries        Search permission     Status
মানে layout হবে এমন:

Permissions
Create, update, inactive, restore...

Show: [10] entries              Search permission.        All Status

Table...

Showing 1 to 10 of 95 records   First | Previous | 1 | 2 | 3 | Next | Last
Search box এবং Status dropdown remove হবে না। শুধু এখন এগুলো backend pagination/search/status filter এর সাথে connected হবে, তাই পুরো database থেকে result আসবে, শুধু current page থেকে না।

Next code-এ আমি page.tsx এমনভাবে দেব যেন:

✅ Search permission থাকে
✅ All/Active/Inactive dropdown থাকে
✅ Show entries dropdown add হয়
✅ First / Previous / Next / Last add হয়
✅ All select করলে সব record দেখায়
✅ Future Company/Branch/Employee pages-এ same common component reuse করা যায়


Pasted text(83).txt
Document
এভাবে আগাবো কিনা? ফাইনাল টা আবার দাও

Thought for 49s
হ্যাঁ ✅ এভাবেই আগানো best। তোমার pasted plan ঠিক আছে—common toolbar + common pagination + dynamic service params, তারপর Permissions page update। এতে পরের সব page-এ একই template reuse হবে। 


তুমি আগে যেগুলো করবা:

1. src/types/pagination.ts
2. src/components/common/DataTableToolbar.tsx
3. src/components/common/DataTablePagination.tsx
4. src/services/permission.ts
5. src/app/security/permissions/page.tsx
আগের common files এবং permission.ts ঠিক আছে। এখন নিচে final updated Permissions page দিচ্ছি।

// E:\Audit\AMS\frontend\src\app\security\permissions\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PermissionForm from "@/components/permissions/PermissionForm";
import PermissionRowActions from "@/components/permissions/PermissionRowActions";

import {
  deactivatePermission,
  getAllPermissions,
  getPermissions,
  permanentlyDeletePermission,
  restorePermission,
} from "@/services/permission";
import type { Permission } from "@/types/permission";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function PermissionsContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadPermissions = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllPermissions({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getPermissions({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setPermissions(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        setPermissions([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllPermissions({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getPermissions({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setPermissions(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load permissions:", error);
        setPermissions([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setDrawerOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingPermission(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingPermission);

    setDrawerOpen(false);
    setEditingPermission(null);

    showSuccess(
      wasEditing
        ? "Permission updated successfully."
        : "Permission created successfully."
    );

    void loadPermissions(false);
  };

  const openConfirm = (permission: Permission, action: ConfirmAction) => {
    setSelectedPermission(permission);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedPermission(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedPermission || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivatePermission(selectedPermission.id);
        showSuccess("Permission marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restorePermission(selectedPermission.id);
        showSuccess("Permission restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeletePermission(selectedPermission.id);
        showSuccess("Permission permanently deleted successfully.");
      }

      setSelectedPermission(null);
      setConfirmAction(null);
      await loadPermissions(false);
    } catch (error) {
      console.error("Permission action failed:", error);
      showError(
        error instanceof Error ? error.message : "Permission action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Permission as Inactive?";
    if (confirmAction === "restore") return "Restore Permission?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Permission?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedPermission) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedPermission.permission_key}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedPermission.permission_key}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedPermission.permission_key}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-800 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <KeyRound size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Permission Management</h1>
              <p className="mt-1 text-blue-100">
                Manage API, menu, button and module permissions for RBAC.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="permission"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Permissions</h2>
            <p className="text-sm text-slate-500">
              Create, update, inactive, restore and permanently delete permissions.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search permission."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Permission Key</th>
                  <th className="px-5 py-4 font-bold">Resource</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading permissions...
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No permission data found.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !permission.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {permission.permission_key}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {permission.description || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {permission.resource_type}
                        </span>

                        <div className="mt-2 text-sm font-semibold text-slate-700">
                          {permission.resource_key}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        {permission.action}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            permission.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {permission.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <PermissionRowActions
                          permission={permission}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingPermission ? "Edit Permission" : "Create Permission"}
        onClose={handleCloseDrawer}
      >
        <PermissionForm
          key={
            editingPermission
              ? `edit-permission-${editingPermission.id}`
              : "create-permission"
          }
          initialData={editingPermission}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedPermission)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function PermissionsPage() {
  return <PermissionsContent />;
}
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Build pass হলে browser test:

http://localhost:3000/security/permissions
Expected:

Show: [10/20/30/40/50/100/All] entries
Search permission.
All Status
Showing 1 to 10 of 95 records
First | Previous | 1 | 2 | 3 | Next | Last


INFO:     127.0.0.1:53414 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:53414 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53416 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53414 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:54736 - "GET /api/v1/permissions?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:53416 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:54734 - "GET /api/v1/permissions?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:62876 - "GET /api/v1/permissions?page=2&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:62876 - "GET /api/v1/permissions?page=3&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:62878 - "GET /api/v1/permissions?page=10&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:58654 - "GET /api/v1/permissions?page=1&page_size=40&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:55743 - "GET /api/v1/permissions?page=3&page_size=40&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:57942 - "GET /api/v1/permissions?page=2&page_size=40&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:55732 - "GET /api/v1/permissions?page=1&page_size=40&sort_by=id&sort_order=asc HTTP/1.1" 200 OK

Thought for 5s
Perfect ✅ Permissions pagination working cleanly.

Logs confirm:

✅ page_size=10 working
✅ page 2 / page 3 / page 10 working
✅ page_size=40 working
✅ First / Previous / Next / Last type navigation working
✅ Backend-driven pagination active
এই repeated GET /api/v1/me/navigation বা same permission API দুবার hit হওয়া dev mode-এ normal—Next/React development mode-এ কখনও double render/request হয়। Production build-এ এটা কমে যাবে।

এখন Permissions Page final status:

✅ Sidebar added
✅ Page route working
✅ Backend API working
✅ Dynamic page size working
✅ Pagination working
✅ Search/Status structure ready
এখন একবার frontend check দাও:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Pass হলে next শুরু করব:

Frontend Security Page 03: Users Page
Users page-এও এই same common pagination toolbar use করব—Show entries, Search, Status, First/Previous/Next/Last.


PS E:\Audit\AMS\frontend> npm run lint

> frontend@0.1.0 lint
> eslint

PS E:\Audit\AMS\frontend> npm run build

> frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 4.9s
✓ Finished TypeScript in 5.2s    
✓ Collecting page data using 7 workers in 1429ms    
✓ Generating static pages using 7 workers (21/21) in 714ms
✓ Finalizing page optimization in 32ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/backend/[...path]
├ ƒ /api/branches
├ ƒ /api/branches/[id]
├ ƒ /api/branches/[id]/inactive
├ ƒ /api/companies
├ ƒ /api/companies/[id]
├ ƒ /api/departments
├ ƒ /api/departments/[id]
├ ƒ /api/departments/[id]/inactive
├ ƒ /api/departments/[id]/restore
├ ƒ /api/designations
├ ƒ /api/designations/[id]
├ ƒ /api/designations/[id]/inactive
├ ƒ /api/designations/[id]/restore
├ ƒ /api/employees
├ ƒ /api/employees/[id]
├ ƒ /api/employees/[id]/inactive
├ ƒ /api/employees/[id]/photo
├ ƒ /api/employees/[id]/restore
├ ƒ /api/me/navigation
├ ○ /branches
├ ○ /companies
├ ○ /dashboard
├ ○ /departments
├ ○ /designations
├ ○ /employees
├ ○ /login
├ ○ /security/permissions
└ ○ /security/roles


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

PS E:\Audit\AMS\frontend> 

Thought for 21s
Excellent ✅ Permissions Page final build passed.

Now শুরু করছি:

Frontend Security Page 03: Users Page
এই page-এও same common pagination থাকবে:

Show: [10/20/30/40/50/100/All] entries
Search user.
Status: All/Active/Inactive
First | Previous | 1 | 2 | 3 | Next | Last
Step 1: Create files
cd E:\Audit\AMS\frontend

New-Item -ItemType File -Force src\types\user.ts
New-Item -ItemType File -Force src\services\user.ts

New-Item -ItemType Directory -Force src\components\users
New-Item -ItemType File -Force src\components\users\UserForm.tsx
New-Item -ItemType File -Force src\components\users\UserRowActions.tsx

New-Item -ItemType Directory -Force src\app\security\users
New-Item -ItemType File -Force src\app\security\users\page.tsx
Step 2: Type + Service
// E:\Audit\AMS\frontend\src\types\user.ts

export type User = {
  id: number;
  user_id: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type UserListResponse = {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type UserPayload = {
  user_id: string;
  email: string;
  full_name: string;
  password?: string;
  is_superuser: boolean;
};

export type UserUpdatePayload = {
  email?: string;
  full_name?: string;
  password?: string;
  is_superuser?: boolean;
};

export type UserMessageResponse = {
  message: string;
  data: User | null;
};
// E:\Audit\AMS\frontend\src\services\user.ts

import type {
  User,
  UserListResponse,
  UserMessageResponse,
  UserPayload,
  UserUpdatePayload,
} from "@/types/user";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type UserListParams = PaginationParams & {
  status?: StatusFilter;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const buildUserSearchParams = (params: UserListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  return searchParams;
};

export const getUsers = async (
  params: UserListParams = {}
): Promise<UserListResponse> => {
  const searchParams = buildUserSearchParams(params);

  return requestJson<UserListResponse>(
    `/api/backend/users?${searchParams.toString()}`
  );
};

export const getAllUsers = async (
  params: UserListParams = {}
): Promise<UserListResponse> => {
  const firstPage = await getUsers({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: User[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getUsers({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createUser = async (
  payload: UserPayload
): Promise<UserMessageResponse> => {
  return requestJson<UserMessageResponse>("/api/backend/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateUser = async (
  userId: number,
  payload: UserUpdatePayload
): Promise<UserMessageResponse> => {
  return requestJson<UserMessageResponse>(`/api/backend/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateUser = async (
  userId: number
): Promise<UserMessageResponse> => {
  return requestJson<UserMessageResponse>(`/api/backend/users/${userId}`, {
    method: "DELETE",
  });
};

export const restoreUser = async (
  userId: number
): Promise<UserMessageResponse> => {
  return requestJson<UserMessageResponse>(`/api/backend/users/${userId}/restore`, {
    method: "PATCH",
  });
};
Step 3: User Form + Row Actions
// E:\Audit\AMS\frontend\src\components\users\UserForm.tsx

"use client";

import { useState } from "react";

import { createUser, updateUser } from "@/services/user";
import type { User } from "@/types/user";

type UserFormProps = {
  initialData?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function UserForm({
  initialData,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [loginId, setLoginId] = useState(initialData?.user_id || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [password, setPassword] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(
    initialData?.is_superuser || false
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isEditMode = Boolean(initialData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !fullName.trim()) {
      setErrorMessage("Email and full name are required.");
      return;
    }

    if (!isEditMode && !loginId.trim()) {
      setErrorMessage("User login ID is required.");
      return;
    }

    if (!isEditMode && !password.trim()) {
      setErrorMessage("Password is required for new user.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (initialData) {
        await updateUser(initialData.id, {
          email: email.trim(),
          full_name: fullName.trim(),
          password: password.trim() || undefined,
          is_superuser: isSuperuser,
        });
      } else {
        await createUser({
          user_id: loginId.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password: password.trim(),
          is_superuser: isSuperuser,
        });
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "User save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Login ID <span className="text-red-500">*</span>
        </label>

        <input
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
          disabled={isEditMode}
          placeholder="Example: admin, auditor01"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Full Name <span className="text-red-500">*</span>
        </label>

        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Example: System Administrator"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="user@example.com"
          type="email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Password {isEditMode ? "(leave blank to keep old password)" : <span className="text-red-500">*</span>}
        </label>

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={isEditMode ? "Optional new password" : "Enter password"}
          type="password"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
        <input
          checked={isSuperuser}
          onChange={(event) => setIsSuperuser(event.target.checked)}
          type="checkbox"
          className="h-4 w-4"
        />
        Super Admin / Superuser
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditMode ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}
// E:\Audit\AMS\frontend\src\components\users\UserRowActions.tsx

"use client";

import { Edit3, RotateCcw, XCircle } from "lucide-react";

import type { User } from "@/types/user";

type UserRowActionsProps = {
  user: User;
  onEdit: (user: User) => void;
  onInactive: (user: User) => void;
  onRestore: (user: User) => void;
};

export default function UserRowActions({
  user,
  onEdit,
  onInactive,
  onRestore,
}: UserRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Edit3 size={16} />
      </button>

      {user.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(user)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark inactive"
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRestore(user)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}
এখন বলো, আমি next message-এ Users Page full page.tsx code দেব common toolbar + pagination সহ।


okay দাও

Thought for 5s
ঠিক আছে ✅ নিচে Users Page full page.tsx code দিলাম। এটা common toolbar + pagination use করবে।

File:

E:\Audit\AMS\frontend\src\app\security\users\page.tsx
// E:\Audit\AMS\frontend\src\app\security\users\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { UsersRound } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserForm from "@/components/users/UserForm";
import UserRowActions from "@/components/users/UserRowActions";

import {
  deactivateUser,
  getAllUsers,
  getUsers,
  restoreUser,
} from "@/services/user";
import type { User } from "@/types/user";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore";
type ConfirmVariant = "danger" | "warning" | "success";

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadUsers = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllUsers({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getUsers({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setUsers(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load users.");
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllUsers({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getUsers({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setUsers(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load users:", error);
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load users.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingUser);

    setDrawerOpen(false);
    setEditingUser(null);

    showSuccess(
      wasEditing ? "User updated successfully." : "User created successfully."
    );

    void loadUsers(false);
  };

  const openConfirm = (user: User, action: ConfirmAction) => {
    setSelectedUser(user);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedUser(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateUser(selectedUser.id);
        showSuccess("User marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreUser(selectedUser.id);
        showSuccess("User restored successfully.");
      }

      setSelectedUser(null);
      setConfirmAction(null);
      await loadUsers(false);
    } catch (error) {
      console.error("User action failed:", error);
      showError(error instanceof Error ? error.message : "User action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark User as Inactive?";
    if (confirmAction === "restore") return "Restore User?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedUser) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedUser.full_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedUser.full_name}"?`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-cyan-800 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <UsersRound size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">User Management</h1>
              <p className="mt-1 text-blue-100">
                Create, update, inactive and restore system users.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="user"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Users</h2>
            <p className="text-sm text-slate-500">
              Manage login users, superuser access and active status.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search user."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">User</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Access</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No user data found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !user.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {user.full_name}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Login ID: {user.user_id}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.is_superuser
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {user.is_superuser ? "Super Admin" : "User"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <UserRowActions
                          user={user}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingUser ? "Edit User" : "Create User"}
        onClose={handleCloseDrawer}
      >
        <UserForm
          key={editingUser ? `edit-user-${editingUser.id}` : "create-user"}
          initialData={editingUser}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedUser)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return <UsersContent />;
}
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Build pass হলে আমি Users sidebar seed script দেব, যাতে sidebar-এ:

Security
 ├─ Roles
 ├─ Permissions
 └─ Users

PS E:\Audit\AMS\frontend> npm run lint                                         
         
> frontend@0.1.0 lint
> eslint

PS E:\Audit\AMS\frontend> npm run build

> frontend@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 5.2s
✓ Finished TypeScript in 4.9s    
✓ Collecting page data using 7 workers in 1473ms    
✓ Generating static pages using 7 workers (22/22) in 587ms
✓ Finalizing page optimization in 30ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/backend/[...path]
├ ƒ /api/branches
├ ƒ /api/branches/[id]
├ ƒ /api/branches/[id]/inactive
├ ƒ /api/companies
├ ƒ /api/companies/[id]
├ ƒ /api/departments
├ ƒ /api/departments/[id]
├ ƒ /api/departments/[id]/inactive
├ ƒ /api/departments/[id]/restore
├ ƒ /api/designations
├ ƒ /api/designations/[id]
├ ƒ /api/designations/[id]/inactive
├ ƒ /api/designations/[id]/restore
├ ƒ /api/employees
├ ƒ /api/employees/[id]
├ ƒ /api/employees/[id]/inactive
├ ƒ /api/employees/[id]/photo
├ ƒ /api/employees/[id]/restore
├ ƒ /api/me/navigation
├ ○ /branches
├ ○ /companies
├ ○ /dashboard
├ ○ /departments
├ ○ /designations
├ ○ /employees
├ ○ /login
├ ○ /security/permissions
├ ○ /security/roles
└ ○ /security/users


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

PS E:\Audit\AMS\frontend> 

Thought for 9s
Excellent ✅ Users Page build passed.

Confirmed:

✅ /security/users route created
✅ npm run lint passed
✅ npm run build passed
এখন sidebar-এ Users menu দেখানোর জন্য backend seed script দাও।

Step 1: Create seed file
cd E:\Audit\AMS\backend

New-Item -ItemType File -Force scripts\seed_user_frontend_navigation.py
code scripts\seed_user_frontend_navigation.py
Step 2: Paste this code
# E:\Audit\AMS\backend\scripts\seed_user_frontend_navigation.py

import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.menu import Menu
from app.models.menu_action import MenuAction
from app.models.navigation_group import NavigationGroup


SYSTEM_USER = "system"


async def get_or_create_security_group(db) -> NavigationGroup:
    result = await db.execute(
        select(NavigationGroup).where(NavigationGroup.group_key == "security")
    )
    group = result.scalar_one_or_none()

    if group:
        group.group_title = "Security"
        group.group_icon = "ShieldCheck"
        group.sort_order = 20
        group.is_collapsible = True
        group.is_visible = True
        group.group_color = "blue"
        group.group_permission_key = None
        group.is_active = True
        group.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(group)

        print("Security navigation group exists/updated.")
        return group

    group = NavigationGroup(
        group_key="security",
        group_title="Security",
        group_icon="ShieldCheck",
        parent_group_id=None,
        sort_order=20,
        is_collapsible=True,
        is_visible=True,
        group_badge=None,
        group_color="blue",
        group_permission_key=None,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(group)
    await db.commit()
    await db.refresh(group)

    print("Security navigation group created.")
    return group


async def get_or_create_user_menu(db, group_id: int) -> Menu:
    result = await db.execute(select(Menu).where(Menu.menu_key == "user"))
    menu = result.scalar_one_or_none()

    if menu:
        menu.navigation_group_id = group_id
        menu.parent_menu_id = None
        menu.menu_title = "Users"
        menu.route_path = "/security/users"
        menu.icon = "UsersRound"
        menu.permission_key = "menu.user.view"
        menu.sort_order = 30
        menu.menu_level = 1
        menu.is_expandable = False
        menu.is_visible = True
        menu.is_active = True
        menu.updated_by = SYSTEM_USER

        await db.commit()
        await db.refresh(menu)

        print("User menu exists/updated.")
        return menu

    menu = Menu(
        navigation_group_id=group_id,
        parent_menu_id=None,
        menu_key="user",
        menu_title="Users",
        route_path="/security/users",
        icon="UsersRound",
        permission_key="menu.user.view",
        sort_order=30,
        menu_level=1,
        is_expandable=False,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(menu)
    await db.commit()
    await db.refresh(menu)

    print("User menu created.")
    return menu


async def get_or_create_menu_action(
    db,
    menu_id: int,
    action_key: str,
    action_title: str,
    permission_key: str,
    button_color: str,
    button_icon: str,
    sort_order: int,
) -> None:
    result = await db.execute(
        select(MenuAction).where(
            MenuAction.menu_id == menu_id,
            MenuAction.action_key == action_key,
        )
    )
    action = result.scalar_one_or_none()

    if action:
        action.action_title = action_title
        action.permission_key = permission_key
        action.button_color = button_color
        action.button_icon = button_icon
        action.sort_order = sort_order
        action.is_visible = True
        action.is_active = True
        action.updated_by = SYSTEM_USER

        await db.commit()

        print(f"Menu action exists/updated: {action_key}")
        return

    action = MenuAction(
        menu_id=menu_id,
        action_key=action_key,
        action_title=action_title,
        permission_key=permission_key,
        button_color=button_color,
        button_icon=button_icon,
        sort_order=sort_order,
        is_visible=True,
        is_active=True,
        created_by=SYSTEM_USER,
        updated_by=SYSTEM_USER,
    )

    db.add(action)
    await db.commit()

    print(f"Menu action created: {action_key}")


async def seed_user_frontend_navigation():
    async with AsyncSessionLocal() as db:
        security_group = await get_or_create_security_group(db)
        user_menu = await get_or_create_user_menu(
            db=db,
            group_id=security_group.id,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=user_menu.id,
            action_key="create",
            action_title="Create",
            permission_key="api.user.create",
            button_color="blue",
            button_icon="Plus",
            sort_order=10,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=user_menu.id,
            action_key="update",
            action_title="Update",
            permission_key="api.user.update",
            button_color="amber",
            button_icon="Edit3",
            sort_order=20,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=user_menu.id,
            action_key="delete",
            action_title="Inactive",
            permission_key="api.user.delete",
            button_color="orange",
            button_icon="XCircle",
            sort_order=30,
        )

        await get_or_create_menu_action(
            db=db,
            menu_id=user_menu.id,
            action_key="restore",
            action_title="Restore",
            permission_key="api.user.restore",
            button_color="emerald",
            button_icon="RotateCcw",
            sort_order=40,
        )

        print("User frontend navigation seed completed.")


if __name__ == "__main__":
    asyncio.run(seed_user_frontend_navigation())
Step 3: Run seed
cd E:\Audit\AMS\backend
python -m scripts.seed_user_frontend_navigation
তারপর:

1. Backend restart করো
2. Frontend refresh করো
3. দরকার হলে Logout → Login again
Expected sidebar:

Security
 ├─ Roles
 ├─ Permissions
 └─ Users
Direct URL:

http://localhost:3000/security/users

(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload                     
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [8984] using StatReload
INFO:     Started server process [21100]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:54517 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:54519 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:54517 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63172 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63173 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63173 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63172 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63563 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63567 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63564 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63565 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK

Thought for 6s
Perfect ✅ Users Page API working cleanly.

তোমার logs confirm করছে:

✅ Login OK
✅ /me/navigation OK
✅ /users?page=1&page_size=10 OK
✅ Users page backend-driven pagination working
✅ Roles page এখনও old service দিয়ে page_size=100 load করছে
এখন Users Page status:

Frontend route: /security/users ✅
Backend API: /api/v1/users ✅
Pagination default: page_size=10 ✅
Navigation API: OK ✅
এখন browser থেকে test করো:

http://localhost:3000/security/users
Check করো:

1. Users menu sidebar-এ দেখাচ্ছে কিনা
2. Users page open হচ্ছে কিনা
3. Show 10/20/30/40/50/100/All কাজ করছে কিনা
4. Next / Previous / First / Last কাজ করছে কিনা
5. Create User কাজ করছে কিনা
6. Edit User কাজ করছে কিনা
7. Inactive / Restore কাজ করছে কিনা
একটা important observation: logs-এ Roles এখনও এটা hit করছে:

/api/v1/roles?page=1&page_size=100
মানে Roles Page এখনও new common pagination template-এ convert করা হয়নি। এটা problem না, কিন্তু পরে আমরা Roles page-কেও same common template-এ আনব।

Recommended next order:

1. Users page browser test finish
2. Roles page common pagination update
3. Company/Branch/Department/Designation/Employee pagination update
4. User Role Assignment page
5. Role Permission Assignment page
আগে Users page-এর create/edit/inactive/restore test result দাও।


image(291).png
Is this "String" or "Password"? and should provide password format details so that user can easily understand.

(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload                     
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [8984] using StatReload
INFO:     Started server process [21100]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:54517 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:54519 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:54517 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63172 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63173 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63173 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63172 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63563 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63567 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63564 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:63565 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:55335 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:55337 - "GET /api/v1/permissions?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:55336 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:55338 - "GET /api/v1/permissions?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:54850 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:54851 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:54848 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:54849 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:51252 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:51250 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:51253 - "GET /api/v1/roles?page=1&page_size=100&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:51251 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:52315 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:52316 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:52314 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:52313 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:58857 - "POST /api/v1/users HTTP/1.1" 422 Unprocessable Entity
INFO:     127.0.0.1:59294 - "POST /api/v1/users HTTP/1.1" 201 Created
INFO:     127.0.0.1:59294 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:57190 - "PATCH /api/v1/users/3 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57190 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:63918 - "DELETE /api/v1/users/3 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63918 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:61625 - "PATCH /api/v1/users/3/restore HTTP/1.1" 200 OK
INFO:     127.0.0.1:61625 - "GET /api/v1/users?page=1&page_size=10&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:61626 - "GET /api/v1/users?page=1&page_size=40&sort_by=id&sort_order=asc HTTP/1.1" 200 OK
INFO:     127.0.0.1:57899 - "GET /api/v1/users?page=1&page_size=40&sort_by=id&sort_order=asc&is_active=false HTTP/1.1" 200 OK
INFO:     127.0.0.1:57899 - "GET /api/v1/users?page=1&page_size=40&sort_by=id&sort_order=asc&is_active=true HTTP/1.1" 200 OK

done

Thought for 5s
Great ✅

এখন confirm করার জন্য run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
তারপর browser-এ test করো:

/security/users → Create User
৪ অক্ষরের password দিলে এখন frontend থেকেই clear message দেখাবে:

Password must be at least 8 characters long.
আর field-এর নিচে guideline থাকবে:

Password must be at least 8 characters. Recommended: use uppercase, lowercase, number and symbol.
Users module এখন প্রায় final ✅

Next best step: Roles Page-কেও same common pagination template-এ convert করা, কারণ logs-এ Roles এখনো page_size=100 দিয়ে old style load করছে।


Roles Page-কেও same common pagination template-এ convert কর

Thought for 26s
হ্যাঁ, এখন Roles Page-কে same common pagination template-এ convert করব ✅
Backend already ready: Roles API page, page_size, search, is_active, sort_by, sort_order support করে, আর page_size max 100 রাখা আছে। 

 Backend service response-এ items, total, page, page_size, total_pages দেয়। 


1. Replace src\types\role.ts and src\services\role.ts
// E:\Audit\AMS\frontend\src\types\role.ts

export type Role = {
  id: number;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RoleListResponse = {
  items: Role[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type RolePayload = {
  role_name: string;
  description?: string | null;
};

export type RoleMessageResponse = {
  message: string;
  data: Role | null;
};
// E:\Audit\AMS\frontend\src\services\role.ts

import type {
  Role,
  RoleListResponse,
  RoleMessageResponse,
  RolePayload,
} from "@/types/role";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type RoleListParams = PaginationParams & {
  status?: StatusFilter;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const buildRoleSearchParams = (params: RoleListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  return searchParams;
};

export const getRoles = async (
  params: RoleListParams = {}
): Promise<RoleListResponse> => {
  const searchParams = buildRoleSearchParams(params);

  return requestJson<RoleListResponse>(
    `/api/backend/roles?${searchParams.toString()}`
  );
};

export const getAllRoles = async (
  params: RoleListParams = {}
): Promise<RoleListResponse> => {
  const firstPage = await getRoles({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Role[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getRoles({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createRole = async (
  payload: RolePayload
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>("/api/backend/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateRole = async (
  roleId: number,
  payload: RolePayload
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(`/api/backend/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(`/api/backend/roles/${roleId}`, {
    method: "DELETE",
  });
};

export const restoreRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(
    `/api/backend/roles/${roleId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteRole = async (
  roleId: number
): Promise<RoleMessageResponse> => {
  return requestJson<RoleMessageResponse>(
    `/api/backend/roles/${roleId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
2. Replace src\app\security\roles\page.tsx
// E:\Audit\AMS\frontend\src\app\security\roles\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleForm from "@/components/roles/RoleForm";
import RoleRowActions from "@/components/roles/RoleRowActions";

import {
  deactivateRole,
  getAllRoles,
  getRoles,
  permanentlyDeleteRole,
  restoreRole,
} from "@/services/role";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Role } from "@/types/role";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadRoles = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllRoles({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getRoles({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setRoles(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load roles:", error);
        setRoles([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllRoles({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getRoles({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setRoles(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load roles:", error);
        setRoles([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRole(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingRole);

    setDrawerOpen(false);
    setEditingRole(null);

    showSuccess(
      wasEditing ? "Role updated successfully." : "Role created successfully."
    );

    void loadRoles(false);
  };

  const openConfirm = (role: Role, action: ConfirmAction) => {
    setSelectedRole(role);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedRole(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedRole || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateRole(selectedRole.id);
        showSuccess("Role marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreRole(selectedRole.id);
        showSuccess("Role restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteRole(selectedRole.id);
        showSuccess("Role permanently deleted successfully.");
      }

      setSelectedRole(null);
      setConfirmAction(null);
      await loadRoles(false);
    } catch (error) {
      console.error("Role action failed:", error);
      showError(error instanceof Error ? error.message : "Role action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Role as Inactive?";
    if (confirmAction === "restore") return "Restore Role?";
    if (confirmAction === "permanent_delete") return "Permanently Delete Role?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedRole) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedRole.role_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedRole.role_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedRole.role_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-800 to-indigo-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Role Management</h1>
              <p className="mt-1 text-blue-100">
                Create, update, inactive, restore and permanently delete roles.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="role"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Roles</h2>
            <p className="text-sm text-slate-500">
              Manage role records with backend-driven pagination.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search role."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Role Name</th>
                  <th className="px-5 py-4 font-bold">Description</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No role data found.
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr
                      key={role.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !role.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {role.role_name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {role.description || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            role.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {role.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(role.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <RoleRowActions
                          role={role}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingRole ? "Edit Role" : "Create Role"}
        onClose={handleCloseDrawer}
      >
        <RoleForm
          key={editingRole ? `edit-role-${editingRole.id}` : "create-role"}
          initialData={editingRole}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedRole)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function RolesPage() {
  return <RolesContent />;
}
3. Run test
cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected backend log এখন হবে:

GET /api/v1/roles?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK
আর Roles page-এ দেখা যাবে:

Show: [10/20/30/40/50/100/All] entries
Search role.
All Status
Showing 1 to 10 of total records
First | Previous | 1 | 2 | 3 | Next | Last

Role done

Thought for 10s
Great ✅ Roles Page common pagination conversion done.

এখন status:

✅ Permissions Page → common pagination done
✅ Users Page → common pagination done
✅ Roles Page → common pagination done
এখন check করো backend log-এ Roles যেন এমন আসে:

GET /api/v1/roles?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK
পুরনোটা আর থাকা উচিত না:

GET /api/v1/roles?page=1&page_size=100...
এখন next best order:

1. Company Page common pagination
2. Branch Page common pagination
3. Department Page common pagination
4. Designation Page common pagination
5. Employee Page common pagination
আমি suggest করব এখন Company Page convert করি, কারণ Organization module-এর base হচ্ছে Company.


okay

Thought for 1m 17s
ঠিক আছে ✅ এখন Company Page-কে same common pagination template-এ convert করব।

Backend company list API already page, page_size, search, is_active, sort_by, sort_order accept করছে। 


Current Company page-এ search/status frontend-side filter হচ্ছিল, তাই আমরা এখন এটাকে backend-driven করব। 


1. Replace src\services\company.ts
// E:\Audit\AMS\frontend\src\services\company.ts

import type { PaginationParams, StatusFilter } from "@/types/pagination";
import type { Company } from "@/types/company";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

type CompanyPayload = {
  company_name: string;
  company_code?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
};

type CompanyMessageResponse = {
  message: string;
  data: Company | null;
};

export type CompanyListResponse = {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type RawCompanyListResponse = {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

type CompanyListParams = PaginationParams & {
  status?: StatusFilter;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const normalizeCompanyListResponse = (
  response: RawCompanyListResponse
): CompanyListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildCompanySearchParams = (params: CompanyListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  return searchParams;
};

export const getCompanies = async (
  params: CompanyListParams = {}
): Promise<CompanyListResponse> => {
  const searchParams = buildCompanySearchParams(params);

  const response = await requestJson<RawCompanyListResponse>(
    `/api/backend/companies?${searchParams.toString()}`
  );

  return normalizeCompanyListResponse(response);
};

export const getAllCompanies = async (
  params: CompanyListParams = {}
): Promise<CompanyListResponse> => {
  const firstPage = await getCompanies({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Company[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getCompanies({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createCompany = async (
  payload: CompanyPayload
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>("/api/backend/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCompany = async (
  companyId: number,
  payload: CompanyPayload
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteCompany = async (
  companyId: number
): Promise<CompanyMessageResponse> => {
  return requestJson<CompanyMessageResponse>(
    `/api/backend/companies/${companyId}/permanent`,
    {
      method: "DELETE",
    }
  );
};
2. Replace src\app\companies\page.tsx
// E:\Audit\AMS\frontend\src\app\companies\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyRowActions from "@/components/companies/CompanyRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  deactivateCompany,
  getAllCompanies,
  getCompanies,
  permanentlyDeleteCompany,
  restoreCompany,
} from "@/services/company";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Company } from "@/types/company";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadCompanies = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllCompanies({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getCompanies({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllCompanies({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getCompanies({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCompany(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingCompany);

    setDrawerOpen(false);
    setEditingCompany(null);

    showSuccess(
      wasEditing
        ? "Company updated successfully."
        : "Company created successfully."
    );

    void loadCompanies(false);
  };

  const openConfirm = (company: Company, action: ConfirmAction) => {
    setSelectedCompany(company);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedCompany(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateCompany(selectedCompany.id);
        showSuccess("Company marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreCompany(selectedCompany.id);
        showSuccess("Company restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteCompany(selectedCompany.id);
        showSuccess("Company permanently deleted successfully.");
      }

      setSelectedCompany(null);
      setConfirmAction(null);
      await loadCompanies(false);
    } catch (error) {
      console.error("Company action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Company action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Company as Inactive?";
    if (confirmAction === "restore") return "Restore Company?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Company?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedCompany) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedCompany.company_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedCompany.company_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedCompany.company_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Building2 size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Company Management</h1>
              <p className="mt-1 text-blue-100">
                Manage organization companies with RBAC-based actions.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="company"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Companies</h2>
            <p className="text-sm text-slate-500">
              Company list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search company."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Phone</th>
                  <th className="px-5 py-4 font-bold">Address</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No company data found. Click Create to add first company.
                    </td>
                  </tr>
                ) : (
                  companies.map((company, index) => (
                    <tr
                      key={company.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !company.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {company.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {company.company_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            company.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {company.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <CompanyRowActions
                          company={company}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingCompany ? "Edit Company" : "Create Company"}
        onClose={handleCloseDrawer}
      >
        <CompanyForm
          key={
            editingCompany
              ? `edit-company-${editingCompany.id}`
              : "create-company"
          }
          initialData={editingCompany}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedCompany)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function CompaniesPage() {
  return <CompaniesContent />;
}
3. Test
cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected backend log:

GET /api/v1/companies?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK
Browser check:

http://localhost:3000/companies
Expected UI:

Show: [10/20/30/40/50/100/All] entries
Search company.
All Status
Showing 1 to 10 of total records
First | Previous | 1 | 2 | 3 | Next | Last

image(292).png

Pasted code(3).ts
TypeScript
path : src\app\(protected)\companies\page.tsx and existing code as below:

Thought for 21s
ঠিক ধরছো ✅
তোমার Company page path হলো:

E:\Audit\AMS\frontend\src\app\(protected)\companies\page.tsx
আগে আমি src\app\companies\page.tsx বলেছিলাম, কিন্তু তোমার project structure-এ Company page protected group-এর ভিতরে আছে। Existing code-এ এখন frontend-side search/filter আছে এবং getCompanies() array ধরছে। 


src\services\company.ts আগের দেওয়া dynamic pagination version দিয়ে replace করা থাকলে, এখন নিচের page file full replace করো।

// E:\Audit\AMS\frontend\src\app\(protected)\companies\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyRowActions from "@/components/companies/CompanyRowActions";

import {
  deactivateCompany,
  getAllCompanies,
  getCompanies,
  permanentlyDeleteCompany,
  restoreCompany,
} from "@/services/company";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Company } from "@/types/company";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadCompanies = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllCompanies({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getCompanies({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllCompanies({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getCompanies({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setCompanies(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load companies:", error);
        setCompanies([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load companies."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCompany(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingCompany);

    setDrawerOpen(false);
    setEditingCompany(null);

    showSuccess(
      wasEditing
        ? "Company updated successfully."
        : "Company created successfully."
    );

    void loadCompanies(false);
  };

  const openConfirm = (company: Company, action: ConfirmAction) => {
    setSelectedCompany(company);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedCompany(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateCompany(selectedCompany.id);
        showSuccess("Company marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreCompany(selectedCompany.id);
        showSuccess("Company restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteCompany(selectedCompany.id);
        showSuccess("Company permanently deleted successfully.");
      }

      setSelectedCompany(null);
      setConfirmAction(null);
      await loadCompanies(false);
    } catch (error) {
      console.error("Company action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Company action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Company as Inactive?";
    if (confirmAction === "restore") return "Restore Company?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Company?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedCompany) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedCompany.company_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedCompany.company_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedCompany.company_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Building2}
          title="Company Management"
          description="Manage organization companies with RBAC-based actions."
          height="x-small"
        />

        <PageActionBar
          menuKey="company"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Companies</h2>
            <p className="text-sm text-slate-500">
              Company list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search company."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Phone</th>
                  <th className="px-5 py-4 font-bold">Address</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No company data found. Click Create to add first company.
                    </td>
                  </tr>
                ) : (
                  companies.map((company, index) => (
                    <tr
                      key={company.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !company.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {company.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_code || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {company.company_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            company.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {company.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <CompanyRowActions
                          company={company}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingCompany ? "Edit Company" : "Create Company"}
        onClose={handleCloseDrawer}
      >
        <CompanyForm
          key={
            editingCompany
              ? `edit-company-${editingCompany.id}`
              : "create-company"
          }
          initialData={editingCompany}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedCompany)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}

export default function CompaniesPage() {
  return <CompaniesContent />;
}
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected backend log:

GET /api/v1/companies?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK

same for E:\Audit\AMS\frontend\src\app\(protected)\employees\page.tsx

Thought for 25s
ঠিক আছে ✅ Employee page-টাও same common pagination template-এ convert করব।

Employee backend already pagination/search/status/filter support করে: page, page_size, search, company_id, branch_id, department_id, designation_id, is_active, sort_by, sort_order আছে। 

 Repository-level search-এ employee code, official id, name, email, phone, NID search হয়। 


প্রথমে service update করো, তারপর page update করো।

1. Replace src\services\employee.ts
// E:\Audit\AMS\frontend\src\services\employee.ts

import type { PaginationParams, StatusFilter } from "@/types/pagination";
import type { Employee } from "@/types/employee";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type RawEmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

type EmployeeMessageResponse = {
  message: string;
  data: Employee | null;
};

export type EmployeePayload = {
  employee_code?: string | null;
  official_employee_id?: string | null;
  employee_name: string;
  email?: string | null;
  phone?: string | null;
  nid?: string | null;
  dob?: string | null;
  joining_date?: string | null;
  gender?: string | null;
  employee_status?: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  reporting_to_employee_id?: number | null;
  remarks?: string | null;
};

type EmployeeListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
  branchId?: number | null;
  departmentId?: number | null;
  designationId?: number | null;
  employeeStatus?: string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const normalizeEmployeeListResponse = (
  response: RawEmployeeListResponse
): EmployeeListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildEmployeeSearchParams = (params: EmployeeListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  if (params.companyId) {
    searchParams.set("company_id", String(params.companyId));
  }

  if (params.branchId) {
    searchParams.set("branch_id", String(params.branchId));
  }

  if (params.departmentId) {
    searchParams.set("department_id", String(params.departmentId));
  }

  if (params.designationId) {
    searchParams.set("designation_id", String(params.designationId));
  }

  if (params.employeeStatus?.trim()) {
    searchParams.set("employee_status", params.employeeStatus.trim());
  }

  return searchParams;
};

export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const searchParams = buildEmployeeSearchParams(params);

  const response = await requestJson<RawEmployeeListResponse>(
    `/api/backend/employees?${searchParams.toString()}`
  );

  return normalizeEmployeeListResponse(response);
};

export const getAllEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const firstPage = await getEmployees({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Employee[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getEmployees({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createEmployee = async (
  payload: EmployeePayload
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>("/api/backend/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateEmployee = async (
  employeeId: number,
  payload: Partial<EmployeePayload>
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/permanent`,
    {
      method: "DELETE",
    }
  );
};

export const uploadEmployeePhoto = async (
  employeeId: number,
  file: File
): Promise<EmployeeMessageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/backend/employees/${employeeId}/photo`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};
2. Replace src\app\(protected)\employees\page.tsx
// E:\Audit\AMS\frontend\src\app\(protected)\employees\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeRowActions from "@/components/employees/EmployeeRowActions";

import {
  deactivateEmployee,
  getAllEmployees,
  getEmployees,
  permanentlyDeleteEmployee,
  restoreEmployee,
} from "@/services/employee";
import type { Employee } from "@/types/employee";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  const loadEmployees = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllEmployees({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getEmployees({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setEmployees(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load employees."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllEmployees({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getEmployees({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setEmployees(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load employees."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingEmployee(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingEmployee);

    setDrawerOpen(false);
    setEditingEmployee(null);

    showSuccess(
      wasEditing
        ? "Employee updated successfully."
        : "Employee created successfully."
    );

    void loadEmployees(false);
  };

  const openConfirm = (employee: Employee, action: ConfirmAction) => {
    setSelectedEmployee(employee);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedEmployee(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedEmployee || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateEmployee(selectedEmployee.id);
        showSuccess("Employee marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreEmployee(selectedEmployee.id);
        showSuccess("Employee restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteEmployee(selectedEmployee.id);
        showSuccess("Employee permanently deleted successfully.");
      }

      setSelectedEmployee(null);
      setConfirmAction(null);
      await loadEmployees(false);
    } catch (error) {
      console.error("Employee action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Employee action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Employee as Inactive?";
    if (confirmAction === "restore") return "Restore Employee?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Employee?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedEmployee) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedEmployee.employee_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedEmployee.employee_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedEmployee.employee_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Users}
          title="Employee Management"
          description="Manage employees with company, branch, department and designation mapping."
          height="x-small"
        />

        <PageActionBar
          menuKey="employee"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Employees</h2>
            <p className="text-sm text-slate-500">
              Employee list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search employee."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-325 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Employee</th>
                  <th className="px-5 py-4 font-bold">Official ID</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Designation</th>
                  <th className="px-5 py-4 font-bold">Employee Status</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No employee data found. Click Create to add first employee.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !employee.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {employee.employee_name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Code: {employee.employee_code || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.official_employee_id || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div>{employee.email || "-"}</div>
                        <div className="mt-1 text-xs font-semibold">
                          {employee.phone || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.company_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.branch_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.department_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.designation_name || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {employee.employee_status || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            employee.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {employee.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <EmployeeRowActions
                          employee={employee}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingEmployee ? "Edit Employee" : "Create Employee"}
        onClose={handleCloseDrawer}
      >
        <EmployeeForm
          key={
            editingEmployee
              ? `edit-employee-${editingEmployee.id}`
              : "create-employee"
          }
          initialData={editingEmployee}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedEmployee)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}

export default function EmployeesPage() {
  return <EmployeesContent />;
}
3. Test
cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected backend log:

GET /api/v1/employees?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK
Browser check:

http://localhost:3000/employees
Expected UI:

Show: [10/20/30/40/50/100/All] entries
Search employee.
All Status
Showing 1 to 10 of total records
First | Previous | 1 | 2 | 3 | Next | Last

[{
	"resource": "/e:/Audit/AMS/frontend/src/app/(protected)/employees/page.tsx",
	"owner": "typescript",
	"code": "2339",
	"severity": 8,
	"message": "Property 'employee_status' does not exist on type 'Employee'.",
	"source": "ts",
	"startLineNumber": 453,
	"startColumn": 37,
	"endLineNumber": 453,
	"endColumn": 52,
	"modelVersionId": 9,
	"origin": "extHost1"
},{
	"resource": "/e:/Audit/AMS/frontend/src/app/(protected)/employees/page.tsx",
	"owner": "typescript",
	"code": "2739",
	"severity": 8,
	"message": "Type '{ key: string; initialData: Employee | null; onSuccess: () => void; onCancel: () => void; }' is missing the following properties from type 'EmployeeFormProps': companies, branches, departments, designations, employees",
	"source": "ts",
	"startLineNumber": 506,
	"startColumn": 10,
	"endLineNumber": 506,
	"endColumn": 22,
	"modelVersionId": 9,
	"origin": "extHost1"
}]

Thought for 1m 36s
দুইটা error-এর কারণ clear:

employee_status type missing — backend response-এ employee_status আছে, কিন্তু frontend Employee type-এ field নেই। Backend helper employee response-এ employee_status, company_name, branch_name, department_name, designation_name return করছে। 

 Backend list API-তেও employee_status filter আছে। 


EmployeeForm lookup props missing — তোমার existing EmployeeForm dropdown-এর জন্য companies, branches, departments, designations, employees props require করে। আমাদের pagination update code-এ এগুলো pass করা হয়নি।

1. Replace src\types\employee.ts
// E:\Audit\AMS\frontend\src\types\employee.ts

export type Employee = {
  id: number;
  employee_code: string;
  official_employee_id: string | null;
  employee_name: string;

  photo_url: string | null;
  signature_url: string | null;

  email: string | null;
  phone: string | null;
  nid: string | null;

  dob: string | null;
  joining_date: string | null;
  gender: string | null;
  employee_status: string;

  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  reporting_to_employee_id: number | null;

  remarks: string | null;
  is_active: boolean;

  company_name: string | null;
  branch_name: string | null;
  department_name: string | null;
  designation_name: string | null;
  reporting_to_employee_name: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
};
2. Update imports + lookup states in employees/page.tsx
E:\Audit\AMS\frontend\src\app\(protected)\employees\page.tsx file-এর import section-এ এগুলো add করো:

import { getAllCompanies } from "@/services/company";
import { getBranches } from "@/services/branch";
import { getDepartments } from "@/services/department";
import { getDesignations } from "@/services/designation";

import type { Company } from "@/types/company";
import type { Branch } from "@/types/branch";
import type { Department } from "@/types/department";
import type { Designation } from "@/types/designation";
type ConfirmVariant... এর নিচে এই helper add করো:

type ListOrItems<T> = T[] | { items: T[] };

const toItems = <T,>(response: ListOrItems<T>): T[] => {
  return Array.isArray(response) ? response : response.items;
};
const [employees, setEmployees] = useState<Employee[]>([]); এর পরে এই lookup states add করো:

const [lookupCompanies, setLookupCompanies] = useState<Company[]>([]);
const [lookupBranches, setLookupBranches] = useState<Branch[]>([]);
const [lookupDepartments, setLookupDepartments] = useState<Department[]>([]);
const [lookupDesignations, setLookupDesignations] = useState<Designation[]>([]);
const [lookupEmployees, setLookupEmployees] = useState<Employee[]>([]);
showError function-এর পরে এই lookup loading effect add করো:

useEffect(() => {
  let isMounted = true;

  const request = Promise.all([
    getAllCompanies({
      status: "active",
      sortBy: "id",
      sortOrder: "asc",
    }),
    getBranches(),
    getDepartments(),
    getDesignations(),
    getAllEmployees({
      status: "active",
      sortBy: "employee_name",
      sortOrder: "asc",
    }),
  ]);

  void request
    .then(
      ([
        companyResponse,
        branchResponse,
        departmentResponse,
        designationResponse,
        employeeResponse,
      ]) => {
        if (!isMounted) return;

        setLookupCompanies(toItems(companyResponse));
        setLookupBranches(toItems(branchResponse));
        setLookupDepartments(toItems(departmentResponse));
        setLookupDesignations(toItems(designationResponse));
        setLookupEmployees(employeeResponse.items);
      }
    )
    .catch((error) => {
      if (!isMounted) return;

      console.error("Failed to load employee form lookup data:", error);
      showError("Failed to load employee form dropdown data.");
    });

  return () => {
    isMounted = false;
  };
}, [showError]);
3. Replace only EmployeeForm call
নিচের পুরোনোটা:

<EmployeeForm
  key={
    editingEmployee
      ? `edit-employee-${editingEmployee.id}`
      : "create-employee"
  }
  initialData={editingEmployee}
  onSuccess={handleSuccess}
  onCancel={handleCloseDrawer}
/>
এইটা দিয়ে replace করো:

<EmployeeForm
  key={
    editingEmployee
      ? `edit-employee-${editingEmployee.id}`
      : "create-employee"
  }
  initialData={editingEmployee}
  companies={lookupCompanies}
  branches={lookupBranches}
  departments={lookupDepartments}
  designations={lookupDesignations}
  employees={lookupEmployees}
  onSuccess={handleSuccess}
  onCancel={handleCloseDrawer}
/>
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected: এই দুইটা TypeScript error চলে যাবে.


provide full file updated code

Thought for 1m 3s
হ্যাঁ, problem clear ✅
আমরা employee.ts service replace করার সময় পুরনো media helper export দুইটা বাদ পড়ে গেছে:

deleteEmployeePhoto
getEmployeeMediaUrl
কিন্তু EmployeeForm.tsx এখনো এগুলো import করছে। Backend-এ employee photo upload/delete endpoint আছে: POST /employees/{employee_id}/photo এবং DELETE /employees/{employee_id}/photo। 


এখন src\services\employee.ts full replace করো।

// E:\Audit\AMS\frontend\src\services\employee.ts

import type { Employee } from "@/types/employee";
import type { PaginationParams, StatusFilter } from "@/types/pagination";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type RawEmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
};

type EmployeeMessageResponse = {
  message: string;
  data: Employee | null;
};

export type EmployeePayload = {
  employee_code?: string | null;
  official_employee_id?: string | null;
  employee_name: string;
  email?: string | null;
  phone?: string | null;
  nid?: string | null;
  dob?: string | null;
  joining_date?: string | null;
  gender?: string | null;
  employee_status?: string;
  company_id: number;
  branch_id: number;
  department_id: number;
  designation_id: number;
  reporting_to_employee_id?: number | null;
  remarks?: string | null;
};

type EmployeeListParams = PaginationParams & {
  status?: StatusFilter;
  companyId?: number | null;
  branchId?: number | null;
  departmentId?: number | null;
  designationId?: number | null;
  employeeStatus?: string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item: ApiValidationError) => {
          return item.msg || item.message || "Validation error";
        })
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const normalizeEmployeeListResponse = (
  response: RawEmployeeListResponse
): EmployeeListResponse => {
  const totalPages =
    response.total_pages ??
    (response.total > 0 ? Math.ceil(response.total / response.page_size) : 0);

  return {
    ...response,
    total_pages: totalPages,
  };
};

const buildEmployeeSearchParams = (params: EmployeeListParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = Math.min(
    params.pageSize ?? DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: params.sortBy ?? "id",
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status === "active") {
    searchParams.set("is_active", "true");
  }

  if (params.status === "inactive") {
    searchParams.set("is_active", "false");
  }

  if (params.companyId) {
    searchParams.set("company_id", String(params.companyId));
  }

  if (params.branchId) {
    searchParams.set("branch_id", String(params.branchId));
  }

  if (params.departmentId) {
    searchParams.set("department_id", String(params.departmentId));
  }

  if (params.designationId) {
    searchParams.set("designation_id", String(params.designationId));
  }

  if (params.employeeStatus?.trim()) {
    searchParams.set("employee_status", params.employeeStatus.trim());
  }

  return searchParams;
};

export const getEmployeeMediaUrl = (
  mediaPath?: string | null
): string | null => {
  if (!mediaPath) {
    return null;
  }

  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  const backendBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  const normalizedPath = mediaPath.startsWith("/")
    ? mediaPath
    : `/${mediaPath}`;

  return `${backendBaseUrl}${normalizedPath}`;
};

export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const searchParams = buildEmployeeSearchParams(params);

  const response = await requestJson<RawEmployeeListResponse>(
    `/api/backend/employees?${searchParams.toString()}`
  );

  return normalizeEmployeeListResponse(response);
};

export const getAllEmployees = async (
  params: EmployeeListParams = {}
): Promise<EmployeeListResponse> => {
  const firstPage = await getEmployees({
    ...params,
    page: 1,
    pageSize: MAX_PAGE_SIZE,
  });

  if (firstPage.total_pages <= 1) {
    return {
      ...firstPage,
      page: 1,
      page_size: firstPage.items.length,
      total_pages: 1,
    };
  }

  const allItems: Employee[] = [...firstPage.items];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    const nextPage = await getEmployees({
      ...params,
      page,
      pageSize: MAX_PAGE_SIZE,
    });

    allItems.push(...nextPage.items);
  }

  return {
    items: allItems,
    total: firstPage.total,
    page: 1,
    page_size: allItems.length,
    total_pages: 1,
  };
};

export const createEmployee = async (
  payload: EmployeePayload
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>("/api/backend/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateEmployee = async (
  employeeId: number,
  payload: Partial<EmployeePayload>
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
};

export const deactivateEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}`,
    {
      method: "DELETE",
    }
  );
};

export const restoreEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteEmployee = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/permanent`,
    {
      method: "DELETE",
    }
  );
};

export const uploadEmployeePhoto = async (
  employeeId: number,
  file: File
): Promise<EmployeeMessageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/backend/employees/${employeeId}/photo`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const deleteEmployeePhoto = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/photo`,
    {
      method: "DELETE",
    }
  );
};
তারপর run করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
এই build error চলে যাবে:

Export deleteEmployeePhoto doesn't exist
Export getEmployeeMediaUrl doesn't exist

deleteEmployeePhoto
getEmployeeMediaUrl
both are need

Thought for 6s
হ্যাঁ ✅ দুইটাই দরকার।

EmployeeForm.tsx এই দুইটা import করছে:

deleteEmployeePhoto
getEmployeeMediaUrl
তাই src\services\employee.ts-এ দুইটা export অবশ্যই থাকতে হবে।

employee.ts file-এর ভিতরে getEmployees function-এর আগে এই দুইটা add/keep করো:

export const getEmployeeMediaUrl = (
  mediaPath?: string | null
): string | null => {
  if (!mediaPath) {
    return null;
  }

  if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
    return mediaPath;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  const backendBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  const normalizedPath = mediaPath.startsWith("/")
    ? mediaPath
    : `/${mediaPath}`;

  return `${backendBaseUrl}${normalizedPath}`;
};

export const deleteEmployeePhoto = async (
  employeeId: number
): Promise<EmployeeMessageResponse> => {
  return requestJson<EmployeeMessageResponse>(
    `/api/backend/employees/${employeeId}/photo`,
    {
      method: "DELETE",
    }
  );
};
আর uploadEmployeePhoto-ও থাকবে:

export const uploadEmployeePhoto = async (...)
Final service-এ এই ৩টা media-related export থাকবে:

✅ getEmployeeMediaUrl
✅ uploadEmployeePhoto
✅ deleteEmployeePhoto
তারপর run করো:

npm run lint
npm run build

now okay

Thought for 5s
Great ✅

এখন Employee service issue fixed:

✅ getEmployeeMediaUrl আছে
✅ uploadEmployeePhoto আছে
✅ deleteEmployeePhoto আছে
✅ EmployeeForm import error fixed
এখন final verify করো:

cd E:\Audit\AMS\frontend
npm run lint
npm run build
Expected backend log when opening Employees:

GET /api/v1/employees?page=1&page_size=10&sort_by=id&sort_order=asc 200 OK
Current pagination conversion status:

✅ Permissions
✅ Users
✅ Roles
✅ Company
✅ Employee
Next best: Branch Page common pagination convert করি.


