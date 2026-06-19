// E:\Audit\AMS\frontend\src\services\designation.ts

import type {
  Designation,
  DesignationCreatePayload,
} from "@/types/designation";

type DesignationListResponse =
  | Designation[]
  | {
      data?: Designation[];
      items?: Designation[];
      results?: Designation[];
      designations?: Designation[];
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

const normalizeDesignations = (
  response: DesignationListResponse
): Designation[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.designations)) return response.designations;

  return [];
};

const getApiErrorMessage = async (
  response: Response,
  fallbackMessage: string
): Promise<string> => {
  const error = (await response.json().catch(() => ({}))) as ApiErrorResponse;

  if (typeof error.message === "string") return error.message;
  if (typeof error.detail === "string") return error.detail;

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

export const getDesignations = async (): Promise<Designation[]> => {
  const response = await fetch("/api/designations?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to load designations")
    );
  }

  const data = (await response.json()) as DesignationListResponse;
  return normalizeDesignations(data);
};

export const createDesignation = async (
  payload: DesignationCreatePayload
): Promise<Designation> => {
  const response = await fetch("/api/designations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create designation")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const updateDesignation = async (
  id: number,
  payload: DesignationCreatePayload
): Promise<Designation> => {
  const response = await fetch(`/api/designations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update designation")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const deactivateDesignation = async (
  id: number
): Promise<Designation> => {
  const response = await fetch(`/api/designations/${id}/inactive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to mark designation inactive")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const restoreDesignation = async (id: number): Promise<Designation> => {
  const response = await fetch(`/api/designations/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to restore designation")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const permanentlyDeleteDesignation = async (
  id: number
): Promise<void> => {
  const response = await fetch(`/api/designations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Failed to permanently delete designation"
      )
    );
  }
};