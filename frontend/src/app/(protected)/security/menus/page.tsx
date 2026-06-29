// E:\Audit\AMS\frontend\src\app\(protected)\security\menus\page.tsx

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Menu as MenuIcon, Plus, Upload } from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import MenuForm from "@/components/menus/MenuForm";
import MenuRowActions from "@/components/menus/MenuRowActions";
import {
  deactivateMenu,
  getAllMenus,
  getMenuDisplayPath,
  getMenusPage,
  permanentlyDeleteMenu,
  restoreMenu,
} from "@/services/menu";
import { getAllNavigationGroups } from "@/services/navigationGroup";
import type { Menu, MenuVisibilityFilter } from "@/types/menu";
import type { NavigationGroupRecord } from "@/types/navigationGroup";
import type { StatusFilter } from "@/types/pagination";

type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";

const getBooleanLabel = (value: boolean) => {
  return value ? "Yes" : "No";
};

function MenusContent() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [navigationGroups, setNavigationGroups] = useState<
    NavigationGroupRecord[]
  >([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<MenuVisibilityFilter>("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuSubmitting, setMenuSubmitting] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [confirmLoading, setConfirmLoading] = useState(false);

  const menuFormId = "menu-form";
  const numericPageSize = pageSize === "all" ? 100 : Number(pageSize);

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

  const selectedGroupId = groupFilter === "all" ? null : Number(groupFilter);

  const navigationGroupById = useMemo(() => {
    return new Map(navigationGroups.map((group) => [group.id, group]));
  }, [navigationGroups]);

  const menuById = useMemo(() => {
    return new Map(allMenus.map((menu) => [menu.id, menu]));
  }, [allMenus]);

  const loadLookups = useCallback(async () => {
    return Promise.all([
      getAllNavigationGroups({
        status: "active",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllMenus({
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
    ]);
  }, []);

  const loadMenus = useCallback(
    async (showPageLoading = false) => {
      try {
        if (showPageLoading) {
          setLoading(true);
        }

        const response =
          pageSize === "all"
            ? await getAllMenus({
                search: searchTerm,
                status: statusFilter,
                visibility: visibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getMenusPage({
                page,
                pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: searchTerm,
                status: statusFilter,
                visibility: visibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setMenus(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load menus:", error);
        setMenus([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      } finally {
        if (showPageLoading) {
          setLoading(false);
        }
      }
    },
    [
      page,
      pageSize,
      searchTerm,
      statusFilter,
      visibilityFilter,
      selectedGroupId,
      showError,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const request = Promise.resolve().then(() => loadLookups());

    void request
      .then(([groupsResponse, menusResponse]) => {
        if (!isMounted) return;

        setNavigationGroups(groupsResponse.items);
        setAllMenus(menusResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menu lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load menu lookup data."
        );
      });

    return () => {
      isMounted = false;
    };
  }, [loadLookups, showError]);

  useEffect(() => {
    let isMounted = true;

    const request =
      pageSize === "all"
        ? getAllMenus({
            search: searchTerm,
            status: statusFilter,
            visibility: visibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getMenusPage({
            page,
            pageSize: Number(pageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: searchTerm,
            status: statusFilter,
            visibility: visibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setMenus(response.items);
        setTotalRecords(response.total);
        setTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menus:", error);
        setMenus([]);
        setTotalRecords(0);
        setTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    page,
    pageSize,
    searchTerm,
    statusFilter,
    visibilityFilter,
    selectedGroupId,
    showError,
  ]);

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

  const handleVisibilityChange = (nextVisibility: MenuVisibilityFilter) => {
    setVisibilityFilter(nextVisibility);
    setPage(1);
  };

  const handleGroupChange = (nextGroupId: string) => {
    setGroupFilter(nextGroupId);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleCreate = () => {
    setEditingMenu(null);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    showSuccess("Export feature will be implemented in the next phase.");
  };

  const handleImport = () => {
    showSuccess("Import feature will be implemented in the next phase.");
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingMenu(null);
    setMenuSubmitting(false);
  };

  const handleSuccess = () => {
    const wasEditing = Boolean(editingMenu);

    setDrawerOpen(false);
    setEditingMenu(null);

    showSuccess(
      wasEditing ? "Menu updated successfully." : "Menu created successfully."
    );

    void loadMenus(false);
    void loadLookups().then(([groupsResponse, menusResponse]) => {
      setNavigationGroups(groupsResponse.items);
      setAllMenus(menusResponse.items);
    });
  };

  const openConfirm = (menu: Menu, action: ConfirmAction) => {
    setSelectedMenu(menu);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;

    setSelectedMenu(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedMenu || !confirmAction) {
      return;
    }

    try {
      setConfirmLoading(true);

      if (confirmAction === "inactive") {
        await deactivateMenu(selectedMenu.id);
        showSuccess("Menu marked as inactive successfully.");
      }

      if (confirmAction === "restore") {
        await restoreMenu(selectedMenu.id);
        showSuccess("Menu restored successfully.");
      }

      if (confirmAction === "permanent_delete") {
        await permanentlyDeleteMenu(selectedMenu.id);
        showSuccess("Menu permanently deleted successfully.");
      }

      setSelectedMenu(null);
      setConfirmAction(null);
      await loadMenus(false);

      const [groupsResponse, menusResponse] = await loadLookups();
      setNavigationGroups(groupsResponse.items);
      setAllMenus(menusResponse.items);
    } catch (error) {
      console.error("Menu action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Menu action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const getConfirmTitle = () => {
    if (confirmAction === "inactive") return "Mark Menu as Inactive?";
    if (confirmAction === "restore") return "Restore Menu?";
    if (confirmAction === "permanent_delete") return "Permanently Delete Menu?";

    return "";
  };

  const getConfirmMessage = () => {
    if (!selectedMenu) return "";

    if (confirmAction === "inactive") {
      return `Are you sure you want to mark "${selectedMenu.menu_title}" as inactive?`;
    }

    if (confirmAction === "restore") {
      return `Are you sure you want to restore "${selectedMenu.menu_title}"?`;
    }

    if (confirmAction === "permanent_delete") {
      return `Are you sure you want to permanently delete "${selectedMenu.menu_title}"? This action cannot be undone.`;
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
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                  <MenuIcon className="h-4 w-4" />
                  Security Foundation
                </div>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                  Navigation Builder
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Manage dynamic menu structure, parent-child hierarchy, route paths and visibility rules.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Menu
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
            onRefresh={() => loadMenus(true)}
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setVisibilityFilter("all");
              setGroupFilter("all");
              setPageSize(DEFAULT_CRUD_PAGE_SIZE);
              setPage(1);
            }}
            filters={[
              {
                key: "search",
                label: "Search",
                type: "search",
                value: searchTerm,
                placeholder: "Search menu.",
                onChange: handleSearchChange,
              },
              {
                key: "group",
                label: "Group",
                type: "select",
                value: groupFilter,
                options: [
                  { value: "all", label: "All Groups" },
                  ...navigationGroups.map((group) => ({
                    value: String(group.id),
                    label: group.group_title,
                  })),
                ],
                onChange: handleGroupChange,
              },
              {
                key: "visibility",
                label: "Visibility",
                type: "select",
                value: visibilityFilter,
                options: [
                  { value: "all", label: "All" },
                  { value: "visible", label: "Visible" },
                  { value: "hidden", label: "Hidden" },
                ],
                onChange: (value) =>
                  handleVisibilityChange(value as MenuVisibilityFilter),
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

          {successMessage || errorMessage ? (
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
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Menu</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Level / Sort</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Visible</th>
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
                      Loading menus...
                    </td>
                  </tr>
                ) : menus.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-slate-400"
                    >
                      No menu data found. Click Create to add first menu.
                    </td>
                  </tr>
                ) : (
                  menus.map((menu, index) => {
                    const group = menu.navigation_group_id
                      ? navigationGroupById.get(menu.navigation_group_id)
                      : null;
                    const parent = menu.parent_menu_id
                      ? menuById.get(menu.parent_menu_id)
                      : null;

                    return (
                      <tr
                        key={menu.id}
                        className={`hover:bg-slate-50/80 ${
                          !menu.is_active ? "bg-slate-50 opacity-70" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {pageSize === "all"
                            ? index + 1
                            : (page - 1) * numericPageSize + index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">
                            {menu.menu_title}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            {menu.menu_key}
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-700">
                          {group?.group_title || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {parent ? parent.menu_title : "Root"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          <span className="line-clamp-1">
                            {getMenuDisplayPath(menu)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <CrudPillBadge>Level {menu.menu_level}</CrudPillBadge>
                            <span className="text-xs font-semibold text-slate-500">
                              Sort {menu.sort_order}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <CrudPillBadge>
                            {getBooleanLabel(menu.is_visible)}
                          </CrudPillBadge>
                        </td>

                        <td className="px-5 py-4">
                          <CrudStatusBadge active={menu.is_active} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <MenuRowActions
                            menu={menu}
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
                    );
                  })
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
        title={editingMenu ? "Edit Menu" : "Create Menu"}
        description="Create and maintain navigation menu hierarchy, route path, icon, permission key and visibility."
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={menuSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={menuFormId}
              disabled={menuSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {menuSubmitting
                ? "Saving..."
                : editingMenu
                  ? "Update Menu"
                  : "Save Menu"}
            </button>
          </>
        }
      >
        <MenuForm
          key={editingMenu ? `edit-menu-${editingMenu.id}` : "create-menu"}
          initialData={editingMenu}
          navigationGroups={navigationGroups}
          menus={allMenus}
          onSuccess={handleSuccess}
          onCancel={handleCloseDrawer}
          formId={menuFormId}
          hideFooter
          onSubmittingChange={setMenuSubmitting}
        />
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmAction && selectedMenu)}
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

export default function MenusPage() {
  return <MenusContent />;
}
