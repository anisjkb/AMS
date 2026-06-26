
// E:\Audit\AMS\frontend\src\app\(protected)\security\menu-action-permissions\page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, ShieldCheck, XCircle } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import DataTablePagination from "@/components/common/DataTablePagination";
import DataTableToolbar from "@/components/common/DataTableToolbar";
import ModuleHero from "@/components/common/ModuleHero";
import PageActionBar from "@/components/common/PageActionBar";

import {
  assignPermissionToMenuAction,
  getMenuActionPermissionsByAction,
  getMenuActionsForPermissionMapping,
  removeMenuActionPermission,
} from "@/services/menuActionPermission";
import { getAllPermissions } from "@/services/permission";

import type {
  MenuActionLookup,
  MenuActionPermission,
} from "@/types/menuActionPermission";
import type { PageSizeOption, StatusFilter } from "@/types/pagination";
import type { Permission } from "@/types/permission";

function MenuActionPermissionsContent() {
  const [menuActions, setMenuActions] = useState<MenuActionLookup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<
    MenuActionPermission[]
  >([]);

  const [selectedMenuActionId, setSelectedMenuActionId] = useState("");
  const [selectedPermissionId, setSelectedPermissionId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedMapping, setSelectedMapping] =
    useState<MenuActionPermission | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedMenuActionIdNumber = selectedMenuActionId
    ? Number(selectedMenuActionId)
    : null;

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
    async (menuActionId: number, showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setLoading(true);
        }

        const data = await getMenuActionPermissionsByAction(menuActionId);
        setAssignedPermissions(data);
      } catch (error) {
        console.error("Failed to load assigned menu action permissions:", error);
        setAssignedPermissions([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned menu action permissions."
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
      getMenuActionsForPermissionMapping(),
      getAllPermissions({
        status: "active",
        sortBy: "permission_key",
        sortOrder: "asc",
      }),
    ]);

    void request
      .then(([actionResponse, permissionResponse]) => {
        if (!isMounted) return;

        setMenuActions(actionResponse);
        setPermissions(permissionResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menu action lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load menu action and permission data."
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
    if (!selectedMenuActionIdNumber) {
      return;
    }

    let isMounted = true;

    const request = getMenuActionPermissionsByAction(
      selectedMenuActionIdNumber
    );

    void request
      .then((data) => {
        if (!isMounted) return;

        setAssignedPermissions(data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load assigned menu action permissions:", error);
        setAssignedPermissions([]);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load assigned menu action permissions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMenuActionIdNumber, showError]);

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

  const totalPages =
    pageSize === "all" || totalRecords === 0
      ? 1
      : Math.ceil(totalRecords / pageSize);

  const visibleAssignedPermissions = useMemo(() => {
    if (pageSize === "all") {
      return filteredAssignedPermissions;
    }

    const startIndex = (page - 1) * pageSize;
    return filteredAssignedPermissions.slice(startIndex, startIndex + pageSize);
  }, [filteredAssignedPermissions, page, pageSize]);

  const selectedMenuAction = menuActions.find(
    (item) => String(item.id) === selectedMenuActionId
  );

  const getPermissionKey = useCallback(
    (mapping: MenuActionPermission) => {
      const permission = permissions.find(
        (item) => item.id === mapping.permission_id
      );

      return (
        mapping.permission_key ||
        permission?.permission_key ||
        `Permission #${mapping.permission_id}`
      );
    },
    [permissions]
  );

  const getPermissionResource = useCallback(
    (mapping: MenuActionPermission) => {
      const permission = permissions.find(
        (item) => item.id === mapping.permission_id
      );

      const resourceType =
        mapping.resource_type || permission?.resource_type || "-";
      const resourceKey =
        mapping.resource_key || permission?.resource_key || "-";

      return `${resourceType} / ${resourceKey}`;
    },
    [permissions]
  );

  const getPermissionAction = useCallback(
    (mapping: MenuActionPermission) => {
      const permission = permissions.find(
        (item) => item.id === mapping.permission_id
      );

      return mapping.action || permission?.action || "-";
    },
    [permissions]
  );

  const getPermissionDescription = useCallback(
    (mapping: MenuActionPermission) => {
      const permission = permissions.find(
        (item) => item.id === mapping.permission_id
      );

      return mapping.description || permission?.description || "-";
    },
    [permissions]
  );

  const handleMenuActionChange = (nextMenuActionId: string) => {
    setSelectedMenuActionId(nextMenuActionId);
    setSelectedPermissionId("");
    setAssignedPermissions([]);
    setLoading(Boolean(nextMenuActionId));
    setPage(1);
  };

  const handleAssign = async () => {
    if (!selectedMenuActionIdNumber || !selectedPermissionId) {
      showError("Please select menu action and permission.");
      return;
    }

    try {
      setAssigning(true);

      await assignPermissionToMenuAction({
        menu_action_id: selectedMenuActionIdNumber,
        permission_id: Number(selectedPermissionId),
      });

      setSelectedPermissionId("");
      showSuccess("Permission assigned to menu action successfully.");
      await loadAssignedPermissions(selectedMenuActionIdNumber, false);
    } catch (error) {
      console.error("Assign menu action permission failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Assign menu action permission failed."
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedMapping || !selectedMenuActionIdNumber) {
      return;
    }

    try {
      setConfirmLoading(true);

      await removeMenuActionPermission(selectedMapping.id);

      setSelectedMapping(null);
      showSuccess("Permission removed from menu action successfully.");
      await loadAssignedPermissions(selectedMenuActionIdNumber, false);
    } catch (error) {
      console.error("Remove menu action permission failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Remove menu action permission failed."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

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

  return (
    <>
      <div className="space-y-6">
        <ModuleHero
          icon={KeyRound}
          title="Menu Action Permission Mapping"
          description="Map menu buttons and actions with permission keys for RBAC controls."
          height="x-small"
        />

        <PageActionBar menuKey="menu_action_permission" />

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
              Assign Permission to Menu Action
            </h2>
            <p className="text-sm text-slate-500">
              Select a menu action first, then assign one or more active
              permissions.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1.8fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Menu Action
              </label>

              <select
                value={selectedMenuActionId}
                onChange={(event) =>
                  handleMenuActionChange(event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select menu action</option>

                {menuActions.map((menuAction) => (
                  <option key={menuAction.id} value={String(menuAction.id)}>
                    {menuAction.menu_title || "Menu"} →{" "}
                    {menuAction.action_title} ({menuAction.action_key})
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
                disabled={!selectedMenuActionIdNumber}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {selectedMenuActionIdNumber
                    ? "Select permission"
                    : "Select menu action first"}
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
                  !selectedMenuActionIdNumber ||
                  !selectedPermissionId ||
                  assigning
                }
                className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Permission"}
              </button>
            </div>
          </div>

          {selectedMenuAction && (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Selected:{" "}
              <span className="font-black">
                {selectedMenuAction.menu_title} →{" "}
                {selectedMenuAction.action_title}
              </span>{" "}
              | Action permission key:{" "}
              <span className="font-mono font-bold">
                {selectedMenuAction.permission_key}
              </span>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Assigned Menu Action Permissions
              </h2>
              <p className="text-sm text-slate-500">
                {selectedMenuAction
                  ? `Current permissions mapped to ${selectedMenuAction.action_title}.`
                  : "Select a menu action to see assigned permissions."}
              </p>
            </div>
          </div>

          <DataTableToolbar
            pageSize={pageSize}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            searchPlaceholder="Search assigned permission."
            onPageSizeChange={handlePageSizeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-7x1 w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">SL</th>
                  <th className="px-5 py-4 font-bold">Permission</th>
                  <th className="px-5 py-4 font-bold">Resource</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                  <th className="px-5 py-4 font-bold">Description</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Mapped At</th>
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
                      Loading menu action permissions...
                    </td>
                  </tr>
                ) : !selectedMenuActionIdNumber ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      Please select a menu action first.
                    </td>
                  </tr>
                ) : visibleAssignedPermissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No permission assigned to this menu action yet.
                    </td>
                  </tr>
                ) : (
                  visibleAssignedPermissions.map((mapping, index) => (
                    <tr
                      key={mapping.id}
                      className={`border-t border-slate-100 hover:bg-slate-50 ${
                        !mapping.is_active ? "bg-slate-50 opacity-70" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        {pageSize === "all"
                          ? index + 1
                          : (page - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {getPermissionKey(mapping)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getPermissionResource(mapping)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {getPermissionAction(mapping)}
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {getPermissionDescription(mapping)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            mapping.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {mapping.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(mapping.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedMapping(mapping)}
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

          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={totalRecords}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </div>

      <ConfirmModal
        open={Boolean(selectedMapping)}
        title="Remove Permission from Menu Action?"
        message={
          selectedMapping
            ? `Are you sure you want to remove "${getPermissionKey(
                selectedMapping
              )}" from this menu action?`
            : ""
        }
        confirmLabel="Remove Permission"
        variant="danger"
        loading={confirmLoading}
        onConfirm={handleRemove}
        onClose={() => {
          if (confirmLoading) return;
          setSelectedMapping(null);
        }}
      />
    </>
  );
}

export default function MenuActionPermissionsPage() {
  return <MenuActionPermissionsContent />;
}