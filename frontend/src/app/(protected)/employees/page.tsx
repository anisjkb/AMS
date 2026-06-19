
// E:\Audit\AMS\frontend\src\app\(protected)\employees\page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, UsersRound } from "lucide-react";
import Image from "next/image";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeRowActions from "@/components/employees/EmployeeRowActions";
import { getBranches } from "@/services/branch";
import { getCompanies } from "@/services/company";
import { getDepartments } from "@/services/department";
import { getDesignations } from "@/services/designation";
import {
  deactivateEmployee,
  getEmployeeMediaUrl,
  getEmployees,
  permanentlyDeleteEmployee,
  restoreEmployee,
} from "@/services/employee";
import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type { Designation } from "@/types/designation";
import type { Employee } from "@/types/employee";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type StatusFilter = "all" | "active" | "inactive";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const companyNameById = useMemo(() => {
    const map = new Map<number, string>();
    companies.forEach((company) => map.set(company.id, company.company_name));
    return map;
  }, [companies]);

  const branchNameById = useMemo(() => {
    const map = new Map<number, string>();
    branches.forEach((branch) => map.set(branch.id, branch.branch_name));
    return map;
  }, [branches]);

  const departmentNameById = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach((department) =>
      map.set(department.id, department.department_name)
    );
    return map;
  }, [departments]);

  const designationNameById = useMemo(() => {
    const map = new Map<number, string>();
    designations.forEach((designation) =>
      map.set(designation.id, designation.designation_name)
    );
    return map;
  }, [designations]);

  const employeeTypes = useMemo(() => {
    const types = new Set<string>();

    employees.forEach((employee) => {
      if (employee.employee_type) {
        types.add(employee.employee_type);
      }
    });

    return Array.from(types);
  }, [employees]);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getEmployees(),
      getCompanies(),
      getBranches(),
      getDepartments(),
      getDesignations(),
    ])
      .then(
        ([
          employeeData,
          companyData,
          branchData,
          departmentData,
          designationData,
        ]) => {
          if (!cancelled) {
            setEmployees(employeeData);
            setCompanies(companyData);
            setBranches(branchData);
            setDepartments(departmentData);
            setDesignations(designationData);
          }
        }
      )
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load employee page data:", error);
          setEmployees([]);
          setCompanies([]);
          setBranches([]);
          setDepartments([]);
          setDesignations([]);
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

  const filteredEmployees = employees.filter((employee) => {
    const keyword = searchTerm.toLowerCase();

    const companyName =
      employee.company_name ||
      companyNameById.get(employee.company_id) ||
      "";
    const branchName =
      employee.branch_name || branchNameById.get(employee.branch_id) || "";
    const departmentName =
      employee.department_name ||
      departmentNameById.get(employee.department_id) ||
      "";
    const designationName =
      employee.designation_name ||
      designationNameById.get(employee.designation_id) ||
      "";

    const matchesSearch =
      employee.employee_name?.toLowerCase().includes(keyword) ||
      employee.employee_code?.toLowerCase().includes(keyword) ||
      employee.official_employee_id?.toLowerCase().includes(keyword) ||
      employee.email?.toLowerCase().includes(keyword) ||
      employee.phone?.toLowerCase().includes(keyword) ||
      employee.nid?.toLowerCase().includes(keyword) ||
      employee.employee_type?.toLowerCase().includes(keyword) ||
      companyName.toLowerCase().includes(keyword) ||
      branchName.toLowerCase().includes(keyword) ||
      departmentName.toLowerCase().includes(keyword) ||
      designationName.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.is_active) ||
      (statusFilter === "inactive" && !employee.is_active);

    const matchesType =
      typeFilter === "all" || employee.employee_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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
    setEditingEmployee(null);
    setDrawerOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingEmployee(null);
  };

  const handleSuccess = async () => {
    const wasEditing = Boolean(editingEmployee);

    setDrawerOpen(false);
    setEditingEmployee(null);

    showSuccess(
      wasEditing ? "Employee updated successfully." : "Employee created successfully."
    );

    await loadEmployees();
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const openConfirm = (employee: Employee, action: ConfirmAction) => {
    setSelectedEmployee(employee);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedEmployee(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedEmployee || !confirmAction) return;

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateEmployee(selectedEmployee.id);
        showSuccess("Employee marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreEmployee(selectedEmployee.id);
        showSuccess("Employee restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteEmployee(selectedEmployee.id);
        showSuccess("Employee permanently deleted successfully.");
      }

      closeConfirm();
      await loadEmployees();
    } catch (error) {
      console.error("Employee action failed:", error);

      showError(
        error instanceof Error ? error.message : "Employee action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Employee Inactive";
    if (confirmAction === "restore") return "Restore Employee";
    if (confirmAction === "permanent_delete")
      return "Permanently Delete Employee";

    return "Confirm Action";
  };

  const getConfirmMessage = () => {
    const name = selectedEmployee?.employee_name || "this employee";

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
          icon={UsersRound}
          title="Employee Management"
          description="Manage employees with company, branch, department, designation, employee type and optimized photo handling."
        />

        <PageActionBar
          menuKey="employee"
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
              <h2 className="text-xl font-black text-slate-900">Employees</h2>
              <p className="text-sm text-slate-500">
                Employee list loads only thumbnail images for better speed.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={17} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search employee."
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

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">All Types</option>
                  {employeeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[1800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Photo</th>
                  <th className="px-5 py-4 font-bold">Employee</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Official ID</th>
                  <th className="px-5 py-4 font-bold">Type</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Designation</th>
                  <th className="px-5 py-4 font-bold">Joining</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading employees...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No employee data found. Click Create to add first employee.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => {
                    const photoUrl = getEmployeeMediaUrl(
                      employee.photo_thumb_url || employee.photo_url
                    );

                    return (
                      <tr
                        key={employee.id}
                        className={`border-t border-slate-100 hover:bg-slate-50 ${
                          !employee.is_active ? "bg-slate-50 opacity-70" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                            {photoUrl ? (
                              <Image
                                src={photoUrl}
                                alt={employee.employee_name}
                                width={44}
                                height={44}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-black text-slate-500">
                                {employee.employee_name?.charAt(0) || "E"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-black text-slate-900">
                            {employee.employee_name}
                          </div>
                          <div className="text-xs font-semibold text-slate-500">
                            {employee.gender || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {employee.employee_code}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {employee.official_employee_id || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {employee.employee_type}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <div>{employee.phone || "-"}</div>
                          <div className="text-xs text-slate-400">
                            {employee.email || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {employee.company_name ||
                            companyNameById.get(employee.company_id) ||
                            `Company #${employee.company_id}`}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {employee.branch_name ||
                            branchNameById.get(employee.branch_id) ||
                            `Branch #${employee.branch_id}`}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {employee.department_name ||
                            departmentNameById.get(employee.department_id) ||
                            `Department #${employee.department_id}`}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {employee.designation_name ||
                            designationNameById.get(employee.designation_id) ||
                            `Designation #${employee.designation_id}`}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {employee.joining_date || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              employee.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {employee.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <EmployeeRowActions
                            employee={employee}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingEmployee ? "Edit Employee" : "Create Employee"}
        onClose={handleCloseDrawer}
      >
        <EmployeeForm
          key={editingEmployee ? `edit-employee-${editingEmployee.id}` : "create-employee"}
          initialData={editingEmployee}
          companies={companies}
          branches={branches}
          departments={departments}
          designations={designations}
          employees={employees}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedEmployee)}
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