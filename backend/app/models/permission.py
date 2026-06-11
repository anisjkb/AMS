from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, UUIDPrimaryKeyMixin


class Permission(UUIDPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "permissions"

    permission_key: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    resource_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    resource_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    action: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
