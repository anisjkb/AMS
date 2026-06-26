
// E:\Audit\AMS\frontend\src\components\roles\RoleRowActions.tsx

"use client";

import { Edit3, RotateCcw, Trash2, XCircle } from "lucide-react";

import type { Role } from "@/types/role";

type RoleRowActionsProps = {
  role: Role;
  onEdit: (role: Role) => void;
  onInactive: (role: Role) => void;
  onRestore: (role: Role) => void;
  onPermanentDelete: (role: Role) => void;
};

export default function RoleRowActions({
  role,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: RoleRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(role)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Edit3 size={16} />
      </button>

      {role.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(role)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark inactive"
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRestore(role)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onPermanentDelete(role)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"
        title="Permanent delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}