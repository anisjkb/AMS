from datetime import datetime

from pydantic import BaseModel


class BusinessNatureResponse(BaseModel):
    id: int
    nature_code: str
    nature_name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class BusinessSectorResponse(BaseModel):
    id: int
    nature_id: int
    sector_code: str
    sector_name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class BusinessIndustryResponse(BaseModel):
    id: int
    sector_id: int
    industry_code: str
    industry_name: str
    description: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
