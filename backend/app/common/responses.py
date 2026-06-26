from typing import Any


def success_response(
    *,
    message: str = "Operation successful.",
    data: Any = None,
) -> dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(
    *,
    message: str = "Operation failed.",
    details: Any = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "details": details,
    }
