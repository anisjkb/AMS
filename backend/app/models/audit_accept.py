from datetime import date

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import ActiveStatusMixin, AuditMixin, Base


class AuditAcceptTemplate(
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_accept_templates"

    __table_args__ = (
        CheckConstraint(
            """
            effective_to IS NULL
            OR effective_from IS NULL
            OR effective_to >= effective_from
            """,
            name="ck_audit_accept_templates_effective_dates",
        ),
        UniqueConstraint(
            "template_key",
            "version",
            name="uq_audit_accept_templates_key_version",
        ),
        Index(
            "ix_audit_accept_templates_is_active",
            "is_active",
        ),
    )

    template_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False,
    )

    template_key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    template_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    reference_no: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    intro_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    effective_from: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    effective_to: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )


class AuditAcceptItem(
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_accept_items"

    __table_args__ = (
        CheckConstraint(
            """
            item_type IN
            (
                'section',
                'question',
                'note',
                'safeguard',
                'conclusion',
                'signature'
            )
            """,
            name="ck_audit_accept_items_item_type",
        ),
        CheckConstraint(
            "response_type IN ('none', 'yes_no')",
            name="ck_audit_accept_items_response_type",
        ),
        CheckConstraint(
            "sort_order >= 0",
            name="ck_audit_accept_items_sort_order",
        ),
        UniqueConstraint(
            "template_id",
            "item_key",
            name="uq_audit_accept_items_template_key",
        ),
        Index(
            "ix_audit_accept_items_template_id",
            "template_id",
        ),
        Index(
            "ix_audit_accept_items_parent_item_id",
            "parent_item_id",
        ),
        Index(
            "ix_audit_accept_items_template_sort",
            "template_id",
            "sort_order",
        ),
        Index(
            "ix_audit_accept_items_template_type_active",
            "template_id",
            "item_type",
            "is_active",
        ),
    )

    item_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False,
    )

    template_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "audit_accept_templates.template_id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    parent_item_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "audit_accept_items.item_id",
            ondelete="RESTRICT",
        ),
        nullable=True,
    )

    item_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    item_key: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    item_no: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    title: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    response_type: Mapped[str] = mapped_column(
        String(20),
        default="none",
        nullable=False,
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_required: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )


class AuditAcceptResponse(
    ActiveStatusMixin,
    AuditMixin,
    Base,
):
    __tablename__ = "audit_accept_responses"

    __table_args__ = (
        CheckConstraint(
            """
            answer_value IS NULL
            OR answer_value IN ('yes', 'no')
            """,
            name="ck_audit_accept_responses_answer_value",
        ),
        UniqueConstraint(
            "audit_id",
            "template_id",
            "item_id",
            name="uq_audit_accept_responses_audit_template_item",
        ),
        Index(
            "ix_audit_accept_responses_audit_id",
            "audit_id",
        ),
        Index(
            "ix_audit_accept_responses_template_id",
            "template_id",
        ),
        Index(
            "ix_audit_accept_responses_item_id",
            "item_id",
        ),
        Index(
            "ix_audit_accept_responses_audit_template",
            "audit_id",
            "template_id",
        ),
    )

    response_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False,
    )

    audit_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "audit_master.audit_id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    template_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "audit_accept_templates.template_id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    item_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "audit_accept_items.item_id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    answer_value: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )