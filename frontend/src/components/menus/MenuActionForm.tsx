"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createMenuAction,
  normalizeOptionalText,
  updateMenuAction,
} from "@/services/menuAction";
import type { Menu } from "@/types/menu";
import type {
  MenuAction,
  MenuActionCreatePayload,
} from "@/types/menuAction";
import type { Permission } from "@/types/permission";

type MenuActionFormProps = {
  initialData?: MenuAction | null;
  menus: Menu[];
  permissions: Permission[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type MenuActionFormState = {
  menu_id: string;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string;
  button_icon: string;
  sort_order: string;
  is_visible: string;
};

const getInitialForm = (
  initialData?: MenuAction | null
): MenuActionFormState => ({
  menu_id: initialData?.menu_id ? String(initialData.menu_id) : "",
  action_key: initialData?.action_key ?? "",
  action_title: initialData?.action_title ?? "",
  permission_key: initialData?.permission_key ?? "",
  button_color: initialData?.button_color ?? "",
  button_icon: initialData?.button_icon ?? "",
  sort_order: String(initialData?.sort_order ?? 10),
  is_visible: String(initialData?.is_visible ?? true),
});

const getMenuOptionLabel = (menu: Menu) => {
  const levelPrefix = menu.menu_level > 1 ? "— ".repeat(menu.menu_level - 1) : "";
  return `${levelPrefix}${menu.menu_title} (${menu.menu_key})`;
};

export default function MenuActionForm({
  initialData,
  menus,
  permissions,
  onSuccess,
  onCancel,
  formId = "menu-action-form",
  hideFooter = false,
  onSubmittingChange,
}: MenuActionFormProps) {
  const [form, setForm] = useState<MenuActionFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeMenus = useMemo(() => {
    return menus
      .filter(
        (menu) => menu.is_active || String(menu.id) === form.menu_id
      )
      .sort((first, second) => {
        if (first.sort_order !== second.sort_order) {
          return first.sort_order - second.sort_order;
        }

        return first.id - second.id;
      });
  }, [menus, form.menu_id]);

  const activePermissions = useMemo(() => {
    return permissions
      .filter(
        (permission) =>
          permission.is_active ||
          permission.permission_key === form.permission_key
      )
      .sort((first, second) =>
        first.permission_key.localeCompare(second.permission_key)
      );
  }, [permissions, form.permission_key]);

  const handleChange = (field: keyof MenuActionFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const buildPayload = (): MenuActionCreatePayload => ({
    menu_id: Number(form.menu_id),
    action_key: form.action_key.trim(),
    action_title: form.action_title.trim(),
    permission_key: form.permission_key.trim(),
    button_color: normalizeOptionalText(form.button_color),
    button_icon: normalizeOptionalText(form.button_icon),
    sort_order: Number(form.sort_order || 0),
    is_visible: form.is_visible === "true",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.menu_id) {
      setError("Menu is required.");
      return;
    }

    if (!form.action_key.trim()) {
      setError("Action key is required.");
      return;
    }

    if (!form.action_title.trim()) {
      setError("Action title is required.");
      return;
    }

    if (!form.permission_key.trim()) {
      setError("Permission key is required.");
      return;
    }

    if (!form.sort_order.trim() || Number.isNaN(Number(form.sort_order))) {
      setError("Sort order must be a valid number.");
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      if (initialData) {
        await updateMenuAction(initialData.id, payload);
      } else {
        await createMenuAction(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Menu action save failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save menu action."
      );
    } finally {
      setSubmitState(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <CrudSelectField
        label="Menu"
        value={form.menu_id}
        required
        disabled={submitting}
        options={[
          { value: "", label: "Select menu" },
          ...activeMenus.map((menu) => ({
            value: String(menu.id),
            label: getMenuOptionLabel(menu),
          })),
        ]}
        onChange={(value) => handleChange("menu_id", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Action Title"
          value={form.action_title}
          required
          disabled={submitting}
          placeholder="Example: Approve"
          onChange={(value) => handleChange("action_title", value)}
        />

        <CrudTextField
          label="Action Key"
          value={form.action_key}
          required
          disabled={submitting}
          placeholder="Example: approve"
          onChange={(value) => handleChange("action_key", value)}
        />
      </div>

      <CrudSelectField
        label="Permission Key"
        value={form.permission_key}
        required
        disabled={submitting}
        options={[
          { value: "", label: "Select permission key" },
          ...activePermissions.map((permission) => ({
            value: permission.permission_key,
            label: permission.permission_key,
          })),
        ]}
        onChange={(value) => handleChange("permission_key", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Button Icon"
          value={form.button_icon}
          disabled={submitting}
          placeholder="Example: CheckCircle, Trash2, Upload"
          onChange={(value) => handleChange("button_icon", value)}
        />

        <CrudTextField
          label="Button Color"
          value={form.button_color}
          disabled={submitting}
          placeholder="Example: blue, emerald, rose"
          onChange={(value) => handleChange("button_color", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Sort Order"
          type="number"
          value={form.sort_order}
          required
          disabled={submitting}
          placeholder="Example: 10"
          onChange={(value) => handleChange("sort_order", value)}
        />

        <CrudSelectField
          label="Visible"
          value={form.is_visible}
          disabled={submitting}
          options={[
            { value: "true", label: "Visible" },
            { value: "false", label: "Hidden" },
          ]}
          onChange={(value) => handleChange("is_visible", value)}
        />
      </div>

      {!hideFooter ? (
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : initialData
                ? "Update Action"
                : "Save Action"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
