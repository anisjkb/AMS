from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class User(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    employee_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "employees.id",
            ondelete="RESTRICT",
        ),
        unique=True,
        index=True,
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
