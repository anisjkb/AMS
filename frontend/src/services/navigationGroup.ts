import type {
  NavigationGroupListResponse,
  NavigationGroupQueryParams,
  NavigationGroupStatusFilter,
  NavigationGroupVisibilityFilter,
} from "@/types/navigationGroup";

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

const requestJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const getIsActiveParam = (status?: NavigationGroupStatusFilter) => {
  if (status === "active") return "true";
  if (status === "inactive") return "false";
  return null;
};

const getIsVisibleParam = (visibility?: NavigationGroupVisibilityFilter) => {
  if (visibility === "visible") return "true";
  if (visibility === "hidden") return "false";
  return null;
};

const buildNavigationGroupQuery = (
  params: NavigationGroupQueryParams = {}
) => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("page_size", String(params.pageSize ?? 100));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
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

export const getNavigationGroupsPage = async (
  params: NavigationGroupQueryParams = {}
): Promise<NavigationGroupListResponse> => {
  return requestJson<NavigationGroupListResponse>(
    `/api/backend/navigation-groups?${buildNavigationGroupQuery(params)}`
  );
};

export const getAllNavigationGroups = async (
  params: Omit<NavigationGroupQueryParams, "page" | "pageSize"> = {}
): Promise<NavigationGroupListResponse> => {
  const firstPage = await getNavigationGroupsPage({
    ...params,
    page: 1,
    pageSize: 100,
  });

  if (firstPage.total_pages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      getNavigationGroupsPage({
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
