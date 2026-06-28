// E:\Audit\AMS\frontend\src\app\(protected)\branches\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, GitBranch, Plus, Upload } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import BranchForm from "@/components/branches/BranchForm";
import BranchRowActions from "@/components/branches/BranchRowActions";

import {
  deactivateBranch,
  getAllBranches,
  getBranchesPage,
  permanentlyDeleteBranch,
  restoreBranch,
} from "@/services/branch";
import type { Branch } from "@/types/branch";
import type { StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function BranchesContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchSubmitting, setBranchSubmitting] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const branchFormId = "branch-form";

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

  const loadBranches = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllBranches({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getBranchesPage({
                page,
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setBranches(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load branches:", error);
        setBranches([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load branches."
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
        ? getAllBranches({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getBranchesPage({
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

        setBranches(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load branches:", error);
        setBranches([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load branches."
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
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBranch(null);
    setBranchSubmitting(false);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingBranch);

    setDrawerOpen(false);
    setEditingBranch(null);

    showSuccess(
      wasEditing ? "Branch updated successfully." : "Branch created successfully."
    );

    void loadBranches(false);
  };

  const openConfirm = (branch: Branch, action: ConfirmAction) => {
    setSelectedBranch(branch);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedBranch(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedBranch || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateBranch(selectedBranch.id);
        showSuccess("Branch marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreBranch(selectedBranch.id);
        showSuccess("Branch restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteBranch(selectedBranch.id);
        showSuccess("Branch permanently deleted successfully.");
      }

      setSelectedBranch(null);
      setConfirmAction(null);
      await loadBranches(false);
    } catch (error) {
      console.error("Branch action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Branch action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Branch as Inactive?";
    if (confirmAction === "restore") return "Restore Branch?";
    if (confirmAction === "permanent_delete") return "Permanently Delete Branch?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedBranch) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedBranch.branch_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedBranch.branch_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedBranch.branch_name}"? This action cannot be undone.`;
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
                  <GitBranch className="h-4 w-4" />
                  Organization Foundation
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                  Branch Management
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Maintain branch profiles, company mapping, contact details and operational status.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Branch
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
            onRefresh={() => loadBranches(true)}
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
                placeholder: "Search branch.",
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
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Branch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading branches...
                    </td>
                  </tr>
                ) : branches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No branch data found. Click Create to add first branch.
                    </td>
                  </tr>
                ) : (
                  branches.map((branch, index) => (
                    <tr
                      key={branch.id}
                      className={`hover:bg-slate-50/80 ${
                        !branch.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {branch.company_name || `Company #${branch.company_id}`}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {branch.branch_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_code || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_email || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {branch.branch_phone || "-"}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {branch.branch_address || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={branch.is_active} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <BranchRowActions
                          branch={branch}
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
        title={editingBranch ? "Edit Branch" : "Create Branch"}
        description="Create and maintain branch profile, company mapping, contact and address information."
        onClose={handleCloseDrawer}
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={branchSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={branchFormId}
              disabled={branchSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {branchSubmitting
                ? "Saving..."
                : editingBranch
                  ? "Update Branch"
                  : "Save Branch"}
            </button>
          </>
        }
      >
        <BranchForm
          key={editingBranch ? `edit-branch-${editingBranch.id}` : "create-branch"}
          initialData={editingBranch}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
          formId={branchFormId}
          hideFooter
          onSubmittingChange={setBranchSubmitting}
        />
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedBranch)}
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

export default function BranchesPage() {
  return <BranchesContent />;
}