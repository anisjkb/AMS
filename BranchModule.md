চলো Branch Module শুরু করি ✅
আমরা Company module-এর exact standard pattern follow করব।

আজকের কাজ: **Branch Frontend CRUD Skeleton + API Proxy + Page + Form + Row Actions**

Backend route আমরা এই pattern ধরে align করব:

```text
GET     /api/v1/branches
POST    /api/v1/branches
PATCH   /api/v1/branches/{id}
DELETE  /api/v1/branches/{id}/permanent
```

---

## Step 0: Frontend folder/file create করো

PowerShell এ frontend folder-এ যাও:

```powershell
cd E:\Audit\AMS\frontend
```

এখন files/folders create করো:

```powershell
New-Item -ItemType Directory -Force src\components\branches
New-Item -ItemType Directory -Force src\app\branches
New-Item -ItemType Directory -Force src\app\api\branches
New-Item -ItemType Directory -Force 'src\app\api\branches\[id]'

New-Item -ItemType File -Force src\types\branch.ts
New-Item -ItemType File -Force src\services\branch.ts
New-Item -ItemType File -Force src\components\branches\BranchForm.tsx
New-Item -ItemType File -Force src\components\branches\BranchRowActions.tsx
New-Item -ItemType File -Force src\app\branches\page.tsx
New-Item -ItemType File -Force src\app\api\branches\route.ts
New-Item -ItemType File -Force 'src\app\api\branches\[id]\route.ts'
```

---

# 1. Branch Type

Full path:

```text
E:\Audit\AMS\frontend\src\types\branch.ts
```

Paste:

```ts
export type Branch = {
  id: number;
  company_id: number;
  company_name?: string | null;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string | null;
  branch_email?: string | null;
  branch_phone?: string | null;
  branch_address?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BranchCreatePayload = {
  company_id: number;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string;
  branch_email?: string;
  branch_phone?: string;
  branch_address?: string;
  remarks?: string;
};

export type BranchUpdatePayload = Partial<BranchCreatePayload> & {
  is_active?: boolean;
};
```

---

# 2. Branch Service

Full path:

```text
E:\Audit\AMS\frontend\src\services\branch.ts
```

Paste:

```ts
import type { Branch, BranchCreatePayload } from "@/types/branch";

type BranchListResponse =
  | Branch[]
  | {
      data?: Branch[];
      items?: Branch[];
      results?: Branch[];
      branches?: Branch[];
    };

const normalizeBranches = (response: BranchListResponse): Branch[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.branches)) return response.branches;

  return [];
};

export const getBranches = async (): Promise<Branch[]> => {
  const response = await fetch("/api/branches?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load branches");
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to create branch");
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to update branch");
  }

  return response.json();
};

export const deactivateBranch = async (id: number): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to mark branch inactive"
    );
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to restore branch");
  }

  return response.json();
};

export const permanentlyDeleteBranch = async (id: number): Promise<void> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to permanently delete branch"
    );
  }
};
```

---

# 3. Branch API Proxy: List/Create

Full path:

```text
E:\Audit\AMS\frontend\src\app\api\branches\route.ts
```

Paste:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function GET(request: Request) {
  const accessToken = await getAccessToken();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `${API_URL}/branches${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
```

---

# 4. Branch API Proxy: Update/Permanent Delete

Full path:

```text
E:\Audit\AMS\frontend\src\app\api\branches\[id]\route.ts
```

Paste:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const body = await request.json();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
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

  const response = await fetch(`${API_URL}/branches/${id}/permanent`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
```

---

# 5. Branch Row Actions

Full path:

```text
E:\Audit\AMS\frontend\src\components\branches\BranchRowActions.tsx
```

Paste:

```tsx
"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";
import type { Branch } from "@/types/branch";

const rowActionKeys = ["update", "delete", "restore", "permanent_delete"];

const buttonStyleMap: Record<string, string> = {
  warning:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
  secondary:
    "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
};

const getDisplayTitle = (actionKey: string, defaultTitle: string) => {
  if (actionKey === "delete") return "Inactive";
  if (actionKey === "permanent_delete") return "Permanent Delete";
  return defaultTitle;
};

export default function BranchRowActions({
  branch,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onInactive: (branch: Branch) => void;
  onRestore: (branch: Branch) => void;
  onPermanentDelete: (branch: Branch) => void;
}) {
  const { getActionsByMenuKey } = useNavigation();

  const actions = getActionsByMenuKey("branch")
    .filter((action) => rowActionKeys.includes(action.action_key))
    .filter((action) => {
      if (action.action_key === "delete") {
        return branch.is_active;
      }

      if (action.action_key === "restore") {
        return !branch.is_active;
      }

      if (action.action_key === "permanent_delete") {
        return !branch.is_active;
      }

      return true;
    });

  if (actions.length === 0) {
    return <span className="text-slate-400">No actions</span>;
  }

  const handleActionClick = (actionKey: string) => {
    if (actionKey === "update") {
      onEdit(branch);
      return;
    }

    if (actionKey === "delete") {
      onInactive(branch);
      return;
    }

    if (actionKey === "restore") {
      onRestore(branch);
      return;
    }

    if (actionKey === "permanent_delete") {
      onPermanentDelete(branch);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {actions.map((action) => {
        const Icon = getIcon(action.button_icon);
        const color = action.button_color ?? "secondary";
        const title = getDisplayTitle(action.action_key, action.action_title);

        return (
          <button
            key={action.id}
            type="button"
            title={title}
            onClick={() => handleActionClick(action.action_key)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
              buttonStyleMap[color] ?? buttonStyleMap.secondary
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
```

---

# 6. Branch Form

Full path:

```text
E:\Audit\AMS\frontend\src\components\branches\BranchForm.tsx
```

Paste:

```tsx
"use client";

import { useEffect, useState } from "react";

import { getCompanies } from "@/services/company";
import { createBranch, updateBranch } from "@/services/branch";
import type { Branch, BranchCreatePayload } from "@/types/branch";
import type { Company } from "@/types/company";

type BranchFormState = {
  company_id: string;
  branch_code: string;
  branch_name: string;
  branch_short_name: string;
  branch_email: string;
  branch_phone: string;
  branch_address: string;
  remarks: string;
};

const getInitialForm = (initialData?: Branch | null): BranchFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_code: initialData?.branch_code ?? "",
  branch_name: initialData?.branch_name ?? "",
  branch_short_name: initialData?.branch_short_name ?? "",
  branch_email: initialData?.branch_email ?? "",
  branch_phone: initialData?.branch_phone ?? "",
  branch_address: initialData?.branch_address ?? "",
  remarks: initialData?.remarks ?? "",
});

export default function BranchForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BranchFormState>(
    getInitialForm(initialData)
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(initialData));
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    field: keyof BranchFormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const buildPayload = (): BranchCreatePayload => ({
    company_id: Number(form.company_id),
    branch_code: form.branch_code.trim(),
    branch_name: form.branch_name.trim(),
    branch_short_name: form.branch_short_name.trim(),
    branch_email: form.branch_email.trim(),
    branch_phone: form.branch_phone.trim(),
    branch_address: form.branch_address.trim(),
    remarks: form.remarks.trim(),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.company_id) {
      setError("Company is required");
      return;
    }

    if (!form.branch_name.trim()) {
      setError("Branch name is required");
      return;
    }

    if (!form.branch_code.trim()) {
      setError("Branch code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = buildPayload();

      if (initialData) {
        await updateBranch(initialData.id, payload);
      } else {
        await createBranch(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Branch save failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Branch save failed. Please try again."
      );
    } finally {
      setLoading(false);
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
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company <span className="text-red-500">*</span>
        </label>

        <select
          value={form.company_id}
          onChange={(event) => handleChange("company_id", event.target.value)}
          disabled={companyLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">
            {companyLoading ? "Loading companies..." : "Select company"}
          </option>

          {companies
            .filter((company) => company.is_active)
            .map((company) => (
              <option key={company.id} value={company.id}>
                {company.company_name} ({company.company_code})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Name <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_name}
          onChange={(event) => handleChange("branch_name", event.target.value)}
          placeholder="Enter branch name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Code <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_code}
          onChange={(event) => handleChange("branch_code", event.target.value)}
          placeholder="Enter branch code"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Short Name
        </label>

        <input
          value={form.branch_short_name}
          onChange={(event) =>
            handleChange("branch_short_name", event.target.value)
          }
          placeholder="Enter short name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          value={form.branch_email}
          onChange={(event) => handleChange("branch_email", event.target.value)}
          placeholder="Enter email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Phone
        </label>

        <input
          value={form.branch_phone}
          onChange={(event) => handleChange("branch_phone", event.target.value)}
          placeholder="Enter phone"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Address
        </label>

        <textarea
          value={form.branch_address}
          onChange={(event) =>
            handleChange("branch_address", event.target.value)
          }
          placeholder="Enter address"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Remarks
        </label>

        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Enter remarks"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Branch"
              : "Save Branch"}
        </button>
      </div>
    </form>
  );
}
```

---

# 7. Branch Page

Full path:

```text
E:\Audit\AMS\frontend\src\app\branches\page.tsx
```

Paste:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Filter, GitBranch, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import BranchForm from "@/components/branches/BranchForm";
import BranchRowActions from "@/components/branches/BranchRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  deactivateBranch,
  getBranches,
  permanentlyDeleteBranch,
  restoreBranch,
} from "@/services/branch";
import type { Branch } from "@/types/branch";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getBranches()
      .then((data) => {
        if (!cancelled) {
          setBranches(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load branches:", error);
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

  const filteredBranches = branches.filter((branch) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      branch.branch_name?.toLowerCase().includes(keyword) ||
      branch.branch_code?.toLowerCase().includes(keyword) ||
      branch.branch_email?.toLowerCase().includes(keyword) ||
      branch.branch_phone?.toLowerCase().includes(keyword) ||
      branch.company_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

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
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBranch(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingBranch);

    setDrawerOpen(false);
    setEditingBranch(null);

    showSuccess(
      wasEditing
        ? "Branch updated successfully."
        : "Branch created successfully."
    );

    loadBranches();
  };

  const openConfirm = (branch: Branch, action: ConfirmAction) => {
    setSelectedBranch(branch);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedBranch(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBranch || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateBranch(selectedBranch.id);
        showSuccess("Branch marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreBranch(selectedBranch.id);
        showSuccess("Branch restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteBranch(selectedBranch.id);
        showSuccess("Branch permanently deleted successfully.");
      }

      setSelectedBranch(null);
      setConfirmAction(null);
      loadBranches();
    } catch (error) {
      console.error("Branch action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Branch action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Branch as Inactive?";
    if (confirmAction === "restore") return "Restore Branch?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Branch?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedBranch) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedBranch.branch_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedBranch.branch_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedBranch.branch_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <GitBranch size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Branch Management</h1>
              <p className="mt-1 text-blue-100">
                Manage company branches with RBAC-based actions.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="branch"
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
              <h2 className="text-xl font-black text-slate-900">Branches</h2>
              <p className="text-sm text-slate-500">
                Branch list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search branch..."
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
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
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
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading branches...
                    </td>
                  </tr>
                ) : filteredBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No branch data found. Click Create to add first branch.
                    </td>
                  </tr>
                ) : (
                  filteredBranches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !branch.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branch.company_name || `Company #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {branch.branch_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {branch.branch_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            branch.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <BranchRowActions
                          branch={branch}
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
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        onClose={handleCloseDrawer}
      >
        <BranchForm
          initialData={editingBranch}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedBranch)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function BranchesPage() {
  return <BranchesContent />;
}
```

---

# 8. Run frontend

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/branches
```

---

# 9. Expected result

যদি backend branch routes already ঠিক থাকে, তাহলে:

```text
GET /api/v1/branches 200 OK
```

Page-এ দেখাবে:

```text
Branch Management
Create | Export | Import
Search
Status Filter
Table
```

Create click করলে drawer open হবে এবং company dropdown আসবে।

---

# 10. এখন test order

প্রথমে শুধু এই ৩টা test করো:

```text
1. /branches page load হয় কিনা
2. Create drawer open হয় কিনা
3. Company dropdown load হয় কিনা
```

তারপর create/update/inactive/restore/permanent delete test করব।

যদি error আসে, backend/frontend terminal log পাঠাও। Especially এইগুলো দরকার হবে:

```text
GET /api/v1/branches ...
POST /api/v1/branches ...
PATCH /api/v1/branches/{id} ...
DELETE /api/v1/branches/{id}/permanent ...
```
ChatGPT Plus


























Pasted text(77).txt
Document
Done! ✅

আমি AMS সম্পর্কিত দীর্ঘমেয়াদী Project Context memory-তে update করে দিয়েছি।

এখন থেকে AMS নিয়ে নতুন chat বা ভবিষ্যতের conversation-এ আমি এই established architecture ধরে এগোবো, যেমন:

* ✅ Enterprise Layered Architecture (Repository → Service → API)
* ✅ Integer Primary Keys
* ✅ Active/Inactive status model
* ✅ Backend-managed audit fields (created_by, updated_by, created_at, updated_at)
* ✅ RBAC-based permission system
* ✅ Dynamic database-driven navigation (navigation_groups, menus, menu_actions)
* ✅ Enterprise frontend/backend integration approach

এতে প্রতিবার শুরু থেকে AMS-এর architecture বুঝিয়ে বলতে হবে না, এবং পরবর্তী development আরও ধারাবাহিকভাবে এগিয়ে নেওয়া যাবে।


AMS Call your memory, read attached file and নেক্সট শুরু করো 


Pasted text(78).txt
Document


Pasted text(79).txt
Document

মেনু সব কোথায় গেল এক্সেস নাই?


Step 6: Test successful next কর: Company CRUD API integration + Enterprise table + Right Drawer Create Form.


কোম্পানি সবকিছু কোথায় গেল এরকম সাদা হয়ে গেল কেন?



Pasted text(80).txt
Document

image(232).png
image(233).png
image(234).png
এই সকল চেঞ্জ গুলা আমি পরে করব. এগুলা করার আগে ডাটাবেজে ডাটা গুলা চেক করে দেখো. কিছু field blank and some ফিল্ডে value আছে কেন?


নতুন এড করা field গুলা দেখাচ্ছে না কেন


Pasted text(81).txt
Document

কোম্পানি ক্রিয়েট done কিন্তু সাকসেসফুল মেসেজ দিবে না এবং টেবিলে দেখাবে না?


INFO:     127.0.0.1:53936 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:53936 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53938 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62682 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62683 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:62684 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:62685 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:52625 - "PUT /api/v1/companies/2 HTTP/1.1" 405 Method Not Allowed

When try to Update Company যাচ্ছি তখন এই error দিচ্ছে


Pasted code.ts
TypeScript
src\app\companies\page.tsx ফুল কোড আপডেট করে দাও

image(239).png
image(240).png
 GET /api/companies 200 in 1216ms (next.js: 81ms, application-code: 1135ms)
 PATCH /api/companies/2 200 in 1780ms (next.js: 824ms, application-code: 957ms)
 GET /api/companies 200 in 840ms (next.js: 3ms, application-code: 837ms)
 PATCH /api/companies/2 200 in 1613ms (next.js: 18ms, application-code: 1595ms)
 GET /api/companies 200 in 1135ms (next.js: 10ms, application-code: 1125ms)

INFO:     127.0.0.1:53128 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53127 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:53130 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:53129 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:54930 - "PATCH /api/v1/companies/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54930 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:60947 - "PATCH /api/v1/companies/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60947 - "GET /api/v1/companies HTTP/1.1" 200 OK

But inactive হচ্ছে না

Branch Module frontend CRUD শুরু করার আগে উপরের Edit, Delete,Restore, Permanent Delete, Export, Import এবং নিচের Filter বাটনের কাজ কি বিষয়গুলো ক্লিয়ার হওয়া দরকার?

নিচে পুরো Company CRUD module-এর Day-1 থেকে complete documentation দিলাম। এটাকে তোমার AMS project-এর standard module development guide হিসেবে রাখো। Branch/Department/Designation/Employee module বানানোর সময় একই pattern follow করবে।

AMS Company CRUD Module Complete Development Guide
Day-1 থেকে Final Company CRUD + RBAC + Dynamic Action Pattern
1. Purpose of This Document
এই document-এর উদ্দেশ্য হলো AMS project-এ Company CRUD module কীভাবে তৈরি করা হয়েছে তা একদম শুরু থেকে শেষ পর্যন্ত explain করা। এই document দেখে নতুন developer-ও বুঝতে পারবে:

কোন file কোথায় থাকবে

কোন file-এর কাজ কী

Backend route কীভাবে frontend route-এর সাথে align হবে

Dynamic RBAC menu/action কীভাবে frontend-এ কাজ করবে

Create/Edit/Inactive/Restore/Permanent Delete কীভাবে implement হবে

একই pattern দিয়ে Branch/Department/Designation/Employee module কীভাবে বানাতে হবে

2. Final Feature Scope of Company CRUD Module
Company module-এ এখন নিচের features complete:

1. Company List
2. Company Search
3. Create Company
4. Edit / Update Company
5. Mark Company as Inactive
6. Restore Inactive Company
7. Permanent Delete
8. Confirm Modal for destructive actions
9. RBAC-based Page Action Bar
10. RBAC-based Row Action Buttons
11. Dynamic Navigation Sidebar
12. Status Filter: All / Active / Inactive
13. Placeholder Export / Import buttons
14. Frontend Next API Proxy
15. Backend API alignment
3. Project Directory Overview
AMS frontend path:

E:\Audit\AMS\frontend
AMS backend path:

E:\Audit\AMS\backend
Important frontend directories:

frontend/src/app
frontend/src/app/api
frontend/src/app/companies
frontend/src/components/common
frontend/src/components/companies
frontend/src/components/layout
frontend/src/contexts
frontend/src/services
frontend/src/types
Important backend directories:

backend/app/api/v1
backend/app/models
backend/app/repositories
backend/app/schemas
backend/app/services/company
4. Core Architecture Decision
AMS module development follows this pattern:

Backend:
Model → Schema → Repository → Service → API Route

Frontend:
Types → Service → Next API Proxy → Component → Page
RBAC and dynamic navigation pattern:

navigation_groups
→ menus
→ menu_actions
→ permissions
→ role_permissions
→ /me/navigation
→ Frontend Sidebar + Page Actions + Row Actions
5. Company Backend API Final Route Design
Backend base API:

http://127.0.0.1:8000/api/v1
Company backend routes:

GET     /api/v1/companies
GET     /api/v1/companies/{company_id}
POST    /api/v1/companies
PATCH   /api/v1/companies/{company_id}
DELETE  /api/v1/companies/{company_id}
PATCH   /api/v1/companies/{company_id}/restore
DELETE  /api/v1/companies/{company_id}/permanent
Meaning:

GET /companies
= List companies

POST /companies
= Create company

PATCH /companies/{id}
= Update company OR set is_active false/true

DELETE /companies/{id}
= Soft delete / Mark inactive

PATCH /companies/{id}/restore
= Restore company

DELETE /companies/{id}/permanent
= Hard delete from database
Important naming decision:

UI label: Inactive
Internal old key/API meaning: delete/deactivate
আমরা UI-তে Delete শব্দ বাদ দিয়ে Inactive করেছি, কারণ Delete hard delete বোঝায়।

6. Frontend Route Alignment
Frontend user page:

http://localhost:3000/companies
Frontend internal API proxy:

/api/companies
/api/companies/{id}
Route alignment:

Frontend Page
→ frontend service function
→ Next.js API route
→ FastAPI backend route
→ Database
Example list route:

Company Page
→ getCompanies()
→ GET /api/companies
→ GET http://127.0.0.1:8000/api/v1/companies
Example permanent delete route:

Company Page
→ permanentlyDeleteCompany(id)
→ DELETE /api/companies/{id}
→ DELETE http://127.0.0.1:8000/api/v1/companies/{id}/permanent
7. Environment Configuration
Frontend .env.local:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
Backend should run on:

http://127.0.0.1:8000
Frontend should run on:

http://localhost:3000
8. Backend: Company API Route
File:

backend/app/api/v1/companies.py
Final route structure:

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import require_permission
from app.db.session import get_db
from app.models.user import User
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyMessageResponse,
    CompanyResponse,
    CompanyUpdate,
)
from app.services.company.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    sort_by: str = "id",
    sort_order: str = "asc",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.list_companies(
        page=page,
        page_size=page_size,
        search=search,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("menu.company.view")),
):
    service = CompanyService(db)
    return await service.get_company(company_id)


@router.post(
    "",
    response_model=CompanyMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.create")),
):
    service = CompanyService(db)
    return await service.create_company(
        payload=payload,
        created_by=current_user.user_id,
    )


@router.patch("/{company_id}", response_model=CompanyMessageResponse)
async def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.update")),
):
    service = CompanyService(db)
    return await service.update_company(
        company_id=company_id,
        payload=payload,
        updated_by=current_user.user_id,
    )


@router.delete("/{company_id}", response_model=CompanyMessageResponse)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.delete")),
):
    service = CompanyService(db)
    return await service.deactivate_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )


@router.patch("/{company_id}/restore", response_model=CompanyMessageResponse)
async def restore_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.restore")),
):
    service = CompanyService(db)
    return await service.restore_company(
        company_id=company_id,
        updated_by=current_user.user_id,
    )


@router.delete("/{company_id}/permanent")
async def permanent_delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("api.company.permanent_delete")),
):
    service = CompanyService(db)
    return await service.permanent_delete_company(company_id)
9. Backend: Company Repository
File:

backend/app/repositories/company_repository.py
Important repository responsibilities:

1. List companies
2. Get by id
3. Get by id any status
4. Create
5. Update
6. Set active/inactive status
7. Permanent delete
8. Check child records
Critical update rule:

update_data = payload.model_dump(exclude_unset=True)

for field, value in update_data.items():
    setattr(company, field, value)
Do not use:

if value:
    setattr(company, field, value)
কারণ False value skip হয়ে যাবে। তখন is_active=False কাজ করবে না।

Important methods:

async def get_by_id_any_status(self, company_id: int) -> Company | None:
    result = await self.db.execute(
        select(Company).where(Company.id == company_id)
    )
    return result.scalar_one_or_none()


async def set_active_status(
    self,
    company: Company,
    is_active: bool,
    updated_by: str,
) -> Company:
    company.is_active = is_active
    company.updated_by = updated_by

    await self.db.commit()
    await self.db.refresh(company)

    return company


async def permanent_delete(self, company: Company) -> None:
    await self.db.delete(company)
    await self.db.commit()
10. Backend: Permanent Delete Service
File:

backend/app/services/company/permanent_delete_company.py
from fastapi import HTTPException

from app.repositories.company_repository import CompanyRepository


async def permanent_delete_company_service(
    company_repo: CompanyRepository,
    company_id: int,
):
    company = await company_repo.get_by_id_any_status(company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    has_child = await company_repo.has_child_records(company_id)

    if has_child:
        raise HTTPException(
            status_code=400,
            detail="Cannot permanently delete. Child records exist.",
        )

    await company_repo.permanent_delete(company)

    return {
        "message": "Company permanently deleted successfully",
    }
11. Backend: Company Service Wrapper
File:

backend/app/services/company/company_service.py
Purpose:

This file does not contain business logic.
It calls separate service files.
Important permanent delete call:

async def permanent_delete_company(
    self,
    company_id: int,
):
    return await permanent_delete_company_service(
        company_repo=self.company_repo,
        company_id=company_id,
    )
12. Frontend: Company Type
File:

frontend/src/types/company.ts
export type Company = {
  id: number;
  company_code: string;
  company_name: string;
  company_short_name?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
  website?: string | null;
  tax_number?: string | null;
  trade_license?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CompanyCreatePayload = {
  company_code: string;
  company_name: string;
  company_short_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  website?: string;
  tax_number?: string;
  trade_license?: string;
  remarks?: string;
};

export type CompanyUpdatePayload = Partial<CompanyCreatePayload> & {
  is_active?: boolean;
};
Important:

Frontend fields must match backend/database field names.
Use company_email, not email.
Use company_phone, not phone.
Use company_address, not address.
13. Frontend: Company Service
File:

frontend/src/services/company.ts
Purpose:

Frontend components never call backend directly.
They call local Next.js API proxy.
import type { Company, CompanyCreatePayload } from "@/types/company";

type CompanyListResponse =
  | Company[]
  | {
      data?: Company[];
      items?: Company[];
      results?: Company[];
      companies?: Company[];
    };

const normalizeCompanies = (response: CompanyListResponse): Company[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.companies)) return response.companies;

  return [];
};

export const getCompanies = async (): Promise<Company[]> => {
  const response = await fetch("/api/companies", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load companies");
  }

  const data = (await response.json()) as CompanyListResponse;
  return normalizeCompanies(data);
};

export const createCompany = async (
  payload: CompanyCreatePayload
): Promise<Company> => {
  const response = await fetch("/api/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to create company");
  }

  return response.json();
};

export const updateCompany = async (
  id: number,
  payload: CompanyCreatePayload
): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to update company");
  }

  return response.json();
};

export const deactivateCompany = async (id: number): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to mark company inactive"
    );
  }

  return response.json();
};

export const restoreCompany = async (id: number): Promise<Company> => {
  const response = await fetch(`/api/companies/${id}`, {
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to restore company");
  }

  return response.json();
};

export const permanentlyDeleteCompany = async (id: number): Promise<void> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to permanently delete company"
    );
  }
};
14. Frontend: Next API Route for Company List/Create
File:

frontend/src/app/api/companies/route.ts
Purpose:

This route receives frontend request and forwards it to backend.
It also attaches Authorization Bearer token from HttpOnly cookie.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/companies`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
15. Frontend: Next API Route for Update/Permanent Delete
File:

frontend/src/app/api/companies/[id]/route.ts
Important:

PATCH /api/companies/{id}
→ Backend PATCH /companies/{id}

DELETE /api/companies/{id}
→ Backend DELETE /companies/{id}/permanent
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const body = await request.json();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/companies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
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

  const response = await fetch(`${API_URL}/companies/${id}/permanent`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
16. Frontend: Confirm Modal
File:

frontend/src/components/common/ConfirmModal.tsx
Purpose:

Any destructive or important action must be confirmed.
Used for Inactive, Restore, Permanent Delete.
"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "success";

const variantStyleMap: Record<ConfirmVariant, string> = {
  danger: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
  success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60 ${variantStyleMap[variant]}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
17. Frontend: Page Action Bar
File:

frontend/src/components/common/PageActionBar.tsx
Purpose:

Top page action bar.
Only generic page actions should appear here.
Final rule:

Top action bar:
Create | Export | Import

Row action:
Edit | Inactive | Restore | Permanent Delete
"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";

const topActionKeys = ["create", "export", "import"];

const buttonStyleMap: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20",
};

export default function PageActionBar({
  menuKey,
  onCreate,
  onExport,
  onImport,
}: {
  menuKey: string;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}) {
  const { getActionsByMenuKey } = useNavigation();

  const actions = getActionsByMenuKey(menuKey).filter((action) =>
    topActionKeys.includes(action.action_key)
  );

  if (actions.length === 0) return null;

  const handleClick = (actionKey: string) => {
    if (actionKey === "create") {
      onCreate?.();
      return;
    }

    if (actionKey === "export") {
      onExport?.();
      return;
    }

    if (actionKey === "import") {
      onImport?.();
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const Icon = getIcon(action.button_icon);
          const color = action.button_color ?? "secondary";

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleClick(action.action_key)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition ${
                buttonStyleMap[color] ?? buttonStyleMap.secondary
              }`}
            >
              <Icon size={18} />
              {action.action_title}
            </button>
          );
        })}
      </div>
    </section>
  );
}
18. Frontend: Company Row Actions
File:

frontend/src/components/companies/CompanyRowActions.tsx
Purpose:

Row-specific actions.
Uses dynamic RBAC actions from /me/navigation.
Final visibility rule:

Active company:
Edit | Inactive

Inactive company:
Edit | Restore | Permanent Delete
"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";
import type { Company } from "@/types/company";

const rowActionKeys = ["update", "delete", "restore", "permanent_delete"];

const buttonStyleMap: Record<string, string> = {
  warning:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
  secondary:
    "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
};

const getDisplayTitle = (actionKey: string, defaultTitle: string) => {
  if (actionKey === "delete") return "Inactive";
  if (actionKey === "permanent_delete") return "Permanent Delete";
  return defaultTitle;
};

export default function CompanyRowActions({
  company,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: {
  company: Company;
  onEdit: (company: Company) => void;
  onInactive: (company: Company) => void;
  onRestore: (company: Company) => void;
  onPermanentDelete: (company: Company) => void;
}) {
  const { getActionsByMenuKey } = useNavigation();

  const actions = getActionsByMenuKey("company")
    .filter((action) => rowActionKeys.includes(action.action_key))
    .filter((action) => {
      if (action.action_key === "delete") {
        return company.is_active;
      }

      if (action.action_key === "restore") {
        return !company.is_active;
      }

      if (action.action_key === "permanent_delete") {
        return !company.is_active;
      }

      return true;
    });

  if (actions.length === 0) {
    return <span className="text-slate-400">No actions</span>;
  }

  const handleActionClick = (actionKey: string) => {
    if (actionKey === "update") {
      onEdit(company);
      return;
    }

    if (actionKey === "delete") {
      onInactive(company);
      return;
    }

    if (actionKey === "restore") {
      onRestore(company);
      return;
    }

    if (actionKey === "permanent_delete") {
      onPermanentDelete(company);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {actions.map((action) => {
        const Icon = getIcon(action.button_icon);
        const color = action.button_color ?? "secondary";
        const title = getDisplayTitle(action.action_key, action.action_title);

        return (
          <button
            key={action.id}
            type="button"
            title={title}
            onClick={() => handleActionClick(action.action_key)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
              buttonStyleMap[color] ?? buttonStyleMap.secondary
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
19. Frontend: Company Form
File:

frontend/src/components/companies/CompanyForm.tsx
Purpose:

Same form is used for create and edit.
If initialData exists → edit mode.
If initialData is null → create mode.
Core logic:

const [form, setForm] = useState<CompanyCreatePayload>({
  company_name: initialData?.company_name ?? "",
  company_code: initialData?.company_code ?? "",
  company_short_name: initialData?.company_short_name ?? "",
  company_email: initialData?.company_email ?? "",
  company_phone: initialData?.company_phone ?? "",
  company_address: initialData?.company_address ?? "",
  website: initialData?.website ?? "",
  tax_number: initialData?.tax_number ?? "",
  trade_license: initialData?.trade_license ?? "",
  remarks: initialData?.remarks ?? "",
});
Submit logic:

if (initialData) {
  await updateCompany(initialData.id, form);
} else {
  await createCompany(form);
}

onSuccess();
Button text:

{loading ? "Saving..." : initialData ? "Update Company" : "Save Company"}
20. Frontend: Company Page
File:

frontend/src/app/companies/page.tsx
Main responsibilities:

1. Load companies
2. Search companies
3. Filter by status
4. Open create drawer
5. Open edit drawer
6. Open confirm modal
7. Call inactive/restore/permanent delete
8. Refresh table
Important states:

const [companies, setCompanies] = useState<Company[]>([]);
const [loading, setLoading] = useState(true);
const [drawerOpen, setDrawerOpen] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
const [editingCompany, setEditingCompany] = useState<Company | null>(null);
const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
const [confirmLoading, setConfirmLoading] = useState(false);
Status filter type:

type StatusFilter = "all" | "active" | "inactive";
Confirm action type:

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
Search + filter logic:

const filteredCompanies = companies.filter((company) => {
  const keyword = searchTerm.toLowerCase();

  const matchesSearch =
    company.company_name?.toLowerCase().includes(keyword) ||
    company.company_code?.toLowerCase().includes(keyword) ||
    company.company_email?.toLowerCase().includes(keyword) ||
    company.company_phone?.toLowerCase().includes(keyword);

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && company.is_active) ||
    (statusFilter === "inactive" && !company.is_active);

  return matchesSearch && matchesStatus;
});
Top action bar usage:

<PageActionBar
  menuKey="company"
  onCreate={handleCreate}
  onExport={handleExport}
  onImport={handleImport}
/>
Row action usage:

<CompanyRowActions
  company={company}
  onEdit={handleEdit}
  onInactive={(selected) => openConfirm(selected, "inactive")}
  onRestore={(selected) => openConfirm(selected, "restore")}
  onPermanentDelete={(selected) =>
    openConfirm(selected, "permanent_delete")
  }
/>
Confirm modal usage:

<ConfirmModal
  open={Boolean(confirmAction && selectedCompany)}
  title={getConfirmTitle()}
  message={getConfirmMessage()}
  confirmLabel={getConfirmLabel()}
  variant={getConfirmVariant()}
  loading={confirmLoading}
  onConfirm={handleConfirmAction}
  onClose={closeConfirm}
/>
Inactive row style:

<tr
  key={company.id}
  className={`border-t border-slate-100 hover:bg-slate-50 ${
    !company.is_active ? "bg-slate-50 opacity-70" : ""
  }`}
>
21. Dynamic RBAC Action Concept
The frontend does not hardcode permission availability.

It asks:

const { getActionsByMenuKey } = useNavigation();
Then filters actions:

getActionsByMenuKey("company")
That means:

If user has create permission → Create button appears
If user has update permission → Edit button appears
If user has delete permission → Inactive button appears
If user has restore permission → Restore button appears
If user has permanent_delete permission → Permanent Delete appears
22. Important UI/UX Decision
Wrong approach:

Top bar:
Create | Edit | Delete | Restore | Permanent Delete | Export | Import
Why wrong?

Edit/Delete/Restore/Permanent Delete are row-specific.
Top bar does not know which company is selected.
Correct approach:

Top bar:
Create | Export | Import

Row action:
Edit | Inactive | Restore | Permanent Delete
23. Export and Import Current Status
Export and Import are currently placeholder actions.

Current behavior:

Click Export → shows message:
Export feature will be implemented in the next phase.

Click Import → shows message:
Import feature will be implemented in the next phase.
Future export behavior:

Export current filtered company list to Excel or CSV.
Future import behavior:

Upload Excel/CSV
→ Validate
→ Preview errors
→ Confirm import
→ Create companies
24. Run Commands
Backend run
Go to backend:

cd E:\Audit\AMS\backend
Activate virtual environment:

.\.venv\Scripts\Activate.ps1
Run backend:

uvicorn main:app --reload
Backend expected URL:

http://127.0.0.1:8000
Backend Swagger:

http://127.0.0.1:8000/docs
Frontend run
Go to frontend:

cd E:\Audit\AMS\frontend
Run:

npm run dev
Frontend URL:

http://localhost:3000
25. Testing Checklist
Test 1: Navigation
Open:

http://localhost:3000/companies
Expected:

Company menu active
Company page loads
Top bar appears
Table appears
Test 2: Create
Click:

Create
Expected:

Right drawer opens
Fill form
Save Company
Company created
Table refreshes
Expected backend log:

POST /api/v1/companies 201 Created
GET /api/v1/companies 200 OK
Test 3: Edit
Click row edit icon.

Expected:

Drawer opens with existing data
Update data
Click Update Company
Table refreshes
Expected backend log:

PATCH /api/v1/companies/{id} 200 OK
GET /api/v1/companies 200 OK
Test 4: Inactive
Click inactive icon on active row.

Expected:

Confirm modal opens
Message says Mark Company as Inactive
Click Mark Inactive
Status becomes Inactive
Expected backend log:

PATCH /api/v1/companies/{id} 200 OK
GET /api/v1/companies 200 OK
Test 5: Restore
Click restore icon on inactive row.

Expected:

Confirm modal opens
Click Restore
Status becomes Active
Test 6: Permanent Delete
Click permanent delete icon on inactive row.

Expected:

Confirm modal opens
Click Permanent Delete
Row removed from table
Expected backend log:

DELETE /api/v1/companies/{id}/permanent 200 OK
GET /api/v1/companies 200 OK
Test 7: Search
Search by:

Company name
Company code
Email
Phone
Expected:

Table filters instantly
Test 8: Status Filter
Select:

All Status
Active Only
Inactive Only
Expected:

Only matching status rows appear
26. Common Problems and Fixes
Problem 1: PATCH 405 Method Not Allowed
Cause:

Frontend used PUT but backend route uses PATCH.
Fix:

method: "PATCH"
Problem 2: Inactive not working
Cause:

Backend schema did not include is_active
or backend update skipped false value.
Fix schema:

is_active: Optional[bool] = None
Fix update logic:

update_data = payload.model_dump(exclude_unset=True)

for field, value in update_data.items():
    setattr(company, field, value)
Problem 3: Permanent delete not working
Cause:

Frontend called DELETE /companies/{id}
But backend permanent route is DELETE /companies/{id}/permanent
Fix frontend proxy:

const response = await fetch(`${API_URL}/companies/${id}/permanent`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
Problem 4: Wrong field names
Wrong:

email
phone
address
Correct:

company_email
company_phone
company_address
Problem 5: Top bar showing Edit/Delete/Restore/Permanent Delete
Cause:

PageActionBar displayed all actions.
Fix:

const topActionKeys = ["create", "export", "import"];
Problem 6: Row actions showing wrong buttons
Fix rule:

Active row:
Edit + Inactive

Inactive row:
Edit + Restore + Permanent Delete
27. How to Add a New Module Using Same Pattern
Example: Branch module.

Step 1: Backend Model
Create:

backend/app/models/branch.py
Fields example:

id
company_id
branch_code
branch_name
branch_email
branch_phone
branch_address
is_active
created_by
updated_by
created_at
updated_at
Step 2: Backend Schema
Create:

backend/app/schemas/branch.py
Schemas:

BranchCreate
BranchUpdate
BranchResponse
BranchListResponse
BranchMessageResponse
Include:

is_active: Optional[bool] = None
in update schema.

Step 3: Backend Repository
Create:

backend/app/repositories/branch_repository.py
Methods:

list_paginated
get_by_id_any_status
get_by_code
create
update
set_active_status
permanent_delete
has_child_records
Step 4: Backend Services
Create folder:

backend/app/services/branch
Files:

create_branch.py
delete_branch.py
get_branch.py
list_branch.py
restore_branch.py
update_branch.py
permanent_delete_branch.py
branch_service.py
Step 5: Backend API Route
Create:

backend/app/api/v1/branches.py
Routes:

GET     /branches
GET     /branches/{branch_id}
POST    /branches
PATCH   /branches/{branch_id}
DELETE  /branches/{branch_id}
PATCH   /branches/{branch_id}/restore
DELETE  /branches/{branch_id}/permanent
Step 6: Include Router
In main router file:

from app.api.v1.branches import router as branches_router

api_router.include_router(branches_router)
Step 7: Seed Navigation and Permissions
Add menu:

menu_key = branch
menu_title = Branch
route_path = /branches
Actions:

create
update
delete
restore
permanent_delete
export
import
Permissions:

menu.branch.view
api.branch.create
api.branch.update
api.branch.delete
api.branch.restore
api.branch.permanent_delete
api.branch.export
api.branch.import
Step 8: Frontend Types
Create:

frontend/src/types/branch.ts
Step 9: Frontend Services
Create:

frontend/src/services/branch.ts
Functions:

getBranches
createBranch
updateBranch
deactivateBranch
restoreBranch
permanentlyDeleteBranch
Step 10: Frontend API Proxy
Create:

frontend/src/app/api/branches/route.ts
frontend/src/app/api/branches/[id]/route.ts
Map:

/api/branches
→ /api/v1/branches

/api/branches/{id}
→ /api/v1/branches/{id}

/api/branches/{id} DELETE
→ /api/v1/branches/{id}/permanent
Step 11: Frontend Components
Create:

frontend/src/components/branches/BranchForm.tsx
frontend/src/components/branches/BranchRowActions.tsx
Step 12: Frontend Page
Create:

frontend/src/app/branches/page.tsx
Use same structure as company page:

DashboardLayout
PageActionBar
Search
Status Filter
Table
RightDrawer
ConfirmModal
Step 13: Test
Test order:

List
Create
Edit
Inactive
Restore
Permanent Delete
Search
Filter
RBAC buttons
28. Standard Naming Convention for Future Modules
For module name branch:

Backend route: /branches
Frontend page: /branches
Menu key: branch
Service: branch.ts
Type: branch.ts
Form: BranchForm.tsx
Row actions: BranchRowActions.tsx
Repository: branch_repository.py
Service wrapper: branch_service.py
For module name department:

Backend route: /departments
Frontend page: /departments
Menu key: department
For module name designation:

Backend route: /designations
Frontend page: /designations
Menu key: designation
For module name employee:

Backend route: /employees
Frontend page: /employees
Menu key: employee
29. Final Company Module Definition
Company module is now considered complete when:

1. Company menu appears in sidebar
2. Company page opens
3. Create button opens drawer
4. Company can be created
5. Company can be updated
6. Active company shows Edit + Inactive
7. Inactive company shows Edit + Restore + Permanent Delete
8. Inactive action changes status to Inactive
9. Restore changes status to Active
10. Permanent Delete removes row from database
11. Search works
12. Status filter works
13. Top bar only shows Create, Export, Import
14. All actions are RBAC-based
15. API routes align correctly
16. Backend logs show correct methods and paths
30. Final Recommended Development Flow for Every New Module
Always follow this exact order:

1. Confirm database/model fields
2. Create/update backend model
3. Create/update backend schema
4. Create repository
5. Create service functions
6. Create service wrapper
7. Create API route
8. Register API router
9. Create permissions
10. Create navigation menu and actions
11. Test backend in Swagger
12. Create frontend type
13. Create frontend service
14. Create Next API proxy
15. Create form component
16. Create row action component
17. Create page
18. Test list
19. Test create
20. Test update
21. Test inactive
22. Test restore
23. Test permanent delete
24. Test search/filter
25. Test RBAC visibility
Never start frontend before backend route is confirmed in Swagger.

Never call backend directly from frontend components.

Never use hard delete for normal Delete/Inactive action.

Never show row-specific actions in top action bar unless row selection system exists.

31. Final Notes
Company module is now the reference module for AMS.

Branch module should be built by copying the Company module structure and replacing:

Company → Branch
company → branch
companies → branches
company_id/name/code fields → branch fields
The same architecture will make AMS consistent, reusable, scalable, and easier to maintain.

এই document অনুযায়ী এখন Company module তোমার reference master module। Branch module শুরু করার সময় আমরা এই document-এর Section 27–30 follow করব। Create → List → Edit → Inactive → Restore → Permanent Delete pattern একদম একই থাকবে।
Keep this as docs/company-crud-module-guide.md অথবা docs/module-development-standard.md.
北京pk

Thought for 1m 44s

Branch module শুরু কর

Thought for 36s
চলো Branch Module শুরু করি ✅
আমরা Company module-এর exact standard pattern follow করব।

আজকের কাজ: Branch Frontend CRUD Skeleton + API Proxy + Page + Form + Row Actions

Backend route আমরা এই pattern ধরে align করব:

GET     /api/v1/branches
POST    /api/v1/branches
PATCH   /api/v1/branches/{id}
DELETE  /api/v1/branches/{id}/permanent
Step 0: Frontend folder/file create করো
PowerShell এ frontend folder-এ যাও:

cd E:\Audit\AMS\frontend
এখন files/folders create করো:

New-Item -ItemType Directory -Force src\components\branches
New-Item -ItemType Directory -Force src\app\branches
New-Item -ItemType Directory -Force src\app\api\branches
New-Item -ItemType Directory -Force 'src\app\api\branches\[id]'

New-Item -ItemType File -Force src\types\branch.ts
New-Item -ItemType File -Force src\services\branch.ts
New-Item -ItemType File -Force src\components\branches\BranchForm.tsx
New-Item -ItemType File -Force src\components\branches\BranchRowActions.tsx
New-Item -ItemType File -Force src\app\branches\page.tsx
New-Item -ItemType File -Force src\app\api\branches\route.ts
New-Item -ItemType File -Force 'src\app\api\branches\[id]\route.ts'
1. Branch Type
Full path:

E:\Audit\AMS\frontend\src\types\branch.ts
Paste:

export type Branch = {
  id: number;
  company_id: number;
  company_name?: string | null;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string | null;
  branch_email?: string | null;
  branch_phone?: string | null;
  branch_address?: string | null;
  remarks?: string | null;
  is_active: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BranchCreatePayload = {
  company_id: number;
  branch_code: string;
  branch_name: string;
  branch_short_name?: string;
  branch_email?: string;
  branch_phone?: string;
  branch_address?: string;
  remarks?: string;
};

export type BranchUpdatePayload = Partial<BranchCreatePayload> & {
  is_active?: boolean;
};
2. Branch Service
Full path:

E:\Audit\AMS\frontend\src\services\branch.ts
Paste:

import type { Branch, BranchCreatePayload } from "@/types/branch";

type BranchListResponse =
  | Branch[]
  | {
      data?: Branch[];
      items?: Branch[];
      results?: Branch[];
      branches?: Branch[];
    };

const normalizeBranches = (response: BranchListResponse): Branch[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.branches)) return response.branches;

  return [];
};

export const getBranches = async (): Promise<Branch[]> => {
  const response = await fetch("/api/branches?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load branches");
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to create branch");
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to update branch");
  }

  return response.json();
};

export const deactivateBranch = async (id: number): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      is_active: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to mark branch inactive"
    );
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to restore branch");
  }

  return response.json();
};

export const permanentlyDeleteBranch = async (id: number): Promise<void> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to permanently delete branch"
    );
  }
};
3. Branch API Proxy: List/Create
Full path:

E:\Audit\AMS\frontend\src\app\api\branches\route.ts
Paste:

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function GET(request: Request) {
  const accessToken = await getAccessToken();
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(
    `${API_URL}/branches${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  const body = await request.json();

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
4. Branch API Proxy: Update/Permanent Delete
Full path:

E:\Audit\AMS\frontend\src\app\api\branches\[id]\route.ts
Paste:

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = await getAccessToken();
  const body = await request.json();
  const { id } = await params;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
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

  const response = await fetch(`${API_URL}/branches/${id}/permanent`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
5. Branch Row Actions
Full path:

E:\Audit\AMS\frontend\src\components\branches\BranchRowActions.tsx
Paste:

"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";
import type { Branch } from "@/types/branch";

const rowActionKeys = ["update", "delete", "restore", "permanent_delete"];

const buttonStyleMap: Record<string, string> = {
  warning:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
  secondary:
    "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
};

const getDisplayTitle = (actionKey: string, defaultTitle: string) => {
  if (actionKey === "delete") return "Inactive";
  if (actionKey === "permanent_delete") return "Permanent Delete";
  return defaultTitle;
};

export default function BranchRowActions({
  branch,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onInactive: (branch: Branch) => void;
  onRestore: (branch: Branch) => void;
  onPermanentDelete: (branch: Branch) => void;
}) {
  const { getActionsByMenuKey } = useNavigation();

  const actions = getActionsByMenuKey("branch")
    .filter((action) => rowActionKeys.includes(action.action_key))
    .filter((action) => {
      if (action.action_key === "delete") {
        return branch.is_active;
      }

      if (action.action_key === "restore") {
        return !branch.is_active;
      }

      if (action.action_key === "permanent_delete") {
        return !branch.is_active;
      }

      return true;
    });

  if (actions.length === 0) {
    return <span className="text-slate-400">No actions</span>;
  }

  const handleActionClick = (actionKey: string) => {
    if (actionKey === "update") {
      onEdit(branch);
      return;
    }

    if (actionKey === "delete") {
      onInactive(branch);
      return;
    }

    if (actionKey === "restore") {
      onRestore(branch);
      return;
    }

    if (actionKey === "permanent_delete") {
      onPermanentDelete(branch);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {actions.map((action) => {
        const Icon = getIcon(action.button_icon);
        const color = action.button_color ?? "secondary";
        const title = getDisplayTitle(action.action_key, action.action_title);

        return (
          <button
            key={action.id}
            type="button"
            title={title}
            onClick={() => handleActionClick(action.action_key)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
              buttonStyleMap[color] ?? buttonStyleMap.secondary
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
6. Branch Form
Full path:

E:\Audit\AMS\frontend\src\components\branches\BranchForm.tsx
Paste:

"use client";

import { useEffect, useState } from "react";

import { getCompanies } from "@/services/company";
import { createBranch, updateBranch } from "@/services/branch";
import type { Branch, BranchCreatePayload } from "@/types/branch";
import type { Company } from "@/types/company";

type BranchFormState = {
  company_id: string;
  branch_code: string;
  branch_name: string;
  branch_short_name: string;
  branch_email: string;
  branch_phone: string;
  branch_address: string;
  remarks: string;
};

const getInitialForm = (initialData?: Branch | null): BranchFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_code: initialData?.branch_code ?? "",
  branch_name: initialData?.branch_name ?? "",
  branch_short_name: initialData?.branch_short_name ?? "",
  branch_email: initialData?.branch_email ?? "",
  branch_phone: initialData?.branch_phone ?? "",
  branch_address: initialData?.branch_address ?? "",
  remarks: initialData?.remarks ?? "",
});

export default function BranchForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BranchFormState>(
    getInitialForm(initialData)
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(initialData));
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    field: keyof BranchFormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const buildPayload = (): BranchCreatePayload => ({
    company_id: Number(form.company_id),
    branch_code: form.branch_code.trim(),
    branch_name: form.branch_name.trim(),
    branch_short_name: form.branch_short_name.trim(),
    branch_email: form.branch_email.trim(),
    branch_phone: form.branch_phone.trim(),
    branch_address: form.branch_address.trim(),
    remarks: form.remarks.trim(),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.company_id) {
      setError("Company is required");
      return;
    }

    if (!form.branch_name.trim()) {
      setError("Branch name is required");
      return;
    }

    if (!form.branch_code.trim()) {
      setError("Branch code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = buildPayload();

      if (initialData) {
        await updateBranch(initialData.id, payload);
      } else {
        await createBranch(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Branch save failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Branch save failed. Please try again."
      );
    } finally {
      setLoading(false);
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
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company <span className="text-red-500">*</span>
        </label>

        <select
          value={form.company_id}
          onChange={(event) => handleChange("company_id", event.target.value)}
          disabled={companyLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">
            {companyLoading ? "Loading companies..." : "Select company"}
          </option>

          {companies
            .filter((company) => company.is_active)
            .map((company) => (
              <option key={company.id} value={company.id}>
                {company.company_name} ({company.company_code})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Name <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_name}
          onChange={(event) => handleChange("branch_name", event.target.value)}
          placeholder="Enter branch name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Code <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_code}
          onChange={(event) => handleChange("branch_code", event.target.value)}
          placeholder="Enter branch code"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Short Name
        </label>

        <input
          value={form.branch_short_name}
          onChange={(event) =>
            handleChange("branch_short_name", event.target.value)
          }
          placeholder="Enter short name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          value={form.branch_email}
          onChange={(event) => handleChange("branch_email", event.target.value)}
          placeholder="Enter email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Phone
        </label>

        <input
          value={form.branch_phone}
          onChange={(event) => handleChange("branch_phone", event.target.value)}
          placeholder="Enter phone"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Address
        </label>

        <textarea
          value={form.branch_address}
          onChange={(event) =>
            handleChange("branch_address", event.target.value)
          }
          placeholder="Enter address"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Remarks
        </label>

        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Enter remarks"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Branch"
              : "Save Branch"}
        </button>
      </div>
    </form>
  );
}
7. Branch Page
Full path:

E:\Audit\AMS\frontend\src\app\branches\page.tsx
Paste:

"use client";

import { useEffect, useState } from "react";
import { Filter, GitBranch, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import BranchForm from "@/components/branches/BranchForm";
import BranchRowActions from "@/components/branches/BranchRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  deactivateBranch,
  getBranches,
  permanentlyDeleteBranch,
  restoreBranch,
} from "@/services/branch";
import type { Branch } from "@/types/branch";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getBranches()
      .then((data) => {
        if (!cancelled) {
          setBranches(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load branches:", error);
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

  const filteredBranches = branches.filter((branch) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      branch.branch_name?.toLowerCase().includes(keyword) ||
      branch.branch_code?.toLowerCase().includes(keyword) ||
      branch.branch_email?.toLowerCase().includes(keyword) ||
      branch.branch_phone?.toLowerCase().includes(keyword) ||
      branch.company_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

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
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBranch(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingBranch);

    setDrawerOpen(false);
    setEditingBranch(null);

    showSuccess(
      wasEditing
        ? "Branch updated successfully."
        : "Branch created successfully."
    );

    loadBranches();
  };

  const openConfirm = (branch: Branch, action: ConfirmAction) => {
    setSelectedBranch(branch);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedBranch(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBranch || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateBranch(selectedBranch.id);
        showSuccess("Branch marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreBranch(selectedBranch.id);
        showSuccess("Branch restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteBranch(selectedBranch.id);
        showSuccess("Branch permanently deleted successfully.");
      }

      setSelectedBranch(null);
      setConfirmAction(null);
      loadBranches();
    } catch (error) {
      console.error("Branch action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Branch action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Branch as Inactive?";
    if (confirmAction === "restore") return "Restore Branch?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Branch?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedBranch) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedBranch.branch_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedBranch.branch_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedBranch.branch_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <GitBranch size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Branch Management</h1>
              <p className="mt-1 text-blue-100">
                Manage company branches with RBAC-based actions.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="branch"
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
              <h2 className="text-xl font-black text-slate-900">Branches</h2>
              <p className="text-sm text-slate-500">
                Branch list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search branch..."
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
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
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
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading branches...
                    </td>
                  </tr>
                ) : filteredBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No branch data found. Click Create to add first branch.
                    </td>
                  </tr>
                ) : (
                  filteredBranches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !branch.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branch.company_name || `Company #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {branch.branch_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {branch.branch_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            branch.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <BranchRowActions
                          branch={branch}
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
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        onClose={handleCloseDrawer}
      >
        <BranchForm
          initialData={editingBranch}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedBranch)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function BranchesPage() {
  return <BranchesContent />;
}
8. Run frontend
npm run dev
Open:

http://localhost:3000/branches
9. Expected result
যদি backend branch routes already ঠিক থাকে, তাহলে:

GET /api/v1/branches 200 OK
Page-এ দেখাবে:

Branch Management
Create | Export | Import
Search
Status Filter
Table
Create click করলে drawer open হবে এবং company dropdown আসবে।

10. এখন test order
প্রথমে শুধু এই ৩টা test করো:

1. /branches page load হয় কিনা
2. Create drawer open হয় কিনা
3. Company dropdown load হয় কিনা
তারপর create/update/inactive/restore/permanent delete test করব।

যদি error আসে, backend/frontend terminal log পাঠাও। Especially এইগুলো দরকার হবে:

GET /api/v1/branches ...
POST /api/v1/branches ...
PATCH /api/v1/branches/{id} ...
DELETE /api/v1/branches/{id}/permanent ...

[{
	"resource": "/e:/Audit/AMS/frontend/src/components/branches/BranchForm.tsx",
	"owner": "eslint5",
	"code": {
		"value": "react-hooks/set-state-in-effect",
		"target": {
			"$mid": 1,
			"path": "/reference/eslint-plugin-react-hooks/lints/set-state-in-effect",
			"scheme": "https",
			"authority": "react.dev"
		}
	},
	"severity": 8,
	"message": "Error: Calling setState synchronously within an effect can trigger cascading renders\n\nEffects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:\n* Update external systems with the latest state from React.\n* Subscribe for updates from some external system, calling setState in a callback function when external state changes.\n\nCalling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).\n\nE:\\Audit\\AMS\\frontend\\src\\components\\branches\\BranchForm.tsx:50:5\n  48 |\n  49 |   useEffect(() => {\n> 50 |     setForm(getInitialForm(initialData));\n     |     ^^^^^^^ Avoid calling setState() directly within an effect\n  51 |   }, [initialData]);\n  52 |\n  53 |   useEffect(() => {",
	"source": "eslint",
	"startLineNumber": 50,
	"startColumn": 5,
	"endLineNumber": 50,
	"endColumn": 12,
	"modelVersionId": 2,
	"origin": "extHost1"
}]

Thought for 11s
এই error হচ্ছে কারণ BranchForm.tsx-এ এই line আছে:

useEffect(() => {
  setForm(getInitialForm(initialData));
}, [initialData]);
Next/React lint এটাকে block করছে। Fix হলো: এই sync setForm effect বাদ দিতে হবে এবং BranchForm-এ key দিতে হবে যেন create/edit mode change হলে form fresh remount হয়।

1. Replace BranchForm.tsx
Full path:

E:\Audit\AMS\frontend\src\components\branches\BranchForm.tsx
পুরো file replace করো:

"use client";

import { useEffect, useState, type FormEvent } from "react";

import { createBranch, updateBranch } from "@/services/branch";
import { getCompanies } from "@/services/company";
import type { Branch, BranchCreatePayload } from "@/types/branch";
import type { Company } from "@/types/company";

type BranchFormState = {
  company_id: string;
  branch_code: string;
  branch_name: string;
  branch_short_name: string;
  branch_email: string;
  branch_phone: string;
  branch_address: string;
  remarks: string;
};

const getInitialForm = (initialData?: Branch | null): BranchFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_code: initialData?.branch_code ?? "",
  branch_name: initialData?.branch_name ?? "",
  branch_short_name: initialData?.branch_short_name ?? "",
  branch_email: initialData?.branch_email ?? "",
  branch_phone: initialData?.branch_phone ?? "",
  branch_address: initialData?.branch_address ?? "",
  remarks: initialData?.remarks ?? "",
});

export default function BranchForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BranchFormState>(() =>
    getInitialForm(initialData)
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: keyof BranchFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const buildPayload = (): BranchCreatePayload => ({
    company_id: Number(form.company_id),
    branch_code: form.branch_code.trim(),
    branch_name: form.branch_name.trim(),
    branch_short_name: form.branch_short_name.trim(),
    branch_email: form.branch_email.trim(),
    branch_phone: form.branch_phone.trim(),
    branch_address: form.branch_address.trim(),
    remarks: form.remarks.trim(),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.company_id) {
      setError("Company is required");
      return;
    }

    if (!form.branch_name.trim()) {
      setError("Branch name is required");
      return;
    }

    if (!form.branch_code.trim()) {
      setError("Branch code is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = buildPayload();

      if (initialData) {
        await updateBranch(initialData.id, payload);
      } else {
        await createBranch(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Branch save failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Branch save failed. Please try again."
      );
    } finally {
      setLoading(false);
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
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company <span className="text-red-500">*</span>
        </label>

        <select
          value={form.company_id}
          onChange={(event) => handleChange("company_id", event.target.value)}
          disabled={companyLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">
            {companyLoading ? "Loading companies..." : "Select company"}
          </option>

          {companies
            .filter((company) => company.is_active)
            .map((company) => (
              <option key={company.id} value={company.id}>
                {company.company_name} ({company.company_code})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Name <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_name}
          onChange={(event) => handleChange("branch_name", event.target.value)}
          placeholder="Enter branch name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Code <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_code}
          onChange={(event) => handleChange("branch_code", event.target.value)}
          placeholder="Enter branch code"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Short Name
        </label>

        <input
          value={form.branch_short_name}
          onChange={(event) =>
            handleChange("branch_short_name", event.target.value)
          }
          placeholder="Enter short name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          value={form.branch_email}
          onChange={(event) => handleChange("branch_email", event.target.value)}
          placeholder="Enter email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Phone
        </label>

        <input
          value={form.branch_phone}
          onChange={(event) => handleChange("branch_phone", event.target.value)}
          placeholder="Enter phone"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Address
        </label>

        <textarea
          value={form.branch_address}
          onChange={(event) =>
            handleChange("branch_address", event.target.value)
          }
          placeholder="Enter address"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Remarks
        </label>

        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Enter remarks"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Branch"
              : "Save Branch"}
        </button>
      </div>
    </form>
  );
}
2. branches/page.tsx-এ BranchForm usage update করো
Full path:

E:\Audit\AMS\frontend\src\app\branches\page.tsx
এই অংশ খুঁজো:

<BranchForm
  initialData={editingBranch}
  onSuccess={handleSuccess}
  onCancel={handleCloseDrawer}
/>
এটা দিয়ে replace করো:

<BranchForm
  key={editingBranch ? `edit-branch-${editingBranch.id}` : "create-branch"}
  initialData={editingBranch}
  onSuccess={handleSuccess}
  onCancel={handleCloseDrawer}
/>
এখন lint error চলে যাবে।
তারপর run করো:

npm run dev

PS E:\Audit\AMS\frontend> npm run dev                                              
                  
> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.20.80.1:3000
- Environments: .env.local
✓ Ready in 608ms
⚠ Turbopack's filesystem cache has been deleted because we previously detected an internal error in Turbopack. Builds or page loads may be slower as a result.

Thought for 4s
এটা কোনো problem না ✅

এই warningটা শুধু Turbopack cache নিয়ে:

Turbopack's filesystem cache has been deleted...
মানে আগের কোনো internal cache issue ছিল, তাই cache clear হয়েছে। App ঠিকমতো run হচ্ছে:

✓ Ready in 608ms
এখন browser-এ open করো:

http://localhost:3000/branches
তারপর এই ৩টা check করো:

1. Branch Management page load হয় কিনা
2. Create button দেখা যায় কিনা
3. Create click করলে drawer open হয় কিনা
4. Company dropdown-এ active company list আসে কিনা
Backend terminal-এ expected log:

GET /api/v1/me/navigation 200 OK
GET /api/v1/branches 200 OK
GET /api/v1/companies 200 OK
যদি /branches page blank হয়, button না আসে, বা GET /api/v1/branches 404/403/500 দেয়—তাহলে frontend ও backend terminal log পাঠাও।


PS E:\Audit\AMS\frontend> npm run dev

> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.20.80.1:3000
- Environments: .env.local
✓ Ready in 349ms

 GET /login 200 in 361ms (next.js: 92ms, proxy.ts: 6ms, application-code: 264ms)
⨯ [TypeError: fetch failed] {
  [cause]: Error: connect ECONNREFUSED 127.0.0.1:8000
      at <unknown> (Error: connect ECONNREFUSED 127.0.0.1:8000) {
    errno: -4078,
    code: 'ECONNREFUSED',
    syscall: 'connect',
    address: '127.0.0.1',
    port: 8000
  }
}
 POST /api/auth/login 500 in 125ms (next.js: 62ms, application-code: 63ms)

Thought for a few seconds
Frontend ঠিক আছে ✅
Problem হলো backend server বন্ধ আছে।

Error:

connect ECONNREFUSED 127.0.0.1:8000
মানে frontend login API backend-এ connect করতে পারছে না:

http://127.0.0.1:8000
Fix: Backend চালু করো
নতুন PowerShell terminal open করো।

cd E:\Audit\AMS\backend
venv activate করো:

.\.venv\Scripts\Activate.ps1
তারপর backend run করো:

uvicorn main:app --reload
Expected output:

Uvicorn running on http://127.0.0.1:8000
তারপর test করো
Browser-এ open করো:

http://127.0.0.1:8000/docs
যদি Swagger open হয়, backend ঠিক আছে।

তারপর frontend-এ আবার login করো:

http://localhost:3000/login
এরপর /branches open করো।

তোমার দুইটা terminal চলতে হবে
Backend terminal:

E:\Audit\AMS\backend
uvicorn main:app --reload
Frontend terminal:

E:\Audit\AMS\frontend
npm run dev
Backend চালু না থাকলে login, companies, branches—কিছুই API থেকে data আনতে পারবে না।


Problem হলো backend server বন্ধ আছে but why shows this error "Invalid user ID or password". It should be proper message "Server Unreachable or Stop"

Thought for 7s
ঠিক বলেছো ✅
Backend server বন্ধ থাকলে “Invalid user ID or password” দেখানো ভুল। এটা misleading message.

কারণ এখন তোমার frontend login flow সম্ভবত সব error এক জায়গায় catch করে এই message দেখাচ্ছে:

Invalid user ID or password
কিন্তু আসলে error type আলাদা হওয়া উচিত:

401 Unauthorized → Invalid user ID or password
503 / fetch failed / ECONNREFUSED → Server unreachable. Please start backend server.
500 → Login server error
এটা fix করতে হবে দুই জায়গায়:

1. Update Login API Proxy
Full path:

E:\Audit\AMS\frontend\src\app\api\auth\login\route.ts
পুরো file replace করো:

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!API_URL) {
      return NextResponse.json(
        {
          message: "Frontend API URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: any = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 401
              ? "Invalid user ID or password."
              : data.detail || data.message || "Login failed.",
        },
        { status: response.status }
      );
    }

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        {
          message: "Login succeeded but token was not received from server.",
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Login successful.",
        user: data.user ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
2. Login Page-এ error message backend থেকে দেখাও
Full path likely:

E:\Audit\AMS\frontend\src\app\login\page.tsx
তোমার login submit function-এর catch বা if (!response.ok) অংশে ensure করো এটা আছে:

const data = await response.json();

if (!response.ok) {
  setError(data.message || "Login failed. Please try again.");
  return;
}
পুরো login request pattern এমন হওয়া উচিত:

const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: userId,
    password,
  }),
});

const data = await response.json();

if (!response.ok) {
  setError(data.message || "Login failed. Please try again.");
  return;
}
আর catch block:

catch (error) {
  console.error("Login failed:", error);
  setError("Network error. Please check your connection and try again.");
}
Expected result
Backend বন্ধ থাকলে এখন দেখাবে:

Server unreachable. Please start the backend server and try again.
Wrong password দিলে দেখাবে:

Invalid user ID or password.
Backend internal error হলে দেখাবে:

Login failed.
এটাই proper enterprise UX. Backend connection error আর credential error কখনো same message হওয়া উচিত না.


আগে এক্সিস্টিং কোড চেক কর তারপরে আপগ্রেটেড কোড প্রদান কর
# E:\Audit\AMS\frontend\src\app\api\auth\login\route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(
    ${process.env.NEXT_PUBLIC_API_URL}/auth/login,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Invalid user ID or password" },
      { status: 401 }
    );
  }

  const data = await response.json();

  const res = NextResponse.json({
    message: "Login successful",
  });

  res.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return res;
}

# E:\Audit\AMS\frontend\src\app\login\page.tsx

"use client";

import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async () => {
  try {
    setLoading(true);
    setError("");

    await login({
      user_id: userId,
      password,
    });

    router.push("/dashboard");
  } catch {
    setError("Invalid user ID or password");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-800">
          AMS Login
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Audit Management System
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full rounded border p-3"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <input
            className="w-full rounded border p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

Thought for 16s
চেক করলাম। তোমার current code-এ problem ২ জায়গায়:

src/app/api/auth/login/route.ts — backend যেকোনো non-OK response দিলেই hardcoded Invalid user ID or password return করছে।

src/app/login/page.tsx — catch block সব error-কে আবার hardcoded Invalid user ID or password বানিয়ে দিচ্ছে।

আর যেহেতু login page login() service ব্যবহার করছে, তাই src/services/auth.ts-ও message pass করার মতো হওয়া দরকার।

1. Replace Login API Proxy
Full path:

E:\Audit\AMS\frontend\src\app\api\auth\login\route.ts
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BackendLoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: unknown;
  message?: string;
  detail?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!API_URL) {
      return NextResponse.json(
        {
          message: "Frontend API URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as BackendLoginResponse;

    if (!response.ok) {
      let message = data.detail || data.message || "Login failed.";

      if (response.status === 401) {
        message = "Invalid user ID or password.";
      }

      if (response.status === 403) {
        message = data.detail || data.message || "You are not allowed to login.";
      }

      return NextResponse.json(
        {
          message,
        },
        { status: response.status }
      );
    }

    if (!data.access_token || !data.refresh_token) {
      return NextResponse.json(
        {
          message: "Login succeeded but token was not received from server.",
        },
        { status: 502 }
      );
    }

    const res = NextResponse.json(
      {
        message: "Login successful.",
        user: data.user ?? null,
      },
      { status: 200 }
    );

    res.cookies.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    res.cookies.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login API proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
2. Update Auth Service
Full path:

E:\Audit\AMS\frontend\src\services\auth.ts
এই file-টা যদি already থাকে, পুরোটা replace করো:

type LoginPayload = {
  user_id: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  user?: unknown;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse;

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Please try again.");
  }

  return data;
};
3. Replace Login Page
Full path:

E:\Audit\AMS\frontend\src\app\login\page.tsx
"use client";

import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!userId.trim()) {
      setError("User ID is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login({
        user_id: userId.trim(),
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-800">
          AMS Login
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Audit Management System
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full rounded border p-3"
            placeholder="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            disabled={loading}
          />

          <input
            className="w-full rounded border p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
Expected Result
Backend বন্ধ থাকলে দেখাবে:

Server unreachable. Please start the backend server and try again.
Wrong password হলে দেখাবে:

Invalid user ID or password.
Token issue হলে দেখাবে:

Login succeeded but token was not received from server.
এরপর frontend restart করো:

CTRL + C
npm run dev

PS E:\Audit\AMS\frontend> npm run dev

> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.20.80.1:3000
- Environments: .env.local
✓ Ready in 364ms

⨯ ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx



./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-ssr] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx


 GET /dashboard 500 in 423ms (next.js: 228ms, proxy.ts: 11ms, application-code: 184ms)
⨯ ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx



./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-ssr] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx


 GET /dashboard 500 in 28ms (next.js: 9ms, proxy.ts: 6ms, application-code: 13ms)
[browser] Uncaught Error: ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx


    at <unknown> (Error: ./src/components/layout/DashboardLayout.tsx:15:1)
    at <unknown> (Error: (./src/components/layout/DashboardLayout.tsx:15:1)
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-ssr] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-ssr] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-client] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 
[browser] ./src/components/layout/DashboardLayout.tsx:15:1
Export logout doesn't exist in target module
  13 |
  14 | import EnterpriseSidebar from "./EnterpriseSidebar";
> 15 | import { logout } from "@/services/auth";
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  16 | import {
  17 |   NavigationProvider,
  18 |   useNavigation,

The export logout was not found in module [project]/src/services/auth.ts [app-ssr] (ecmascript).
Did you mean to import login?
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.

Import trace:
  Server Component:
    ./src/components/layout/DashboardLayout.tsx
    ./src/app/dashboard/page.tsx 

Thought for 9s
ঠিক ধরেছো। এই error আমার আগের auth.ts replace করার কারণে হয়েছে। তোমার DashboardLayout.tsx-এ এই import আছে:

import { logout } from "@/services/auth";
কিন্তু নতুন auth.ts-এ আমি শুধু login দিয়েছিলাম, logout export বাদ পড়ে গেছে। তাই এখন শুধু src/services/auth.ts ঠিক করলেই error যাবে।

Replace auth.ts
Full path:

E:\Audit\AMS\frontend\src\services\auth.ts
পুরো file replace করো:

type LoginPayload = {
  user_id: string;
  password: string;
};

type LoginResponse = {
  message?: string;
  user?: unknown;
};

type ErrorResponse = {
  message?: string;
  detail?: string;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as LoginResponse &
    ErrorResponse;

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || "Login failed. Please try again."
    );
  }

  return data;
};

export const logout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as ErrorResponse;

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Logout failed.");
  }
};
যদি logout API route না থাকে
এই file check করো:

E:\Audit\AMS\frontend\src\app\api\auth\logout\route.ts
না থাকলে create করো:

New-Item -ItemType Directory -Force src\app\api\auth\logout
New-Item -ItemType File -Force src\app\api\auth\logout\route.ts
তারপর paste করো:

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      message: "Logout successful.",
    },
    { status: 200 }
  );

  response.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });

  return response;
}
তারপর frontend restart করো:

CTRL + C
npm run dev
Expected: DashboardLayout.tsx error চলে যাবে।


image(245).png
image(246).png
দ্বিতীয় image চেক করো it seems bigger এটাকে full পেজের (image-1) সাথে মানানসই কর যাতে দেখতে সুন্দর লাগে

Thought for 7s
হ্যাঁ, ঠিকই ধরেছো — 2nd image-এ Branch hero/banner একটু বেশি বড় লাগছে।
Main কারণ হচ্ছে banner section visually একটু bulky লাগছে:

p-8 padding বেশি

icon box h-16 w-16 বড়

title text-3xl + full-width gradient area

cropped view-তে এটা আরও বড় মনে হচ্ছে

যেহেতু তুমি চাও এটা image-1 এর full page layout-এর সাথে balanced দেখাক, তাই best fix হলো:

কী change করব
banner vertical padding একটু কমাব

icon box একটু ছোট করব

heading responsive করব

subtitle font একটু soft করব

overall section exact same style family-তে রাখব

Exact Replace
File:
E:\Audit\AMS\frontend\src\app\branches\page.tsx
এই অংশটা খুঁজো:
<section className="rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 p-8 text-white shadow-xl">
  <div className="flex items-center gap-4">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
      <GitBranch size={34} />
    </div>

    <div>
      <h1 className="text-3xl font-black">Branch Management</h1>
      <p className="mt-1 text-blue-100">
        Manage company branches with RBAC-based actions.
      </p>
    </div>
  </div>
</section>
এটা দিয়ে replace করো:
<section className="rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 px-8 py-6 text-white shadow-xl md:px-9 md:py-7">
  <div className="flex items-center gap-4">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 md:h-16 md:w-16">
      <GitBranch size={30} />
    </div>

    <div>
      <h1 className="text-2xl font-black tracking-tight md:text-3xl">
        Branch Management
      </h1>
      <p className="mt-1 text-sm text-blue-100 md:text-base">
        Manage company branches with RBAC-based actions.
      </p>
    </div>
  </div>
</section>
কেন এটা better হবে
এই পরিবর্তনের পর:

banner height একটু কমবে

full page-এর সঙ্গে proportion better হবে

sidebar + action bar + table এর সাথে visually balanced লাগবে

mobile/tablet/desktop সবখানেই cleaner দেখাবে

যদি Company page-এর সাথে 100% same standard রাখতে চাও
তাহলে later আমরা একটা reusable shared component বানাতে পারি:

src/components/common/ModuleHero.tsx
তারপর Company, Branch, Department, Designation, Employee — সব module-এ same hero pattern use করব।
এতে সব page perfectly consistent হবে।

Optional polish
আরও সুন্দর করতে চাইলে subtitle width limit করতে পারো:

<p className="mt-1 max-w-2xl text-sm text-blue-100 md:text-base">
  Manage company branches with RBAC-based actions.
</p>
এতে text line-length সুন্দর হবে।

Final recommendation
এখন best practical fix: শুধু উপরের hero section replace করো।
এটাই image-1 এর সঙ্গে সবচেয়ে মানানসই হবে।

চাইলে next message-এ আমি তোমাকে full updated src\app\branches\page.tsx clean version দিয়ে দিতে পারি, যাতে hero + filter + table spacing সব perfectly balanced থাকে।


100% same standard রাখতে Company, Branch, Department, Designation, Employee — সব module-এ same hero pattern use করব। এতে সব page perfectly consistent হবে। আরও সুন্দর করতে চাই subtitle width limit করতে পারো


Pasted code(1).ts
TypeScript
provide full updated code:
E:\Audit\AMS\frontend\src\app\companies\page.tsx

Thought for 11s
তোমার current file-এ ModuleHero import করা আছে, কিন্তু old <section> hero এখনো use হচ্ছে। তাই full updated companies/page.tsx নিচে দিলাম—এখানে Company hero এখন reusable ModuleHero দিয়ে করা হয়েছে এবং CompanyForm-এ key দেওয়া হয়েছে যেন create/edit mode সবসময় clean থাকে। 


Full path:

E:\Audit\AMS\frontend\src\app\companies\page.tsx
"use client";

import { useEffect, useState } from "react";
import { Building2, Filter, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import CompanyForm from "@/components/companies/CompanyForm";
import CompanyRowActions from "@/components/companies/CompanyRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  deactivateCompany,
  getCompanies,
  permanentlyDeleteCompany,
  restoreCompany,
} from "@/services/company";
import type { Company } from "@/types/company";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
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

  const filteredCompanies = companies.filter((company) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      company.company_name?.toLowerCase().includes(keyword) ||
      company.company_code?.toLowerCase().includes(keyword) ||
      company.company_email?.toLowerCase().includes(keyword) ||
      company.company_phone?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && company.is_active) ||
      (statusFilter === "inactive" && !company.is_active);

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
    setEditingCompany(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCompany(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingCompany);

    setDrawerOpen(false);
    setEditingCompany(null);

    showSuccess(
      wasEditing
        ? "Company updated successfully."
        : "Company created successfully."
    );

    loadCompanies();
  };

  const openConfirm = (company: Company, action: ConfirmAction) => {
    setSelectedCompany(company);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedCompany(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedCompany || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateCompany(selectedCompany.id);
        showSuccess("Company marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreCompany(selectedCompany.id);
        showSuccess("Company restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteCompany(selectedCompany.id);
        showSuccess("Company permanently deleted successfully.");
      }

      setSelectedCompany(null);
      setConfirmAction(null);
      loadCompanies();
    } catch (error) {
      console.error("Company action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Company action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Company as Inactive?";
    if (confirmAction === "restore") return "Restore Company?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Company?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedCompany) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedCompany.company_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedCompany.company_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedCompany.company_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleHero
          icon={Building2}
          title="Company Management"
          description="Manage organization companies with RBAC-based actions."
        />

        <PageActionBar
          menuKey="company"
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
              <h2 className="text-xl font-black text-slate-900">Companies</h2>
              <p className="text-sm text-slate-500">
                Company list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search company..."
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
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
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
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading companies...
                    </td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No company data found. Click Create to add first company.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company, index) => (
                    <tr
                      key={company.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !company.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {company.company_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {company.company_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {company.company_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            company.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {company.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <CompanyRowActions
                          company={company}
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
        title={editingCompany ? "Edit Company" : "Create Company"}
        onClose={handleCloseDrawer}
      >
        <CompanyForm
          key={
            editingCompany
              ? `edit-company-${editingCompany.id}`
              : "create-company"
          }
          initialData={editingCompany}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedCompany)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function CompaniesPage() {
  return <CompaniesContent />;
}
Run/check:

npm run dev
Open:

http://localhost:3000/companies


Pasted code(2).ts
TypeScript
provide full updated code-E:\Audit\AMS\frontend\src\app\branches\page.tsx

Thought for 5s
তোমার current branches/page.tsx-এ old hero <section> এখনো আছে। নিচের full updated code-এ ModuleHero use করা হয়েছে এবং BranchForm key formatting clean করা হয়েছে। 


Full path:

E:\Audit\AMS\frontend\src\app\branches\page.tsx
"use client";

import { useEffect, useState } from "react";
import { Filter, GitBranch, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import BranchForm from "@/components/branches/BranchForm";
import BranchRowActions from "@/components/branches/BranchRowActions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  deactivateBranch,
  getBranches,
  permanentlyDeleteBranch,
  restoreBranch,
} from "@/services/branch";
import type { Branch } from "@/types/branch";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getBranches()
      .then((data) => {
        if (!cancelled) {
          setBranches(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load branches:", error);
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

  const filteredBranches = branches.filter((branch) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      branch.branch_name?.toLowerCase().includes(keyword) ||
      branch.branch_code?.toLowerCase().includes(keyword) ||
      branch.branch_email?.toLowerCase().includes(keyword) ||
      branch.branch_phone?.toLowerCase().includes(keyword) ||
      branch.company_name?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.is_active) ||
      (statusFilter === "inactive" && !branch.is_active);

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
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBranch(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingBranch);

    setDrawerOpen(false);
    setEditingBranch(null);

    showSuccess(
      wasEditing
        ? "Branch updated successfully."
        : "Branch created successfully."
    );

    loadBranches();
  };

  const openConfirm = (branch: Branch, action: ConfirmAction) => {
    setSelectedBranch(branch);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedBranch(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBranch || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateBranch(selectedBranch.id);
        showSuccess("Branch marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreBranch(selectedBranch.id);
        showSuccess("Branch restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteBranch(selectedBranch.id);
        showSuccess("Branch permanently deleted successfully.");
      }

      setSelectedBranch(null);
      setConfirmAction(null);
      loadBranches();
    } catch (error) {
      console.error("Branch action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Branch action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Branch as Inactive?";
    if (confirmAction === "restore") return "Restore Branch?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Branch?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedBranch) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedBranch.branch_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedBranch.branch_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedBranch.branch_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ModuleHero
          icon={GitBranch}
          title="Branch Management"
          description="Manage company branches with RBAC-based actions."
        />

        <PageActionBar
          menuKey="branch"
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
              <h2 className="text-xl font-black text-slate-900">Branches</h2>
              <p className="text-sm text-slate-500">
                Branch list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search branch..."
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
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
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
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading branches...
                    </td>
                  </tr>
                ) : filteredBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No branch data found. Click Create to add first branch.
                    </td>
                  </tr>
                ) : (
                  filteredBranches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !branch.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branch.company_name || `Company #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {branch.branch_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {branch.branch_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            branch.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {branch.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <BranchRowActions
                          branch={branch}
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
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        onClose={handleCloseDrawer}
      >
        <BranchForm
          key={editingBranch ? `edit-branch-${editingBranch.id}` : "create-branch"}
          initialData={editingBranch}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedBranch)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function BranchesPage() {
  return <BranchesContent />;
}
Run/check:

npm run dev
Open:

http://localhost:3000/branches

ModuleHero height এডজাস্ট করবো কিভাবে?

Thought for 6s
ModuleHero height মূলত এই ৪টা জিনিস দিয়ে control হয়:

px-8 py-6 md:px-9 md:py-7
বিশেষ করে height control করে:

py-6
md:py-7
আর icon box height-ও banner height বাড়ায়:

h-14 w-14 md:h-16 md:w-16
Best approach হলো ModuleHero component-এ height prop add করা। তাহলে Company, Branch, Department সব page-এ একই component use করে height control করতে পারবে।

Updated ModuleHero.tsx
Full path:

E:\Audit\AMS\frontend\src\components\common\ModuleHero.tsx
পুরো file replace করো:

import type { LucideIcon } from "lucide-react";

type ModuleHeroHeight = "compact" | "default" | "large";

const heightStyleMap: Record<ModuleHeroHeight, string> = {
  compact: "px-7 py-5 md:px-8 md:py-6",
  default: "px-8 py-6 md:px-9 md:py-7",
  large: "px-8 py-8 md:px-10 md:py-9",
};

const iconStyleMap: Record<ModuleHeroHeight, string> = {
  compact: "h-12 w-12 md:h-14 md:w-14",
  default: "h-14 w-14 md:h-16 md:w-16",
  large: "h-16 w-16 md:h-18 md:w-18",
};

const iconSizeMap: Record<ModuleHeroHeight, number> = {
  compact: 26,
  default: 30,
  large: 34,
};

export default function ModuleHero({
  icon: Icon,
  title,
  description,
  height = "default",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  height?: ModuleHeroHeight;
}) {
  return (
    <section
      className={`rounded-3xl bg-linear-to-r from-blue-700 via-cyan-600 to-slate-900 text-white shadow-xl ${heightStyleMap[height]}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center rounded-2xl bg-white/15 ${iconStyleMap[height]}`}
        >
          <Icon size={iconSizeMap[height]} />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            {title}
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
Usage Example
Company page
<ModuleHero
  icon={Building2}
  title="Company Management"
  description="Manage organization companies with RBAC-based actions."
  height="default"
/>
Branch page একটু ছোট চাইলে
<ModuleHero
  icon={GitBranch}
  title="Branch Management"
  description="Manage company branches with RBAC-based actions."
  height="compact"
/>
কোনো page বড় banner চাইলে
<ModuleHero
  icon={Users}
  title="Employee Management"
  description="Manage employee records with RBAC-based actions."
  height="large"
/>
Recommendation
তোমার current layout-এর জন্য best:

height="default"
যদি banner বেশি বড় লাগে:

height="compact"
AMS-এর সব master module-এ consistent রাখতে আমি recommend করব:

Company       → default
Branch        → default
Department    → default
Designation   → default
Employee      → default
কিন্তু dashboard বা report page-এ চাইলে large use করা যাবে।


done

Great ✅

এখন Company এবং Branch দুই page-ই same ModuleHero standard follow করছে।

Next quick check করো:

/companies
/branches
Expected:

1. Hero height same
2. Icon size same
3. Subtitle width clean
4. Page spacing balanced
5. Create/Export/Import bar same position
এখন Branch module-এর next logical test:

1. /branches page load
2. Create drawer open
3. Company dropdown load
4. Branch create
Backend চালু রেখে /branches page open করে terminal log পাঠাও যদি কোনো issue আসে।


 GET /api/companies 200 in 979ms (next.js: 13ms, application-code: 966ms)
 GET /branches 200 in 32ms (next.js: 4ms, proxy.ts: 5ms, application-code: 22ms)
 GET /api/branches?page_size=100 200 in 495ms (next.js: 39ms, application-code: 456ms)
 GET /api/me/navigation 200 in 514ms (next.js: 5ms, application-code: 509ms)
 GET /api/me/navigation 200 in 564ms (next.js: 4ms, application-code: 560ms)
 GET /api/branches?page_size=100 200 in 566ms (next.js: 9ms, application-code: 558ms)

Thought for 4s
Perfect ✅
Logs confirm করছে Branch page properly load হচ্ছে:

GET /branches 200
GET /api/branches?page_size=100 200
GET /api/me/navigation 200
মানে:

✅ /branches page route কাজ করছে
✅ Branch list API proxy কাজ করছে
✅ Backend /api/v1/branches response দিচ্ছে
✅ Dynamic navigation load হচ্ছে
✅ Company API-ও available আছে

এখন next test করো: Branch Create

Test 1: Create Drawer
/branches page-এ গিয়ে:

Create → Drawer open
Check করো:

Company dropdown আসে কিনা
Branch Name field আছে কিনা
Branch Code field আছে কিনা
Test 2: Create Branch
Example data দাও:

Company: Active company select করো
Branch Name: Head Office Branch
Branch Code: BR-001
Short Name: HOB
Email: branch@example.com
Phone: 01700000000
Address: Dhaka
Remarks: Test branch
Click:

Save Branch
Expected frontend:

Branch created successfully.
Table refresh হবে
New branch row show করবে
Expected backend log:

POST /api/v1/branches HTTP/1.1" 201 Created
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
যদি create success হয়, তারপর আমরা test করব:

1. Edit Branch
2. Mark Branch Inactive
3. Restore Branch
4. Permanent Delete Branch
Create test করে backend/frontend terminal log পাঠাও।


image(248).png
image(249).png
Shows Inactive সাকসেসফুল কিন্তু but actually ইন একটিভ হচ্ছে না why?

Thought for 16s
এটা frontend problem না — frontend success message দেখাচ্ছে কারণ API 200 OK return করছে, কিন্তু backend আসলে is_active=false database-এ save করছে না।

তোমার screenshot অনুযায়ী flow হলো:

Mark Inactive clicked
→ API success
→ Success message shown
→ Table reload
→ Status still Active
এর মানে backend update logic response দিচ্ছে, কিন্তু is_active value change করছে না।

Most likely কারণ
Company module-এ যেমন হয়েছিল, Branch module-এও একই issue:

1. BranchUpdate schema-তে is_active নেই
Backend file check করো:

E:\Audit\AMS\backend\app\schemas\branch.py
BranchUpdate schema-তে এটা থাকতে হবে:

is_active: Optional[bool] = None
2. Branch update logic False skip করছে
এই ধরনের ভুল code থাকলে inactive হবে না:

for field, value in update_data.items():
    if value:
        setattr(branch, field, value)
কারণ False value হলে if value fail করে।

Correct code:

update_data = payload.model_dump(exclude_unset=True)

for field, value in update_data.items():
    setattr(branch, field, value)
এখন যেটা করো
এই ৩টা backend file পাঠাও, আমি check করে full updated code দিব:

E:\Audit\AMS\backend\app\schemas\branch.py
E:\Audit\AMS\backend\app\repositories\branch_repository.py
E:\Audit\AMS\backend\app\services\branch\update_branch.py
আর backend terminal log-এ inactive click করার সময় কী দেখায় সেটাও পাঠাও। Expected log likely এমন:

PATCH /api/v1/branches/2 HTTP/1.1" 200 OK
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
এখন issue almost confirmed: Branch backend update service/schema is_active=False persist করছে না।



branch.py
Python

branch_repository.py
Python

update_branch.py
Python

Thought for 1m 25s
তোমার ৩টা backend file check করলাম। Important finding:

BranchUpdate-এ is_active already আছে, কিন্তু Optional ভুল জায়গা থেকে import করা হয়েছে: from alembic.environment import Optional — এটা ঠিক না, typing থেকে আসতে হবে। 


Repository update logic ঠিক আছে, কারণ exclude_unset=True দিয়ে False value skip করছে না। 


Repository-তে dedicated set_active_status() method-ও আছে, যেটা inactive/restore-এর জন্য better। 


তাই best fix হলো: Inactive action general PATCH update দিয়ে না করে backend-এর dedicated deactivate route দিয়ে করব।

1. Fix backend schema import
Full path:

E:\Audit\AMS\backend\app\schemas\branch.py
পুরো file replace করো:

# backend/app/schemas/branch.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class BranchBase(BaseModel):
    branch_name: str = Field(..., max_length=255)
    company_id: int
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None


class BranchCreate(BranchBase):
    branch_code: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = None
    company_id: int | None = None
    branch_code: str | None = None
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None


class BranchResponse(BranchBase):
    id: int
    branch_code: str
    is_active: bool | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class BranchListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BranchResponse]


class BranchMessageResponse(BaseModel):
    message: str
    data: BranchResponse | None = None
Backend restart করো:

CTRL + C
uvicorn main:app --reload
2. Create frontend inactive proxy route
এখন inactive-এর জন্য আলাদা local proxy route বানাও।

Create folder/file:

New-Item -ItemType Directory -Force 'src\app\api\branches\[id]\inactive'
New-Item -ItemType File -Force 'src\app\api\branches\[id]\inactive\route.ts'
Full path:

E:\Audit\AMS\frontend\src\app\api\branches\[id]\inactive\route.ts
Paste:

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
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

  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  return NextResponse.json(data, { status: response.status });
}
এটার মানে:

Frontend PATCH /api/branches/{id}/inactive
→ Backend DELETE /api/v1/branches/{id}
→ Backend deactivate_branch_service()
→ is_active = false
3. Update frontend branch service
Full path:

E:\Audit\AMS\frontend\src\services\branch.ts
পুরো file replace করো:

import type { Branch, BranchCreatePayload } from "@/types/branch";

type BranchListResponse =
  | Branch[]
  | {
      data?: Branch[];
      items?: Branch[];
      results?: Branch[];
      branches?: Branch[];
    };

const normalizeBranches = (response: BranchListResponse): Branch[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.branches)) return response.branches;

  return [];
};

export const getBranches = async (): Promise<Branch[]> => {
  const response = await fetch("/api/branches?page_size=100", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load branches");
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to create branch");
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to update branch");
  }

  return response.json();
};

export const deactivateBranch = async (id: number): Promise<Branch> => {
  const response = await fetch(`/api/branches/${id}/inactive`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to mark branch inactive"
    );
  }

  return response.json();
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
    const error = await response.json();
    throw new Error(error.detail || error.message || "Failed to restore branch");
  }

  return response.json();
};

export const permanentlyDeleteBranch = async (id: number): Promise<void> => {
  const response = await fetch(`/api/branches/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(
      error.detail || error.message || "Failed to permanently delete branch"
    );
  }
};
4. Test again
Frontend restart করো:

CTRL + C
npm run dev
Backend চালু রেখে Branch page-এ গিয়ে আবার Mark Inactive করো।

Expected backend log এবার হওয়া উচিত:

DELETE /api/v1/branches/2 HTTP/1.1" 200 OK
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
Expected UI:

Status = Inactive
Row gray হবে
Inactive button hide হবে
Restore + Permanent Delete show হবে
যদি এবারও Active থাকে, তাহলে next file check করতে হবে:

E:\Audit\AMS\backend\app\services\branch\delete_branch.py
কারণ তখন problem হবে deactivate service-এর ভিতরে।


image(250).png
INFO:     127.0.0.1:56749 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56752 - "DELETE /api/v1/branches/2 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56752 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56753 - "DELETE /api/v1/branches/2/permanent HTTP/1.1" 200 OK
INFO:     127.0.0.1:56753 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63728 - "GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:63729 - "GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized

কেন এরকম আসবে and কেন code দেখা যাবে ফ্রন্ট end-এ?


Thought for 10s
এটা ২টা কারণে হচ্ছে।

প্রথম কারণ: backend বলছে তুমি unauthorized:

GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized
মানে access token নাই, expired, invalid, অথবা logout/permanent delete test করার সময় cookie/token state invalid হয়ে গেছে।

দ্বিতীয় কারণ: তুমি development mode-এ আছো:

Next.js 16.2.9 Turbopack
Development mode-এ Next.js error overlay দেখায় এবং code snippet show করে। Production build-এ user এভাবে source code দেখবে না। কিন্তু dev mode-এ এটা normal.

তবে problem হলো আমাদের frontend এই error user-friendly ভাবে handle করছে না। এখন /me/navigation 401 হলে app crash করছে। এটা ঠিক করতে হবে।

Fix করতে হবে: navigation.ts
Full path:

E:\Audit\AMS\frontend\src\services\navigation.ts
এই file-টা full replace করো:

import type { NavigationGroup } from "@/types/navigation";

export class NavigationUnauthorizedError extends Error {
  constructor() {
    super("Your session has expired. Please login again.");
    this.name = "NavigationUnauthorizedError";
  }
}

export const getMyNavigation = async (): Promise<NavigationGroup[]> => {
  const response = await fetch("/api/me/navigation", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new NavigationUnauthorizedError();
  }

  if (!response.ok) {
    console.error("Navigation API failed:", response.status);
    return [];
  }

  return response.json();
};
তারপর update করো: NavigationContext.tsx
Full path:

E:\Audit\AMS\frontend\src\contexts\NavigationContext.tsx
Import section-এ এটা রাখো:

import { useRouter } from "next/navigation";
import {
  getMyNavigation,
  NavigationUnauthorizedError,
} from "@/services/navigation";
NavigationProvider function-এর ভিতরে state-এর আগে/পরে router add করো:

const router = useRouter();
তারপর .catch() অংশে এটা use করো:

.catch((error) => {
  if (!cancelled) {
    if (error instanceof NavigationUnauthorizedError) {
      console.error("Session expired:", error.message);
      setNavigation([]);
      router.replace("/login");
      return;
    }

    console.error("Failed to load AMS navigation:", error);
    setNavigation([]);
  }
})
যদি full NavigationContext.tsx দরকার হয়
তাহলে এই version use করো:

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  getMyNavigation,
  NavigationUnauthorizedError,
} from "@/services/navigation";
import type {
  NavigationAction,
  NavigationGroup,
  NavigationMenu,
} from "@/types/navigation";

type NavigationContextValue = {
  navigation: NavigationGroup[];
  loading: boolean;
  getMenuByKey: (menuKey: string) => NavigationMenu | undefined;
  getActionsByMenuKey: (menuKey: string) => NavigationAction[];
  hasAction: (menuKey: string, actionKey: string) => boolean;
  reloadNavigation: () => Promise<void>;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [navigation, setNavigation] = useState<NavigationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNavigationError = useCallback(
    (error: unknown) => {
      if (error instanceof NavigationUnauthorizedError) {
        console.error("Session expired:", error.message);
        setNavigation([]);
        router.replace("/login");
        return;
      }

      console.error("Failed to load AMS navigation:", error);
      setNavigation([]);
    },
    [router]
  );

  const reloadNavigation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyNavigation();
      setNavigation(data);
    } catch (error) {
      handleNavigationError(error);
    } finally {
      setLoading(false);
    }
  }, [handleNavigationError]);

  useEffect(() => {
    let cancelled = false;

    getMyNavigation()
      .then((data) => {
        if (!cancelled) {
          setNavigation(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleNavigationError(error);
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
  }, [handleNavigationError]);

  const value = useMemo<NavigationContextValue>(() => {
    const allMenus = navigation.flatMap((group) => group.menus);

    const getMenuByKey = (menuKey: string) =>
      allMenus.find((menu) => menu.menu_key === menuKey);

    const getActionsByMenuKey = (menuKey: string) =>
      getMenuByKey(menuKey)?.actions ?? [];

    const hasAction = (menuKey: string, actionKey: string) =>
      getActionsByMenuKey(menuKey).some(
        (action) => action.action_key === actionKey
      );

    return {
      navigation,
      loading,
      getMenuByKey,
      getActionsByMenuKey,
      hasAction,
      reloadNavigation,
    };
  }, [navigation, loading, reloadNavigation]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used inside NavigationProvider");
  }

  return context;
}
এখন কী করবে
Token invalid হয়ে গেছে, তাই আগে logout/login করো।

Browser cookie clear করলেও হবে।

Backend + frontend দুইটাই চালু রাখো।

আবার login করো।

Expected behavior এখন:

Token valid হলে → dashboard/sidebar load হবে
Token invalid হলে → code error overlay না, login page-এ redirect হবে
Development mode-এ code দেখা normal, কিন্তু এই fix-এর পর /me/navigation 401 হলে app crash করবে না।


প্রতিটা মেনুতে ক্লিক করার সাথে সাথে নেভিগেশন কেন reload কেন। Faster কাজ করার জন্য বারবার reload হবে কি সেটা ভালো? আমার মনে হয় নেভিগেশন বারবার লোড হবে না। নেভিগেশন লগইনের সময় একবারই লোড হবে এরপরে শুধুমাত্র কন্টেন্ট page চেঞ্জ হবে যেটা মাস্টার child কনসেপ্ট এর মত

Thought for 23s
তোমার ধারণা 100% correct ✅
প্রতিটা মেনুতে ক্লিক করলে navigation reload হওয়া উচিত না। এটা performance-এর জন্য ভালো না এবং enterprise architecture-এও ঠিক pattern না।

এখন কেন reload হচ্ছে?

কারণ আমরা এখন প্রতিটা page-এর ভিতরে এভাবে DashboardLayout wrap করছি:

<DashboardLayout>
  <PageContent />
</DashboardLayout>
তাই /companies থেকে /branches গেলে:

Companies page unmount
→ DashboardLayout unmount
→ NavigationProvider unmount
→ Branches page mount
→ DashboardLayout আবার mount
→ NavigationProvider আবার mount
→ /api/me/navigation আবার call
এজন্য প্রতিটা menu click-এ এই log আসছে:

GET /api/v1/me/navigation
Correct Enterprise Pattern
আমাদের target হওয়া উচিত:

Login
→ Navigation load once
→ Sidebar/Header stay fixed
→ Only page content changes
মানে:

DashboardLayout = Master Layout
Companies / Branches / Department = Child Pages
এইটা Next.js App Router-এ করতে হবে Route Group Layout দিয়ে।

Final Architecture
Current wrong pattern:

src/app/companies/page.tsx
  └── DashboardLayout
        └── CompaniesContent

src/app/branches/page.tsx
  └── DashboardLayout
        └── BranchesContent
Correct pattern:

src/app/(protected)/layout.tsx
  └── DashboardLayout
        └── children

src/app/(protected)/companies/page.tsx
  └── CompaniesContent only

src/app/(protected)/branches/page.tsx
  └── BranchesContent only
URL same থাকবে:

/companies
/branches
/dashboard
কারণ (protected) route group URL-এ show হয় না।

Step 1: Create Protected Route Group
Frontend terminal:

cd E:\Audit\AMS\frontend
Run:

New-Item -ItemType Directory -Force 'src\app\(protected)'
New-Item -ItemType Directory -Force 'src\app\(protected)\dashboard'
New-Item -ItemType Directory -Force 'src\app\(protected)\companies'
New-Item -ItemType Directory -Force 'src\app\(protected)\branches'
Step 2: Move Pages
Move-Item -Force 'src\app\dashboard\page.tsx' 'src\app\(protected)\dashboard\page.tsx'
Move-Item -Force 'src\app\companies\page.tsx' 'src\app\(protected)\companies\page.tsx'
Move-Item -Force 'src\app\branches\page.tsx' 'src\app\(protected)\branches\page.tsx'
Old empty folders থাকলে problem না।

Step 3: Create Protected Layout
Create file:

New-Item -ItemType File -Force 'src\app\(protected)\layout.tsx'
Full path:

E:\Audit\AMS\frontend\src\app\(protected)\layout.tsx
Paste:

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
এটাই master layout হবে।

Step 4: Update Company Page
New path:

E:\Audit\AMS\frontend\src\app\(protected)\companies\page.tsx
এই import remove করো:

import DashboardLayout from "@/components/layout/DashboardLayout";
তারপর return-এর wrapper change করো।

আগে ছিল:

return (
  <DashboardLayout>
    <div className="space-y-6">
      ...
    </div>

    <RightDrawer ...>
      ...
    </RightDrawer>

    <ConfirmModal ... />
  </DashboardLayout>
);
এখন হবে:

return (
  <>
    <div className="space-y-6">
      ...
    </div>

    <RightDrawer ...>
      ...
    </RightDrawer>

    <ConfirmModal ... />
  </>
);
Step 5: Update Branch Page
New path:

E:\Audit\AMS\frontend\src\app\(protected)\branches\page.tsx
এই import remove করো:

import DashboardLayout from "@/components/layout/DashboardLayout";
তারপর return wrapper একইভাবে change করো:

return (
  <>
    <div className="space-y-6">
      ...
    </div>

    <RightDrawer ...>
      ...
    </RightDrawer>

    <ConfirmModal ... />
  </>
);
Step 6: Dashboard Page-ও Same
New path:

E:\Audit\AMS\frontend\src\app\(protected)\dashboard\page.tsx
যদি dashboard page-এর ভিতরেও DashboardLayout wrapper থাকে, সেটাও remove করবে।
কারণ এখন src/app/(protected)/layout.tsx already dashboard layout দিচ্ছে।

Expected Behavior After Fix
Menu click করলে:

NavigationProvider থাকবে mounted
Sidebar থাকবে fixed
Header থাকবে fixed
Only children/page content change হবে
Backend log expected:

প্রথম login/dashboard load:

GET /api/v1/me/navigation 200 OK
তারপর /companies, /branches, /dashboard click করলে ideally আর বারবার navigation call হবে না।

তখন শুধু page-specific API call হবে:

GET /api/v1/companies
GET /api/v1/branches
Navigation কখন reload হবে?
Navigation reload হওয়া উচিত শুধু এই সময়:

1. Login করার পর
2. Browser hard refresh/F5 করলে
3. User logout করে আবার login করলে
4. Admin permission/menu change করলে manually reloadNavigation() call করলে
5. Token expire হলে login page redirect করলে
Menu click করলে navigation reload হওয়া উচিত না।

Final Recommendation
এই protected layout migration এখনই করা উচিত। কারণ আমরা Branch, Department, Designation, Employee module যত বাড়াব, প্রতিটা page যদি নিজের ভিতরে DashboardLayout mount করে, তাহলে performance খারাপ হবে এবং unnecessary /me/navigation API call বাড়বে।

এই migration করলে AMS architecture হবে:

Auth/Login
→ Protected Master Layout
→ Persistent Sidebar + Header + Navigation Context
→ Dynamic Child Pages
এটাই proper enterprise master-child layout pattern.


NFO:     127.0.0.1:58157 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:49673 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:58157 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:65085 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:65084 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59079 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:59078 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60495 - "DELETE /api/v1/branches/1 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60495 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:62097 - "PATCH /api/v1/branches/1 HTTP/1.1" 200 OK
INFO:     127.0.0.1:62097 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
GET /api/companies 200 in 3.0s (next.js: 6ms, application-code: 3.0s)
 GET /api/companies 200 in 3.4s (next.js: 42ms, application-code: 3.4s)
 GET /branches 200 in 487ms (next.js: 450ms, proxy.ts: 5ms, application-code: 33ms)
 GET /api/branches?page_size=100 200 in 3.7s (next.js: 75ms, application-code: 3.6s)
 GET /api/branches?page_size=100 200 in 4.1s (next.js: 62ms, application-code: 4.1s)
 PATCH /api/branches/1/inactive 200 in 3.4s (next.js: 587ms, application-code: 2.8s)
 GET /api/branches?page_size=100 200 in 1961ms (next.js: 4ms, application-code: 1957ms)
 PATCH /api/branches/1 200 in 3.6s (next.js: 563ms, application-code: 3.0s)
 GET /api/branches?page_size=100 200 in 2.5s (next.js: 5ms, application-code: 2.5s)
done

Thought for 9s
Perfect ✅ Done.

তোমার log অনুযায়ী এখন Branch module core actions কাজ করছে:

DELETE /api/v1/branches/1 200 OK
GET /api/v1/branches?page_size=100 200 OK
PATCH /api/v1/branches/1 200 OK
GET /api/v1/branches?page_size=100 200 OK
মানে:

✅ Branch Inactive কাজ করছে
✅ Branch Restore কাজ করছে
✅ Branch list refresh হচ্ছে
✅ Backend route alignment ঠিক আছে
✅ Frontend proxy route ঠিক আছে

Navigation reload issue status
এখন log-এ /me/navigation শুধু login-এর পরে এসেছে:

POST /api/v1/auth/login 200 OK
GET /api/v1/me/navigation 200 OK
GET /api/v1/me/navigation 200 OK
এটা আগের মতো প্রতিটা menu click-এ repeatedly আসছে না। Good.

/me/navigation দুইবার আসার কারণ likely Next.js development mode / React Strict Mode double effect call। Development mode-এ এটা normal. Production build-এ সাধারণত single হবে।

Companies/Branches API দুইবার কেন হচ্ছে?
GET /api/v1/companies 200 OK
GET /api/v1/companies 200 OK

GET /api/v1/branches?page_size=100 200 OK
GET /api/v1/branches?page_size=100 200 OK
এটাও dev mode-এর কারণে হতে পারে। Next/React development mode অনেক সময় effect দুইবার run করে side-effect detect করার জন্য।

এখন এটা blocker না। Production-ready optimization পরে করব:

TanStack Query cache
staleTime
deduplication
background refetch control
Current Branch Module Status
এখন Branch module-এর completed part:

✅ Page load
✅ Dynamic menu
✅ Top action bar
✅ Create drawer
✅ Company dropdown
✅ List branch
✅ Inactive
✅ Restore
✅ Refresh after action
✅ Same ModuleHero standard

Next test করো:

1. Branch Create
2. Branch Edit
3. Branch Permanent Delete
Create/Edit/Permanent Delete ঠিক থাকলে Branch module Company module-এর মতো complete হয়ে যাবে।


image(251).png
## Error Type
Console Error

## Error Message
[object Object]


    at createBranch (src/services/branch.ts:51:11)
    at async handleSubmit (src/components/branches/BranchForm.tsx:120:9)

## Code Frame
  49 |   if (!response.ok) {
  50 |     const error = await response.json();
> 51 |     throw new Error(error.detail || error.message || "Failed to create br...
     |           ^
  52 |   }
  53 |
  54 |   return response.json();

Next.js version: 16.2.9 (Turbopack)

INFO:     127.0.0.1:59854 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59855 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:63032 - "POST /api/v1/branches HTTP/1.1" 422 Unprocessable Entity


Thought for 12s
Problem clear ✅

Backend log বলছে:

POST /api/v1/branches HTTP/1.1" 422 Unprocessable Entity
মানে backend request reject করেছে। Screenshot-এ তুমি Email field-এ দিয়েছো:

test
কিন্তু backend schema-তে branch_email: EmailStr, তাই valid email না হলে 422 হবে। আর frontend-এ [object Object] দেখাচ্ছে কারণ FastAPI 422 error-এর detail array/object আকারে আসে, কিন্তু frontend সেটা সরাসরি new Error(error.detail) করছে।

আমরা ২টা fix করব:

Frontend error message readable করব

Branch form submit করার আগেই invalid email ধরব

1. Replace src/services/branch.ts
Full path:

E:\Audit\AMS\frontend\src\services\branch.ts
পুরো file replace করো:

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
2. Update BranchForm.tsx email validation
Full path:

E:\Audit\AMS\frontend\src\components\branches\BranchForm.tsx
handleSubmit-এর ভিতরে, branch_code validation-এর পরে এটা add করো:

if (
  form.branch_email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branch_email.trim())
) {
  setError("Please enter a valid branch email address.");
  return;
}
মানে final validation order হবে:

if (!form.company_id) {
  setError("Company is required");
  return;
}

if (!form.branch_name.trim()) {
  setError("Branch name is required");
  return;
}

if (!form.branch_code.trim()) {
  setError("Branch code is required");
  return;
}

if (
  form.branch_email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branch_email.trim())
) {
  setError("Please enter a valid branch email address.");
  return;
}
এখন কী input দিবে
Email field-এ এটা ভুল:

test
Valid email দাও:

test@gmail.com
অথবা email optional হলে blank রাখো।

তারপর আবার Save Branch করো। Expected backend log:

POST /api/v1/branches HTTP/1.1" 201 Created
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK

ফোন নাম্বারের ফরমেটে ঠিক করতে হবে

Thought for 50s
হ্যাঁ, Branch Phone format fixed করা দরকার। এখন backend schema-তে branch_phone শুধু normal string, আর update service শুধু duplicate check করছে—format validation করছে না। তাই frontend + backend দুই জায়গায় validation দেব। 

 


আমরা standard ধরব:

Allowed:
01712345678
+8801712345678
8801712345678

Stored as:
01712345678
1. Create reusable phone utility
Full path:

E:\Audit\AMS\frontend\src\utils\phone.ts
Create command:

New-Item -ItemType Directory -Force src\utils
New-Item -ItemType File -Force src\utils\phone.ts
Paste:

const bdMobileRegex = /^01[3-9]\d{8}$/;

export const normalizeBangladeshPhone = (value: string): string => {
  let phone = value.trim().replace(/[\s-]/g, "");

  if (!phone) return "";

  if (phone.startsWith("+880")) {
    phone = `0${phone.slice(4)}`;
  } else if (phone.startsWith("880")) {
    phone = `0${phone.slice(3)}`;
  }

  return phone;
};

export const isValidBangladeshPhone = (value: string): boolean => {
  const phone = normalizeBangladeshPhone(value);

  if (!phone) return true;

  return bdMobileRegex.test(phone);
};

export const bangladeshPhoneFormatMessage =
  "Phone number must be a valid Bangladesh mobile number. Example: 01712345678 or +8801712345678.";
2. Update BranchForm.tsx
Full path:

E:\Audit\AMS\frontend\src\components\branches\BranchForm.tsx
Import section-এ add করো:
import {
  bangladeshPhoneFormatMessage,
  isValidBangladeshPhone,
  normalizeBangladeshPhone,
} from "@/utils/phone";
buildPayload function replace করো:
const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const buildPayload = (): BranchCreatePayload => ({
  company_id: Number(form.company_id),
  branch_code: form.branch_code.trim(),
  branch_name: form.branch_name.trim(),
  branch_short_name: optionalText(form.branch_short_name),
  branch_email: optionalText(form.branch_email),
  branch_phone: optionalText(normalizeBangladeshPhone(form.branch_phone)),
  branch_address: optionalText(form.branch_address),
  remarks: optionalText(form.remarks),
});
handleSubmit-এর validation অংশে branch_code validation-এর পরে add করো:
if (
  form.branch_email.trim() &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branch_email.trim())
) {
  setError("Please enter a valid branch email address.");
  return;
}

if (!isValidBangladeshPhone(form.branch_phone)) {
  setError(bangladeshPhoneFormatMessage);
  return;
}
Phone input replace করো:
আগের Phone input block-এর input অংশটা এভাবে রাখো:

<input
  value={form.branch_phone}
  onChange={(event) => handleChange("branch_phone", event.target.value)}
  onBlur={() =>
    handleChange("branch_phone", normalizeBangladeshPhone(form.branch_phone))
  }
  placeholder="Example: 01712345678"
  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
/>
এতে user +8801712345678 লিখলেও blur করার পর 01712345678 হয়ে যাবে।

3. Backend validation add করো
Full path:

E:\Audit\AMS\backend\app\schemas\branch.py
পুরো file replace করো:

# backend/app/schemas/branch.py

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


BD_MOBILE_REGEX = re.compile(r"^01[3-9]\d{8}$")


def normalize_bd_phone(value: str | None):
    if value is None:
        return None

    phone = str(value).strip().replace(" ", "").replace("-", "")

    if not phone:
        return None

    if phone.startswith("+880"):
        phone = "0" + phone[4:]
    elif phone.startswith("880"):
        phone = "0" + phone[3:]

    if not BD_MOBILE_REGEX.fullmatch(phone):
        raise ValueError(
            "Phone number must be a valid Bangladesh mobile number. "
            "Example: 01712345678 or +8801712345678."
        )

    return phone


class BranchBase(BaseModel):
    branch_name: str = Field(..., max_length=255)
    company_id: int
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchCreate(BranchBase):
    branch_code: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = None
    company_id: int | None = None
    branch_code: str | None = None
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchResponse(BranchBase):
    id: int
    branch_code: str
    is_active: bool | None = None

    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class BranchListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BranchResponse]


class BranchMessageResponse(BaseModel):
    message: str
    data: BranchResponse | None = None
4. Backend restart করো
cd E:\Audit\AMS\backend
CTRL + C
uvicorn main:app --reload
Frontend:

cd E:\Audit\AMS\frontend
npm run dev
Test
Valid phone:

01712345678
+8801712345678
8801712345678
Invalid phone:

1234
test
017123
01112345678
Expected: invalid হলে frontend-এ readable message দেখাবে, আর backend-ও reject করবে।


PS E:\Audit\AMS\frontend> npm run dev                                      

> frontend@0.1.0 dev
> next dev

▲ Next.js 16.2.9 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.20.80.1:3000
- Environments: .env.local
✓ Ready in 357ms

 GET /branches 200 in 614ms (next.js: 100ms, proxy.ts: 190ms, application-code: 325ms)
 GET /api/branches?page_size=100 401 in 204ms (next.js: 76ms, application-code: 128ms)
 GET /api/me/navigation 401 in 207ms (next.js: 139ms, application-code: 68ms)
[browser] Failed to load branches: Error: Could not validate credentials
    at getBranches (src/services/branch.ts:69:11)
  67 |
  68 |   if (!response.ok) {
> 69 |     throw new Error(
     |           ^
  70 |       await getApiErrorMessage(response, "Failed to load branches")
  71 |     );
  72 |   } (src/app/(protected)
[browser] Failed to load AMS navigation: Error: Failed to load navigation
    at getMyNavigation (src/services/navigation.ts:11:11)
   9 |
  10 |   if (!response.ok) {
> 11 |     throw new Error("Failed to load navigation");
     |           ^
  12 |   }
  13 |
  14 |   return response.json(); (src/contexts/NavigationContext.tsx:58:19)
 POST /api/auth/logout 200 in 37ms (next.js: 31ms, application-code: 6ms)
 GET /login 200 in 57ms (next.js: 24ms, proxy.ts: 6ms, application-code: 27ms)
 GET /login 200 in 38ms (next.js: 3ms, proxy.ts: 6ms, application-code: 28ms)
 POST /api/auth/login 200 in 4.8s (next.js: 30ms, application-code: 4.7s)
 GET /dashboard 200 in 80ms (next.js: 30ms, proxy.ts: 9ms, application-code: 41ms)
 GET /api/me/navigation 200 in 3.6s (next.js: 4ms, application-code: 3.5s)
 GET /api/me/navigation 200 in 3.6s (next.js: 17ms, application-code: 3.5s)
 POST /api/auth/logout 200 in 7ms (next.js: 3ms, application-code: 5ms)
 GET /login 200 in 67ms (next.js: 10ms, proxy.ts: 7ms, application-code: 51ms)
 GET /login 200 in 69ms (next.js: 33ms, proxy.ts: 7ms, application-code: 28ms)
 GET /login 200 in 84ms (next.js: 4ms, proxy.ts: 6ms, application-code: 74ms)
 POST /api/auth/login 200 in 2.4s (next.js: 2ms, application-code: 2.4s)
 GET /dashboard 200 in 54ms (next.js: 4ms, proxy.ts: 4ms, application-code: 46ms)
 GET /api/me/navigation 200 in 2.2s (next.js: 4ms, application-code: 2.2s)
 GET /api/me/navigation 200 in 2.2s (next.js: 4ms, application-code: 2.2s)
 GET /branches 200 in 36ms (next.js: 3ms, proxy.ts: 6ms, application-code: 27ms)
 GET /api/branches?page_size=100 200 in 3.1s (next.js: 4ms, application-code: 3.1s)
 GET /api/branches?page_size=100 200 in 3.2s (next.js: 8ms, application-code: 3.2s)
 GET /api/companies 200 in 3.7s (next.js: 40ms, application-code: 3.6s)
 GET /api/companies 200 in 5.0s (next.js: 47ms, application-code: 5.0s)
⨯ SyntaxError: Unexpected token 'I', "Internal S"... is not valid JSON
    at JSON.parse (<anonymous>)
 POST /api/branches 500 in 4.9s (next.js: 3ms, application-code: 4.9s)
[browser] Branch save failed: Error: Failed to create branch
    at createBranch (src/services/branch.ts:91:11)
    at async handleSubmit (src/components/branches/BranchForm.tsx:141:9)
  89 |
  90 |   if (!response.ok) {
> 91 |     throw new Error(
     |           ^
  92 |       await getApiErrorMessage(response, "Failed to create branch")
  93 |     );
  94 |   } (src/components/branches/BranchForm.tsx:146:15)

(.venv) PS E:\Audit\AMS\backend> uvicorn main:app --reload
INFO:     Will watch for changes in these directories: ['E:\\Audit\\AMS\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [22032] using StatReload
INFO:     Started server process [11408]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:63903 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:63904 - "GET /api/v1/me/navigation HTTP/1.1" 401 Unauthorized
INFO:     127.0.0.1:63903 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:63903 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:59599 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:59922 - "POST /api/v1/auth/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:59923 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:59922 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:59922 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:59923 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:59925 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59926 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:55753 - "POST /api/v1/branches HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 415, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 62, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\applications.py", line 1159, in __call__
    await super().__call__(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\middleware\cors.py", line 88, in __call__
    await self.app(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\routing.py", line 680, in app
    await route.handle(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\routing.py", line 134, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\routing.py", line 120, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\routing.py", line 674, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\.venv\Lib\site-packages\fastapi\routing.py", line 328, in run_endpoint_function
    return await dependant.call(**values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\app\api\v1\branches.py", line 66, in create_branch
    return await service.create_branch(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\app\services\branch\branch_service.py", line 52, in create_branch
    return await create_branch_service(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\app\services\branch\create_branch.py", line 58, in create_branch_service
    branch = await branch_repo.create(
             ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "E:\Audit\AMS\backend\app\repositories\branch_repository.py", line 124, in create
    branch = Branch(
             ^^^^^^^
TypeError: app.models.branch.Branch() got multiple values for keyword argument 'is_active'

Thought for 20s
Problem clear ✅

Backend error-এর real কারণ:

TypeError: app.models.branch.Branch() got multiple values for keyword argument 'is_active'
মানে BranchCreate payload-এর ভিতরেও is_active চলে যাচ্ছে, আবার repository create করার সময় আলাদা করে is_active=True দেওয়া হচ্ছে:

branch = Branch(
    **data,
    is_active=True,
    ...
)
তাই same keyword দুইবার যাচ্ছে।

আর frontend error:

Unexpected token 'I', "Internal S"... is not valid JSON
এটা হচ্ছে কারণ backend 500 দিলে response body plain text "Internal Server Error" হয়, কিন্তু Next API proxy সেটাকে JSON parse করতে চাচ্ছে।

এখন ৩টা জায়গায় fix করো।

1. Fix backend schema
Full path:

E:\Audit\AMS\backend\app\schemas\branch.py
পুরো file replace করো:

# backend/app/schemas/branch.py

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


BD_MOBILE_REGEX = re.compile(r"^01[3-9]\d{8}$")


def normalize_bd_phone(value: str | None):
    if value is None:
        return None

    phone = str(value).strip().replace(" ", "").replace("-", "")

    if not phone:
        return None

    if phone.startswith("+880"):
        phone = "0" + phone[4:]
    elif phone.startswith("880"):
        phone = "0" + phone[3:]

    if not BD_MOBILE_REGEX.fullmatch(phone):
        raise ValueError(
            "Phone number must be a valid Bangladesh mobile number. "
            "Example: 01712345678 or +8801712345678."
        )

    return phone


class BranchBase(BaseModel):
    branch_name: str = Field(..., max_length=255)
    company_id: int
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchCreate(BranchBase):
    branch_code: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = None
    company_id: int | None = None
    branch_code: str | None = None
    branch_email: EmailStr | None = None
    branch_phone: str | None = None
    branch_address: str | None = None
    remarks: str | None = None
    is_active: Optional[bool] = None

    @field_validator("branch_phone", mode="before")
    @classmethod
    def validate_branch_phone(cls, value):
        return normalize_bd_phone(value)


class BranchResponse(BranchBase):
    id: int
    branch_code: str
    is_active: bool

    created_by: str | None = None
    updated_by: str | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    created_at: datetime
    updated_at: datetime


class BranchListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BranchResponse]


class BranchMessageResponse(BaseModel):
    message: str
    data: BranchResponse | None = None
Important change:

is_active
BranchBase থেকে remove করা হয়েছে।
BranchCreate আর is_active accept করবে না।
BranchUpdate এবং BranchResponse-এ থাকবে।

2. Fix repository create method
Full path:

E:\Audit\AMS\backend\app\repositories\branch_repository.py
শুধু create() method replace করো:

async def create(
    self,
    payload: BranchCreate,
    branch_code: str,
    created_by: str,
) -> Branch:
    data = payload.model_dump(exclude_none=True)

    data.pop("is_active", None)
    data["branch_code"] = branch_code

    branch = Branch(
        **data,
        is_active=True,
        created_by=created_by,
        updated_by=created_by,
    )

    self.db.add(branch)
    await self.db.commit()
    await self.db.refresh(branch)

    return branch
এখানে extra safety হিসেবে রাখা হয়েছে:

data.pop("is_active", None)
যদি ভবিষ্যতে ভুল করে payload-এ is_active আসে, তাও duplicate হবে না।

3. Fix frontend branch API proxy JSON parse issue
Full path:

E:\Audit\AMS\frontend\src\app\api\branches\route.ts
পুরো file replace করো:

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

async function parseBackendResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

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

  try {
    const response = await fetch(
      `${API_URL}/branches${queryString ? `?${queryString}` : ""}`,
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
    console.error("Branch GET proxy failed:", error);

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

  try {
    const response = await fetch(`${API_URL}/branches`, {
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
    console.error("Branch POST proxy failed:", error);

    return NextResponse.json(
      {
        message:
          "Backend server unreachable. Please start the backend server and try again.",
      },
      { status: 503 }
    );
  }
}
এটা করলে backend 500 দিলেও frontend আর এই error দিবে না:

Unexpected token 'I'
বরং readable message দেখাবে।

4. Restart backend
cd E:\Audit\AMS\backend
CTRL + C
uvicorn main:app --reload
Frontend already running থাকলে hot reload হবে। না হলে:

cd E:\Audit\AMS\frontend
npm run dev
5. Test branch create again
Valid data দাও:

Company: Hannan Mollah Company
Branch Name: BT Test
Branch Code: TEST
Short Name: tEst
Email: test@gmail.com
Phone: 01712345678
Address: Dhaka
Expected backend log:

POST /api/v1/branches HTTP/1.1" 201 Created
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
এই fix-এর পর is_active duplicate error যাবে, branch create হবে।


INFO:     127.0.0.1:56298 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:56299 - "GET /api/v1/me/navigation HTTP/1.1" 200 OK
INFO:     127.0.0.1:56302 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:56299 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:52361 - "POST /api/v1/branches HTTP/1.1" 201 Created
INFO:     127.0.0.1:52361 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58925 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:58924 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:59359 - "POST /api/v1/branches HTTP/1.1" 201 Created
INFO:     127.0.0.1:59359 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:59359 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:56772 - "GET /api/v1/companies HTTP/1.1" 200 OK
INFO:     127.0.0.1:50161 - "PATCH /api/v1/branches/4 HTTP/1.1" 400 Bad Request
INFO:     127.0.0.1:63340 - "PATCH /api/v1/branches/4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63340 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK

Excellent ✅ Branch create এবং update এখন কাজ করছে।

Log confirm করছে:

POST /api/v1/branches HTTP/1.1" 201 Created
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
PATCH /api/v1/branches/4 HTTP/1.1" 200 OK
GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
একবার 400 Bad Request এসেছে:

PATCH /api/v1/branches/4 HTTP/1.1" 400 Bad Request
তারপর আবার same branch update 200 OK হয়েছে। তাই ওই 400 সম্ভবত validation issue ছিল—যেমন duplicate email/phone, invalid company, duplicate branch name under same company, অথবা invalid phone/email format। পরে correct data দিলে update successful হয়েছে।

এখন Branch module-এর current status:

✅ Branch page load
✅ Branch list
✅ Company dropdown
✅ Branch create
✅ Branch update
✅ Branch inactive
✅ Branch restore
✅ Branch permanent delete route ready
✅ Phone format validation fixed
✅ Email validation fixed
✅ ModuleHero standard applied
এখন final test বাকি:

1. Inactive newly created branch
2. Restore it
3. Permanent delete it
যদি এই ৩টা pass করে, তাহলে Branch CRUD module complete.


INFO:     127.0.0.1:63340 - "PATCH /api/v1/branches/4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63340 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:55087 - "DELETE /api/v1/branches/4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:55087 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63996 - "PATCH /api/v1/branches/4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:63996 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:62267 - "DELETE /api/v1/branches/4 HTTP/1.1" 200 OK
INFO:     127.0.0.1:62267 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK
INFO:     127.0.0.1:62267 - "DELETE /api/v1/branches/4/permanent HTTP/1.1" 200 OK
INFO:     127.0.0.1:62267 - "GET /api/v1/branches?page_size=100 HTTP/1.1" 200 OK '

Thought for 8s
Perfect ✅ Branch CRUD module এখন complete.

Log confirm করছে:

PATCH /api/v1/branches/4 200 OK
DELETE /api/v1/branches/4 200 OK
PATCH /api/v1/branches/4 200 OK
DELETE /api/v1/branches/4/permanent 200 OK
GET /api/v1/branches?page_size=100 200 OK
মানে:

✅ Branch Update কাজ করছে
✅ Branch Inactive কাজ করছে
✅ Branch Restore কাজ করছে
✅ Branch Permanent Delete কাজ করছে
✅ Action শেষে table refresh হচ্ছে
✅ Frontend proxy route alignment ঠিক আছে
✅ Backend service/repository ঠিক আছে

Branch module final status:

✅ Page load
✅ List
✅ Search
✅ Status filter
✅ Create
✅ Edit/Update
✅ Mark Inactive
✅ Restore
✅ Permanent Delete
✅ Company dropdown
✅ Email validation
✅ Phone format validation
✅ Confirm modal
✅ RBAC-based action buttons
✅ ModuleHero standard
এখন Company + Branch দুইটা master module complete.

Next logical module:

Department Module
কারণ hierarchy হবে:

Company → Branch → Department → Designation → Employee
Department module-এ Branch dropdown থাকবে, আর Branch dropdown-এর আগে Company select/filter রাখা ভালো হবে।


