// E:\Audit\AMS\frontend\src\components\departments\DepartmentForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { createDepartment, updateDepartment } from "@/services/department";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type {
  Department,
  DepartmentCreatePayload,
} from "@/types/department";
import {
  bangladeshPhoneFormatMessage,
  isValidBangladeshPhone,
  normalizeBangladeshPhone,
} from "@/utils/phone";

type DepartmentFormProps = {
  initialData?: Department | null;
  companies: Company[];
  branches: Branch[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type DepartmentFormState = {
  company_id: string;
  branch_id: string;

  department_code: string;
  department_name: string;
  department_short_name: string;
  department_email: string;
  department_phone: string;
  department_address: string;

  remarks: string;
};

const getInitialForm = (
  initialData?: Department | null
): DepartmentFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_id: initialData?.branch_id ? String(initialData.branch_id) : "",

  department_code: initialData?.department_code ?? "",
  department_name: initialData?.department_name ?? "",
  department_short_name: initialData?.department_short_name ?? "",
  department_email: initialData?.department_email ?? "",
  department_phone: initialData?.department_phone ?? "",
  department_address: initialData?.department_address ?? "",

  remarks: initialData?.remarks ?? "",
});

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

export default function DepartmentForm({
  initialData,
  companies,
  branches,
  onSuccess,
  onCancel,
  formId = "department-form",
  hideFooter = false,
  onSubmittingChange,
}: DepartmentFormProps) {
  const [form, setForm] = useState<DepartmentFormState>(() =>
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

  const handleChange = (field: keyof DepartmentFormState, value: string) => {
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
    }));
  };

  const buildPayload = (): DepartmentCreatePayload => ({
    company_id: Number(form.company_id),
    branch_id: Number(form.branch_id),

    department_code: form.department_code.trim(),
    department_name: form.department_name.trim(),
    department_short_name: optionalText(form.department_short_name),
    department_email: optionalText(form.department_email),
    department_phone: optionalText(
      normalizeBangladeshPhone(form.department_phone)
    ),
    department_address: optionalText(form.department_address),

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

    if (!form.department_name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!form.department_code.trim()) {
      setError("Department code is required.");
      return;
    }

    if (
      form.department_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.department_email.trim())
    ) {
      setError("Please enter a valid department email address.");
      return;
    }

    if (!isValidBangladeshPhone(form.department_phone)) {
      setError(bangladeshPhoneFormatMessage);
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      if (initialData) {
        await updateDepartment(initialData.id, payload);
      } else {
        await createDepartment(payload);
      }

      setSubmitState(false);
      onSuccess();
    } catch (submitError) {
      console.error("Department save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save department."
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
          onChange={(value) => handleChange("branch_id", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Department Name"
          value={form.department_name}
          required
          disabled={submitting}
          placeholder="Example: Accounts"
          onChange={(value) => handleChange("department_name", value)}
        />

        <CrudTextField
          label="Department Code"
          value={form.department_code}
          required
          disabled={submitting}
          placeholder="Example: ACC"
          onChange={(value) => handleChange("department_code", value)}
        />
      </div>

      <CrudTextField
        label="Short Name"
        value={form.department_short_name}
        disabled={submitting}
        placeholder="Example: ACC"
        onChange={(value) => handleChange("department_short_name", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Email"
          type="email"
          value={form.department_email}
          disabled={submitting}
          placeholder="accounts@example.com"
          onChange={(value) => handleChange("department_email", value)}
        />

        <CrudTextField
          label="Phone"
          type="tel"
          value={form.department_phone}
          disabled={submitting}
          placeholder="Example: 01712345678"
          onChange={(value) => handleChange("department_phone", value)}
          onBlur={() =>
            handleChange(
              "department_phone",
              normalizeBangladeshPhone(form.department_phone)
            )
          }
        />
      </div>

      <CrudTextAreaField
        label="Address"
        value={form.department_address}
        disabled={submitting}
        placeholder="Department address"
        rows={3}
        onChange={(value) => handleChange("department_address", value)}
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
                ? "Update Department"
                : "Save Department"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
