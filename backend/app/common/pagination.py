from dataclasses import dataclass
from math import ceil
from typing import Any


DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100


@dataclass(frozen=True)
class PaginationParams:
    page: int
    page_size: int
    offset: int
    limit: int


def normalize_pagination(
    page: int = DEFAULT_PAGE,
    page_size: int = DEFAULT_PAGE_SIZE,
    max_page_size: int = MAX_PAGE_SIZE,
) -> PaginationParams:
    safe_page = max(page or DEFAULT_PAGE, 1)
    safe_page_size = page_size or DEFAULT_PAGE_SIZE
    safe_page_size = max(1, min(safe_page_size, max_page_size))

    offset = (safe_page - 1) * safe_page_size

    return PaginationParams(
        page=safe_page,
        page_size=safe_page_size,
        offset=offset,
        limit=safe_page_size,
    )


def calculate_total_pages(total: int, page_size: int) -> int:
    if total <= 0:
        return 0

    if page_size <= 0:
        return 1

    return ceil(total / page_size)


def build_paginated_response(
    *,
    items: list[Any],
    total: int,
    page: int,
    page_size: int,
) -> dict[str, Any]:
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": calculate_total_pages(total, page_size),
    }
