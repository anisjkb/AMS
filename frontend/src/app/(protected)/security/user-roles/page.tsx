// E:\Audit\AMS\frontend\src\app\security\user-roles\page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserRoundCog, XCircle } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";

import { getRoles } from "@/services/role";
import { getUsers } from "@/services/user";
import {
  assignRoleToUser,
  getUserRolesByUser,
  removeUserRole,
} from "@/services/userRole";

import type { StatusFilter } from "@/types/pagination";
import type { Role } from "@/types/role";
import type { User } from "@/types/user";
import type { UserRole } from "@/types/userRole";

function UserRolesContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<UserRole[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedUserIdNumber = selectedUserId ? Number(selectedUserId) : null;

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

  const loadAssignedRoles = useCallback(
    async (userId: number, showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setLoading(true);
        }

        const data = await getUserRolesByUser(userId);
        setAssignedRoles(data);
      } catch (error) {
        console.error("Failed to load assigned roles:", error);
        setAssignedRoles([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned roles."
        );
      } finally {
        if (showTableLoading) {
          setLoading(false);
        }
      }
    },
    [showError]
  );

  useEffect(() => {
    let isMounted = true;

    const request = Promise.all([
      getUsers({
        page: 1,
        pageSize: 100,
        status: "active",
        sortBy: "full_name",
        sortOrder: "asc",
      }),
      getRoles({
        page: 1,
        pageSize: 100,
        status: "active",
        sortBy: "role_name",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(([userResponse, roleResponse]) => {
        if (!isMounted) return;

        setUsers(userResponse.items);
        setRoles(roleResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load user role lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load user and role data."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [showError]);

  useEffect(() => {
    if (!selectedUserIdNumber) {
      return;
    }

    let isMounted = true;

    const request = getUserRolesByUser(selectedUserIdNumber);

    void request
      .then((data) => {
        if (!isMounted) return;

        setAssignedRoles(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load assigned roles:", error);
        setAssignedRoles([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned roles."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserIdNumber, showError]);

  const assignedRoleIds = useMemo(() => {
    return new Set(assignedRoles.map((item) => item.role_id));
  }, [assignedRoles]);

  const availableRoles = useMemo(() => {
    return roles.filter((role) => !assignedRoleIds.has(role.id));
  }, [roles, assignedRoleIds]);

  const filteredAssignedRoles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return assignedRoles.filter((item) => {
      const role = roles.find((roleItem) => roleItem.id === item.role_id);

      const roleName = item.role_name || role?.role_name || "";
      const roleDescription = item.role_description || role?.description || "";

      const matchesSearch =
        !keyword ||
        roleName.toLowerCase().includes(keyword) ||
        roleDescription.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [assignedRoles, roles, searchTerm, statusFilter]);

  const totalRecords = filteredAssignedRoles.length;

  const numericPageSize =
    pageSize === "all" ? Math.max(totalRecords, 1) : Number(pageSize);

  const totalPages =
    pageSize === "all" || totalRecords === 0
      ? 1
      : Math.ceil(totalRecords / numericPageSize);

  const visibleAssignedRoles = useMemo(() => {
    if (pageSize === "all") {
      return filteredAssignedRoles;
    }

    const startIndex = (page - 1) * numericPageSize;
    return filteredAssignedRoles.slice(
      startIndex,
      startIndex + numericPageSize
    );
  }, [filteredAssignedRoles, page, pageSize, numericPageSize]);

  const selectedUser = users.find((user) => String(user.id) === selectedUserId);

  const getRoleName = useCallback(
    (userRole: UserRole) => {
      const role = roles.find((item) => item.id === userRole.role_id);
      return (
        userRole.role_name || role?.role_name || `Role #${userRole.role_id}`
      );
    },
    [roles]
  );

  const getRoleDescription = useCallback(
    (userRole: UserRole) => {
      const role = roles.find((item) => item.id === userRole.role_id);
      return userRole.role_description || role?.description || "-";
    },
    [roles]
  );

  const handleUserChange = (nextUserId: string) => {
    setSelectedUserId(nextUserId);
    setSelectedRoleId("");
    setAssignedRoles([]);
    setLoading(Boolean(nextUserId));
    setPage(1);
  };

  const handleAssign = async () => {
    if (!selectedUserIdNumber || !selectedRoleId) {
      showError("Please select user and role.");
      return;
    }

    try {
      setAssigning(true);

      await assignRoleToUser({
        user_id: selectedUserIdNumber,
        role_id: Number(selectedRoleId),
      });

      setSelectedRoleId("");
      showSuccess("Role assigned to user successfully.");
      await loadAssignedRoles(selectedUserIdNumber, false);
    } catch (error) {
      console.error("Assign role failed:", error);
      showError(error instanceof Error ? error.message : "Assign role failed.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedUserRole || !selectedUserIdNumber) {
      return;
    }

    try {
      setConfirmLoading(true);

      await removeUserRole(selectedUserRole.id);

      setSelectedUserRole(null);
      showSuccess("Role removed from user successfully.");
      await loadAssignedRoles(selectedUserIdNumber, false);
    } catch (error) {
      console.error("Remove role failed:", error);
      showError(error instanceof Error ? error.message : "Remove role failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

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

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={UserRoundCog}
          title="User Role Assignment"
          description="Assign system roles to users for RBAC access control."
          height="x-small"
        />

        <PageActionBar menuKey="user_role" />

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
            <h2 className="text-xl font-black text-slate-900">
              Assign Role to User
            </h2>
            <p className="text-sm text-slate-500">
              Select a user first, then assign one or more active roles.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1.4fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                User
              </label>

              <select
                value={selectedUserId}
                onChange={(event) => handleUserChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select user</option>

                {users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.full_name} ({user.user_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Role
              </label>

              <select
                value={selectedRoleId}
                onChange={(event) => setSelectedRoleId(event.target.value)}
                disabled={!selectedUserIdNumber}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedUserIdNumber ? "Select role" : "Select user first"}
                </option>

                {availableRoles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedUserIdNumber || !selectedRoleId || assigning}
                className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Role"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Assigned Roles
              </h2>
              <p className="text-sm text-slate-500">
                {selectedUser
                  ? `Current roles assigned to ${selectedUser.full_name}.`
                  : "Select a user to see assigned roles."}
              </p>
            </div>
          </div>

          <CrudToolbar
            pageSize={pageSize}
            onPageSizeChange={(value) =>
              handlePageSizeChange(value as CrudPageSizeOption)
            }
            onRefresh={() => {
              if (selectedUserIdNumber) {
                void loadAssignedRoles(selectedUserIdNumber, true);
              }
            }}
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
                placeholder: "Search assigned role.",
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

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-250 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Role</th>
                  <th className="px-5 py-4 font-bold">Description</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Assigned At</th>
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
                      Loading user roles...
                    </td>
                  </tr>
                ) : !selectedUserIdNumber ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Please select a user first.
                    </td>
                  </tr>
                ) : visibleAssignedRoles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No role assigned to this user yet.
                    </td>
                  </tr>
                ) : (
                  visibleAssignedRoles.map((userRole, index) => (
                    <tr
                      key={userRole.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !userRole.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {getRoleName(userRole)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getRoleDescription(userRole)}
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={userRole.is_active} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(userRole.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUserRole(userRole)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          title="Remove role"
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200">
            <CrudPagination
              page={page}
              pageSize={numericPageSize}
              total={totalRecords}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </div>

      <ConfirmModal
        open={Boolean(selectedUserRole)}
        title="Remove Role from User?"
        message={
          selectedUserRole
            ? `Are you sure you want to remove "${getRoleName(
                selectedUserRole
              )}" from this user?`
            : ""
        }
        confirmLabel="Remove Role"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleRemove}
        onClose={() => {
          if (confirmLoading) return;
          setSelectedUserRole(null);
        }}
      />
    </>
  );
}

export default function UserRolesPage() {
  return <UserRolesContent />;
}