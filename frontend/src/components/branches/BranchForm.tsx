"use client";

import { useEffect, useState, type FormEvent } from "react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import { createBranch, updateBranch } from "@/services/branch";
import { getCompanies } from "@/services/company";
import type { Branch, BranchCreatePayload } from "@/types/branch";
import type { Company } from "@/types/company";
import {
  bangladeshPhoneFormatMessage,
  isValidBangladeshPhone,
  normalizeBangladeshPhone,
} from "@/utils/phone";

type BranchFormState = {
  company_id: string;
  branch_code: string;
  branch_name: string;
  branch_short_name: string;
  branch_email: string;
  branch_phone: string;
  branch_address: string;
  remarks: string;
};

type BranchFormProps = {
  initialData?: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

const getInitialForm = (initialData?: Branch | null): BranchFormState => ({
  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_code: initialData?.branch_code ?? "",
  branch_name: initialData?.branch_name ?? "",
  branch_short_name: initialData?.branch_short_name ?? "",
  branch_email: initialData?.branch_email ?? "",
  branch_phone: initialData?.branch_phone ?? "",
  branch_address: initialData?.branch_address ?? "",
  remarks: initialData?.remarks ?? "",
});

export default function BranchForm({
  initialData,
  onSuccess,
  onCancel,
  formId = "branch-form",
  hideFooter = false,
  onSubmittingChange,
}: BranchFormProps) {
  const [form, setForm] = useState<BranchFormState>(() =>
    getInitialForm(initialData)
  );
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((data) => {
        if (!cancelled) {
          setCompanies(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load companies:", error);
          setCompanies([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCompanyLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: keyof BranchFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const optionalText = (value: string) => {
    const trimmed = value.trim();
    return trimmed || undefined;
  };

  const buildPayload = (): BranchCreatePayload => ({
    company_id: Number(form.company_id),
    branch_code: form.branch_code.trim(),
    branch_name: form.branch_name.trim(),
    branch_short_name: optionalText(form.branch_short_name),
    branch_email: optionalText(form.branch_email),
    branch_phone: optionalText(normalizeBangladeshPhone(form.branch_phone)),
    branch_address: optionalText(form.branch_address),
    remarks: optionalText(form.remarks),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    if (!form.company_id) {
      setError("Company is required.");
      return;
    }

    if (!form.branch_name.trim()) {
      setError("Branch name is required.");
      return;
    }

    if (!form.branch_code.trim()) {
      setError("Branch code is required.");
      return;
    }

    if (
      form.branch_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branch_email.trim())
    ) {
      setError("Please enter a valid branch email address.");
      return;
    }

    if (!isValidBangladeshPhone(form.branch_phone)) {
      setError(bangladeshPhoneFormatMessage);
      return;
    }

    try {
      setLoading(true);
      onSubmittingChange?.(true);
      setError("");

      const payload = buildPayload();

      if (initialData) {
        await updateBranch(initialData.id, payload);
      } else {
        await createBranch(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Branch save failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Branch save failed. Please try again."
      );
    } finally {
      setLoading(false);
      onSubmittingChange?.(false);
    }
  };

  const companyOptions = [
    {
      value: "",
      label: companyLoading ? "Loading companies..." : "Select company",
    },
    ...companies
      .filter((company) => company.is_active)
      .map((company) => ({
        value: String(company.id),
        label: `${company.company_name} (${company.company_code})`,
      })),
  ];

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <CrudSelectField
        label="Company"
        value={form.company_id}
        required
        disabled={companyLoading || loading}
        options={companyOptions}
        onChange={(value) => handleChange("company_id", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Branch Name"
          value={form.branch_name}
          required
          disabled={loading}
          placeholder="Example: Dhaka Main Branch"
          onChange={(value) => handleChange("branch_name", value)}
        />

        <CrudTextField
          label="Branch Code"
          value={form.branch_code}
          required
          disabled={loading}
          placeholder="Example: BR-001"
          onChange={(value) => handleChange("branch_code", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Short Name"
          value={form.branch_short_name}
          disabled={loading}
          placeholder="Example: Dhaka"
          onChange={(value) => handleChange("branch_short_name", value)}
        />

        <CrudTextField
          label="Email"
          type="email"
          value={form.branch_email}
          disabled={loading}
          placeholder="branch@example.com"
          onChange={(value) => handleChange("branch_email", value)}
        />
      </div>

      <CrudTextField
        label="Phone"
        type="tel"
        value={form.branch_phone}
        disabled={loading}
        placeholder="Example: 01712345678"
        onChange={(value) => handleChange("branch_phone", value)}
        onBlur={() =>
          handleChange("branch_phone", normalizeBangladeshPhone(form.branch_phone))
        }
      />

      <CrudTextAreaField
        label="Address"
        value={form.branch_address}
        disabled={loading}
        placeholder="Enter branch address"
        rows={3}
        onChange={(value) => handleChange("branch_address", value)}
      />

      <CrudTextAreaField
        label="Remarks"
        value={form.remarks}
        disabled={loading}
        placeholder="Enter remarks"
        rows={3}
        onChange={(value) => handleChange("remarks", value)}
      />

      {!hideFooter ? (
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : initialData
                ? "Update Branch"
                : "Save Branch"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
