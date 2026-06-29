import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { NavigationGroupRecord } from "@/types/navigationGroup";

type NavigationGroupRowActionsProps = {
  group: NavigationGroupRecord;
  onEdit: (group: NavigationGroupRecord) => void;
  onInactive: (group: NavigationGroupRecord) => void;
  onRestore: (group: NavigationGroupRecord) => void;
  onPermanentDelete: (group: NavigationGroupRecord) => void;
};

export default function NavigationGroupRowActions({
  group,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: NavigationGroupRowActionsProps) {
  if (!group.is_active) {
    return (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onRestore(group)}
          className="rounded-xl border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
          title="Restore group"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onPermanentDelete(group)}
          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
          title="Permanent delete group"
        >
          <AlertTriangle className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(group)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
        title="Edit group"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onInactive(group)}
        className="rounded-xl border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
        title="Mark inactive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
