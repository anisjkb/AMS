from typing import Literal


SortOrder = Literal["asc", "desc"]


def normalize_search(search: str | None) -> str | None:
    if search is None:
        return None

    cleaned = search.strip()

    return cleaned if cleaned else None


def normalize_sort_order(sort_order: str | None) -> SortOrder:
    if not sort_order:
        return "asc"

    return "desc" if sort_order.lower() == "desc" else "asc"


def status_to_is_active(status: str | None) -> bool | None:
    if not status:
        return None

    normalized = status.strip().lower()

    if normalized == "active":
        return True

    if normalized == "inactive":
        return False

    return None
