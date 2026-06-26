
// E:\Audit\AMS\frontend\src\components\users\UserRowActions.tsx

"use client";

import { Edit3, RotateCcw, XCircle } from "lucide-react";

import type { User } from "@/types/user";

type UserRowActionsProps = {
  user: User;
  onEdit: (user: User) => void;
  onInactive: (user: User) => void;
  onRestore: (user: User) => void;
};

export default function UserRowActions({
  user,
  onEdit,
  onInactive,
  onRestore,
}: UserRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit(user)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
        title="Edit"
      >
        <Edit3 size={16} />
      </button>

      {user.is_active ? (
        <button
          type="button"
          onClick={() => onInactive(user)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark inactive"
        >
          <XCircle size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onRestore(user)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}