// E:\Audit\AMS\frontend\src\components\departments\DepartmentRowActions.tsx

"use client";

import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

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
        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {department.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(department)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title="Inactive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onRestore(department)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            title="Restore"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onPermanentDelete(department)}
            className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
            title="Permanent delete"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
