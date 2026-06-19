"use client";

import { useState } from "react";

import { createCompany, updateCompany } from "@/services/company";
import type { Company, CompanyCreatePayload } from "@/types/company";

export default function CompanyForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CompanyCreatePayload>({
    company_name: initialData?.company_name ?? "",
    company_code: initialData?.company_code ?? "",
    company_short_name: initialData?.company_short_name ?? "",
    company_email: initialData?.company_email ?? "",
    company_phone: initialData?.company_phone ?? "",
    company_address: initialData?.company_address ?? "",
    website: initialData?.website ?? "",
    tax_number: initialData?.tax_number ?? "",
    trade_license: initialData?.trade_license ?? "",
    remarks: initialData?.remarks ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (
    field: keyof CompanyCreatePayload,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!form.company_name.trim()) {
        setError("Company name is required");
        return;
      }

      if (!form.company_code.trim()) {
        setError("Company code is required");
        return;
      }

      if (initialData) {
        await updateCompany(initialData.id, form);
      } else {
          await createCompany(form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          value={form.company_name}
          onChange={(e) => updateField("company_name", e.target.value)}
          placeholder="Example: ABC Group"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company Code <span className="text-red-500">*</span>
        </label>
        <input
          value={form.company_code}
          onChange={(e) => updateField("company_code", e.target.value)}
          placeholder="Example: ABC"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Short Name
        </label>
        <input
          value={form.company_short_name}
          onChange={(e) => updateField("company_short_name", e.target.value)}
          placeholder="Example: ABC"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company Email
        </label>
        <input
          value={form.company_email}
          onChange={(e) => updateField("company_email", e.target.value)}
          placeholder="company@example.com"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company Phone
        </label>
        <input
          value={form.company_phone}
          onChange={(e) => updateField("company_phone", e.target.value)}
          placeholder="+880..."
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Company Address
        </label>
        <textarea
          value={form.company_address}
          onChange={(e) => updateField("company_address", e.target.value)}
          placeholder="Company address"
          rows={4}
          className="ams-input resize-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Website
        </label>
        <input
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://example.com"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Tax Number
        </label>
        <input
          value={form.tax_number}
          onChange={(e) => updateField("tax_number", e.target.value)}
          placeholder="Tax number"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Trade License
        </label>
        <input
          value={form.trade_license}
          onChange={(e) => updateField("trade_license", e.target.value)}
          placeholder="Trade license number"
          className="ams-input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Remarks
        </label>
        <textarea
          value={form.remarks}
          onChange={(e) => updateField("remarks", e.target.value)}
          placeholder="Remarks"
          rows={3}
          className="ams-input resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : initialData ? "Update Company" : "Save Company"}
        </button>
      </div>
    </div>
  );
}