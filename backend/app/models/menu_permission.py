from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class MenuPermission(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "menu_permissions"

    menu_id: Mapped[int] = mapped_column(
        ForeignKey("menus.id"),
        nullable=False,
        index=True,
    )

    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.id"),
        nullable=False,
        index=True,
    )