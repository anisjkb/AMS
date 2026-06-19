// E:\Audit\AMS\frontend\src\components\designations\DesignationForm.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";

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

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500";

const labelClass = "mb-2 block text-sm font-bold text-slate-700";

export default function DesignationForm({
  initialData,
  companies,
  branches,
  departments,
  onSuccess,
  onCancel,
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
      setSubmitting(true);

      const payload = buildPayload();

      if (initialData) {
        await updateDesignation(initialData.id, payload);
      } else {
        await createDesignation(payload);
      }

      onSuccess();
    } catch (submitError) {
      console.error("Designation save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save designation."
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
          onChange={(event) => handleBranchChange(event.target.value)}
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

      <div>
        <label className={labelClass}>Department *</label>
        <select
          value={form.department_id}
          onChange={(event) =>
            handleChange("department_id", event.target.value)
          }
          disabled={!form.branch_id}
          className={inputClass}
        >
          <option value="">
            {form.branch_id ? "Select department" : "Select branch first"}
          </option>

          {availableDepartments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.department_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Designation Name *</label>
          <input
            value={form.designation_name}
            onChange={(event) =>
              handleChange("designation_name", event.target.value)
            }
            placeholder="Example: Manager"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Designation Code *</label>
          <input
            value={form.designation_code}
            onChange={(event) =>
              handleChange("designation_code", event.target.value)
            }
            placeholder="Example: MGR"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short Name</label>
        <input
          value={form.designation_short_name}
          onChange={(event) =>
            handleChange("designation_short_name", event.target.value)
          }
          placeholder="Example: MGR"
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
              ? "Update Designation"
              : "Save Designation"}
        </button>
      </div>
    </form>
  );
}