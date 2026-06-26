// E:\Audit\AMS\frontend\src\app\security\roles\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import PageActionBar from "@/components/common/PageActionBar";
import RightDrawer from "@/components/common/RightDrawer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleForm from "@/components/roles/RoleForm";
import RoleRowActions from "@/components/roles/RoleRowActions";

import {
  deactivateRole,
  getAllRoles,
  getRoles,
  permanentlyDeleteRole,
  restoreRole,
} from "@/services/role";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Role } from "@/types/role";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
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
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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

  const loadRoles = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllRoles({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getRoles({
                page,
                pageSize,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setRoles(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load roles:", error);
        setRoles([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
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
        ? getAllRoles({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getRoles({
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

        setRoles(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load roles:", error);
        setRoles([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load roles.");
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
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
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
    setEditingRole(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingRole);

    setDrawerOpen(false);
    setEditingRole(null);

    showSuccess(
      wasEditing ? "Role updated successfully." : "Role created successfully."
    );

    void loadRoles(false);
  };

  const openConfirm = (role: Role, action: ConfirmAction) => {
    setSelectedRole(role);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedRole(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedRole || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateRole(selectedRole.id);
        showSuccess("Role marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreRole(selectedRole.id);
        showSuccess("Role restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteRole(selectedRole.id);
        showSuccess("Role permanently deleted successfully.");
      }

      setSelectedRole(null);
      setConfirmAction(null);
      await loadRoles(false);
    } catch (error) {
      console.error("Role action failed:", error);
      showError(error instanceof Error ? error.message : "Role action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Role as Inactive?";
    if (confirmAction === "restore") return "Restore Role?";
    if (confirmAction === "permanent_delete") return "Permanently Delete Role?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedRole) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedRole.role_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedRole.role_name}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedRole.role_name}"? This action cannot be undone.`;
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
        <section className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-800 to-indigo-700 p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck size={34} />
            </div>

            <div>
              <h1 className="text-3xl font-black">Role Management</h1>
              <p className="mt-1 text-blue-100">
                Create, update, inactive, restore and permanently delete roles.
              </p>
            </div>
          </div>
        </section>

        <PageActionBar
          menuKey="role"
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
            <h2 className="text-xl font-black text-slate-900">Roles</h2>
            <p className="text-sm text-slate-500">
              Manage role records with backend-driven pagination.
            </p>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search role."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-900px w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Role Name</th>
                  <th className="px-5 py-4 font-bold">Description</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Created At</th>
                  <th className="px-5 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No role data found.
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr
                      key={role.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !role.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {role.role_name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {role.description || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            role.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {role.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(role.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <RoleRowActions
                          role={role}
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
        title={editingRole ? "Edit Role" : "Create Role"}
        onClose={handleCloseDrawer}
      >
        <RoleForm
          key={editingRole ? `edit-role-${editingRole.id}` : "create-role"}
          initialData={editingRole}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </RightDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedRole)}
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

export default function RolesPage() {
  return <RolesContent />;
}