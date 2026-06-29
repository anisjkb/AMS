"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import {
  createNavigationGroup,
  normalizeOptionalNumber,
  normalizeOptionalText,
  updateNavigationGroup,
} from "@/services/navigationGroup";
import type {
  NavigationGroupCreatePayload,
  NavigationGroupRecord,
} from "@/types/navigationGroup";

type NavigationGroupFormProps = {
  initialData?: NavigationGroupRecord | null;
  groups: NavigationGroupRecord[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type NavigationGroupFormState = {
  group_key: string;
  group_title: string;
  group_icon: string;
  parent_group_id: string;
  sort_order: string;
  is_collapsible: string;
  is_visible: string;
  group_badge: string;
  group_color: string;
  group_permission_key: string;
};

const getInitialForm = (
  initialData?: NavigationGroupRecord | null
): NavigationGroupFormState => ({
  group_key: initialData?.group_key ?? "",
  group_title: initialData?.group_title ?? "",
  group_icon: initialData?.group_icon ?? "",
  parent_group_id: initialData?.parent_group_id
    ? String(initialData.parent_group_id)
    : "",
  sort_order: String(initialData?.sort_order ?? 10),
  is_collapsible: String(initialData?.is_collapsible ?? true),
  is_visible: String(initialData?.is_visible ?? true),
  group_badge: initialData?.group_badge ?? "",
  group_color: initialData?.group_color ?? "",
  group_permission_key: initialData?.group_permission_key ?? "",
});

export default function NavigationGroupForm({
  initialData,
  groups,
  onSuccess,
  onCancel,
  formId = "navigation-group-form",
  hideFooter = false,
  onSubmittingChange,
}: NavigationGroupFormProps) {
  const [form, setForm] = useState<NavigationGroupFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const parentGroupOptions = useMemo(() => {
    return groups
      .filter((group) => {
        if (initialData && group.id === initialData.id) {
          return false;
        }

        return group.is_active || String(group.id) === form.parent_group_id;
      })
      .sort((first, second) => {
        if (first.sort_order !== second.sort_order) {
          return first.sort_order - second.sort_order;
        }

        return first.id - second.id;
      });
  }, [groups, initialData, form.parent_group_id]);

  const handleChange = (
    field: keyof NavigationGroupFormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const buildPayload = (): NavigationGroupCreatePayload => ({
    group_key: form.group_key.trim(),
    group_title: form.group_title.trim(),
    group_icon: normalizeOptionalText(form.group_icon),
    parent_group_id: normalizeOptionalNumber(form.parent_group_id),
    sort_order: Number(form.sort_order || 0),
    is_collapsible: form.is_collapsible === "true",
    is_visible: form.is_visible === "true",
    group_badge: normalizeOptionalText(form.group_badge),
    group_color: normalizeOptionalText(form.group_color),
    group_permission_key: normalizeOptionalText(form.group_permission_key),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.group_key.trim()) {
      setError("Group key is required.");
      return;
    }

    if (!form.group_title.trim()) {
      setError("Group title is required.");
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
        await updateNavigationGroup(initialData.id, payload);
      } else {
        await createNavigationGroup(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Navigation group save failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save navigation group."
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
        <CrudTextField
          label="Group Title"
          value={form.group_title}
          required
          disabled={submitting}
          placeholder="Example: Compliance"
          onChange={(value) => handleChange("group_title", value)}
        />

        <CrudTextField
          label="Group Key"
          value={form.group_key}
          required
          disabled={submitting}
          placeholder="Example: compliance"
          onChange={(value) => handleChange("group_key", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Group Icon"
          value={form.group_icon}
          disabled={submitting}
          placeholder="Example: ShieldCheck, BarChart3, Settings"
          onChange={(value) => handleChange("group_icon", value)}
        />

        <CrudTextField
          label="Sort Order"
          type="number"
          value={form.sort_order}
          required
          disabled={submitting}
          placeholder="Example: 10"
          onChange={(value) => handleChange("sort_order", value)}
        />
      </div>

      <CrudSelectField
        label="Parent Group"
        value={form.parent_group_id}
        disabled={submitting}
        options={[
          { value: "", label: "Root group / no parent" },
          ...parentGroupOptions.map((group) => ({
            value: String(group.id),
            label: `${group.group_title} (${group.group_key})`,
          })),
        ]}
        onChange={(value) => handleChange("parent_group_id", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudSelectField
          label="Collapsible"
          value={form.is_collapsible}
          disabled={submitting}
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          onChange={(value) => handleChange("is_collapsible", value)}
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

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Group Badge"
          value={form.group_badge}
          disabled={submitting}
          placeholder="Optional badge"
          onChange={(value) => handleChange("group_badge", value)}
        />

        <CrudTextField
          label="Group Color"
          value={form.group_color}
          disabled={submitting}
          placeholder="Optional color key"
          onChange={(value) => handleChange("group_color", value)}
        />
      </div>

      <CrudTextField
        label="Group Permission Key"
        value={form.group_permission_key}
        disabled={submitting}
        placeholder="Example: menu.compliance.view"
        onChange={(value) => handleChange("group_permission_key", value)}
      />

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
                ? "Update Group"
                : "Save Group"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
