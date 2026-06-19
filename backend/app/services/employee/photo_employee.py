# app/services/employee/photo_employee.py

import os
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

from app.repositories.employee_repository import EmployeeRepository
from app.services.employee.helpers import employee_with_names


MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

MEDIA_ROOT = Path(os.getenv("AMS_MEDIA_ROOT", "uploads"))
EMPLOYEE_MEDIA_DIR = MEDIA_ROOT / "employees"
MEDIA_URL_PREFIX = "/media/employees"


def _employee_folder(employee_id: int) -> Path:
    return EMPLOYEE_MEDIA_DIR / str(employee_id)


def _file_path_from_media_url(url: str | None) -> Path | None:
    if not url:
        return None

    expected_prefix = f"{MEDIA_URL_PREFIX}/"

    if not url.startswith(expected_prefix):
        return None

    relative_path = url.replace("/media/", "", 1)
    return MEDIA_ROOT / relative_path


def _delete_file_by_url(url: str | None) -> None:
    file_path = _file_path_from_media_url(url)

    if file_path and file_path.exists() and file_path.is_file():
        file_path.unlink()


def _delete_existing_photo_files(employee) -> None:
    _delete_file_by_url(employee.photo_url)
    _delete_file_by_url(employee.photo_thumb_url)
    _delete_file_by_url(employee.passport_photo_url)


def _save_webp(
    image: Image.Image,
    path: Path,
    size: tuple[int, int],
    quality: int,
) -> None:
    prepared_image = ImageOps.exif_transpose(image).convert("RGB")

    resized_image = ImageOps.fit(
        prepared_image,
        size,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    resized_image.save(
        path,
        "WEBP",
        quality=quality,
        method=6,
    )


async def upload_employee_photo_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
    file: UploadFile,
    updated_by: str,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, or WEBP image files are allowed.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty image file is not allowed.")

    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image size must be 3 MB or less.",
        )

    try:
        image = Image.open(BytesIO(file_bytes))
        image.verify()
        image = Image.open(BytesIO(file_bytes))
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    employee_folder = _employee_folder(employee.id)
    employee_folder.mkdir(parents=True, exist_ok=True)

    _delete_existing_photo_files(employee)

    unique_key = uuid4().hex[:12]

    profile_filename = f"profile_{unique_key}.webp"
    thumb_filename = f"profile_thumb_{unique_key}.webp"
    passport_filename = f"passport_{unique_key}.webp"

    profile_path = employee_folder / profile_filename
    thumb_path = employee_folder / thumb_filename
    passport_path = employee_folder / passport_filename

    _save_webp(
        image=image,
        path=profile_path,
        size=(512, 512),
        quality=82,
    )

    _save_webp(
        image=image,
        path=thumb_path,
        size=(96, 96),
        quality=78,
    )

    _save_webp(
        image=image,
        path=passport_path,
        size=(413, 531),
        quality=85,
    )

    photo_url = f"{MEDIA_URL_PREFIX}/{employee.id}/{profile_filename}"
    photo_thumb_url = f"{MEDIA_URL_PREFIX}/{employee.id}/{thumb_filename}"
    passport_photo_url = f"{MEDIA_URL_PREFIX}/{employee.id}/{passport_filename}"

    updated_employee = await employee_repo.update_photo_fields(
        employee=employee,
        photo_url=photo_url,
        photo_thumb_url=photo_thumb_url,
        passport_photo_url=passport_photo_url,
        photo_original_name=file.filename,
        photo_mime_type="image/webp",
        photo_size_bytes=len(file_bytes),
        updated_by=updated_by,
    )

    return {
        "message": "Employee photo uploaded successfully",
        "data": await employee_with_names(updated_employee, employee_repo),
    }


async def delete_employee_photo_service(
    employee_repo: EmployeeRepository,
    employee_id: int,
    updated_by: str,
):
    employee = await employee_repo.get_by_id_any_status(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    _delete_existing_photo_files(employee)

    updated_employee = await employee_repo.update_photo_fields(
        employee=employee,
        photo_url=None,
        photo_thumb_url=None,
        passport_photo_url=None,
        photo_original_name=None,
        photo_mime_type=None,
        photo_size_bytes=None,
        updated_by=updated_by,
    )

    return {
        "message": "Employee photo deleted successfully",
        "data": await employee_with_names(updated_employee, employee_repo),
    }