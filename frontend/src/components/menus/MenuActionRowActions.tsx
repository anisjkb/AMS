import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { MenuAction } from "@/types/menuAction";

type MenuActionRowActionsProps = {
  action: MenuAction;
  canEdit?: boolean;
  canInactive?: boolean;
  canRestore?: boolean;
  canPermanentDelete?: boolean;
  onEdit: (action: MenuAction) => void;
  onInactive: (action: MenuAction) => void;
  onRestore: (action: MenuAction) => void;
  onPermanentDelete: (action: MenuAction) => void;
};

export default function MenuActionRowActions({
  action,
  canEdit = true,
  canInactive = true,
  canRestore = true,
  canPermanentDelete = true,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: MenuActionRowActionsProps) {
  if (!action.is_active) {
    if (!canRestore && !canPermanentDelete) return null;

    return (
      <div className="flex justify-end gap-2">
        {canRestore ? (
          <button
            type="button"
            onClick={() => onRestore(action)}
            className="rounded-xl border border-emerald-200 p-2 text-emerald-600 transition hover:bg-emerald-50"
            title="Restore action"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        ) : null}

        {canPermanentDelete ? (
          <button
            type="button"
            onClick={() => onPermanentDelete(action)}
            className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
            title="Permanent delete action"
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    );
  }

  if (!canEdit && !canInactive) return null;

  return (
    <div className="flex justify-end gap-2">
      {canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(action)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
          title="Edit action"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}

      {canInactive ? (
        <button
          type="button"
          onClick={() => onInactive(action)}
          className="rounded-xl border border-amber-200 p-2 text-amber-600 transition hover:bg-amber-50"
          title="Mark inactive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
