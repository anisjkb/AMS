from typing import Any


def get_actor_id(current_user: Any) -> str | None:
    user_id = getattr(current_user, "user_id", None)

    if isinstance(user_id, str) and user_id.strip():
        return user_id

    fallback_id = getattr(current_user, "id", None)

    if fallback_id is not None:
        return str(fallback_id)

    return None


def with_create_audit_fields(
    data: dict[str, Any],
    current_user: Any,
) -> dict[str, Any]:
    actor_id = get_actor_id(current_user)

    return {
        **data,
        "created_by": actor_id,
        "updated_by": actor_id,
    }


def with_update_audit_fields(
    data: dict[str, Any],
    current_user: Any,
) -> dict[str, Any]:
    actor_id = get_actor_id(current_user)

    return {
        **data,
        "updated_by": actor_id,
    }
