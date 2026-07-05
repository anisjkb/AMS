from pathlib import Path
import re
import shutil
from datetime import datetime

root = Path.cwd()
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = root / f"backup_c25_3_meeting_type_{stamp}"
backup.mkdir(exist_ok=True)

def p(path: str) -> Path:
    return root / path

def read(path: str) -> str:
    return p(path).read_text(encoding="utf-8")

def write(path: str, content: str) -> None:
    target = p(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8", newline="\n")
    print(f"WROTE {path}")

def backup_file(path: str) -> None:
    source = p(path)
    if source.exists():
        target = backup / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        print(f"BACKUP {path}")

required = [
    "backend/app/api/v1/meeting_master.py",
    "backend/app/api/v1/router.py",
    "backend/app/models/meeting_master.py",
    "backend/app/schemas/meeting_master.py",
    "backend/app/repositories/meeting_master_repository.py",
    "backend/app/services/meeting_master/meeting_master_service.py",
    "frontend/src/services/meetingMaster.ts",
    "frontend/src/app/(protected)/audit-meetings/master/page.tsx",
]

for item in required:
    if not p(item).exists():
        raise SystemExit(f"Missing required file: {item}")

for item in [
    "backend/app/api/v1/router.py",
    "backend/app/models/__init__.py",
    "frontend/src/services/meetingMaster.ts",
]:
    backup_file(item)

# -----------------------------
# Backend: MeetingType model
# -----------------------------
write("backend/app/models/meeting_type.py", '''from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class MeetingType(ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "meeting_type"

    meeting_type_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    meeting_type_name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        index=True,
        nullable=False,
    )
''')

# -----------------------------
# Backend: MeetingType schema
# -----------------------------
write("backend/app/schemas/meeting_type.py", '''from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MeetingTypeBase(BaseModel):
    meeting_type_name: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(default=None)
    status: str = Field(default="active", min_length=2, max_length=20)

    @field_validator("meeting_type_name", "status")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("description")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class MeetingTypeCreate(MeetingTypeBase):
    pass


class MeetingTypeUpdate(BaseModel):
    meeting_type_name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None)
    status: str | None = Field(default=None, min_length=2, max_length=20)
    is_active: bool | None = None

    @field_validator("meeting_type_name", "status")
    @classmethod
    def clean_optional_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty.")

        return value

    @field_validator("description")
    @classmethod
    def clean_optional_description(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class MeetingTypeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    meeting_type_id: int
    meeting_type_name: str
    description: str | None = None
    status: str
    is_active: bool
    created_by: str | None = None
    updated_by: str | None = None
    created_at: datetime
    updated_at: datetime


class MeetingTypeListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[MeetingTypeResponse]


class MeetingTypeMessageResponse(BaseModel):
    message: str
    data: MeetingTypeResponse | None = None
''')

# -----------------------------
# Backend: MeetingType repository
# -----------------------------
write("backend/app/repositories/meeting_type_repository.py", '''from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_type import MeetingType


class MeetingTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "meeting_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
    ) -> tuple[int, list[MeetingType]]:
        allowed_sort_fields = {
            "meeting_type_id": MeetingType.meeting_type_id,
            "meeting_type_name": MeetingType.meeting_type_name,
            "status": MeetingType.status,
            "created_at": MeetingType.created_at,
            "updated_at": MeetingType.updated_at,
        }

        sort_column = allowed_sort_fields.get(sort_by, MeetingType.meeting_type_id)
        order_column = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

        filters = []

        if is_active is not None:
            filters.append(MeetingType.is_active == is_active)

        if search:
            search_pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    MeetingType.meeting_type_name.ilike(search_pattern),
                    MeetingType.description.ilike(search_pattern),
                    MeetingType.status.ilike(search_pattern),
                )
            )

        count_query = select(func.count()).select_from(MeetingType)
        query = select(MeetingType)

        if filters:
            count_query = count_query.where(*filters)
            query = query.where(*filters)

        total_result = await self.db.execute(count_query)
        total = int(total_result.scalar_one())

        result = await self.db.execute(
            query.order_by(order_column)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        return total, list(result.scalars().all())

    async def get_by_id(self, meeting_type_id: int) -> MeetingType | None:
        result = await self.db.execute(
            select(MeetingType).where(MeetingType.meeting_type_id == meeting_type_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, meeting_type_name: str) -> MeetingType | None:
        result = await self.db.execute(
            select(MeetingType).where(
                func.lower(MeetingType.meeting_type_name) == meeting_type_name.strip().lower()
            )
        )
        return result.scalar_one_or_none()

    async def create(self, item: MeetingType) -> MeetingType:
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item: MeetingType) -> MeetingType:
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete(self, item: MeetingType) -> None:
        await self.db.delete(item)
        await self.db.commit()
''')

# -----------------------------
# Backend: MeetingType service
# -----------------------------
write("backend/app/services/meeting_type/meeting_type_service.py", '''from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meeting_type import MeetingType
from app.repositories.meeting_type_repository import MeetingTypeRepository
from app.schemas.meeting_type import (
    MeetingTypeCreate,
    MeetingTypeListResponse,
    MeetingTypeMessageResponse,
    MeetingTypeUpdate,
)


class MeetingTypeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = MeetingTypeRepository(db)

    async def list_meeting_type(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        sort_by: str = "meeting_type_id",
        sort_order: str = "desc",
        is_active: bool | None = None,
    ) -> MeetingTypeListResponse:
        total, items = await self.repository.list(
            page=page,
            page_size=page_size,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            is_active=is_active,
        )

        return MeetingTypeListResponse(
            total=total,
            page=page,
            page_size=page_size,
            items=items,
        )

    async def get_meeting_type(self, meeting_type_id: int) -> MeetingType:
        item = await self.repository.get_by_id(meeting_type_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting type not found.",
            )
        return item

    async def create_meeting_type(
        self,
        payload: MeetingTypeCreate,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        existing = await self.repository.get_by_name(payload.meeting_type_name)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Meeting type name already exists.",
            )

        item = MeetingType(**payload.model_dump())
        if username:
            item.created_by = username
            item.updated_by = username

        created = await self.repository.create(item)
        return MeetingTypeMessageResponse(
            message="Meeting type created successfully.",
            data=created,
        )

    async def update_meeting_type(
        self,
        meeting_type_id: int,
        payload: MeetingTypeUpdate,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        data = payload.model_dump(exclude_unset=True)

        if "meeting_type_name" in data and data["meeting_type_name"]:
            existing = await self.repository.get_by_name(data["meeting_type_name"])
            if existing is not None and existing.meeting_type_id != meeting_type_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Meeting type name already exists.",
                )

        for field, value in data.items():
            setattr(item, field, value)

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type updated successfully.",
            data=updated,
        )

    async def deactivate_meeting_type(
        self,
        meeting_type_id: int,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        item.is_active = False
        item.status = "inactive"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type inactivated successfully.",
            data=updated,
        )

    async def restore_meeting_type(
        self,
        meeting_type_id: int,
        *,
        username: str | None = None,
    ) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        item.is_active = True
        item.status = "active"

        if username:
            item.updated_by = username

        updated = await self.repository.update(item)
        return MeetingTypeMessageResponse(
            message="Meeting type restored successfully.",
            data=updated,
        )

    async def permanent_delete_meeting_type(self, meeting_type_id: int) -> MeetingTypeMessageResponse:
        item = await self.get_meeting_type(meeting_type_id)
        await self.repository.delete(item)
        return MeetingTypeMessageResponse(
            message="Meeting type permanently deleted successfully.",
            data=None,
        )
''')

# -----------------------------
# Backend: API router by cloning Meeting Master router imports/pattern
# -----------------------------
router_text = read("backend/app/api/v1/meeting_master.py")
router_text = router_text.replace("meeting_master", "meeting_type")
router_text = router_text.replace("MeetingMaster", "MeetingType")
router_text = router_text.replace("meeting-master", "meeting-type")
router_text = router_text.replace("Meeting Master", "Meeting Type")
router_text = router_text.replace("meeting_id", "meeting_type_id")

# Temporary permission bridge: reuse meeting master permissions to avoid 403
router_text = router_text.replace("menu.meeting_type.view", "menu.meeting_master.view")
router_text = router_text.replace("api.meeting_type.create", "api.meeting_master.create")
router_text = router_text.replace("api.meeting_type.update", "api.meeting_master.update")
router_text = router_text.replace("api.meeting_type.delete", "api.meeting_master.delete")
router_text = router_text.replace("api.meeting_type.restore", "api.meeting_master.restore")
router_text = router_text.replace("api.meeting_type.permanent_delete", "api.meeting_master.permanent_delete")

write("backend/app/api/v1/meeting_type.py", router_text)

# -----------------------------
# Backend: router registration
# -----------------------------
router_path = "backend/app/api/v1/router.py"
router = read(router_path)
backup_file(router_path)

if "meeting_type_router" not in router:
    marker = "from app.api.v1.meeting_master import router as meeting_master_router"
    if marker in router:
        router = router.replace(
            marker,
            "from app.api.v1.meeting_type import router as meeting_type_router\n" + marker,
        )
    else:
        router += "\nfrom app.api.v1.meeting_type import router as meeting_type_router\n"

    include_marker = "api_router.include_router(meeting_master_router)"
    if include_marker in router:
        router = router.replace(
            include_marker,
            "api_router.include_router(meeting_type_router)\n" + include_marker,
        )
    else:
        router += "\napi_router.include_router(meeting_type_router)\n"

    write(router_path, router)
else:
    print("SKIP router registration already exists")

# -----------------------------
# Backend: optional model init registration
# -----------------------------
models_init = p("backend/app/models/__init__.py")
if models_init.exists():
    text = models_init.read_text(encoding="utf-8")
    if "meeting_type" not in text:
        text += "\nfrom app.models.meeting_type import MeetingType\n"
        models_init.write_text(text, encoding="utf-8", newline="\n")
        print("UPDATED backend/app/models/__init__.py")

# -----------------------------
# Alembic migration
# -----------------------------
migration_path = "backend/alembic/versions/c253_meeting_type.py"
if not p(migration_path).exists():
    write(migration_path, '''"""create meeting type and update meeting master

Revision ID: c253_meeting_type
Revises: e10f6d2c4a9b
Create Date: 2026-07-05
"""

from alembic import op
import sqlalchemy as sa


revision = "c253_meeting_type"
down_revision = "e10f6d2c4a9b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meeting_type",
        sa.Column("meeting_type_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("meeting_type_name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="active", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("meeting_type_id"),
        sa.UniqueConstraint("meeting_type_name", name="uq_meeting_type_name"),
    )

    op.create_index("ix_meeting_type_meeting_type_id", "meeting_type", ["meeting_type_id"], unique=False)
    op.create_index("ix_meeting_type_meeting_type_name", "meeting_type", ["meeting_type_name"], unique=False)
    op.create_index("ix_meeting_type_status", "meeting_type", ["status"], unique=False)

    op.execute(
        """
        INSERT INTO meeting_type (
            meeting_type_name,
            description,
            status,
            is_active,
            created_at,
            updated_at
        )
        SELECT DISTINCT
            TRIM(meeting_type) AS meeting_type_name,
            NULL AS description,
            'active' AS status,
            TRUE AS is_active,
            NOW() AS created_at,
            NOW() AS updated_at
        FROM meeting_master
        WHERE meeting_type IS NOT NULL
          AND TRIM(meeting_type) <> ''
        ON CONFLICT (meeting_type_name) DO NOTHING
        """
    )

    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.add_column(sa.Column("meeting_name", sa.String(length=150), nullable=True))
        batch_op.add_column(sa.Column("meeting_type_id", sa.Integer(), nullable=True))

    op.execute(
        """
        UPDATE meeting_master mm
        SET meeting_type_id = mt.meeting_type_id
        FROM meeting_type mt
        WHERE TRIM(mm.meeting_type) = mt.meeting_type_name
          AND mm.meeting_type_id IS NULL
        """
    )

    op.execute(
        """
        UPDATE meeting_master
        SET meeting_name = LEFT(
            CONCAT(
                COALESCE(NULLIF(TRIM(meeting_type), ''), 'Meeting'),
                ' - ',
                client_code,
                ' - ',
                audit_year
            ),
            150
        )
        WHERE meeting_name IS NULL
           OR TRIM(meeting_name) = ''
        """
    )

    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.alter_column("meeting_name", existing_type=sa.String(length=150), nullable=False)
        batch_op.alter_column("meeting_type_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_index("ix_meeting_master_meeting_name", ["meeting_name"], unique=False)
        batch_op.create_index("ix_meeting_master_meeting_type_id", ["meeting_type_id"], unique=False)
        batch_op.create_foreign_key(
            "fk_meeting_master_meeting_type_id_meeting_type",
            "meeting_type",
            ["meeting_type_id"],
            ["meeting_type_id"],
        )


def downgrade() -> None:
    with op.batch_alter_table("meeting_master") as batch_op:
        batch_op.drop_constraint("fk_meeting_master_meeting_type_id_meeting_type", type_="foreignkey")
        batch_op.drop_index("ix_meeting_master_meeting_type_id")
        batch_op.drop_index("ix_meeting_master_meeting_name")
        batch_op.drop_column("meeting_type_id")
        batch_op.drop_column("meeting_name")

    op.drop_index("ix_meeting_type_status", table_name="meeting_type")
    op.drop_index("ix_meeting_type_meeting_type_name", table_name="meeting_type")
    op.drop_index("ix_meeting_type_meeting_type_id", table_name="meeting_type")
    op.drop_table("meeting_type")
''')
else:
    print("SKIP migration already exists")

# -----------------------------
# Frontend: MeetingType service
# -----------------------------
master_service = read("frontend/src/services/meetingMaster.ts")
match = re.search(r"""^import\s+\{[^}]*requestJson[^}]*\}\s+from\s+["'][^"']+["'];""", master_service, re.MULTILINE)
if not match:
    raise SystemExit("Could not find requestJson import in frontend/src/services/meetingMaster.ts")

request_import = match.group(0)

write("frontend/src/services/meetingType.ts", f'''{request_import}

export type MeetingType = {{
  meeting_type_id: number;
  meeting_type_name: string;
  description: string | null;
  status: string;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}};

export type MeetingTypeListResponse = {{
  total: number;
  page: number;
  page_size: number;
  items: MeetingType[];
}};

export type MeetingTypePayload = {{
  meeting_type_name: string;
  description?: string | null;
  status: string;
}};

export type MeetingTypeUpdatePayload = Partial<MeetingTypePayload> & {{
  is_active?: boolean;
}};

export type MeetingTypeListParams = {{
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  is_active?: boolean;
}};

function buildQuery(params: MeetingTypeListParams = {{}}): string {{
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {{
    if (value === undefined || value === null || value === "") {{
      return;
    }}

    searchParams.set(key, String(value));
  }});

  const query = searchParams.toString();
  return query ? `?${{query}}` : "";
}}

export async function listMeetingTypes(
  params: MeetingTypeListParams = {{}},
): Promise<MeetingTypeListResponse> {{
  return requestJson<MeetingTypeListResponse>(
    `/api/backend/meeting-type${{buildQuery(params)}}`,
  );
}}

export async function createMeetingType(
  payload: MeetingTypePayload,
): Promise<{{ message: string; data: MeetingType | null }}> {{
  return requestJson<{{ message: string; data: MeetingType | null }}>(
    "/api/backend/meeting-type",
    {{
      method: "POST",
      body: JSON.stringify(payload),
    }},
  );
}}

export async function updateMeetingType(
  meetingTypeId: number,
  payload: MeetingTypeUpdatePayload,
): Promise<{{ message: string; data: MeetingType | null }}> {{
  return requestJson<{{ message: string; data: MeetingType | null }}>(
    `/api/backend/meeting-type/${{meetingTypeId}}`,
    {{
      method: "PATCH",
      body: JSON.stringify(payload),
    }},
  );
}}

export async function deactivateMeetingType(
  meetingTypeId: number,
): Promise<{{ message: string; data: MeetingType | null }}> {{
  return requestJson<{{ message: string; data: MeetingType | null }}>(
    `/api/backend/meeting-type/${{meetingTypeId}}`,
    {{
      method: "DELETE",
    }},
  );
}}

export async function restoreMeetingType(
  meetingTypeId: number,
): Promise<{{ message: string; data: MeetingType | null }}> {{
  return requestJson<{{ message: string; data: MeetingType | null }}>(
    `/api/backend/meeting-type/${{meetingTypeId}}/restore`,
    {{
      method: "PATCH",
    }},
  );
}}

export async function permanentDeleteMeetingType(
  meetingTypeId: number,
): Promise<{{ message: string; data: MeetingType | null }}> {{
  return requestJson<{{ message: string; data: MeetingType | null }}>(
    `/api/backend/meeting-type/${{meetingTypeId}}/permanent`,
    {{
      method: "DELETE",
    }},
  );
}}
''')

# -----------------------------
# Frontend: MeetingType page
# -----------------------------
write("frontend/src/app/(protected)/audit-meetings/types/page.tsx", '''"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  createMeetingType,
  deactivateMeetingType,
  listMeetingTypes,
  permanentDeleteMeetingType,
  restoreMeetingType,
  updateMeetingType,
  type MeetingType,
} from "@/services/meetingType";

type FormState = {
  meeting_type_name: string;
  description: string;
  status: string;
};

const emptyForm: FormState = {
  meeting_type_name: "",
  description: "",
  status: "active",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function buildPayload(form: FormState) {
  return {
    meeting_type_name: form.meeting_type_name.trim(),
    description: form.description.trim() || null,
    status: form.status,
  };
}

export default function MeetingTypePage() {
  const [items, setItems] = useState<MeetingType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("active");
  const [sortBy, setSortBy] = useState("meeting_type_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedItem, setSelectedItem] = useState<MeetingType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [pageSize, total]);

  const isActiveValue = useMemo(() => {
    if (activeFilter === "active") {
      return true;
    }

    if (activeFilter === "inactive") {
      return false;
    }

    return undefined;
  }, [activeFilter]);

  const loadMeetingTypes = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await listMeetingTypes({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        is_active: isActiveValue,
      });

      setItems(response.items);
      setTotal(response.total);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, isActiveValue, page, pageSize, search, sortBy, sortOrder]);

  useEffect(() => {
    void loadMeetingTypes();
  }, [loadMeetingTypes]);

  const openCreateForm = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: MeetingType) => {
    setSelectedItem(item);
    setForm({
      meeting_type_name: item.meeting_type_name,
      description: item.description ?? "",
      status: item.status,
    });
    setMessage("");
    setError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.meeting_type_name.trim()) {
      setError("Meeting type name is required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      if (selectedItem) {
        const response = await updateMeetingType(
          selectedItem.meeting_type_id,
          buildPayload(form),
        );
        setMessage(response.message);
      } else {
        const response = await createMeetingType(buildPayload(form));
        setMessage(response.message);
      }

      closeForm();
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (item: MeetingType) => {
    const confirmed = window.confirm(
      `Are you sure you want to inactive "${item.meeting_type_name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await deactivateMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handleRestore = async (item: MeetingType) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${item.meeting_type_name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await restoreMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const handlePermanentDelete = async (item: MeetingType) => {
    const confirmed = window.confirm(
      `Permanently delete "${item.meeting_type_name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await permanentDeleteMeetingType(item.meeting_type_id);
      setMessage(response.message);
      await loadMeetingTypes();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("active");
    setSortBy("meeting_type_id");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Audit Meetings
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Meeting Type
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Create and maintain reusable meeting types for Meeting Master dropdown selection.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Create Meeting Type
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search meeting type..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />

          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadMeetingTypes()}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isFormOpen ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              {selectedItem ? "Edit Meeting Type" : "Create Meeting Type"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Meeting Type Name *
              </span>
              <input
                value={form.meeting_type_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    meeting_type_name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                maxLength={100}
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : selectedItem ? "Update" : "Save"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-600">
            Total records: <span className="font-semibold">{total}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("meeting_type_id");
                      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
                    }}
                  >
                    ID
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("meeting_type_name");
                      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
                    }}
                  >
                    Meeting Type Name
                  </button>
                </th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                    No meeting type found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.meeting_type_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{item.meeting_type_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {item.meeting_type_name}
                    </td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">
                      {item.is_active ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        {item.is_active ? (
                          <button
                            type="button"
                            onClick={() => void handleDeactivate(item)}
                            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            Inactive
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleRestore(item)}
                              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => void handlePermanentDelete(item)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              Permanent Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
''')

print(f"Backup saved at: {backup}")
print("C25.3-A meeting_type patch completed.")
