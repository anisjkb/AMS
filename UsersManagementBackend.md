ঠিক আছে। এখন **Users Management Backend** করব।

Important: `users` table/model already আছে, তাই migration লাগবে না। Existing `User` model-এ `user_id`, `email`, `full_name`, `hashed_password`, `is_superuser` আছে। 
Current `user_repository.py` শুধু basic get/create পর্যন্ত আছে, তাই এটাকে extend করব। 
Current `api/v1/users.py`-তে শুধু `/users/me` আছে, তাই full management route দিয়ে replace করব। 

## Step 1: Replace `schemas/user.py` and `repositories/user_repository.py`

```py
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
```

```py
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
```

## Step 2: Create User Management Service

Folder না থাকলে create করো:

```powershell
New-Item -ItemType Directory -Force E:\Audit\AMS\backend\app\services\user
New-Item -ItemType File -Force E:\Audit\AMS\backend\app\services\user\__init__.py
```

তারপর এই file create করো।

```py
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
```

## Step 3: Replace `api/v1/users.py`

`router.py` already users router include করছে, তাই `router.py` change লাগবে না। 

```py
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
```

## Step 4: Verify

Run:

```powershell
cd E:\Audit\AMS\backend
python -m compileall app
python -c "from app.api.v1.users import router; print([r.path for r in router.routes])"
```

Expected:

```text
['/users/me', '/users', '/users/{user_id}', '/users', '/users/{user_id}', '/users/{user_id}', '/users/{user_id}/restore']
```

Then restart:

```powershell
uvicorn main:app --reload
```

Swagger test payload for create:

```json
{
  "user_id": "audituser1",
  "full_name": "Audit User One",
  "password": "User@12345",
  "email": "audituser1@example.com",
  "is_superuser": false
}
```

Expected logs:

```text
GET /api/v1/users 200 OK
POST /api/v1/users 201 Created
GET /api/v1/users/{id} 200 OK
PATCH /api/v1/users/{id} 200 OK
DELETE /api/v1/users/{id} 200 OK
PATCH /api/v1/users/{id}/restore 200 OK
```
