// E:\Audit\AMS\frontend\src\app\security\permissions\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PermissionForm from "@/components/permissions/PermissionForm";
import PermissionRowActions from "@/components/permissions/PermissionRowActions";

import {
  deactivatePermission,
  getAllPermissions,
  getPermissions,
  permanentlyDeletePermission,
  restorePermission,
} from "@/services/permission";
import type { Permission } from "@/types/permission";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function PermissionsContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
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

  const loadPermissions = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllPermissions({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getPermissions({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setPermissions(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load permissions:", error);
        setPermissions([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
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
        ? getAllPermissions({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getPermissions({
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

        setPermissions(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load permissions:", error);
        setPermissions([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load permissions."
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
    setEditingPermission(null);
    setDrawerOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingPermission(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingPermission);

    setDrawerOpen(false);
    setEditingPermission(null);

    showSuccess(
      wasEditing
        ? "Permission updated successfully."
        : "Permission created successfully."
    );

    void loadPermissions(false);
  };

  const openConfirm = (permission: Permission, action: ConfirmAction) => {
    setSelectedPermission(permission);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedPermission(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedPermission || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivatePermission(selectedPermission.id);
        showSuccess("Permission marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restorePermission(selectedPermission.id);
        showSuccess("Permission restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeletePermission(selectedPermission.id);
        showSuccess("Permission permanently deleted successfully.");
      }

      setSelectedPermission(null);
      setConfirmAction(null);
      await loadPermissions(false);
    } catch (error) {
      console.error("Permission action failed:", error);
      showError(
        error instanceof Error ? error.message : "Permission action failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Permission as Inactive?";
    if (confirmAction === "restore") return "Restore Permission?";
    if (confirmAction === "permanent_delete") {
      return "Permanently Delete Permission?";
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedPermission) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedPermission.permission_key}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedPermission.permission_key}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedPermission.permission_key}"? This action cannot be undone.`;
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
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-800 to-blue-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <KeyRound size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Permission Management</h1>
              <p className="mt-1 text-blue-100">
                Manage API, menu, button and module permissions for RBAC.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="permission"
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-900">Permissions</h2>
            <p className="text-sm text-slate-500">
              Create, update, inactive, restore and permanently delete permissions.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search permission."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-1100px w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Permission Key</th>
                  <th className="px-5 py-4 font-bold">Resource</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading permissions...
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No permission data found.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !permission.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {permission.permission_key}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {permission.description || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {permission.resource_type}
                        </span>

                        <div className="mt-2 text-sm font-semibold text-slate-700">
                          {permission.resource_key}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">
                        {permission.action}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            permission.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {permission.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <PermissionRowActions
                          permission={permission}
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
        title={editingPermission ? "Edit Permission" : "Create Permission"}
        onClose={handleCloseDrawer}
      >
        <PermissionForm
          key={
            editingPermission
              ? `edit-permission-${editingPermission.id}`
              : "create-permission"
          }
          initialData={editingPermission}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedPermission)}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmLabel={getConfirmLabel()}
        variant={getConfirmVariant()}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </DashboardLayout>
  );
}

export default function PermissionsPage() {
  return <PermissionsContent />;
}