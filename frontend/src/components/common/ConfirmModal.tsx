"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmVariant = "danger" | "warning" | "success";

const variantStyleMap: Record<ConfirmVariant, string> = {
  danger: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
  success: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60 ${variantStyleMap[variant]}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}