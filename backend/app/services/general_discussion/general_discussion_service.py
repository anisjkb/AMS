from sqlalchemy.ext.asyncio import AsyncSession

from app.models.general_discussion import GeneralDiscussion
from app.repositories.general_discussion_repository import GeneralDiscussionRepository


def _to_dict(data):
    if hasattr(data, "model_dump"):
        return data.model_dump(exclude_unset=True)
    return data.dict(exclude_unset=True)


class GeneralDiscussionService:
    def __init__(self):
        self.repo = GeneralDiscussionRepository()

    async def create(self, db: AsyncSession, data):
        payload = _to_dict(data)
        payload.setdefault("is_active", True)
        obj = GeneralDiscussion(**payload)
        return await self.repo.create(db, obj)

    async def get(self, db: AsyncSession, id: int):
        return await self.repo.get_by_id(db, id)

    async def list(
        self,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        search: str | None = None,
        status: str | None = None,
        is_active: bool | None = None,
    ):
        return await self.repo.list(
            db,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            is_active=is_active,
        )

    async def update(self, db: AsyncSession, obj, data):
        for key, value in _to_dict(data).items():
            setattr(obj, key, value)
        return await self.repo.update(db, obj)

    async def deactivate(self, db: AsyncSession, obj):
        return await self.repo.deactivate(db, obj)

    async def restore(self, db: AsyncSession, obj):
        return await self.repo.restore(db, obj)

    async def permanent_delete(self, db: AsyncSession, obj):
        return await self.repo.permanent_delete(db, obj)
