
// E:\Audit\AMS\frontend\src\components\departments\DepartmentForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";

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

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500";

const labelClass = "mb-2 block text-sm font-bold text-slate-700";

export default function DepartmentForm({
  initialData,
  companies,
  branches,
  onSuccess,
  onCancel,
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
      setSubmitting(true);

      const payload = buildPayload();

      if (initialData) {
        await updateDepartment(initialData.id, payload);
      } else {
        await createDepartment(payload);
      }

      onSuccess();
    } catch (submitError) {
      console.error("Department save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Company *</label>
        <select
          value={form.company_id}
          onChange={(event) => handleCompanyChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Select company</option>
          {activeCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Branch *</label>
        <select
          value={form.branch_id}
          onChange={(event) => handleChange("branch_id", event.target.value)}
          disabled={!form.company_id}
          className={inputClass}
        >
          <option value="">
            {form.company_id ? "Select branch" : "Select company first"}
          </option>

          {availableBranches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branch_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Department Name *</label>
          <input
            value={form.department_name}
            onChange={(event) =>
              handleChange("department_name", event.target.value)
            }
            placeholder="Example: Accounts"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Department Code *</label>
          <input
            value={form.department_code}
            onChange={(event) =>
              handleChange("department_code", event.target.value)
            }
            placeholder="Example: ACC"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Name</label>
        <input
          value={form.department_short_name}
          onChange={(event) =>
            handleChange("department_short_name", event.target.value)
          }
          placeholder="Example: ACC"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Email</label>
          <input
            value={form.department_email}
            onChange={(event) =>
              handleChange("department_email", event.target.value)
            }
            placeholder="accounts@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            value={form.department_phone}
            onChange={(event) =>
              handleChange("department_phone", event.target.value)
            }
            onBlur={() =>
              handleChange(
                "department_phone",
                normalizeBangladeshPhone(form.department_phone)
              )
            }
            placeholder="Example: 01712345678"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <textarea
          value={form.department_address}
          onChange={(event) =>
            handleChange("department_address", event.target.value)
          }
          placeholder="Department address"
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Remarks</label>
        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Optional remarks"
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : initialData
              ? "Update Department"
              : "Save Department"}
        </button>
      </div>
    </form>
  );
}