import type {
  NavigationGroupCreatePayload,
  NavigationGroupListResponse,
  NavigationGroupMessageResponse,
  NavigationGroupQueryParams,
  NavigationGroupRecord,
  NavigationGroupUpdatePayload,
} from "@/types/navigationGroup";

type ApiValidationError = {
  msg?: string;
  message?: string;
};

const BASE_URL = "/api/backend/navigation-groups";

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

  return response.json() as Promise<T>;
};

const buildQuery = (params: NavigationGroupQueryParams = {}) => {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("page_size", String(params.pageSize ?? 20));
  query.set("sort_by", params.sortBy ?? "sort_order");
  query.set("sort_order", params.sortOrder ?? "asc");

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.parentGroupId) {
    query.set("parent_group_id", String(params.parentGroupId));
  }

  if (params.visibility === "visible") {
    query.set("is_visible", "true");
  }

  if (params.visibility === "hidden") {
    query.set("is_visible", "false");
  }

  if (params.status === "active") {
    query.set("is_active", "true");
  }

  if (params.status === "inactive") {
    query.set("is_active", "false");
  }

  return query.toString();
};

export const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || null;
};

export const normalizeOptionalNumber = (value: string) => {
  if (!value.trim()) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getNavigationGroupsPage = async (
  params: NavigationGroupQueryParams = {}
): Promise<NavigationGroupListResponse> => {
  return requestJson<NavigationGroupListResponse>(
    `${BASE_URL}?${buildQuery(params)}`
  );
};

export const getAllNavigationGroups = async (
  params: Omit<NavigationGroupQueryParams, "page" | "pageSize"> = {}
): Promise<NavigationGroupListResponse> => {
  return getNavigationGroupsPage({
    ...params,
    page: 1,
    pageSize: 100,
  });
};

export const createNavigationGroup = async (
  payload: NavigationGroupCreatePayload
): Promise<NavigationGroupMessageResponse> => {
  return requestJson<NavigationGroupMessageResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateNavigationGroup = async (
  groupId: number,
  payload: NavigationGroupUpdatePayload
): Promise<NavigationGroupMessageResponse> => {
  return requestJson<NavigationGroupMessageResponse>(`${BASE_URL}/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deactivateNavigationGroup = async (
  groupId: number
): Promise<NavigationGroupMessageResponse> => {
  return requestJson<NavigationGroupMessageResponse>(`${BASE_URL}/${groupId}`, {
    method: "DELETE",
  });
};

export const restoreNavigationGroup = async (
  groupId: number
): Promise<NavigationGroupMessageResponse> => {
  return requestJson<NavigationGroupMessageResponse>(
    `${BASE_URL}/${groupId}/restore`,
    {
      method: "PATCH",
    }
  );
};

export const permanentlyDeleteNavigationGroup = async (
  groupId: number
): Promise<NavigationGroupMessageResponse> => {
  return requestJson<NavigationGroupMessageResponse>(
    `${BASE_URL}/${groupId}/permanent`,
    {
      method: "DELETE",
    }
  );
};

export const getGroupDisplayName = (group: NavigationGroupRecord) => {
  return `${group.group_title} (${group.group_key})`;
};
