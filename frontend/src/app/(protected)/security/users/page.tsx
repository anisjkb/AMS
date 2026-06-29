// E:\Audit\AMS\frontend\src\app\(protected)\security\users\page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { UsersRound } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import UserForm from "@/components/users/UserForm";
import UserRowActions from "@/components/users/UserRowActions";
import {
  deactivateUser,
  getAllUsers,
  getUsers,
  restoreUser,
} from "@/services/user";
import type { StatusFilter } from "@/types/pagination";
import type { User } from "@/types/user";

type ConfirmAction = "inactive" | "restore";
type ConfirmVariant = "danger" | "warning" | "success";

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const loadUsers = useCallback(
    async (showPageLoading = true) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllUsers({
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              })
            : await getUsers({
                page,
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: searchTerm,
                status: statusFilter,
                sortBy: "id",
                sortOrder: "asc",
              });

        setUsers(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load users.");
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
        ? getAllUsers({
            search: searchTerm,
            status: statusFilter,
            sortBy: "id",
            sortOrder: "asc",
          })
        : getUsers({
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

        setUsers(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load users:", error);
        setUsers([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load users.");
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
    setEditingUser(null);
    setDrawerOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingUser);

    setDrawerOpen(false);
    setEditingUser(null);

    showSuccess(wasEditing ? "User updated successfully." : "User created successfully.");
    void loadUsers(false);
  };

  const openConfirm = (user: User, action: ConfirmAction) => {
    setSelectedUser(user);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedUser(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !confirmAction) return;

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateUser(selectedUser.id);
        showSuccess("User marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreUser(selectedUser.id);
        showSuccess("User restored successfully.");
      }

      setSelectedUser(null);
      setConfirmAction(null);
      await loadUsers(false);
    } catch (error) {
      console.error("User action failed:", error);
      showError(error instanceof Error ? error.message : "User action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark User as Inactive?";
    if (confirmAction === "restore") return "Restore User?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedUser) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedUser.full_name}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedUser.full_name}"?`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmAction === "inactive") return "Mark Inactive";
    if (confirmAction === "restore") return "Restore";

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
          icon={UsersRound}
          title="User Management"
          description="Create, update, deactivate and restore AMS login users and superuser access."
          height="small"
        />

        <PageActionBar
          menuKey="user"
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
            onRefresh={() => void loadUsers(true)}
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
                placeholder: "Search user.",
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
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Access</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                      No user data found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`transition hover:bg-sky-50/50 ${
                        !user.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-black text-slate-950">
                          {user.full_name}
                        </div>
                        <div className="mt-1 text-xs font-bold text-slate-500">
                          Login ID: {user.user_id}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <CrudPillBadge>
                          {user.is_superuser ? "Super Admin" : "User"}
                        </CrudPillBadge>
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={user.is_active} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <UserRowActions
                          user={user}
                          onEdit={handleEdit}
                          onInactive={(selected) =>
                            openConfirm(selected, "inactive")
                          }
                          onRestore={(selected) =>
                            openConfirm(selected, "restore")
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
        title={editingUser ? "Edit User" : "Create User"}
        description="Maintain AMS users, login identity, email and superuser access."
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-3xl"
      >
        <UserForm
          key={editingUser ? `edit-user-${editingUser.id}` : "create-user"}
          initialData={editingUser}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
        />
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedUser)}
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

export default function UsersPage() {
  return <UsersContent />;
}
