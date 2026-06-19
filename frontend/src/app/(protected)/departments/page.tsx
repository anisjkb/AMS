
// E:\Audit\AMS\frontend\src\app\(protected)\departments\page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Network, Search } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DepartmentForm from "@/components/departments/DepartmentForm";
import DepartmentRowActions from "@/components/departments/DepartmentRowActions";
import {
  deactivateDepartment,
  getDepartments,
  permanentlyDeleteDepartment,
  restoreDepartment,
} from "@/services/department";
import { getBranches } from "@/services/branch";
import { getCompanies } from "@/services/company";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const companyNameById = useMemo(() => {
    const map = new Map<number, string>();

    companies.forEach((company) => {
      map.set(company.id, company.company_name);
    });

    return map;
  }, [companies]);

  const branchNameById = useMemo(() => {
    const map = new Map<number, string>();

    branches.forEach((branch) => {
      map.set(branch.id, branch.branch_name);
    });

    return map;
  }, [branches]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
      setDepartments([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getDepartments(), getCompanies(), getBranches()])
      .then(([departmentData, companyData, branchData]) => {
        if (!cancelled) {
          setDepartments(departmentData);
          setCompanies(companyData);
          setBranches(branchData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load department page data:", error);
          setDepartments([]);
          setCompanies([]);
          setBranches([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDepartments = departments.filter((department) => {
    const keyword = searchTerm.toLowerCase();

    const companyName =
      companyNameById.get(department.company_id)?.toLowerCase() ?? "";
    const branchName =
      branchNameById.get(department.branch_id)?.toLowerCase() ?? "";

    const matchesSearch =
      department.department_name?.toLowerCase().includes(keyword) ||
      department.department_code?.toLowerCase().includes(keyword) ||
      department.department_short_name?.toLowerCase().includes(keyword) ||
      department.department_email?.toLowerCase().includes(keyword) ||
      department.department_phone?.toLowerCase().includes(keyword) ||
      department.department_address?.toLowerCase().includes(keyword) ||
      companyName.includes(keyword) ||
      branchName.includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && department.is_active) ||
      (statusFilter === "inactive" && !department.is_active);

    return matchesSearch && matchesStatus;
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingDepartment(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingDepartment);

    setDrawerOpen(false);
    setEditingDepartment(null);

    showSuccess(
      wasEditing
        ? "Department updated successfully."
        : "Department created successfully."
    );

    loadDepartments();
  };

  const openConfirm = (department: Department, action: ConfirmAction) => {
    setSelectedDepartment(department);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedDepartment(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedDepartment || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateDepartment(selectedDepartment.id);
        showSuccess("Department marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreDepartment(selectedDepartment.id);
        showSuccess("Department restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteDepartment(selectedDepartment.id);
        showSuccess("Department permanently deleted successfully.");
      }

      closeConfirm();
      await loadDepartments();
    } catch (error) {
      console.error("Department action failed:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Department action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Department Inactive";
    if (confirmAction === "restore") return "Restore Department";
    if (confirmAction === "permanent_delete")
      return "Permanently Delete Department";

    return "Confirm Action";
  };

  const getConfirmMessage = () => {
    const name = selectedDepartment?.department_name || "this department";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`;
    }

    return "Are you sure you want to continue?";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "permanent_delete") return "danger";

    return "warning";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Network}
          title="Department Management"
          description="Manage company and branch-wise departments with RBAC-based actions."
        />

        <PageActionBar
          menuKey="department"
          onCreate={handleCreate}
          onExport={handleExport}
          onImport={handleImport}
        />

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Departments
              </h2>
              <p className="text-sm text-slate-500">
                Department list connected with backend CRUD API.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search department."
                  className="ml-2 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <Filter size={17} className="text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-1450px w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Short Name</th>
                  <th className="px-5 py-4 font-bold">Email</th>
                  <th className="px-5 py-4 font-bold">Phone</th>
                  <th className="px-5 py-4 font-bold">Address</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No department data found. Click Create to add first
                      department.
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((department, index) => (
                    <tr
                      key={department.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !department.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {companyNameById.get(department.company_id) ||
                          `Company #${department.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branchNameById.get(department.branch_id) ||
                          `Branch #${department.branch_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {department.department_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_code}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_short_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {department.department_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            department.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {department.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DepartmentRowActions
                          department={department}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
                          }
                          onPermanentDelete={(selected) =>
                            openConfirm(selected, "permanent_delete")
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={
          editingDepartment ? "Edit Department" : "Create Department"
        }
        onClose={handleCloseDrawer}
      >
        <DepartmentForm
          key={
            editingDepartment
              ? `edit-department-${editingDepartment.id}`
              : "create-department"
          }
          initialData={editingDepartment}
          companies={companies}
          branches={branches}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedDepartment)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </>
  );
}