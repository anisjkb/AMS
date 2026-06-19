# app/schemas/user.py
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserMeResponse(BaseModel):
    id: int
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
