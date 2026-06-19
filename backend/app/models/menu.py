from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class Menu(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "menus"

    navigation_group_id: Mapped[int | None] = mapped_column(
        ForeignKey("navigation_groups.id"),
        nullable=True,
        index=True,
    )

    parent_menu_id: Mapped[int | None] = mapped_column(
        ForeignKey("menus.id"),
        nullable=True,
        index=True,
    )

    menu_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    menu_title: Mapped[str] = mapped_column(String(150), nullable=False)
    route_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)

    permission_key: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
        index=True,
    )

    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    menu_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_expandable: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_visible: Mapped[bool] = mapped_column(nullable=False, default=True)