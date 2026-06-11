# app/schemas/user.py
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserMeResponse(BaseModel):
    id: uuid.UUID
    user_id: str
    email: EmailStr | None = None
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
