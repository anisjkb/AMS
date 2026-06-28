// E:\Audit\AMS\frontend\src\app\(protected)\designations\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Download, Plus, Upload } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudPagination from "@/components/crud/CrudPagination";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import DesignationForm from "@/components/designations/DesignationForm";
import DesignationRowActions from "@/components/designations/DesignationRowActions";

import { getBranches } from "@/services/branch";
import { getCompanies } from "@/services/company";
import { getDepartments } from "@/services/department";
import {
  deactivateDesignation,
  getAllDesignations,
  getDesignationsPage,
  permanentlyDeleteDesignation,
  restoreDesignation,
} from "@/services/designation";

import type { Branch } from "@/types/branch";
import type { Company } from "@/types/company";
import type { Department } from "@/types/department";
import type { Designation } from "@/types/designation";
import type { StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function DesignationsContent() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingDesignation, setEditingDesignation] =
    useState<Designation | null>(null);
  const [designationSubmitting, setDesignationSubmitting] = useState(false);

  const [selectedDesignation, setSelectedDesignation] =
    useState<Designation | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const designationFormId = "designation-form";

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

  const getCompanyName = useCallback(
    (designation: Designation) => {
      return (
        designation.company_name ||
        companies.find((company) => company.id === designation.company_id)
          ?.company_name ||
        `Company #${designation.company_id}`
      );
    },
    [companies]
  );

  const getBranchName = useCallback(
    (designation: Designation) => {
      return (
        designation.branch_name ||
        branches.find((branch) => branch.id === designation.branch_id)
          ?.branch_name ||
        `Branch #${designation.branch_id}`
      );
    },
    [branches]
  );

  const getDepartmentName = useCallback(
    (designation: Designation) => {
      return (
        designation.department_name ||
        departments.find(
          (department) => department.id === designation.department_id
        )?.department_name ||
        `Department #${designation.department_id}`
      );
    },
    [departments]
  );

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
      getDepartments({
        status: "active",
        sortBy: "id",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(([companyData, branchData, departmentData]) => {
        if (!isMounted) return;

        setCompanies(companyData);
        setBranches(branchData);
        setDepartments(departmentData);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load designation form lookup data:", error);
        showError("Failed to load designation form dropdown data.");
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  const loadDesignations = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllDesignations({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getDesignationsPage({
                page,
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setDesignations(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load designations:", error);
        setDesignations([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load designations."
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
        ? getAllDesignations({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getDesignationsPage({
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

        setDesignations(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load designations:", error);
        setDesignations([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load designations."
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
    setEditingDesignation(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingDesignation(null);
    setDesignationSubmitting(false);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingDesignation);

    setDrawerOpen(false);
    setEditingDesignation(null);

    showSuccess(
      wasEditing
        ? "Designation updated successfully."
        : "Designation created successfully."
    );

    void loadDesignations(false);
  };

  const openConfirm = (designation: Designation, action: ConfirmAction) => {
    setSelectedDesignation(designation);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedDesignation(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedDesignation || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateDesignation(selectedDesignation.id);
        showSuccess("Designation marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreDesignation(selectedDesignation.id);
        showSuccess("Designation restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteDesignation(selectedDesignation.id);
        showSuccess("Designation permanently deleted successfully.");
      }

      setSelectedDesignation(null);
      setConfirmAction(null);
      await loadDesignations(false);
    } catch (error) {
      console.error("Designation action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Designation action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Designation as Inactive?";
    if (confirmAction === "restore") return "Restore Designation?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Designation?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedDesignation) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedDesignation.designation_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedDesignation.designation_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedDesignation.designation_name}"? This action cannot be undone.`;
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
                  <BadgeCheck className="h-4 w-4" />
                  Organization Foundation
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                  Designation Management
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Maintain designation profiles, company, branch and department mapping information.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Designation
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
            onRefresh={() => loadDesignations(true)}
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
                placeholder: "Search designation.",
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
            <table className="min-w-300 w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">SL</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Designation Name</th>
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
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading designations...
                    </td>
                  </tr>
                ) : designations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No designation data found. Click Create to add first
                      designation.
                    </td>
                  </tr>
                ) : (
                  designations.map((designation, index) => (
                    <tr
                      key={designation.id}
                      className={`hover:bg-slate-50/80 ${
                        !designation.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {getCompanyName(designation)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {getBranchName(designation)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {getDepartmentName(designation)}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {designation.designation_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {designation.designation_code || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {designation.remarks || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            designation.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {designation.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <DesignationRowActions
                          designation={designation}
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
        title={editingDesignation ? "Edit Designation" : "Create Designation"}
        description="Create and maintain designation profile, company, branch and department mapping information."
        onClose={handleCloseDrawer}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={designationSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={designationFormId}
              disabled={designationSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {designationSubmitting
                ? "Saving..."
                : editingDesignation
                  ? "Update Designation"
                  : "Save Designation"}
            </button>
          </>
        }
      >
        <DesignationForm
          key={
            editingDesignation
              ? `edit-designation-${editingDesignation.id}`
              : "create-designation"
          }
          initialData={editingDesignation}
          companies={companies}
          branches={branches}
          departments={departments}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
          formId={designationFormId}
          hideFooter
          onSubmittingChange={setDesignationSubmitting}
        />
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedDesignation)}
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

export default function DesignationsPage() {
  return <DesignationsContent />;
}