"use client";

import { AlertTriangle, Pencil, RotateCcw, Trash2 } from "lucide-react";

import type { Menu } from "@/types/menu";

type MenuRowActionsProps = {
  menu: Menu;
  canEdit?: boolean;
  canInactive?: boolean;
  canRestore?: boolean;
  canPermanentDelete?: boolean;
  onEdit: (menu: Menu) => void;
  onInactive: (menu: Menu) => void;
  onRestore: (menu: Menu) => void;
  onPermanentDelete: (menu: Menu) => void;
};

export default function MenuRowActions({
  menu,
  canEdit = true,
  canInactive = true,
  canRestore = true,
  canPermanentDelete = true,
  onEdit,
  onInactive,
  onRestore,
  onPermanentDelete,
}: MenuRowActionsProps) {
  if (menu.is_active && !canEdit && !canInactive) return null;
  if (!menu.is_active && !canRestore && !canPermanentDelete) return null;

  return (
    <div className="flex justify-end gap-2">
      {menu.is_active && canEdit ? (
        <button
          type="button"
          onClick={() => onEdit(menu)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}

      {menu.is_active && canInactive ? (
        <button
          type="button"
          onClick={() => onInactive(menu)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          title="Inactive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}

      {!menu.is_active && canRestore ? (
        <button
          type="button"
          onClick={() => onRestore(menu)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      ) : null}

      {!menu.is_active && canPermanentDelete ? (
        <button
          type="button"
          onClick={() => onPermanentDelete(menu)}
          className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
          title="Permanent delete"
        >
          <AlertTriangle className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
