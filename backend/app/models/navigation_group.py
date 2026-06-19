from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class NavigationGroup(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "navigation_groups"

    group_key: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    group_title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    group_icon: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    parent_group_id: Mapped[int | None] = mapped_column(
        ForeignKey("navigation_groups.id"),
        nullable=True,
        index=True,
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    is_collapsible: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
    )

    is_visible: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
    )

    group_badge: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    group_color: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    group_permission_key: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )