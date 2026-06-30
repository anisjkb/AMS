
// E:\Audit\AMS\frontend\src\app\(protected)\security\role-permissions\page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck, XCircle } from "lucide-react";

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

import { getAllPermissions } from "@/services/permission";
import { getRoles } from "@/services/role";
import {
  assignPermissionToRole,
  getRolePermissionsByRole,
  removeRolePermission,
} from "@/services/rolePermission";

import type { StatusFilter } from "@/types/pagination";
import type { Permission } from "@/types/permission";
import type { Role } from "@/types/role";
import type { RolePermission } from "@/types/rolePermission";

function RolePermissionsContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<
    RolePermission[]
  >([]);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissionId, setSelectedPermissionId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedRolePermission, setSelectedRolePermission] =
    useState<RolePermission | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedRoleIdNumber = selectedRoleId ? Number(selectedRoleId) : null;

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

  const loadAssignedPermissions = useCallback(
    async (roleId: number, showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setLoading(true);
        }

        const data = await getRolePermissionsByRole(roleId);
        setAssignedPermissions(data);
      } catch (error) {
        console.error("Failed to load assigned permissions:", error);
        setAssignedPermissions([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned permissions."
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
      getRoles({
        page: 1,
        pageSize: 100,
        status: "active",
        sortBy: "role_name",
        sortOrder: "asc",
      }),
      getAllPermissions({
        status: "active",
        sortBy: "permission_key",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(([roleResponse, permissionResponse]) => {
        if (!isMounted) return;

        setRoles(roleResponse.items);
        setPermissions(permissionResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load role permission lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load role and permission data."
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
    if (!selectedRoleIdNumber) {
      return;
    }

    let isMounted = true;

    const request = getRolePermissionsByRole(selectedRoleIdNumber);

    void request
      .then((data) => {
        if (!isMounted) return;

        setAssignedPermissions(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load assigned permissions:", error);
        setAssignedPermissions([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned permissions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRoleIdNumber, showError]);

  const assignedPermissionIds = useMemo(() => {
    return new Set(assignedPermissions.map((item) => item.permission_id));
  }, [assignedPermissions]);

  const availablePermissions = useMemo(() => {
    return permissions.filter(
      (permission) => !assignedPermissionIds.has(permission.id)
    );
  }, [permissions, assignedPermissionIds]);

  const filteredAssignedPermissions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return assignedPermissions.filter((item) => {
      const permission = permissions.find(
        (permissionItem) => permissionItem.id === item.permission_id
      );

      const permissionKey =
        item.permission_key || permission?.permission_key || "";
      const resourceType =
        item.resource_type || permission?.resource_type || "";
      const resourceKey = item.resource_key || permission?.resource_key || "";
      const action = item.action || permission?.action || "";
      const description = item.description || permission?.description || "";

      const matchesSearch =
        !keyword ||
        permissionKey.toLowerCase().includes(keyword) ||
        resourceType.toLowerCase().includes(keyword) ||
        resourceKey.toLowerCase().includes(keyword) ||
        action.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [assignedPermissions, permissions, searchTerm, statusFilter]);

  const totalRecords = filteredAssignedPermissions.length;

  const numericPageSize =
    pageSize === "all" ? Math.max(totalRecords, 1) : Number(pageSize);

  const totalPages =
    pageSize === "all" || totalRecords === 0
      ? 1
      : Math.ceil(totalRecords / numericPageSize);

  const visibleAssignedPermissions = useMemo(() => {
    if (pageSize === "all") {
      return filteredAssignedPermissions;
    }

    const startIndex = (page - 1) * numericPageSize;
    return filteredAssignedPermissions.slice(
      startIndex,
      startIndex + numericPageSize
    );
  }, [filteredAssignedPermissions, page, pageSize, numericPageSize]);

  const selectedRole = roles.find((role) => String(role.id) === selectedRoleId);

  const getPermissionKey = useCallback(
    (rolePermission: RolePermission) => {
      const permission = permissions.find(
        (item) => item.id === rolePermission.permission_id
      );

      return (
        rolePermission.permission_key ||
        permission?.permission_key ||
        `Permission #${rolePermission.permission_id}`
      );
    },
    [permissions]
  );

  const getPermissionResource = useCallback(
    (rolePermission: RolePermission) => {
      const permission = permissions.find(
        (item) => item.id === rolePermission.permission_id
      );

      const resourceType =
        rolePermission.resource_type || permission?.resource_type || "-";
      const resourceKey =
        rolePermission.resource_key || permission?.resource_key || "-";

      return `${resourceType} / ${resourceKey}`;
    },
    [permissions]
  );

  const getPermissionAction = useCallback(
    (rolePermission: RolePermission) => {
      const permission = permissions.find(
        (item) => item.id === rolePermission.permission_id
      );

      return rolePermission.action || permission?.action || "-";
    },
    [permissions]
  );

  const getPermissionDescription = useCallback(
    (rolePermission: RolePermission) => {
      const permission = permissions.find(
        (item) => item.id === rolePermission.permission_id
      );

      return rolePermission.description || permission?.description || "-";
    },
    [permissions]
  );

  const handleRoleChange = (nextRoleId: string) => {
    setSelectedRoleId(nextRoleId);
    setSelectedPermissionId("");
    setAssignedPermissions([]);
    setLoading(Boolean(nextRoleId));
    setPage(1);
  };

  const handleAssign = async () => {
    if (!selectedRoleIdNumber || !selectedPermissionId) {
      showError("Please select role and permission.");
      return;
    }

    try {
      setAssigning(true);

      await assignPermissionToRole({
        role_id: selectedRoleIdNumber,
        permission_id: Number(selectedPermissionId),
      });

      setSelectedPermissionId("");
      showSuccess("Permission assigned to role successfully.");
      await loadAssignedPermissions(selectedRoleIdNumber, false);
    } catch (error) {
      console.error("Assign permission failed:", error);
      showError(
        error instanceof Error ? error.message : "Assign permission failed."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedRolePermission || !selectedRoleIdNumber) {
      return;
    }

    try {
      setConfirmLoading(true);

      await removeRolePermission(selectedRolePermission.id);

      setSelectedRolePermission(null);
      showSuccess("Permission removed from role successfully.");
      await loadAssignedPermissions(selectedRoleIdNumber, false);
    } catch (error) {
      console.error("Remove permission failed:", error);
      showError(
        error instanceof Error ? error.message : "Remove permission failed."
      );
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
          icon={KeyRound}
          title="Role Permission Assignment"
          description="Assign system permissions to roles for RBAC access control."
          height="x-small"
        />

        <PageActionBar menuKey="role_permission" />

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
              Assign Permission to Role
            </h2>
            <p className="text-sm text-slate-500">
              Select a role first, then assign one or more active permissions.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Role
              </label>

              <select
                value={selectedRoleId}
                onChange={(event) => handleRoleChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select role</option>

                {roles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Permission
              </label>

              <select
                value={selectedPermissionId}
                onChange={(event) =>
                  setSelectedPermissionId(event.target.value)
                }
                disabled={!selectedRoleIdNumber}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedRoleIdNumber
                    ? "Select permission"
                    : "Select role first"}
                </option>

                {availablePermissions.map((permission) => (
                  <option key={permission.id} value={String(permission.id)}>
                    {permission.permission_key}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  !selectedRoleIdNumber || !selectedPermissionId || assigning
                }
                className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Permission"}
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
                Assigned Permissions
              </h2>
              <p className="text-sm text-slate-500">
                {selectedRole
                  ? `Current permissions assigned to ${selectedRole.role_name}.`
                  : "Select a role to see assigned permissions."}
              </p>
            </div>
          </div>

          <CrudToolbar
            pageSize={pageSize}
            onPageSizeChange={(value) =>
              handlePageSizeChange(value as CrudPageSizeOption)
            }
            onRefresh={() => {
              if (selectedRoleIdNumber) {
                void loadAssignedPermissions(selectedRoleIdNumber, true);
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
                placeholder: "Search assigned permission.",
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
            <table className="min-w-[320px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Permission</th>
                  <th className="px-5 py-4 font-bold">Resource</th>
                  <th className="px-5 py-4 font-bold">Action</th>
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
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Loading role permissions...
                    </td>
                  </tr>
                ) : !selectedRoleIdNumber ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Please select a role first.
                    </td>
                  </tr>
                ) : visibleAssignedPermissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No permission assigned to this role yet.
                    </td>
                  </tr>
                ) : (
                  visibleAssignedPermissions.map((rolePermission, index) => (
                    <tr
                      key={rolePermission.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !rolePermission.is_active
                          ? "bg-slate-50 opacity-70"
                          : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * numericPageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {getPermissionKey(rolePermission)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getPermissionResource(rolePermission)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getPermissionAction(rolePermission)}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {getPermissionDescription(rolePermission)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <CrudStatusBadge active={rolePermission.is_active} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(rolePermission.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRolePermission(rolePermission)
                          }
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          title="Remove permission"
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
        open={Boolean(selectedRolePermission)}
        title="Remove Permission from Role?"
        message={
          selectedRolePermission
            ? `Are you sure you want to remove "${getPermissionKey(
                selectedRolePermission
              )}" from this role?`
            : ""
        }
        confirmLabel="Remove Permission"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleRemove}
        onClose={() => {
          if (confirmLoading) return;
          setSelectedRolePermission(null);
        }}
      />
    </>
  );
}

export default function RolePermissionsPage() {
  return <RolePermissionsContent />;
}