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