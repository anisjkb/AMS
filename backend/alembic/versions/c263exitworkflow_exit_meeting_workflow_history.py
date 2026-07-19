"""Add Exit Meeting Maker-Checker workflow and snapshot history.

Revision ID: c263exitworkflow
Revises: c262exitlockfix
Create Date: 2026-07-14
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "c263exitworkflow"
down_revision = "c262exitlockfix"
branch_labels = None
depends_on = None


WORKFLOW_STATES = (
    "draft",
    "pending_lock_approval",
    "locked",
    "pending_unlock_approval",
    "unlocked_for_edit",
    "pending_relock_approval",
    "changes_requested",
)

UNLOCK_REQUEST_STATES = (
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
    "expired",
)

SNAPSHOT_KINDS = (
    "initial_lock",
    "relock",
    "legacy_import",
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table(
        "exit_meeting_minutes"
    ):
        raise RuntimeError(
            "exit_meeting_minutes table was not found."
        )

    # -------------------------------------------------
    # Main Exit Meeting workflow fields
    # -------------------------------------------------

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "workflow_status",
            sa.String(length=40),
            nullable=False,
            server_default="draft",
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "workflow_version",
            sa.Integer(),
            nullable=False,
            server_default="1",
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "unlock_cycle_number",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "submitted_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "reviewed_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "review_note",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "current_edit_scope",
            postgresql.JSONB(
                astext_type=sa.Text()
            ),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "edit_approved_until",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "last_workflow_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "last_workflow_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.create_check_constraint(
        "ck_exit_meeting_minutes_workflow_status",
        "exit_meeting_minutes",
        (
            "workflow_status in ("
            "'draft', "
            "'pending_lock_approval', "
            "'locked', "
            "'pending_unlock_approval', "
            "'unlocked_for_edit', "
            "'pending_relock_approval', "
            "'changes_requested'"
            ")"
        ),
    )

    op.create_check_constraint(
        "ck_exit_meeting_minutes_workflow_version",
        "exit_meeting_minutes",
        "workflow_version > 0",
    )

    op.create_check_constraint(
        "ck_exit_meeting_minutes_unlock_cycle",
        "exit_meeting_minutes",
        "unlock_cycle_number >= 0",
    )

    op.create_index(
        "ix_exit_meeting_minutes_workflow_status",
        "exit_meeting_minutes",
        ["workflow_status"],
        unique=False,
    )

    # -------------------------------------------------
    # Immutable snapshot history
    # -------------------------------------------------

    op.create_table(
        "exit_meeting_minute_snapshots",
        sa.Column(
            "snapshot_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
        ),
        sa.Column(
            "minute_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "snapshot_version",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "snapshot_kind",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "snapshot_data",
            postgresql.JSONB(
                astext_type=sa.Text()
            ),
            nullable=False,
        ),
        sa.Column(
            "snapshot_hash",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "template_key",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "template_version",
            sa.String(length=30),
            nullable=True,
        ),
        sa.Column(
            "source_unlock_request_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "locked_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "approved_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "locked_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "lock_reason",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "is_current",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["minute_id"],
            ["exit_meeting_minutes.minute_id"],
            name="fk_exit_snapshot_minute",
            ondelete="CASCADE",
        ),
        sa.CheckConstraint(
            "snapshot_version > 0",
            name="ck_exit_snapshot_version",
        ),
        sa.CheckConstraint(
            (
                "snapshot_kind in ("
                "'initial_lock', "
                "'relock', "
                "'legacy_import'"
                ")"
            ),
            name="ck_exit_snapshot_kind",
        ),
        sa.UniqueConstraint(
            "minute_id",
            "snapshot_version",
            name="uq_exit_snapshot_minute_version",
        ),
    )

    op.create_index(
        "ix_exit_snapshot_minute_locked_at",
        "exit_meeting_minute_snapshots",
        ["minute_id", "locked_at"],
        unique=False,
    )

    op.create_index(
        "uq_exit_snapshot_current",
        "exit_meeting_minute_snapshots",
        ["minute_id"],
        unique=True,
        postgresql_where=sa.text(
            "is_current = true"
        ),
    )

    # -------------------------------------------------
    # Unlock request Maker-Checker table
    # -------------------------------------------------

    op.create_table(
        "exit_meeting_minute_unlock_requests",
        sa.Column(
            "request_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
        ),
        sa.Column(
            "minute_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "request_status",
            sa.String(length=30),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "request_reason",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "edit_scope",
            postgresql.JSONB(
                astext_type=sa.Text()
            ),
            nullable=False,
        ),
        sa.Column(
            "requested_by_user_id",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "requested_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "reviewed_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "review_comment",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "approved_until",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "cancelled_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "created_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "updated_by",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["minute_id"],
            ["exit_meeting_minutes.minute_id"],
            name="fk_exit_unlock_request_minute",
            ondelete="CASCADE",
        ),
        sa.CheckConstraint(
            (
                "request_status in ("
                "'pending', "
                "'approved', "
                "'rejected', "
                "'cancelled', "
                "'completed', "
                "'expired'"
                ")"
            ),
            name="ck_exit_unlock_request_status",
        ),
    )

    op.create_index(
        "ix_exit_unlock_request_minute_status",
        "exit_meeting_minute_unlock_requests",
        ["minute_id", "request_status"],
        unique=False,
    )

    op.create_index(
        "ix_exit_unlock_request_requester",
        "exit_meeting_minute_unlock_requests",
        ["requested_by_user_id", "requested_at"],
        unique=False,
    )

    op.create_index(
        "uq_exit_unlock_request_open",
        "exit_meeting_minute_unlock_requests",
        ["minute_id"],
        unique=True,
        postgresql_where=sa.text(
            "request_status in ('pending', 'approved') "
            "and is_active = true"
        ),
    )

    # -------------------------------------------------
    # Current snapshot/request references on main row
    # -------------------------------------------------

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "current_snapshot_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "exit_meeting_minutes",
        sa.Column(
            "current_unlock_request_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_exit_minute_current_snapshot",
        "exit_meeting_minutes",
        "exit_meeting_minute_snapshots",
        ["current_snapshot_id"],
        ["snapshot_id"],
        ondelete="SET NULL",
    )

    op.create_foreign_key(
        "fk_exit_minute_current_unlock_request",
        "exit_meeting_minutes",
        "exit_meeting_minute_unlock_requests",
        ["current_unlock_request_id"],
        ["request_id"],
        ondelete="SET NULL",
    )

    # Add the snapshot-to-unlock-request FK after both
    # related tables exist.
    op.create_foreign_key(
        "fk_exit_snapshot_unlock_request",
        "exit_meeting_minute_snapshots",
        "exit_meeting_minute_unlock_requests",
        ["source_unlock_request_id"],
        ["request_id"],
        ondelete="SET NULL",
    )

    # -------------------------------------------------
    # Append-only workflow event history
    # -------------------------------------------------

    op.create_table(
        "exit_meeting_minute_workflow_events",
        sa.Column(
            "event_id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True,
        ),
        sa.Column(
            "minute_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "unlock_request_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "snapshot_id",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "event_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "from_status",
            sa.String(length=40),
            nullable=True,
        ),
        sa.Column(
            "to_status",
            sa.String(length=40),
            nullable=False,
        ),
        sa.Column(
            "event_comment",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "event_payload",
            postgresql.JSONB(
                astext_type=sa.Text()
            ),
            nullable=True,
        ),
        sa.Column(
            "performed_by_user_id",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "performed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["minute_id"],
            ["exit_meeting_minutes.minute_id"],
            name="fk_exit_workflow_event_minute",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["unlock_request_id"],
            [
                "exit_meeting_minute_unlock_requests."
                "request_id"
            ],
            name="fk_exit_workflow_event_unlock_request",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["snapshot_id"],
            ["exit_meeting_minute_snapshots.snapshot_id"],
            name="fk_exit_workflow_event_snapshot",
            ondelete="SET NULL",
        ),
    )

    op.create_index(
        "ix_exit_workflow_event_minute_time",
        "exit_meeting_minute_workflow_events",
        ["minute_id", "performed_at"],
        unique=False,
    )

    op.create_index(
        "ix_exit_workflow_event_type",
        "exit_meeting_minute_workflow_events",
        ["event_type"],
        unique=False,
    )

    # -------------------------------------------------
    # Existing data backfill
    # -------------------------------------------------

    bind.execute(
        sa.text(
            """
            update exit_meeting_minutes
            set
                workflow_status = case
                    when is_locked = true
                        then 'locked'
                    else 'draft'
                end,
                workflow_version = 1,
                unlock_cycle_number = 0,
                last_workflow_by_user_id =
                    coalesce(
                        locked_by_user_id,
                        updated_by,
                        created_by
                    ),
                last_workflow_at =
                    coalesce(
                        locked_at,
                        updated_at,
                        created_at
                    )
            """
        )
    )

    bind.execute(
        sa.text(
            """
            insert into exit_meeting_minute_snapshots (
                minute_id,
                snapshot_version,
                snapshot_kind,
                snapshot_data,
                snapshot_hash,
                template_key,
                template_version,
                locked_by_user_id,
                approved_by_user_id,
                locked_at,
                lock_reason,
                is_current,
                created_by,
                created_at
            )
            select
                minute_id,
                greatest(
                    coalesce(snapshot_version, 1),
                    1
                ),
                'legacy_import',
                snapshot_data,
                snapshot_hash,
                template_key,
                template_version,
                locked_by_user_id,
                locked_by_user_id,
                coalesce(
                    locked_at,
                    updated_at,
                    created_at,
                    now()
                ),
                (
                    'Imported from the existing '
                    'locked Exit Meeting Minutes record.'
                ),
                true,
                coalesce(
                    locked_by_user_id,
                    updated_by,
                    created_by,
                    'system'
                ),
                coalesce(
                    locked_at,
                    updated_at,
                    created_at,
                    now()
                )
            from exit_meeting_minutes
            where is_locked = true
              and snapshot_data is not null
              and snapshot_hash is not null
            """
        )
    )

    bind.execute(
        sa.text(
            """
            update exit_meeting_minutes minute
            set current_snapshot_id =
                snapshot.snapshot_id
            from exit_meeting_minute_snapshots snapshot
            where snapshot.minute_id =
                    minute.minute_id
              and snapshot.is_current = true
            """
        )
    )

    bind.execute(
        sa.text(
            """
            insert into
                exit_meeting_minute_workflow_events (
                    minute_id,
                    snapshot_id,
                    event_type,
                    from_status,
                    to_status,
                    event_comment,
                    event_payload,
                    performed_by_user_id,
                    performed_at,
                    created_at
                )
            select
                minute.minute_id,
                snapshot.snapshot_id,
                'legacy_lock_imported',
                null,
                'locked',
                (
                    'Existing locked record imported '
                    'into Maker-Checker workflow history.'
                ),
                jsonb_build_object(
                    'source',
                    'c263exitworkflow migration',
                    'snapshot_version',
                    minute.snapshot_version
                ),
                coalesce(
                    minute.locked_by_user_id,
                    minute.updated_by,
                    minute.created_by,
                    'system'
                ),
                coalesce(
                    minute.locked_at,
                    minute.updated_at,
                    minute.created_at,
                    now()
                ),
                now()
            from exit_meeting_minutes minute
            left join
                exit_meeting_minute_snapshots snapshot
              on snapshot.minute_id =
                    minute.minute_id
             and snapshot.is_current = true
            where minute.is_locked = true
            """
        )
    )


def downgrade() -> None:
    op.drop_index(
        "ix_exit_workflow_event_type",
        table_name=(
            "exit_meeting_minute_workflow_events"
        ),
    )

    op.drop_index(
        "ix_exit_workflow_event_minute_time",
        table_name=(
            "exit_meeting_minute_workflow_events"
        ),
    )

    op.drop_table(
        "exit_meeting_minute_workflow_events"
    )

    op.drop_constraint(
        "fk_exit_minute_current_unlock_request",
        "exit_meeting_minutes",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_exit_minute_current_snapshot",
        "exit_meeting_minutes",
        type_="foreignkey",
    )

    op.drop_column(
        "exit_meeting_minutes",
        "current_unlock_request_id",
    )

    op.drop_column(
        "exit_meeting_minutes",
        "current_snapshot_id",
    )

    op.drop_constraint(
        "fk_exit_snapshot_unlock_request",
        "exit_meeting_minute_snapshots",
        type_="foreignkey",
    )

    op.drop_index(
        "uq_exit_unlock_request_open",
        table_name=(
            "exit_meeting_minute_unlock_requests"
        ),
    )

    op.drop_index(
        "ix_exit_unlock_request_requester",
        table_name=(
            "exit_meeting_minute_unlock_requests"
        ),
    )

    op.drop_index(
        "ix_exit_unlock_request_minute_status",
        table_name=(
            "exit_meeting_minute_unlock_requests"
        ),
    )

    op.drop_table(
        "exit_meeting_minute_unlock_requests"
    )

    op.drop_index(
        "uq_exit_snapshot_current",
        table_name=(
            "exit_meeting_minute_snapshots"
        ),
    )

    op.drop_index(
        "ix_exit_snapshot_minute_locked_at",
        table_name=(
            "exit_meeting_minute_snapshots"
        ),
    )

    op.drop_table(
        "exit_meeting_minute_snapshots"
    )

    op.drop_index(
        "ix_exit_meeting_minutes_workflow_status",
        table_name="exit_meeting_minutes",
    )

    op.drop_constraint(
        "ck_exit_meeting_minutes_unlock_cycle",
        "exit_meeting_minutes",
        type_="check",
    )

    op.drop_constraint(
        "ck_exit_meeting_minutes_workflow_version",
        "exit_meeting_minutes",
        type_="check",
    )

    op.drop_constraint(
        "ck_exit_meeting_minutes_workflow_status",
        "exit_meeting_minutes",
        type_="check",
    )

    for column_name in (
        "last_workflow_at",
        "last_workflow_by_user_id",
        "edit_approved_until",
        "current_edit_scope",
        "review_note",
        "reviewed_at",
        "reviewed_by_user_id",
        "submitted_at",
        "submitted_by_user_id",
        "unlock_cycle_number",
        "workflow_version",
        "workflow_status",
    ):
        op.drop_column(
            "exit_meeting_minutes",
            column_name,
        )
