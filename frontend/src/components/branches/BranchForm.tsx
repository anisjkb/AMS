"use client";

import { useEffect, useState, type FormEvent } from "react";

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
}: {
  initialData?: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
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

    if (!form.company_id) {
      setError("Company is required");
      return;
    }

    if (!form.branch_name.trim()) {
      setError("Branch name is required");
      return;
    }

    if (!form.branch_code.trim()) {
      setError("Branch code is required");
      return;
    }
    
    if (
      form.branch_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branch_email.trim())
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
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company <span className="text-red-500">*</span>
        </label>

        <select
          value={form.company_id}
          onChange={(event) => handleChange("company_id", event.target.value)}
          disabled={companyLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        >
          <option value="">
            {companyLoading ? "Loading companies..." : "Select company"}
          </option>

          {companies
            .filter((company) => company.is_active)
            .map((company) => (
              <option key={company.id} value={company.id}>
                {company.company_name} ({company.company_code})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Name <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_name}
          onChange={(event) => handleChange("branch_name", event.target.value)}
          placeholder="Enter branch name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Branch Code <span className="text-red-500">*</span>
        </label>

        <input
          value={form.branch_code}
          onChange={(event) => handleChange("branch_code", event.target.value)}
          placeholder="Enter branch code"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Short Name
        </label>

        <input
          value={form.branch_short_name}
          onChange={(event) =>
            handleChange("branch_short_name", event.target.value)
          }
          placeholder="Enter short name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          value={form.branch_email}
          onChange={(event) => handleChange("branch_email", event.target.value)}
          placeholder="Enter email"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Phone
        </label>

<input
  value={form.branch_phone}
  onChange={(event) => handleChange("branch_phone", event.target.value)}
  onBlur={() =>
    handleChange("branch_phone", normalizeBangladeshPhone(form.branch_phone))
  }
  placeholder="Example: 01712345678"
  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
/>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Address
        </label>

        <textarea
          value={form.branch_address}
          onChange={(event) =>
            handleChange("branch_address", event.target.value)
          }
          placeholder="Enter address"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Remarks
        </label>

        <textarea
          value={form.remarks}
          onChange={(event) => handleChange("remarks", event.target.value)}
          placeholder="Enter remarks"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        />
      </div>

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
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : initialData
              ? "Update Branch"
              : "Save Branch"}
        </button>
      </div>
    </form>
  );
}