from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.navigation_repository import NavigationRepository


class NavigationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_navigation(
        self,
        current_user: User,
    ):
        return await NavigationRepository.get_navigation(
            db=self.db,
            current_user=current_user,
        )