// E:\Audit\AMS\frontend\src\app\(protected)\security\roles\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

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
import RoleForm from "@/components/roles/RoleForm";
import RoleRowActions from "@/components/roles/RoleRowActions";
import {
  deactivateRole,
  getAllRoles,
  getRoles,
  permanentlyDeleteRole,
  restoreRole,
} from "@/services/role";
import type { StatusFilter } from "@/types/pagination";
import type { Role } from "@/types/role";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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

  const loadRoles = useCallback(
    async (showPageLoading = true) => {
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
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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
            pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
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

  const handleCreate = () => {
    setEditingRole(null);
    setDrawerOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRole(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingRole);

    setDrawerOpen(false);
    setEditingRole(null);

    showSuccess(wasEditing ? "Role updated successfully." : "Role created successfully.");
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
    if (!selectedRole || !confirmAction) return;

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

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={ShieldCheck}
          title="Role Management"
          description="Create, update, deactivate, restore and permanently delete RBAC roles."
          height="small"
        />

        <PageActionBar
          menuKey="role"
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
            onRefresh={() => void loadRoles(true)}
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
                placeholder: "Search role.",
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
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Role Name</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                      Loading roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                      No role data found.
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr
                      key={role.id}
                      className={`transition hover:bg-sky-50/50 ${
                        !role.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-black text-slate-950">
                        {role.role_name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {role.description || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={role.is_active} />
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
        title={editingRole ? "Edit Role" : "Create Role"}
        description="Maintain AMS user roles and access responsibility groups."
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-2xl"
      >
        <RoleForm
          key={editingRole ? `edit-role-${editingRole.id}` : "create-role"}
          initialData={editingRole}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </CrudDrawer>

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
    </>
  );
}

export default function RolesPage() {
  return <RolesContent />;
}
