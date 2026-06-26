// E:\Audit\AMS\frontend\src\app\(protected)\departments\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Network } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DepartmentForm from "@/components/departments/DepartmentForm";
import DepartmentRowActions from "@/components/departments/DepartmentRowActions";

import { getBranches } from "@/services/branch";
import { getCompanies } from "@/services/company";
import {
  deactivateDepartment,
  getAllDepartments,
  getDepartmentsPage,
  permanentlyDeleteDepartment,
  restoreDepartment,
} from "@/services/department";

import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
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
      getCompanies({
        status: "active",
        sortBy: "id",
        sortOrder: "asc",
      }),
      getBranches({
        status: "active",
        sortBy: "id",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(([companyData, branchData]) => {
        if (!isMounted) return;

        setCompanies(companyData);
        setBranches(branchData);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load department form lookup data:", error);
        showError("Failed to load department form dropdown data.");
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const loadDepartments = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllDepartments({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getDepartmentsPage({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setDepartments(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load departments:", error);
        setDepartments([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load departments."
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
        ? getAllDepartments({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getDepartmentsPage({
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

        setDepartments(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load departments:", error);
        setDepartments([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load departments."
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

    void loadDepartments(false);
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

      setSelectedDepartment(null);
      setConfirmAction(null);
      await loadDepartments(false);
    } catch (error) {
      console.error("Department action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Department action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Department as Inactive?";
    if (confirmAction === "restore") return "Restore Department?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Department?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedDepartment) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedDepartment.department_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedDepartment.department_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedDepartment.department_name}"? This action cannot be undone.`;
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
          icon={Network}
          title="Department Management"
          description="Manage departments under company and branch structure."
          height="x-small"
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
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Departments</h2>
            <p className="text-sm text-slate-500">
              Department list connected with backend CRUD API.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search department."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-275 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Company</th>
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Department Name</th>
                  <th className="px-5 py-4 font-bold">Code</th>
                  <th className="px-5 py-4 font-bold">Remarks</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading departments...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No department data found. Click Create to add first
                      department.
                    </td>
                  </tr>
                ) : (
                  departments.map((department, index) => (
                    <tr
                      key={department.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !department.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {department.company_name ||
                          `Company #${department.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {department.branch_name ||
                          `Branch #${department.branch_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {department.department_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {department.department_code || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {department.remarks || "-"}
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
        title={editingDepartment ? "Edit Department" : "Create Department"}
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

export default function DepartmentsPage() {
  return <DepartmentsContent />;
}