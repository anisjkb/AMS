// E:\Audit\AMS\frontend\src\components\roles\RoleForm.tsx

"use client";

import { useState } from "react";

import { createRole, updateRole } from "@/services/role";
import type { Role } from "@/types/role";

type RoleFormProps = {
  initialData?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function RoleForm({
  initialData,
  onSuccess,
  onCancel,
}: RoleFormProps) {
  const [roleName, setRoleName] = useState(initialData?.role_name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!roleName.trim()) {
      setErrorMessage("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        role_name: roleName.trim(),
        description: description.trim() || null,
      };

      if (initialData) {
        await updateRole(initialData.id, payload);
      } else {
        await createRole(payload);
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Role save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Role Name <span className="text-red-500">*</span>
        </label>

        <input
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
          placeholder="Example: Admin, Auditor, Manager"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Write short role description."
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : initialData ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}