"""mark acceptance questions as required

Revision ID: c269acceptrequired
Revises: c268acceptworkflow
Create Date: 2026-07-25
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "c269acceptrequired"
down_revision: str | None = "c268acceptworkflow"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


TARGET_TEMPLATE_KEY = 'client_acceptance_procedures'
TARGET_TEMPLATE_VERSION = '1.0'

TARGET_ITEM_KEYS = ('question_01_a_i',
 'question_01_a_ii',
 'question_01_b',
 'question_01_c',
 'question_02_a',
 'question_02_b',
 'question_03',
 'question_04',
 'question_05',
 'question_06_a',
 'question_06_b',
 'question_07',
 'question_08_a',
 'question_08_b',
 'question_08_c',
 'question_08_d',
 'question_09',
 'question_10_a',
 'question_10_b',
 'question_10_c',
 'question_10_d',
 'question_10_e',
 'question_10_f',
 'question_10_g_i',
 'question_10_g_ii',
 'question_10_g_iii',
 'question_10_g_iv',
 'question_10_h',
 'question_11',
 'question_12_a',
 'question_12_b',
 'question_13_a',
 'question_13_b')


def _get_template_id(bind) -> int:
    rows = bind.execute(
        sa.text(
            """
            select template_id
            from audit_accept_templates
            where template_key = :template_key
              and version = :template_version
            order by template_id
            """
        ),
        {
            "template_key": TARGET_TEMPLATE_KEY,
            "template_version": TARGET_TEMPLATE_VERSION,
        },
    ).scalars().all()

    if len(rows) != 1:
        raise RuntimeError(
            "Expected exactly one matching Acceptance "
            "template."
        )

    return int(rows[0])


def _target_count(
    bind,
    template_id: int,
    required_value: bool | None = None,
) -> int:
    required_clause = ""

    if required_value is True:
        required_clause = "and is_required = true"
    elif required_value is False:
        required_clause = "and is_required = false"

    statement = sa.text(
        f"""
        select count(*)
        from audit_accept_items
        where template_id = :template_id
          and response_type = 'yes_no'
          and item_key in :item_keys
          {required_clause}
        """
    ).bindparams(
        sa.bindparam(
            "item_keys",
            expanding=True,
        )
    )

    value = bind.execute(
        statement,
        {
            "template_id": template_id,
            "item_keys": list(TARGET_ITEM_KEYS),
        },
    ).scalar_one()

    return int(value or 0)


def _update_required(
    bind,
    template_id: int,
    value: bool,
) -> None:
    statement = sa.text(
        """
        update audit_accept_items
        set is_required = :required_value,
            updated_at = now()
        where template_id = :template_id
          and response_type = 'yes_no'
          and item_key in :item_keys
        """
    ).bindparams(
        sa.bindparam(
            "item_keys",
            expanding=True,
        )
    )

    bind.execute(
        statement,
        {
            "template_id": template_id,
            "item_keys": list(TARGET_ITEM_KEYS),
            "required_value": value,
        },
    )


def upgrade() -> None:
    """Require the 33 seeded Acceptance questions."""

    bind = op.get_bind()
    template_id = _get_template_id(bind)

    matched_count = _target_count(
        bind,
        template_id,
    )

    optional_count = _target_count(
        bind,
        template_id,
        required_value=False,
    )

    if matched_count != 33:
        raise RuntimeError(
            "Expected 33 matching Acceptance questions."
        )

    if optional_count != 33:
        raise RuntimeError(
            "C269 expected all targeted questions "
            "to be optional before upgrade."
        )

    _update_required(
        bind,
        template_id,
        True,
    )

    required_count = _target_count(
        bind,
        template_id,
        required_value=True,
    )

    if required_count != 33:
        raise RuntimeError(
            "C269 failed to mark all 33 questions required."
        )


def downgrade() -> None:
    """Restore the 33 seeded questions as optional."""

    bind = op.get_bind()
    template_id = _get_template_id(bind)

    matched_count = _target_count(
        bind,
        template_id,
    )

    if matched_count != 33:
        raise RuntimeError(
            "Expected 33 matching Acceptance questions."
        )

    _update_required(
        bind,
        template_id,
        False,
    )

    optional_count = _target_count(
        bind,
        template_id,
        required_value=False,
    )

    if optional_count != 33:
        raise RuntimeError(
            "C269 downgrade failed to restore "
            "the optional state."
        )
