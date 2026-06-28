
// E:\Audit\AMS\frontend\src\components\employees\EmployeeForm.tsx

"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";

import CrudSelectField from "@/components/crud/fields/CrudSelectField";
import CrudTextField from "@/components/crud/fields/CrudTextField";
import CrudTextAreaField from "@/components/crud/fields/CrudTextAreaField";

import {
  createEmployee,
  deleteEmployeePhoto,
  getEmployeeMediaUrl,
  updateEmployee,
  uploadEmployeePhoto,
} from "@/services/employee";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type { Designation } from "@/types/designation";
import type { Employee, EmployeeCreatePayload } from "@/types/employee";
import {
  bangladeshPhoneFormatMessage,
  isValidBangladeshPhone,
  normalizeBangladeshPhone,
} from "@/utils/phone";

type EmployeeFormProps = {
  initialData?: Employee | null;
  companies: Company[];
  branches: Branch[];
  departments: Department[];
  designations: Designation[];
  employees: Employee[];
  onSuccess: () => void;
  onCancel: () => void;
  formId?: string;
  hideFooter?: boolean;
  onSubmittingChange?: (isSubmitting: boolean) => void;
};

type EmployeeFormState = {
  employee_code: string;
  official_employee_id: string;
  employee_name: string;

  email: string;
  phone: string;
  nid: string;

  dob: string;
  joining_date: string;

  gender: string;
  employee_type: string;

  company_id: string;
  branch_id: string;
  department_id: string;
  designation_id: string;

  reporting_to_employee_id: string;

  remarks: string;
};

const employeeTypeOptions = [
  "Permanent",
  "Contractual",
  "Probation",
  "Intern",
  "Temporary",
  "Part Time",
  "Other",
];

const genderOptions = ["Male", "Female", "Other"];

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const optionalDate = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const getInitialForm = (initialData?: Employee | null): EmployeeFormState => ({
  employee_code: initialData?.employee_code ?? "",
  official_employee_id: initialData?.official_employee_id ?? "",
  employee_name: initialData?.employee_name ?? "",

  email: initialData?.email ?? "",
  phone: initialData?.phone ?? "",
  nid: initialData?.nid ?? "",

  dob: initialData?.dob ?? "",
  joining_date: initialData?.joining_date ?? "",

  gender: initialData?.gender ?? "",
  employee_type: initialData?.employee_type ?? "Permanent",

  company_id: initialData?.company_id ? String(initialData.company_id) : "",
  branch_id: initialData?.branch_id ? String(initialData.branch_id) : "",
  department_id: initialData?.department_id
    ? String(initialData.department_id)
    : "",
  designation_id: initialData?.designation_id
    ? String(initialData.designation_id)
    : "",

  reporting_to_employee_id: initialData?.reporting_to_employee_id
    ? String(initialData.reporting_to_employee_id)
    : "",

  remarks: initialData?.remarks ?? "",
});

export default function EmployeeForm({
  initialData,
  companies,
  branches,
  departments,
  designations,
  employees,
  onSuccess,
  onCancel,
  formId = "employee-form",
  hideFooter = false,
  onSubmittingChange,
}: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormState>(() =>
    getInitialForm(initialData)
  );
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [error, setError] = useState("");

const photoPreviewUrl = useMemo(() => {
  if (!selectedPhoto) return "";

  return URL.createObjectURL(selectedPhoto);
}, [selectedPhoto]);

useEffect(() => {
  return () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
  };
}, [photoPreviewUrl]);

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

  const availableDesignations = useMemo(
    () =>
      designations.filter(
        (designation) =>
          String(designation.company_id) === form.company_id &&
          String(designation.branch_id) === form.branch_id &&
          String(designation.department_id) === form.department_id &&
          (designation.is_active ||
            String(designation.id) === form.designation_id)
      ),
    [
      designations,
      form.company_id,
      form.branch_id,
      form.department_id,
      form.designation_id,
    ]
  );

  const reportingEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        if (!employee.is_active) return false;
        if (initialData && employee.id === initialData.id) return false;

        if (form.company_id && String(employee.company_id) !== form.company_id) {
          return false;
        }

        return true;
      }),
    [employees, form.company_id, initialData]
  );

  const existingPhotoUrl = getEmployeeMediaUrl(
    initialData?.photo_thumb_url || initialData?.photo_url
  );

  const displayPhotoUrl = photoPreviewUrl || existingPhotoUrl;

  const handleChange = (field: keyof EmployeeFormState, value: string) => {
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
      designation_id: "",
      reporting_to_employee_id: "",
    }));
  };

  const handleBranchChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      branch_id: value,
      department_id: "",
      designation_id: "",
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setForm((previous) => ({
      ...previous,
      department_id: value,
      designation_id: "",
    }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be 3 MB or less.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedPhoto(file);
  };

  const buildPayload = (): EmployeeCreatePayload => {
    const phone = optionalText(form.phone);

    return {
      employee_code: optionalText(form.employee_code),
      official_employee_id: optionalText(form.official_employee_id),
      employee_name: form.employee_name.trim(),

      email: optionalText(form.email),
      phone: phone ? normalizeBangladeshPhone(phone) : undefined,
      nid: optionalText(form.nid),

      dob: optionalDate(form.dob),
      joining_date: optionalDate(form.joining_date),

      gender: optionalText(form.gender),
      employee_type: form.employee_type,

      company_id: Number(form.company_id),
      branch_id: Number(form.branch_id),
      department_id: Number(form.department_id),
      designation_id: Number(form.designation_id),

      reporting_to_employee_id: form.reporting_to_employee_id
        ? Number(form.reporting_to_employee_id)
        : null,

      remarks: optionalText(form.remarks),
    };
  };

  const setSubmitState = (isSubmitting: boolean) => {
    setSubmitting(isSubmitting);
    onSubmittingChange?.(isSubmitting);
  };

  const handleDeletePhoto = async () => {
    if (!initialData) return;

    try {
      setDeletingPhoto(true);
      setError("");

      await deleteEmployeePhoto(initialData.id);
      setSubmitState(false);
      onSuccess();
    } catch (deleteError) {
      console.error("Employee photo delete failed:", deleteError);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete employee photo."
      );
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.employee_name.trim()) {
      setError("Employee name is required.");
      return;
    }

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

    if (!form.designation_id) {
      setError("Designation is required.");
      return;
    }

    if (form.phone && !isValidBangladeshPhone(form.phone)) {
      setError(bangladeshPhoneFormatMessage);
      return;
    }

    try {
      setSubmitState(true);

      const payload = buildPayload();

      const savedResponse = initialData
        ? await updateEmployee(initialData.id, payload) 
        : await createEmployee(payload);

      const savedEmployeeId = savedResponse.data?.id ?? initialData?.id;

      if (selectedPhoto && savedEmployeeId) {
        await uploadEmployeePhoto(savedEmployeeId, selectedPhoto);
      }

      onSuccess();
    } catch (submitError) {
      console.error("Employee save failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save employee."
      );
    } finally {
      setSubmitState(false);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
            {displayPhotoUrl ? (
<Image
  src={displayPhotoUrl}
  alt="Employee"
  width={80}
  height={80}
  unoptimized
  className="h-full w-full object-cover"
/>
            ) : (
              <Camera className="text-slate-400" size={28} />
            )}
          </div>

          <div className="flex-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">
              <Upload size={16} />
              Select Photo
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              JPG, PNG or WEBP. Max 3 MB. System will create thumbnail and
              passport image automatically.
            </p>

            {initialData && existingPhotoUrl && (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={deletingPhoto || submitting}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deletingPhoto ? "Deleting..." : "Delete Photo"}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Employee Name"
          value={form.employee_name}
          required
          disabled={submitting}
          placeholder="Example: Rahim Uddin"
          onChange={(value) => handleChange("employee_name", value)}
        />

        <CrudTextField
          label="Employee Code"
          value={form.employee_code}
          disabled={submitting}
          placeholder="Auto-generated if empty"
          onChange={(value) => handleChange("employee_code", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CrudTextField
          label="Official Employee ID"
          value={form.official_employee_id}
          disabled={submitting}
          placeholder="Example: OFF001"
          onChange={(value) => handleChange("official_employee_id", value)}
        />

        <CrudSelectField
          label="Employee Type"
          value={form.employee_type}
          required
          disabled={submitting}
          options={employeeTypeOptions.map((type) => ({
            value: type,
            label: type,
          }))}
          onChange={(value) => handleChange("employee_type", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CrudTextField
          label="Email"
          type="email"
          value={form.email}
          disabled={submitting}
          placeholder="employee@example.com"
          onChange={(value) => handleChange("email", value)}
        />

        <CrudTextField
          label="Phone"
          type="tel"
          value={form.phone}
          disabled={submitting}
          placeholder="01712345678"
          onChange={(value) => handleChange("phone", value)}
          onBlur={() => handleChange("phone", normalizeBangladeshPhone(form.phone))}
        />

        <CrudTextField
          label="NID"
          value={form.nid}
          disabled={submitting}
          placeholder="National ID"
          onChange={(value) => handleChange("nid", value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CrudTextField
          label="Date of Birth"
          type="date"
          value={form.dob}
          disabled={submitting}
          onChange={(value) => handleChange("dob", value)}
        />

        <CrudTextField
          label="Joining Date"
          type="date"
          value={form.joining_date}
          disabled={submitting}
          onChange={(value) => handleChange("joining_date", value)}
        />

        <CrudSelectField
          label="Gender"
          value={form.gender}
          disabled={submitting}
          options={[
            { value: "", label: "Select gender" },
            ...genderOptions.map((gender) => ({
              value: gender,
              label: gender,
            })),
          ]}
          onChange={(value) => handleChange("gender", value)}
        />
      </div>

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
            label: form.branch_id ? "Select department" : "Select branch first",
          },
          ...availableDepartments.map((department) => ({
            value: String(department.id),
            label: department.department_name,
          })),
        ]}
        onChange={handleDepartmentChange}
      />

      <CrudSelectField
        label="Designation"
        value={form.designation_id}
        required
        disabled={submitting || !form.department_id}
        options={[
          {
            value: "",
            label: form.department_id
              ? "Select designation"
              : "Select department first",
          },
          ...availableDesignations.map((designation) => ({
            value: String(designation.id),
            label: designation.designation_name,
          })),
        ]}
        onChange={(value) => handleChange("designation_id", value)}
      />

      <CrudSelectField
        label="Reporting To"
        value={form.reporting_to_employee_id}
        disabled={submitting}
        options={[
          { value: "", label: "No reporting manager" },
          ...reportingEmployees.map((employee) => ({
            value: String(employee.id),
            label: `${employee.employee_name}${
              employee.employee_code ? ` (${employee.employee_code})` : ""
            }`,
          })),
        ]}
        onChange={(value) => handleChange("reporting_to_employee_id", value)}
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
                ? "Update Employee"
                : "Save Employee"}
          </button>
        </div>
      ) : null}
    </form>
  );
}