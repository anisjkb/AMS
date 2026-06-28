// E:\Audit\AMS\frontend\src\components\designations\DesignationForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { createDesignation, updateDesignation } from "@/services/designation";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type {
  Designation,
  DesignationCreatePayload,
} from "@/types/designation";

type DesignationFormProps = {
  initialData?: Designation | null;
  companies: Company[];
  branches: Branch[];
  departments: Department[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type DesignationFormState = {
  company_id: string;
  branch_id: string;
  department_id: string;

  designation_code: string;
  designation_name: string;
  designation_short_name: string;

  remarks: string;
};

const getInitialForm = (
  initialData?: Designation | null
): DesignationFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_id: initialData?.branch_id ? String(initialData.branch_id) : "",
  department_id: initialData?.department_id
    ? String(initialData.department_id)
    : "",

  designation_code: initialData?.designation_code ?? "",
  designation_name: initialData?.designation_name ?? "",
  designation_short_name: initialData?.designation_short_name ?? "",

  remarks: initialData?.remarks ?? "",
});

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

export default function DesignationForm({
  initialData,
  companies,
  branches,
  departments,
  onSuccess,
  onCancel,
  formId = "designation-form",
  hideFooter = false,
  onSubmittingChange,
}: DesignationFormProps) {
  const [form, setForm] = useState<DesignationFormState>(() =>
    getInitialForm(initialData)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          company.is_active || String(company.id) === form.company_id
      ),
    [companies, form.company_id]
  );

  const availableBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          String(branch.company_id) === form.company_id &&
          (branch.is_active || String(branch.id) === form.branch_id)
      ),
    [branches, form.company_id, form.branch_id]
  );

  const availableDepartments = useMemo(
    () =>
      departments.filter(
        (department) =>
          String(department.company_id) === form.company_id &&
          String(department.branch_id) === form.branch_id &&
          (department.is_active ||
            String(department.id) === form.department_id)
      ),
    [departments, form.company_id, form.branch_id, form.department_id]
  );

  const handleChange = (field: keyof DesignationFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCompanyChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      company_id: value,
      branch_id: "",
      department_id: "",
    }));
  };

  const handleBranchChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      branch_id: value,
      department_id: "",
    }));
  };

  const buildPayload = (): DesignationCreatePayload => ({
    company_id: Number(form.company_id),
    branch_id: Number(form.branch_id),
    department_id: Number(form.department_id),

    designation_code: form.designation_code.trim(),
    designation_name: form.designation_name.trim(),
    designation_short_name: optionalText(form.designation_short_name),

    remarks: optionalText(form.remarks),
  });

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.company_id) {
      setError("Company is required.");
      return;
    }

    if (!form.branch_id) {
      setError("Branch is required.");
      return;
    }

    if (!form.department_id) {
      setError("Department is required.");
      return;
    }

    if (!form.designation_name.trim()) {
      setError("Designation name is required.");
      return;
    }

    if (!form.designation_code.trim()) {
      setError("Designation code is required.");
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      if (initialData) {
        await updateDesignation(initialData.id, payload);
      } else {
        await createDesignation(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Designation save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save designation."
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

      <div className="grid gap-4 md:grid-cols-3">
        <CrudSelectField
          label="Company"
          value={form.company_id}
          required
          disabled={submitting}
          options={[
            { value: "", label: "Select company" },
            ...activeCompanies.map((company) => ({
              value: String(company.id),
              label: company.company_name,
            })),
          ]}
          onChange={handleCompanyChange}
        />

        <CrudSelectField
          label="Branch"
          value={form.branch_id}
          required
          disabled={submitting || !form.company_id}
          options={[
            {
              value: "",
              label: form.company_id ? "Select branch" : "Select company first",
            },
            ...availableBranches.map((branch) => ({
              value: String(branch.id),
              label: branch.branch_name,
            })),
          ]}
          onChange={handleBranchChange}
        />

        <CrudSelectField
          label="Department"
          value={form.department_id}
          required
          disabled={submitting || !form.branch_id}
          options={[
            {
              value: "",
              label: form.branch_id
                ? "Select department"
                : "Select branch first",
            },
            ...availableDepartments.map((department) => ({
              value: String(department.id),
              label: department.department_name,
            })),
          ]}
          onChange={(value) => handleChange("department_id", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Designation Name"
          value={form.designation_name}
          required
          disabled={submitting}
          placeholder="Example: Manager"
          onChange={(value) => handleChange("designation_name", value)}
        />

        <CrudTextField
          label="Designation Code"
          value={form.designation_code}
          required
          disabled={submitting}
          placeholder="Example: MGR"
          onChange={(value) => handleChange("designation_code", value)}
        />
      </div>

      <CrudTextField
        label="Short Name"
        value={form.designation_short_name}
        disabled={submitting}
        placeholder="Example: MGR"
        onChange={(value) => handleChange("designation_short_name", value)}
      />

      <CrudTextAreaField
        label="Remarks"
        value={form.remarks}
        disabled={submitting}
        placeholder="Optional remarks"
        rows={3}
        onChange={(value) => handleChange("remarks", value)}
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
                ? "Update Designation"
                : "Save Designation"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
