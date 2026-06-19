
// E:\Audit\AMS\frontend\src\components\employees\EmployeeForm.tsx

"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";

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

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500";

const labelClass = "mb-2 block text-sm font-bold text-slate-700";

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

  const handleDeletePhoto = async () => {
    if (!initialData) return;

    try {
      setDeletingPhoto(true);
      setError("");

      await deleteEmployeePhoto(initialData.id);
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
      setSubmitting(true);

      const payload = buildPayload();

      const savedEmployee = initialData
        ? await updateEmployee(initialData.id, payload)
        : await createEmployee(payload);

      if (selectedPhoto) {
        await uploadEmployeePhoto(savedEmployee.id, selectedPhoto);
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
        <div>
          <label className={labelClass}>Employee Name *</label>
          <input
            value={form.employee_name}
            onChange={(event) =>
              handleChange("employee_name", event.target.value)
            }
            placeholder="Example: Rahim Uddin"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Employee Code</label>
          <input
            value={form.employee_code}
            onChange={(event) =>
              handleChange("employee_code", event.target.value)
            }
            placeholder="Auto-generated if empty"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Official Employee ID</label>
          <input
            value={form.official_employee_id}
            onChange={(event) =>
              handleChange("official_employee_id", event.target.value)
            }
            placeholder="Example: OFF001"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Employee Type *</label>
          <select
            value={form.employee_type}
            onChange={(event) =>
              handleChange("employee_type", event.target.value)
            }
            className={inputClass}
          >
            {employeeTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="employee@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            placeholder="01712345678"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>NID</label>
          <input
            value={form.nid}
            onChange={(event) => handleChange("nid", event.target.value)}
            placeholder="National ID"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={(event) => handleChange("dob", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Joining Date</label>
          <input
            type="date"
            value={form.joining_date}
            onChange={(event) =>
              handleChange("joining_date", event.target.value)
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Gender</label>
          <select
            value={form.gender}
            onChange={(event) => handleChange("gender", event.target.value)}
            className={inputClass}
          >
            <option value="">Select gender</option>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          onChange={(event) => handleDepartmentChange(event.target.value)}
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

      <div>
        <label className={labelClass}>Designation *</label>
        <select
          value={form.designation_id}
          onChange={(event) =>
            handleChange("designation_id", event.target.value)
          }
          disabled={!form.department_id}
          className={inputClass}
        >
          <option value="">
            {form.department_id
              ? "Select designation"
              : "Select department first"}
          </option>
          {availableDesignations.map((designation) => (
            <option key={designation.id} value={designation.id}>
              {designation.designation_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Reporting To</label>
        <select
          value={form.reporting_to_employee_id}
          onChange={(event) =>
            handleChange("reporting_to_employee_id", event.target.value)
          }
          className={inputClass}
        >
          <option value="">No reporting manager</option>
          {reportingEmployees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.employee_name} ({employee.employee_code})
            </option>
          ))}
        </select>
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
              ? "Update Employee"
              : "Save Employee"}
        </button>
      </div>
    </form>
  );
}