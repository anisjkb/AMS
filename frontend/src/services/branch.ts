import type { Branch, BranchCreatePayload } from "@/types/branch";

type BranchListResponse =
  | Branch[]
  | {
      data?: Branch[];
      items?: Branch[];
      results?: Branch[];
      branches?: Branch[];
    };

type ApiErrorItem = {
  msg?: string;
  loc?: Array<string | number>;
  type?: string;
};

type ApiErrorResponse = {
  detail?: string | ApiErrorItem[] | Record<string, unknown>;
  message?: string;
};

const normalizeBranches = (response: BranchListResponse): Branch[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.branches)) return response.branches;

  return [];
};

const getApiErrorMessage = async (
  response: Response,
  fallbackMessage: string
): Promise<string> => {
  const error = (await response.json().catch(() => ({}))) as ApiErrorResponse;

  if (typeof error.message === "string") {
    return error.message;
  }

  if (typeof error.detail === "string") {
    return error.detail;
  }

  if (Array.isArray(error.detail)) {
    return error.detail
      .map((item) => {
        const field = item.loc?.[item.loc.length - 1];
        const message = item.msg || fallbackMessage;

        return field ? `${String(field)}: ${message}` : message;
      })
      .join(", ");
  }

  return fallbackMessage;
};

export const getBranches = async (): Promise<Branch[]> => {
  const response = await fetch("/api/branches?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to load branches")
    );
  }

  const data = (await response.json()) as BranchListResponse;
  return normalizeBranches(data);
};

export const createBranch = async (
  payload: BranchCreatePayload
): Promise<Branch> => {
  const response = await fetch("/api/branches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create branch")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const updateBranch = async (
  id: number,
  payload: BranchCreatePayload
): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update branch")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const deactivateBranch = async (id: number): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}/inactive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to mark branch inactive")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const restoreBranch = async (id: number): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to restore branch")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const permanentlyDeleteBranch = async (id: number): Promise<void> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to permanently delete branch")
    );
  }
};