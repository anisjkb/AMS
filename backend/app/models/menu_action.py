from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class MenuAction(IntegerPrimaryKeyMixin, ActiveStatusMixin, AuditMixin, Base):
    __tablename__ = "menu_actions"

    menu_id: Mapped[int] = mapped_column(
        ForeignKey("menus.id"),
        nullable=False,
        index=True,
    )

    action_key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    action_title: Mapped[str] = mapped_column(String(100), nullable=False)

    permission_key: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )

    button_color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    button_icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_visible: Mapped[bool] = mapped_column(nullable=False, default=True)