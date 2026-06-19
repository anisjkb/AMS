
// E:\Audit\AMS\frontend\src\services\department.ts

import type {
  Department,
  DepartmentCreatePayload,
} from "@/types/department";

type DepartmentListResponse =
  | Department[]
  | {
      data?: Department[];
      items?: Department[];
      results?: Department[];
      departments?: Department[];
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

const normalizeDepartments = (
  response: DepartmentListResponse
): Department[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.departments)) return response.departments;

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

export const getDepartments = async (): Promise<Department[]> => {
  const response = await fetch("/api/departments?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to load departments")
    );
  }

  const data = (await response.json()) as DepartmentListResponse;
  return normalizeDepartments(data);
};

export const createDepartment = async (
  payload: DepartmentCreatePayload
): Promise<Department> => {
  const response = await fetch("/api/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to create department")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const updateDepartment = async (
  id: number,
  payload: DepartmentCreatePayload
): Promise<Department> => {
  const response = await fetch(`/api/departments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to update department")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const deactivateDepartment = async (
  id: number
): Promise<Department> => {
  const response = await fetch(`/api/departments/${id}/inactive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to mark department inactive")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const restoreDepartment = async (id: number): Promise<Department> => {
  const response = await fetch(`/api/departments/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to restore department")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const permanentlyDeleteDepartment = async (
  id: number
): Promise<void> => {
  const response = await fetch(`/api/departments/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Failed to permanently delete department"
      )
    );
  }
};