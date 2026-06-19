// E:\Audit\AMS\frontend\src\components\employees\EmployeeRowActions.tsx

"use client";

import { Archive, Edit3, RotateCcw, Trash2 } from "lucide-react";

import type { Employee } from "@/types/employee";

type EmployeeRowActionsProps = {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onInactive: (employee: Employee) => void;
  onRestore: (employee: Employee) => void;
  onPermanentDelete: (employee: Employee) => void;
};

export default function EmployeeRowActions({
  employee,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: EmployeeRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(employee)}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        <Edit3 size={14} />
        Edit
      </button>

      {employee.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(employee)}
          className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
        >
          <Archive size={14} />
          Inactive
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onRestore(employee)}
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
          >
            <RotateCcw size={14} />
            Restore
          </button>

          <button
            type="button"
            onClick={() => onPermanentDelete(employee)}
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