// E:\Audit\AMS\frontend\src\app\(protected)\employees\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeRowActions from "@/components/employees/EmployeeRowActions";

import { getBranches } from "@/services/branch";
import { getAllCompanies } from "@/services/company";
import { getDepartments } from "@/services/department";
import { getDesignations } from "@/services/designation";
import {
  deactivateEmployee,
  getAllEmployees,
  getEmployees,
  permanentlyDeleteEmployee,
  restoreEmployee,
} from "@/services/employee";

import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type { Designation } from "@/types/designation";
import type { Employee } from "@/types/employee";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

type ListOrItems<T> = T[] | { items: T[] };

const toItems = <T,>(response: ListOrItems<T>): T[] => {
  return Array.isArray(response) ? response : response.items;
};

function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [lookupCompanies, setLookupCompanies] = useState<Company[]>([]);
  const [lookupBranches, setLookupBranches] = useState<Branch[]>([]);
  const [lookupDepartments, setLookupDepartments] = useState<Department[]>([]);
  const [lookupDesignations, setLookupDesignations] = useState<Designation[]>(
    []
  );
  const [lookupEmployees, setLookupEmployees] = useState<Employee[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const request = Promise.all([
      getAllCompanies({
        status: "active",
        sortBy: "id",
        sortOrder: "asc",
      }),
      getBranches(),
      getDepartments(),
      getDesignations(),
      getAllEmployees({
        status: "active",
        sortBy: "employee_name",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(
        ([
          companyResponse,
          branchResponse,
          departmentResponse,
          designationResponse,
          employeeResponse,
        ]) => {
          if (!isMounted) return;

          setLookupCompanies(toItems(companyResponse));
          setLookupBranches(toItems(branchResponse));
          setLookupDepartments(toItems(departmentResponse));
          setLookupDesignations(toItems(designationResponse));
          setLookupEmployees(employeeResponse.items);
        }
      )
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load employee form lookup data:", error);
        showError("Failed to load employee form dropdown data.");
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const loadEmployees = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllEmployees({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getEmployees({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setEmployees(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load employees."
        );
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [page, pageSize, searchTerm, statusFilter, showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllEmployees({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getEmployees({
            page,
            pageSize,
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setEmployees(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load employees."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, showError]);

  const handlePageSizeChange = (nextPageSize: PageSizeOption) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleSearchChange = (nextSearchTerm: string) => {
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingEmployee(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingEmployee);

    setDrawerOpen(false);
    setEditingEmployee(null);

    showSuccess(
      wasEditing
        ? "Employee updated successfully."
        : "Employee created successfully."
    );

    void loadEmployees(false);
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
    if (!selectedEmployee || !confirmAction) {
      return;
    }

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

      setSelectedEmployee(null);
      setConfirmAction(null);
      await loadEmployees(false);
    } catch (error) {
      console.error("Employee action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Employee action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Employee as Inactive?";
    if (confirmAction === "restore") return "Restore Employee?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Employee?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedEmployee) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedEmployee.employee_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedEmployee.employee_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedEmployee.employee_name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";
    if (confirmAction === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={Users}
          title="Employee Management"
          description="Manage employees with company, branch, department and designation mapping."
          height="x-small"
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
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Employees</h2>
            <p className="text-sm text-slate-500">
              Employee list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search employee."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-325 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Employee</th>
                  <th className="px-5 py-4 font-bold">Official ID</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="px-5 py-4 font-bold">Designation</th>
                  <th className="px-5 py-4 font-bold">Employee Status</th>
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
                      Loading employees...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No employee data found. Click Create to add first employee.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !employee.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {employee.employee_name}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">
                          Code: {employee.employee_code || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.official_employee_id || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div>{employee.email || "-"}</div>
                        <div className="mt-1 text-xs font-semibold">
                          {employee.phone || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.company_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.branch_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.department_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {employee.designation_name || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {employee.employee_status || "-"}
                        </span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <RightDrawer
        open={drawerOpen}
        title={editingEmployee ? "Edit Employee" : "Create Employee"}
        onClose={handleCloseDrawer}
      >
        <EmployeeForm
          key={
            editingEmployee
              ? `edit-employee-${editingEmployee.id}`
              : "create-employee"
          }
          initialData={editingEmployee}
          companies={lookupCompanies}
          branches={lookupBranches}
          departments={lookupDepartments}
          designations={lookupDesignations}
          employees={lookupEmployees}
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

export default function EmployeesPage() {
  return <EmployeesContent />;
}