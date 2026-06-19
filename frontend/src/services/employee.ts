
// E:\Audit\AMS\frontend\src\services\employee.ts

import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeUpdatePayload,
} from "@/types/employee";

type EmployeeListResponse =
  | Employee[]
  | {
      data?: Employee[];
      items?: Employee[];
      results?: Employee[];
      employees?: Employee[];
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

const normalizeEmployees = (response: EmployeeListResponse): Employee[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.employees)) return response.employees;

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

export const getEmployeeMediaUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  try {
    const origin = new URL(apiUrl).origin;
    return `${origin}${url}`;
  } catch {
    return url;
  }
};

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await fetch("/api/employees?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to load employees"));
  }

  const data = (await response.json()) as EmployeeListResponse;
  return normalizeEmployees(data);
};

export const createEmployee = async (
  payload: EmployeeCreatePayload
): Promise<Employee> => {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to create employee"));
  }

  const data = await response.json();
  return data.data ?? data;
};

export const updateEmployee = async (
  id: number,
  payload: EmployeeUpdatePayload
): Promise<Employee> => {
  const response = await fetch(`/api/employees/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to update employee"));
  }

  const data = await response.json();
  return data.data ?? data;
};

export const deactivateEmployee = async (id: number): Promise<Employee> => {
  const response = await fetch(`/api/employees/${id}/inactive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to mark employee inactive")
    );
  }

  const data = await response.json();
  return data.data ?? data;
};

export const restoreEmployee = async (id: number): Promise<Employee> => {
  const response = await fetch(`/api/employees/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to restore employee"));
  }

  const data = await response.json();
  return data.data ?? data;
};

export const permanentlyDeleteEmployee = async (id: number): Promise<void> => {
  const response = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(
      await getApiErrorMessage(response, "Failed to permanently delete employee")
    );
  }
};

export const uploadEmployeePhoto = async (
  id: number,
  file: File
): Promise<Employee> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/employees/${id}/photo`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to upload photo"));
  }

  const data = await response.json();
  return data.data ?? data;
};

export const deleteEmployeePhoto = async (id: number): Promise<Employee> => {
  const response = await fetch(`/api/employees/${id}/photo`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Failed to delete photo"));
  }

  const data = await response.json();
  return data.data ?? data;
};