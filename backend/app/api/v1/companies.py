from fastapi import APIRouter, Depends

from app.core.permissions import require_permission
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("")
async def create_company(
    current_user: User = Depends(require_permission("api.company.create")),
):
    return {
        "message": "Company create permission verified successfully.",
        "created_by": current_user.user_id,
    }
