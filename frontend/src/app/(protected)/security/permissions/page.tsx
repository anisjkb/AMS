// E:\Audit\AMS\frontend\src\app\(protected)\security\permissions\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import PermissionForm from "@/components/permissions/PermissionForm";
import PermissionRowActions from "@/components/permissions/PermissionRowActions";
import {
  deactivatePermission,
  getAllPermissions,
  getPermissions,
  permanentlyDeletePermission,
  restorePermission,
} from "@/services/permission";
import type { StatusFilter } from "@/types/pagination";
import type { Permission } from "@/types/permission";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function PermissionsContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<Permission | null>(null);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const numericPageSize =
    pageSize === "all" ? Math.max(totalRecords, 1) : Number(pageSize);

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
    async (showPageLoading = true) => {
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
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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
            pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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

  const handleCreate = () => {
    setEditingPermission(null);
    setDrawerOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDrawerOpen(true);
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
    if (!selectedPermission || !confirmAction) return;

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

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={KeyRound}
          title="Permission Management"
          description="Create, update, deactivate, restore and permanently delete permission keys used across AMS RBAC."
          height="small"
        />

        <PageActionBar
          menuKey="permission"
          onCreate={handleCreate}
          onExport={() =>
            showSuccess("Export feature will be implemented in the next phase.")
          }
          onImport={() =>
            showSuccess("Import feature will be implemented in the next phase.")
          }
        />

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
          <CrudToolbar
            pageSize={pageSize}
            onPageSizeChange={(value) => {
              setPageSize(value as CrudPageSizeOption);
              setPage(1);
            }}
            onRefresh={() => void loadPermissions(true)}
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
                placeholder: "Search permission.",
                onChange: (value) => {
                  setSearchTerm(value);
                  setPage(1);
                },
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
                onChange: (value) => {
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                },
              },
            ]}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-sky-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Permission Key</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                      Loading permissions...
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                      No permission data found.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className={`transition hover:bg-sky-50/50 ${
                        !permission.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-black text-slate-900">
                        {permission.permission_key}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {permission.resource_type} / {permission.resource_key}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {permission.action}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {permission.description || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={permission.is_active} />
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
        title={editingPermission ? "Edit Permission" : "Create Permission"}
        description="Maintain permission resource, action and permission key metadata."
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-3xl"
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
      </CrudDrawer>

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
    </>
  );
}

export default function PermissionsPage() {
  return <PermissionsContent />;
}
