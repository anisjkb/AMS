# app/services/auth_service.py

from fastapi import HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    async def login(self, user_id: str, password: str) -> dict[str, str]:
        user = await self.user_repo.get_by_user_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID or password",
            )

        subject = str(user.id)

        return {
            "access_token": create_access_token(subject=subject),
            "refresh_token": create_refresh_token(subject=subject),
        }

    async def refresh_access_token(self, refresh_token: str) -> str:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

        try:
            payload = jwt.decode(
                refresh_token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )

            token_type = payload.get("type")
            if token_type != "refresh":
                raise credentials_exception

            subject = payload.get("sub")
            if subject is None:
                raise credentials_exception

        except JWTError:
            raise credentials_exception

        return create_access_token(subject=subject)
