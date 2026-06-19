ঠিক আছে ✅
Department module-এ যাওয়ার আগে আমরা এবার **আগের ভুলগুলো avoid করে** এগোবো। Company/Branch-এ যেসব issue হয়েছে, Department-এ এগুলো আগেই handle করব:

```text
1. Route alignment আগে confirm
2. Backend schema field আগে confirm
3. Create payload-এ is_active যাবে না
4. Update payload-এ is_active থাকবে
5. Inactive আলাদা proxy দিয়ে backend DELETE route call করবে
6. Permanent delete backend /permanent route call করবে
7. 422/500 error readable message হবে
8. Phone/email থাকলে frontend + backend validation থাকবে
9. ModuleHero, PageActionBar, ConfirmModal reuse হবে
10. DashboardLayout আর page-এর ভিতরে wrap করা হবে না
```

## Department Module Final Standard

Department hierarchy হবে:

```text
Company → Branch → Department
```

Department form-এ ideal fields:

```text
Company      required, dropdown
Branch       required, dropdown, selected company অনুযায়ী filter হবে
Department Name required
Department Code required / auto-generated হলে optional
Short Name optional
Email optional
Phone optional
Address optional
Remarks optional
Status backend managed
```

Department page actions:

```text
Top bar:
Create | Export | Import

Active row:
Edit | Inactive

Inactive row:
Edit | Restore | Permanent Delete
```

## আগে Backend Contract Check করব

বারবার code change এড়ানোর জন্য প্রথমে Department backend files check করা দরকার। তুমি এই files গুলো পাঠাও:

```text
E:\Audit\AMS\backend\app\schemas\department.py
```

```text
E:\Audit\AMS\backend\app\api\v1\departments.py
```

```text
E:\Audit\AMS\backend\app\repositories\department_repository.py
```

```text
E:\Audit\AMS\backend\app\services\department\create_department.py
```

```text
E:\Audit\AMS\backend\app\services\department\update_department.py
```

```text
E:\Audit\AMS\backend\app\services\department\delete_department.py
```

```text
E:\Audit\AMS\backend\app\services\department\restore_department.py
```

```text
E:\Audit\AMS\backend\app\services\department\permanent_delete_department.py
```

এগুলো check না করে frontend code দিলে আবার field mismatch, route mismatch, `is_active` duplicate, 422 `[object Object]`, বা permanent delete route mismatch হতে পারে।

## আমি কী check করব

আমি এইগুলো verify করব:

```text
1. GET /api/v1/departments আছে কিনা
2. POST /api/v1/departments আছে কিনা
3. PATCH /api/v1/departments/{id} আছে কিনা
4. DELETE /api/v1/departments/{id} inactive করে কিনা
5. PATCH /api/v1/departments/{id}/restore আছে কিনা
6. DELETE /api/v1/departments/{id}/permanent আছে কিনা
7. DepartmentCreate schema-তে is_active নেই কিনা
8. DepartmentUpdate schema-তে is_active আছে কিনা
9. update logic False value skip করছে কিনা
10. create method-এ duplicate is_active issue আছে কিনা
11. Branch relation field name branch_id কিনা
12. Response-এ company_name / branch_name আছে কিনা
```

## তারপর Frontend বানাব এই structure-এ

```text
frontend/src/types/department.ts
frontend/src/services/department.ts
frontend/src/components/departments/DepartmentForm.tsx
frontend/src/components/departments/DepartmentRowActions.tsx
frontend/src/app/api/departments/route.ts
frontend/src/app/api/departments/[id]/route.ts
frontend/src/app/api/departments/[id]/inactive/route.ts
frontend/src/app/(protected)/departments/page.tsx
```

## Department module-এর জন্য reusable things already ready

আমরা এগুলো reuse করব:

```text
ModuleHero
PageActionBar
ConfirmModal
RightDrawer
NavigationContext
Phone utility
Dashboard protected layout
```

মানে Department-এ design/UX আবার নতুন করে বানাব না। Company/Branch standard-ই follow করব।

## এখন next action

Department backend files পাঠাও। আমি আগে backend contract clean করে দেব, তারপর একবারে full frontend Department CRUD code দেব যাতে বারবার change না লাগে।

Migration successful ✅
Backend DB এখন `departments` table-এ নতুন fields support করছে। Department API routes আগেই Company/Branch pattern অনুযায়ী ready ছিল: list, create, update, inactive, restore, permanent delete সব endpoint আছে। 
এখন frontend Department module বানাও। `DashboardLayout` page-এর ভিতরে wrap করবে না, কারণ protected layout already master layout হিসেবে কাজ করছে।

---

## Step 1: Frontend folders create করো

```powershell id="11ly91"
cd E:\Audit\AMS\frontend

New-Item -ItemType Directory -Force 'src\components\departments'
New-Item -ItemType Directory -Force 'src\app\api\departments'
New-Item -ItemType Directory -Force 'src\app\api\departments\[id]'
New-Item -ItemType Directory -Force 'src\app\api\departments\[id]\inactive'
New-Item -ItemType Directory -Force 'src\app\api\departments\[id]\restore'
New-Item -ItemType Directory -Force 'src\app\(protected)\departments'

New-Item -ItemType File -Force 'src\types\department.ts'
New-Item -ItemType File -Force 'src\services\department.ts'
New-Item -ItemType File -Force 'src\app\api\departments\route.ts'
New-Item -ItemType File -Force 'src\app\api\departments\[id]\route.ts'
New-Item -ItemType File -Force 'src\app\api\departments\[id]\inactive\route.ts'
New-Item -ItemType File -Force 'src\app\api\departments\[id]\restore\route.ts'
New-Item -ItemType File -Force 'src\components\departments\DepartmentForm.tsx'
New-Item -ItemType File -Force 'src\components\departments\DepartmentRowActions.tsx'
New-Item -ItemType File -Force 'src\app\(protected)\departments\page.tsx'
```

---

## Step 2: Types, Service, API Proxy files

```ts id="6c8438"
// E:\Audit\AMS\frontend\src\types\department.ts

export type Department = {
  id: number;

  company_id: number;
  branch_id: number;

  company_name?: string | null;
  branch_name?: string | null;

  department_code: string;
  department_name: string;
  department_short_name?: string | null;
  department_email?: string | null;
  department_phone?: string | null;
  department_address?: string | null;

  remarks?: string | null;
  is_active: boolean;

  created_by?: string | null;
  updated_by?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type DepartmentCreatePayload = {
  company_id: number;
  branch_id: number;

  department_code: string;
  department_name: string;
  department_short_name?: string;
  department_email?: string;
  department_phone?: string;
  department_address?: string;

  remarks?: string;
};

export type DepartmentUpdatePayload = Partial<DepartmentCreatePayload> & {
  is_active?: boolean;
};
```

```ts id="d7acw3"
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
```

```ts id="198301"
// E:\Audit\AMS\frontend\src\app\api\departments\route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function GET(request: Request) {
  const accessToken = await getAccessToken();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${API_URL}/departments${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department GET proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department POST proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
```

```ts id="n6ss7g"
// E:\Audit\AMS\frontend\src\app\api\departments\[id]\route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department PATCH proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}/permanent`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department DELETE proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
```

```ts id="e6yxx9"
// E:\Audit\AMS\frontend\src\app\api\departments\[id]\inactive\route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department inactive proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
```

```ts id="yyz22q"
// E:\Audit\AMS\frontend\src\app\api\departments\[id]\restore\route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!API_URL) {
    return NextResponse.json(
      { message: "Frontend API URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${API_URL}/departments/${id}/restore`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Department restore proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
```

---

## Step 3: Department components

```tsx id="gu8sxl"
// E:\Audit\AMS\frontend\src\components\departments\DepartmentRowActions.tsx

"use client";

import { Archive, Edit3, RotateCcw, Trash2 } from "lucide-react";

import type { Department } from "@/types/department";

type DepartmentRowActionsProps = {
  department: Department;
  onEdit: (department: Department) => void;
  onInactive: (department: Department) => void;
  onRestore: (department: Department) => void;
  onPermanentDelete: (department: Department) => void;
};

export default function DepartmentRowActions({
  department,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: DepartmentRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(department)}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <Edit3 size={14} />
        Edit
      </button>

      {department.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(department)}
          className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
        >
          <Archive size={14} />
          Inactive
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onRestore(department)}
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <RotateCcw size={14} />
            Restore
          </button>

          <button
            type="button"
            onClick={() => onPermanentDelete(department)}
            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
          >
            <Trash2 size={14} />
            Permanent Delete
          </button>
        </>
      )}
    </div>
  );
}
```

```tsx id="xifkiy"
// E:\Audit\AMS\frontend\src\components\departments\DepartmentForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";

import { createDepartment, updateDepartment } from "@/services/department";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type {
  Department,
  DepartmentCreatePayload,
} from "@/types/department";
import {
  bangladeshPhoneFormatMessage,
  isValidBangladeshPhone,
  normalizeBangladeshPhone,
} from "@/utils/phone";

type DepartmentFormProps = {
  initialData?: Department | null;
  companies: Company[];
  branches: Branch[];
  onSuccess: () => void;
  onCancel: () => void;
};

type DepartmentFormState = {
  company_id: string;
  branch_id: string;

  department_code: string;
  department_name: string;
  department_short_name: string;
  department_email: string;
  department_phone: string;
  department_address: string;

  remarks: string;
};

const getInitialForm = (
  initialData?: Department | null
): DepartmentFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_id: initialData?.branch_id ? String(initialData.branch_id) : "",

  department_code: initialData?.department_code ?? "",
  department_name: initialData?.department_name ?? "",
  department_short_name: initialData?.department_short_name ?? "",
  department_email: initialData?.department_email ?? "",
  department_phone: initialData?.department_phone ?? "",
  department_address: initialData?.department_address ?? "",

  remarks: initialData?.remarks ?? "",
});

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500";

const labelClass = "mb-2 block text-sm font-bold text-slate-700";

export default function DepartmentForm({
  initialData,
  companies,
  branches,
  onSuccess,
  onCancel,
}: DepartmentFormProps) {
  const [form, setForm] = useState<DepartmentFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          company.is_active || String(company.id) === form.company_id
      ),
    [companies, form.company_id]
  );

  const availableBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          String(branch.company_id) === form.company_id &&
          (branch.is_active || String(branch.id) === form.branch_id)
      ),
    [branches, form.company_id, form.branch_id]
  );

  const handleChange = (field: keyof DepartmentFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCompanyChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      company_id: value,
      branch_id: "",
    }));
  };

  const buildPayload = (): DepartmentCreatePayload => ({
    company_id: Number(form.company_id),
    branch_id: Number(form.branch_id),

    department_code: form.department_code.trim(),
    department_name: form.department_name.trim(),
    department_short_name: optionalText(form.department_short_name),
    department_email: optionalText(form.department_email),
    department_phone: optionalText(
      normalizeBangladeshPhone(form.department_phone)
    ),
    department_address: optionalText(form.department_address),

    remarks: optionalText(form.remarks),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.company_id) {
      setError("Company is required.");
      return;
    }

    if (!form.branch_id) {
      setError("Branch is required.");
      return;
    }

    if (!form.department_name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!form.department_code.trim()) {
      setError("Department code is required.");
      return;
    }

    if (
      form.department_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.department_email.trim())
    ) {
      setError("Please enter a valid department email address.");
      return;
    }

    if (!isValidBangladeshPhone(form.department_phone)) {
      setError(bangladeshPhoneFormatMessage);
      return;
    }

    try {
      setSubmitting(true);

      const payload = buildPayload();

      if (initialData) {
        await updateDepartment(initialData.id, payload);
      } else {
        await createDepartment(payload);
      }

      onSuccess();
    } catch (submitError) {
      console.error("Department save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Company *</label>
        <select
          value={form.company_id}
          onChange={(event) => handleCompanyChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select company</option>
          {activeCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Branch *</label>
        <select
          value={form.branch_id}
          onChange={(event) => handleChange("branch_id", event.target.value)}
          disabled={!form.company_id}
          className={inputClass}
        >
          <option value="">
            {form.company_id ? "Select branch" : "Select company first"}
          </option>

          {availableBranches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branch_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Department Name *</label>
          <input
            value={form.department_name}
            onChange={(event) =>
              handleChange("department_name", event.target.value)
            }
            placeholder="Example: Accounts"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Department Code *</label>
          <input
            value={form.department_code}
            onChange={(event) =>
              handleChange("department_code", event.target.value)
            }
            placeholder="Example: ACC"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Name</label>
        <input
          value={form.department_short_name}
          onChange={(event) =>
            handleChange("department_short_name", event.target.value)
          }
          placeholder="Example: ACC"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Email</label>
          <input
            value={form.department_email}
            onChange={(event) =>
              handleChange("department_email", event.target.value)
            }
            placeholder="accounts@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            value={form.department_phone}
            onChange={(event) =>
              handleChange("department_phone", event.target.value)
            }
            onBlur={() =>
              handleChange(
                "department_phone",
                normalizeBangladeshPhone(form.department_phone)
              )
            }
            placeholder="Example: 01712345678"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <textarea
          value={form.department_address}
          onChange={(event) =>
            handleChange("department_address", event.target.value)
          }
          placeholder="Department address"
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Remarks</label>
        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Optional remarks"
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : initialData
              ? "Update Department"
              : "Save Department"}
        </button>
      </div>
    </form>
  );
}
```

```tsx id="4ux4n2"
// E:\Audit\AMS\frontend\src\app\(protected)\departments\page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Network, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DepartmentForm from "@/components/departments/DepartmentForm";
import DepartmentRowActions from "@/components/departments/DepartmentRowActions";
import {
  deactivateDepartment,
  getDepartments,
  permanentlyDeleteDepartment,
  restoreDepartment,
} from "@/services/department";
import { getBranches } from "@/services/branch";
import { getCompanies } from "@/services/company";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const companyNameById = useMemo(() => {
    const map = new Map<number, string>();

    companies.forEach((company) => {
      map.set(company.id, company.company_name);
    });

    return map;
  }, [companies]);

  const branchNameById = useMemo(() => {
    const map = new Map<number, string>();

    branches.forEach((branch) => {
      map.set(branch.id, branch.branch_name);
    });

    return map;
  }, [branches]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getDepartments(), getCompanies(), getBranches()])
      .then(([departmentData, companyData, branchData]) => {
        if (!cancelled) {
          setDepartments(departmentData);
          setCompanies(companyData);
          setBranches(branchData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load department page data:", error);
          setDepartments([]);
          setCompanies([]);
          setBranches([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDepartments = departments.filter((department) => {
    const keyword = searchTerm.toLowerCase();

    const companyName =
      companyNameById.get(department.company_id)?.toLowerCase() ?? "";
    const branchName =
      branchNameById.get(department.branch_id)?.toLowerCase() ?? "";

    const matchesSearch =
      department.department_name?.toLowerCase().includes(keyword) ||
      department.department_code?.toLowerCase().includes(keyword) ||
      department.department_short_name?.toLowerCase().includes(keyword) ||
      department.department_email?.toLowerCase().includes(keyword) ||
      department.department_phone?.toLowerCase().includes(keyword) ||
      department.department_address?.toLowerCase().includes(keyword) ||
      companyName.includes(keyword) ||
      branchName.includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && department.is_active) ||
      (statusFilter === "inactive" && !department.is_active);

    return matchesSearch && matchesStatus;
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingDepartment(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingDepartment);

    setDrawerOpen(false);
    setEditingDepartment(null);

    showSuccess(
      wasEditing
        ? "Department updated successfully."
        : "Department created successfully."
    );

    loadDepartments();
  };

  const openConfirm = (department: Department, action: ConfirmAction) => {
    setSelectedDepartment(department);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedDepartment(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedDepartment || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateDepartment(selectedDepartment.id);
        showSuccess("Department marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreDepartment(selectedDepartment.id);
        showSuccess("Department restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteDepartment(selectedDepartment.id);
        showSuccess("Department permanently deleted successfully.");
      }

      closeConfirm();
      await loadDepartments();
    } catch (error) {
      console.error("Department action failed:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Department action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Department Inactive";
    if (confirmAction === "restore") return "Restore Department";
    if (confirmAction === "permanent_delete")
      return "Permanently Delete Department";

    return "Confirm Action";
  };

  const getConfirmMessage = () => {
    const name = selectedDepartment?.department_name || "this department";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`;
    }

    return "Are you sure you want to continue?";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "permanent_delete") return "danger";

    return "warning";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Network}
          title="Department Management"
          description="Manage company and branch-wise departments with RBAC-based actions."
        />

        <PageActionBar
          menuKey="department"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Departments
              </h2>
              <p className="text-sm text-slate-500">
                Department list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search department."
                  className="ml-2 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Filter size={17} className="text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1450px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Short Name</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Phone</th>
                  <th className="px-5 py-4 font-bold">Address</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No department data found. Click Create to add first
                      department.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((department, index) => (
                    <tr
                      key={department.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !department.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {companyNameById.get(department.company_id) ||
                          `Company #${department.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branchNameById.get(department.branch_id) ||
                          `Branch #${department.branch_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {department.department_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_short_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {department.department_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            department.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {department.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DepartmentRowActions
                          department={department}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={
          editingDepartment ? "Edit Department" : "Create Department"
        }
        onClose={handleCloseDrawer}
      >
        <DepartmentForm
          key={
            editingDepartment
              ? `edit-department-${editingDepartment.id}`
              : "create-department"
          }
          initialData={editingDepartment}
          companies={companies}
          branches={branches}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedDepartment)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}
```

---

## Step 4: Run

Backend restart করো:

```powershell id="18r7rf"
cd E:\Audit\AMS\backend
uvicorn main:app --reload
```

Frontend:

```powershell id="d9zrju"
cd E:\Audit\AMS\frontend
npm run dev
```

তারপর open করো:

```text id="rer6jw"
http://localhost:3000/departments
```

Expected backend log:

```text id="n0d5op"
GET /api/v1/departments?page_size=100 200 OK
GET /api/v1/companies 200 OK
GET /api/v1/branches?page_size=100 200 OK
```

Create test data:

```text id="4gwz5l"
Company: active company
Branch: active branch under selected company
Department Name: Accounts
Department Code: ACC
Short Name: ACC
Email: accounts@example.com
Phone: 01712345678
Address: Dhaka
Remarks: Finance department
```

Expected after save:

```text id="kgf2vk"
POST /api/v1/departments 201 Created
GET /api/v1/departments?page_size=100 200 OK
```
