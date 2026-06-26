// E:\Audit\AMS\frontend\src\components\permissions\PermissionForm.tsx

"use client";

import { useState } from "react";

import { createPermission, updatePermission } from "@/services/permission";
import type { Permission } from "@/types/permission";

type PermissionFormProps = {
  initialData?: Permission | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function PermissionForm({
  initialData,
  onSuccess,
  onCancel,
}: PermissionFormProps) {
  const [permissionKey, setPermissionKey] = useState(
    initialData?.permission_key || ""
  );
  const [resourceType, setResourceType] = useState(
    initialData?.resource_type || "api"
  );
  const [resourceKey, setResourceKey] = useState(
    initialData?.resource_key || ""
  );
  const [action, setAction] = useState(initialData?.action || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !permissionKey.trim() ||
      !resourceType.trim() ||
      !resourceKey.trim() ||
      !action.trim()
    ) {
      setErrorMessage(
        "Permission key, resource type, resource key and action are required."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        permission_key: permissionKey.trim(),
        resource_type: resourceType.trim(),
        resource_key: resourceKey.trim(),
        action: action.trim(),
        description: description.trim() || null,
      };

      if (initialData) {
        await updatePermission(initialData.id, payload);
      } else {
        await createPermission(payload);
      }

      onSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Permission save failed."
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
          Permission Key <span className="text-red-500">*</span>
        </label>

        <input
          value={permissionKey}
          onChange={(event) => setPermissionKey(event.target.value)}
          placeholder="Example: api.audit.create"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Resource Type <span className="text-red-500">*</span>
          </label>

          <select
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="api">api</option>
            <option value="menu">menu</option>
            <option value="button">button</option>
            <option value="module">module</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Action <span className="text-red-500">*</span>
          </label>

          <input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="create, update, delete, view"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Resource Key <span className="text-red-500">*</span>
        </label>

        <input
          value={resourceKey}
          onChange={(event) => setResourceKey(event.target.value)}
          placeholder="Example: audit, role, permission"
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
          placeholder="Write short permission description."
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
          {saving
            ? "Saving..."
            : initialData
              ? "Update Permission"
              : "Create Permission"}
        </button>
      </div>
    </form>
  );
}