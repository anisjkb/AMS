from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to AMS API",
        "version": settings.VERSION,
    }


app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)
