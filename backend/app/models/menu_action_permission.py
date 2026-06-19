from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base, IntegerPrimaryKeyMixin


class MenuActionPermission(
    IntegerPrimaryKeyMixin,
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "menu_action_permissions"

    menu_action_id: Mapped[int] = mapped_column(
        ForeignKey("menu_actions.id"),
        nullable=False,
        index=True,
    )

    permission_id: Mapped[int] = mapped_column(
        ForeignKey("permissions.id"),
        nullable=False,
        index=True,
    )