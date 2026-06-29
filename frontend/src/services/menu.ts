import type {
  Menu,
  MenuCreatePayload,
  MenuListResponse,
  MenuMessageResponse,
  MenuQueryParams,
  MenuStatusFilter,
  MenuVisibilityFilter,
  MenuUpdatePayload,
} from "@/types/menu";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

const getErrorMessage = async (response: Response) => {
  try {
    const data: {
      detail?: string | ApiValidationError[];
      message?: string;
    } = await response.json();

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => item.msg || item.message || "Validation error")
        .join(", ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    return "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
};

const requestJson = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const getIsActiveParam = (status?: MenuStatusFilter) => {
  if (status === "active") return "true";
  if (status === "inactive") return "false";
  return null;
};

const getIsVisibleParam = (visibility?: MenuVisibilityFilter) => {
  if (visibility === "visible") return "true";
  if (visibility === "hidden") return "false";
  return null;
};

const buildMenuQuery = (params: MenuQueryParams = {}) => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.pageSize ?? 20));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.navigationGroupId) {
    searchParams.set("navigation_group_id", String(params.navigationGroupId));
  }

  if (params.parentMenuId) {
    searchParams.set("parent_menu_id", String(params.parentMenuId));
  }

  const isActive = getIsActiveParam(params.status);
  if (isActive !== null) {
    searchParams.set("is_active", isActive);
  }

  const isVisible = getIsVisibleParam(params.visibility);
  if (isVisible !== null) {
    searchParams.set("is_visible", isVisible);
  }

  searchParams.set("sort_by", params.sortBy ?? "sort_order");
  searchParams.set("sort_order", params.sortOrder ?? "asc");

  return searchParams.toString();
};

export const getMenusPage = async (
  params: MenuQueryParams = {}
): Promise<MenuListResponse> => {
  return requestJson<MenuListResponse>(`/api/backend/menus?${buildMenuQuery(params)}`);
};

export const getAllMenus = async (
  params: Omit<MenuQueryParams, "page" | "pageSize"> = {}
): Promise<MenuListResponse> => {
  const firstPage = await getMenusPage({
    ...params,
    page: 1,
    pageSize: 100,
  });

  if (firstPage.total_pages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      getMenusPage({
        ...params,
        page: index + 2,
        pageSize: 100,
      })
    )
  );

  return {
    ...firstPage,
    items: [
      ...firstPage.items,
      ...remainingPages.flatMap((response) => response.items),
    ],
  };
};

export const createMenu = async (
  payload: MenuCreatePayload
): Promise<MenuMessageResponse> => {
  return requestJson<MenuMessageResponse>("/api/backend/menus", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateMenu = async (
  menuId: number,
  payload: MenuUpdatePayload
): Promise<MenuMessageResponse> => {
  return requestJson<MenuMessageResponse>(`/api/backend/menus/${menuId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateMenu = async (
  menuId: number
): Promise<MenuMessageResponse> => {
  return requestJson<MenuMessageResponse>(`/api/backend/menus/${menuId}`, {
    method: "DELETE",
  });
};

export const restoreMenu = async (
  menuId: number
): Promise<MenuMessageResponse> => {
  return requestJson<MenuMessageResponse>(
    `/api/backend/menus/${menuId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteMenu = async (
  menuId: number
): Promise<MenuMessageResponse> => {
  return requestJson<MenuMessageResponse>(
    `/api/backend/menus/${menuId}/permanent`,
    {
      method: "DELETE",
    }
  );
};

export const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const normalizeOptionalNumber = (value: string) => {
  return value ? Number(value) : null;
};

export const getMenuDisplayPath = (menu: Menu) => {
  return menu.route_path || "Parent / Container";
};
