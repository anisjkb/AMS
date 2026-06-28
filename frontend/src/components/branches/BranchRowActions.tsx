"use client";

import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { useNavigation } from "@/contexts/NavigationContext";
import type { Branch } from "@/types/branch";

const rowActionKeys = ["update", "delete", "restore", "permanent_delete"];

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

  const allowedActionKeys = new Set(
    getActionsByMenuKey("branch")
      .filter((action) => rowActionKeys.includes(action.action_key))
      .map((action) => action.action_key),
  );

  const canEdit = allowedActionKeys.has("update");
  const canDeactivate =
    branch.is_active &&
    (allowedActionKeys.has("delete") || allowedActionKeys.has("inactive"));
  const canRestore = !branch.is_active && allowedActionKeys.has("restore");
  const canPermanentDelete =
    !branch.is_active && allowedActionKeys.has("permanent_delete");

  if (!canEdit && !canDeactivate && !canRestore && !canPermanentDelete) {
    return <span className="text-xs font-semibold text-slate-400">No actions</span>;
  }

  return (
    <div className="flex justify-end gap-2">
      {canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(branch)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}

      {canDeactivate ? (
        <button
          type="button"
          onClick={() => onInactive(branch)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title="Inactive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}

      {canRestore ? (
        <button
          type="button"
          onClick={() => onRestore(branch)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      ) : null}

      {canPermanentDelete ? (
        <button
          type="button"
          onClick={() => onPermanentDelete(branch)}
          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
          title="Permanent delete"
        >
          <AlertTriangle className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
