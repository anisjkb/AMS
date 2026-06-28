// E:\Audit\AMS\frontend\src\app\(protected)\departments\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Network, Plus, Upload } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
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
import type { StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [departmentSubmitting, setDepartmentSubmitting] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const departmentFormId = "department-form";

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
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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
            pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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

  const handlePageSizeChange = (nextPageSize: CrudPageSizeOption) => {
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
    setDepartmentSubmitting(false);
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

  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmAction === "restore") return "success";
    if (confirmAction === "inactive") return "warning";

    return "danger";
  };

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                  <Network className="h-4 w-4" />
                  Organization Foundation
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                  Department Management
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Maintain department profiles, company and branch mapping, contact details and operational status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={handleImport}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
              </div>
            </div>
          </div>

          <CrudToolbar
            pageSize={pageSize}
            onPageSizeChange={(value) =>
              handlePageSizeChange(value as CrudPageSizeOption)
            }
            onRefresh={() => loadDepartments(true)}
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPageSize(DEFAULT_CRUD_PAGE_SIZE);
              setPage(1);
            }}
            filters={[
              {
                key: "search",
                label: "Search",
                type: "search",
                value: searchTerm,
                placeholder: "Search department.",
                onChange: handleSearchChange,
              },
              {
                key: "status",
                label: "Status",
                type: "select",
                value: statusFilter,
                options: [
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
                onChange: (value) => handleStatusChange(value as StatusFilter),
              },
            ]}
          />

          {(successMessage || errorMessage) ? (
            <div className="border-b border-slate-200 px-6 py-4">
              {successMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          ) : null}


          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">SL</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Department Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
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
                      className={`hover:bg-slate-50/80 ${
                        !department.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
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

          <div className="border-t border-slate-200 px-6 py-5">
            <CrudPagination
              page={page}
              totalPages={totalPages}
              total={totalRecords}
              pageSize={numericPageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>

      <CrudDrawer
        isOpen={drawerOpen}
        title={editingDepartment ? "Edit Department" : "Create Department"}
        description="Create and maintain department profile, company and branch mapping, contact and address information."
        onClose={handleCloseDrawer}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={departmentSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={departmentFormId}
              disabled={departmentSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {departmentSubmitting
                ? "Saving..."
                : editingDepartment
                  ? "Update Department"
                  : "Save Department"}
            </button>
          </>
        }
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
          formId={departmentFormId}
          hideFooter
          onSubmittingChange={setDepartmentSubmitting}
        />
      </CrudDrawer>

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