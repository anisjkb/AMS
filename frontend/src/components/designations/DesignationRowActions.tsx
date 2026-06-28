// E:\Audit\AMS\frontend\src\components\designations\DesignationRowActions.tsx

"use client";

import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { Designation } from "@/types/designation";

type DesignationRowActionsProps = {
  designation: Designation;
  onEdit: (designation: Designation) => void;
  onInactive: (designation: Designation) => void;
  onRestore: (designation: Designation) => void;
  onPermanentDelete: (designation: Designation) => void;
};

export default function DesignationRowActions({
  designation,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: DesignationRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(designation)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {designation.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(designation)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title="Inactive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onRestore(designation)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            title="Restore"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onPermanentDelete(designation)}
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
