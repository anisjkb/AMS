"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createMenu,
  normalizeOptionalNumber,
  normalizeOptionalText,
  updateMenu,
} from "@/services/menu";
import type {
  Menu,
  MenuCreatePayload,
} from "@/types/menu";
import type { NavigationGroupRecord } from "@/types/navigationGroup";

type MenuFormProps = {
  initialData?: Menu | null;
  navigationGroups: NavigationGroupRecord[];
  menus: Menu[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type MenuFormState = {
  navigation_group_id: string;
  parent_menu_id: string;
  menu_key: string;
  menu_title: string;
  route_path: string;
  icon: string;
  permission_key: string;
  sort_order: string;
  menu_level: string;
  is_expandable: string;
  is_visible: string;
};

const getInitialForm = (initialData?: Menu | null): MenuFormState => ({
  navigation_group_id: initialData?.navigation_group_id
    ? String(initialData.navigation_group_id)
    : "",
  parent_menu_id: initialData?.parent_menu_id
    ? String(initialData.parent_menu_id)
    : "",
  menu_key: initialData?.menu_key ?? "",
  menu_title: initialData?.menu_title ?? "",
  route_path: initialData?.route_path ?? "",
  icon: initialData?.icon ?? "",
  permission_key: initialData?.permission_key ?? "",
  sort_order: String(initialData?.sort_order ?? 0),
  menu_level: String(initialData?.menu_level ?? 1),
  is_expandable: String(initialData?.is_expandable ?? false),
  is_visible: String(initialData?.is_visible ?? true),
});

const getMenuOptionLabel = (menu: Menu) => {
  const levelPrefix = menu.menu_level > 1 ? "— ".repeat(menu.menu_level - 1) : "";
  return `${levelPrefix}${menu.menu_title} (${menu.menu_key})`;
};

const getNextMenuLevel = (parentMenu: Menu | undefined) => {
  if (!parentMenu) return "1";

  return String(Math.min(parentMenu.menu_level + 1, 5));
};

export default function MenuForm({
  initialData,
  navigationGroups,
  menus,
  onSuccess,
  onCancel,
  formId = "menu-form",
  hideFooter = false,
  onSubmittingChange,
}: MenuFormProps) {
  const [form, setForm] = useState<MenuFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeNavigationGroups = useMemo(() => {
    return navigationGroups.filter(
      (group) =>
        group.is_active || String(group.id) === form.navigation_group_id
    );
  }, [navigationGroups, form.navigation_group_id]);

  const parentMenuOptions = useMemo(() => {
    return menus
      .filter((menu) => {
        if (initialData && menu.id === initialData.id) {
          return false;
        }

        if (!form.navigation_group_id) {
          return false;
        }

        return String(menu.navigation_group_id) === form.navigation_group_id;
      })
      .sort((first, second) => {
        if (first.sort_order !== second.sort_order) {
          return first.sort_order - second.sort_order;
        }

        return first.id - second.id;
      });
  }, [menus, initialData, form.navigation_group_id]);

  const handleChange = (field: keyof MenuFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNavigationGroupChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      navigation_group_id: value,
      parent_menu_id: "",
      menu_level: "1",
    }));
  };

  const handleParentMenuChange = (value: string) => {
    const parentMenu = menus.find((menu) => String(menu.id) === value);

    setForm((previous) => ({
      ...previous,
      parent_menu_id: value,
      menu_level: getNextMenuLevel(parentMenu),
    }));
  };

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const buildPayload = (): MenuCreatePayload => ({
    navigation_group_id: Number(form.navigation_group_id),
    parent_menu_id: normalizeOptionalNumber(form.parent_menu_id),
    menu_key: form.menu_key.trim(),
    menu_title: form.menu_title.trim(),
    route_path: normalizeOptionalText(form.route_path),
    icon: normalizeOptionalText(form.icon),
    permission_key: normalizeOptionalText(form.permission_key),
    sort_order: Number(form.sort_order || 0),
    menu_level: Number(form.menu_level || 1),
    is_expandable: form.is_expandable === "true",
    is_visible: form.is_visible === "true",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.navigation_group_id) {
      setError("Navigation group is required.");
      return;
    }

    if (!form.menu_key.trim()) {
      setError("Menu key is required.");
      return;
    }

    if (!form.menu_title.trim()) {
      setError("Menu title is required.");
      return;
    }

    if (!form.sort_order.trim() || Number.isNaN(Number(form.sort_order))) {
      setError("Sort order must be a valid number.");
      return;
    }

    if (!form.menu_level.trim() || Number.isNaN(Number(form.menu_level))) {
      setError("Menu level must be a valid number.");
      return;
    }

    if (Number(form.menu_level) < 1 || Number(form.menu_level) > 5) {
      setError("Menu level must be between 1 and 5.");
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      if (initialData) {
        await updateMenu(initialData.id, payload);
      } else {
        await createMenu(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Menu save failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save menu."
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

      <div className="grid gap-4 md:grid-cols-2">
        <CrudSelectField
          label="Navigation Group"
          value={form.navigation_group_id}
          required
          disabled={submitting}
          options={[
            { value: "", label: "Select navigation group" },
            ...activeNavigationGroups.map((group) => ({
              value: String(group.id),
              label: `${group.group_title} (${group.group_key})`,
            })),
          ]}
          onChange={handleNavigationGroupChange}
        />

        <CrudSelectField
          label="Parent Menu"
          value={form.parent_menu_id}
          disabled={submitting || !form.navigation_group_id}
          options={[
            {
              value: "",
              label: form.navigation_group_id
                ? "Root menu / no parent"
                : "Select navigation group first",
            },
            ...parentMenuOptions.map((menu) => ({
              value: String(menu.id),
              label: getMenuOptionLabel(menu),
            })),
          ]}
          onChange={handleParentMenuChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Menu Title"
          value={form.menu_title}
          required
          disabled={submitting}
          placeholder="Example: Audit Subjects"
          onChange={(value) => handleChange("menu_title", value)}
        />

        <CrudTextField
          label="Menu Key"
          value={form.menu_key}
          required
          disabled={submitting}
          placeholder="Example: audit_subject"
          onChange={(value) => handleChange("menu_key", value)}
        />
      </div>

      <CrudTextField
        label="Route Path"
        value={form.route_path}
        disabled={submitting}
        placeholder="Example: /audit-subjects, keep empty for parent menu"
        onChange={(value) => handleChange("route_path", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Icon"
          value={form.icon}
          disabled={submitting}
          placeholder="Example: ClipboardList"
          onChange={(value) => handleChange("icon", value)}
        />

        <CrudTextField
          label="Permission Key"
          value={form.permission_key}
          disabled={submitting}
          placeholder="Example: menu.audit_subject.view"
          onChange={(value) => handleChange("permission_key", value)}
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

        <CrudTextField
          label="Menu Level"
          type="number"
          value={form.menu_level}
          required
          disabled={submitting}
          placeholder="1 to 5"
          onChange={(value) => handleChange("menu_level", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudSelectField
          label="Expandable"
          value={form.is_expandable}
          disabled={submitting}
          options={[
            { value: "false", label: "No" },
            { value: "true", label: "Yes" },
          ]}
          onChange={(value) => handleChange("is_expandable", value)}
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
                ? "Update Menu"
                : "Save Menu"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
