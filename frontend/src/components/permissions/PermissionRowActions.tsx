
// E:\Audit\AMS\frontend\src\components\permissions\PermissionRowActions.tsx

"use client";

import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react";

import type { Permission } from "@/types/permission";

type PermissionRowActionsProps = {
  permission: Permission;
  onEdit: (permission: Permission) => void;
  onInactive: (permission: Permission) => void;
  onRestore: (permission: Permission) => void;
  onPermanentDelete: (permission: Permission) => void;
};

export default function PermissionRowActions({
  permission,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: PermissionRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(permission)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Edit3 size={16} />
      </button>

      {permission.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(permission)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark inactive"
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRestore(permission)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onPermanentDelete(permission)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
        title="Permanent delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}