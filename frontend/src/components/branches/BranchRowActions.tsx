"use client";

import { getIcon } from "@/components/layout/IconMapper";
import { useNavigation } from "@/contexts/NavigationContext";
import type { Branch } from "@/types/branch";

const rowActionKeys = ["update", "delete", "restore", "permanent_delete"];

const buttonStyleMap: Record<string, string> = {
  warning:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
  danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
  success:
    "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
  secondary:
    "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200",
};

const getDisplayTitle = (actionKey: string, defaultTitle: string) => {
  if (actionKey === "delete") return "Inactive";
  if (actionKey === "permanent_delete") return "Permanent Delete";
  return defaultTitle;
};

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

  const actions = getActionsByMenuKey("branch")
    .filter((action) => rowActionKeys.includes(action.action_key))
    .filter((action) => {
      if (action.action_key === "delete") {
        return branch.is_active;
      }

      if (action.action_key === "restore") {
        return !branch.is_active;
      }

      if (action.action_key === "permanent_delete") {
        return !branch.is_active;
      }

      return true;
    });

  if (actions.length === 0) {
    return <span className="text-slate-400">No actions</span>;
  }

  const handleActionClick = (actionKey: string) => {
    if (actionKey === "update") {
      onEdit(branch);
      return;
    }

    if (actionKey === "delete") {
      onInactive(branch);
      return;
    }

    if (actionKey === "restore") {
      onRestore(branch);
      return;
    }

    if (actionKey === "permanent_delete") {
      onPermanentDelete(branch);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {actions.map((action) => {
        const Icon = getIcon(action.button_icon);
        const color = action.button_color ?? "secondary";
        const title = getDisplayTitle(action.action_key, action.action_title);

        return (
          <button
            key={action.id}
            type="button"
            title={title}
            onClick={() => handleActionClick(action.action_key)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
              buttonStyleMap[color] ?? buttonStyleMap.secondary
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}