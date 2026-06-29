// E:\Audit\AMS\frontend\src\app\(protected)\security\menus\page.tsx

"use client";

import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  EyeOff,
  Layers3,
  Menu as MenuIcon,
  MousePointerClick,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

import ConfirmModal from "@/components/common/ConfirmModal";
import CrudDrawer from "@/components/crud/CrudDrawer";
import CrudPagination from "@/components/crud/CrudPagination";
import { CrudPillBadge, CrudStatusBadge } from "@/components/crud/CrudStatusBadge";
import CrudToolbar from "@/components/crud/CrudToolbar";
import {
  DEFAULT_CRUD_PAGE_SIZE,
  type CrudPageSizeOption,
} from "@/components/crud/crudConstants";
import { getIcon } from "@/components/layout/IconMapper";
import MenuActionForm from "@/components/menus/MenuActionForm";
import MenuActionRowActions from "@/components/menus/MenuActionRowActions";
import MenuForm from "@/components/menus/MenuForm";
import MenuRowActions from "@/components/menus/MenuRowActions";
import NavigationGroupForm from "@/components/menus/NavigationGroupForm";
import NavigationGroupRowActions from "@/components/menus/NavigationGroupRowActions";
import { clearNavigationCache, useNavigation } from "@/contexts/NavigationContext";
import {
  deactivateMenu,
  getAllMenus,
  getMenuDisplayPath,
  getMenusPage,
  permanentlyDeleteMenu,
  restoreMenu,
} from "@/services/menu";
import {
  deactivateMenuAction,
  getAllMenuActions,
  getMenuActionsPage,
  permanentlyDeleteMenuAction,
  restoreMenuAction,
} from "@/services/menuAction";
import {
  deactivateNavigationGroup,
  getAllNavigationGroups,
  getNavigationGroupsPage,
  permanentlyDeleteNavigationGroup,
  restoreNavigationGroup,
} from "@/services/navigationGroup";
import { getAllPermissions } from "@/services/permission";
import type { Menu, MenuVisibilityFilter } from "@/types/menu";
import type {
  MenuAction,
  MenuActionVisibilityFilter,
} from "@/types/menuAction";
import type {
  NavigationGroupRecord,
  NavigationGroupVisibilityFilter,
} from "@/types/navigationGroup";
import type { StatusFilter } from "@/types/pagination";
import type { Permission } from "@/types/permission";

type BuilderTab = "groups" | "menus" | "actions";
type ConfirmAction = "inactive" | "restore" | "permanent_delete";
type ConfirmVariant = "danger" | "warning" | "success";
type ConfirmState =
  | {
      target: "group";
      action: ConfirmAction;
      item: NavigationGroupRecord;
    }
  | {
      target: "menu";
      action: ConfirmAction;
      item: Menu;
    }
  | {
      target: "action";
      action: ConfirmAction;
      item: MenuAction;
    }
  | null;

const groupFormId = "navigation-group-form";
const menuFormId = "menu-form";
const menuActionFormId = "menu-action-form";

const getBooleanLabel = (value: boolean) => {
  return value ? "Yes" : "No";
};

const renderIcon = (iconName: string | null, className?: string) => {
  const IconComponent = getIcon(iconName);
  return createElement(IconComponent, { className });
};

function SummaryCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white/75 p-5 shadow-sm shadow-sky-100/60 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{hint}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-600 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MenusContent() {
  const { reloadNavigation } = useNavigation();

  const [activeTab, setActiveTab] = useState<BuilderTab>("groups");

  const [groups, setGroups] = useState<NavigationGroupRecord[]>([]);
  const [allGroups, setAllGroups] = useState<NavigationGroupRecord[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [actions, setActions] = useState<MenuAction[]>([]);
  const [allActions, setAllActions] = useState<MenuAction[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [groupTotalRecords, setGroupTotalRecords] = useState(0);
  const [groupTotalPages, setGroupTotalPages] = useState(0);
  const [menuTotalRecords, setMenuTotalRecords] = useState(0);
  const [menuTotalPages, setMenuTotalPages] = useState(0);
  const [actionTotalRecords, setActionTotalRecords] = useState(0);
  const [actionTotalPages, setActionTotalPages] = useState(0);

  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [groupStatusFilter, setGroupStatusFilter] =
    useState<StatusFilter>("all");
  const [groupVisibilityFilter, setGroupVisibilityFilter] =
    useState<NavigationGroupVisibilityFilter>("all");

  const [menuPage, setMenuPage] = useState(1);
  const [menuPageSize, setMenuPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [menuStatusFilter, setMenuStatusFilter] = useState<StatusFilter>("all");
  const [menuVisibilityFilter, setMenuVisibilityFilter] =
    useState<MenuVisibilityFilter>("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const [actionPage, setActionPage] = useState(1);
  const [actionPageSize, setActionPageSize] =
    useState<CrudPageSizeOption>(DEFAULT_CRUD_PAGE_SIZE);
  const [actionSearchTerm, setActionSearchTerm] = useState("");
  const [actionStatusFilter, setActionStatusFilter] =
    useState<StatusFilter>("all");
  const [actionVisibilityFilter, setActionVisibilityFilter] =
    useState<MenuActionVisibilityFilter>("all");
  const [actionMenuFilter, setActionMenuFilter] = useState("all");

  const [groupsLoading, setGroupsLoading] = useState(true);
  const [menusLoading, setMenusLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(true);

  const [drawerMode, setDrawerMode] = useState<BuilderTab | null>(null);
  const [editingGroup, setEditingGroup] =
    useState<NavigationGroupRecord | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingAction, setEditingAction] = useState<MenuAction | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedGroupId =
    groupFilter === "all" ? undefined : Number(groupFilter);
  const selectedActionMenuId =
    actionMenuFilter === "all" ? undefined : Number(actionMenuFilter);

  const numericGroupPageSize =
    groupPageSize === "all" ? Math.max(groupTotalRecords, 1) : Number(groupPageSize);
  const numericMenuPageSize =
    menuPageSize === "all" ? Math.max(menuTotalRecords, 1) : Number(menuPageSize);
  const numericActionPageSize =
    actionPageSize === "all"
      ? Math.max(actionTotalRecords, 1)
      : Number(actionPageSize);

  const groupById = useMemo(() => {
    return new Map(allGroups.map((group) => [group.id, group]));
  }, [allGroups]);

  const menuById = useMemo(() => {
    return new Map(allMenus.map((menu) => [menu.id, menu]));
  }, [allMenus]);

  const summary = useMemo(() => {
    return {
      totalGroups: allGroups.length,
      totalMenus: allMenus.length,
      totalActions: allActions.length,
      hiddenItems:
        allGroups.filter((group) => !group.is_visible).length +
        allMenus.filter((menu) => !menu.is_visible).length +
        allActions.filter((action) => !action.is_visible).length,
    };
  }, [allGroups, allMenus, allActions]);

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

  const refreshLiveNavigation = useCallback(() => {
    clearNavigationCache();
    void reloadNavigation();
  }, [reloadNavigation]);

  const loadLookups = useCallback(() => {
    return Promise.all([
      getAllNavigationGroups({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllMenus({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllMenuActions({
        status: "all",
        visibility: "all",
        sortBy: "sort_order",
        sortOrder: "asc",
      }),
      getAllPermissions({
        status: "active",
        sortBy: "permission_key",
        sortOrder: "asc",
      }),
    ]);
  }, []);

  const loadGroups = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setGroupsLoading(true);
        }

        const response =
          groupPageSize === "all"
            ? await getAllNavigationGroups({
                search: groupSearchTerm,
                status: groupStatusFilter,
                visibility: groupVisibilityFilter,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getNavigationGroupsPage({
                page: groupPage,
                pageSize: Number(groupPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: groupSearchTerm,
                status: groupStatusFilter,
                visibility: groupVisibilityFilter,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setGroups(response.items);
        setGroupTotalRecords(response.total);
        setGroupTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load navigation groups:", error);
        setGroups([]);
        setGroupTotalRecords(0);
        setGroupTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation groups."
        );
      } finally {
        if (showTableLoading) {
          setGroupsLoading(false);
        }
      }
    },
    [
      groupPage,
      groupPageSize,
      groupSearchTerm,
      groupStatusFilter,
      groupVisibilityFilter,
      showError,
    ]
  );

  const loadMenus = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setMenusLoading(true);
        }

        const response =
          menuPageSize === "all"
            ? await getAllMenus({
                search: menuSearchTerm,
                status: menuStatusFilter,
                visibility: menuVisibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getMenusPage({
                page: menuPage,
                pageSize: Number(menuPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: menuSearchTerm,
                status: menuStatusFilter,
                visibility: menuVisibilityFilter,
                navigationGroupId: selectedGroupId,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setMenus(response.items);
        setMenuTotalRecords(response.total);
        setMenuTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load menus:", error);
        setMenus([]);
        setMenuTotalRecords(0);
        setMenuTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      } finally {
        if (showTableLoading) {
          setMenusLoading(false);
        }
      }
    },
    [
      menuPage,
      menuPageSize,
      menuSearchTerm,
      menuStatusFilter,
      menuVisibilityFilter,
      selectedGroupId,
      showError,
    ]
  );

  const loadActions = useCallback(
    async (showTableLoading = true) => {
      try {
        if (showTableLoading) {
          setActionsLoading(true);
        }

        const response =
          actionPageSize === "all"
            ? await getAllMenuActions({
                search: actionSearchTerm,
                status: actionStatusFilter,
                visibility: actionVisibilityFilter,
                menuId: selectedActionMenuId,
                sortBy: "sort_order",
                sortOrder: "asc",
              })
            : await getMenuActionsPage({
                page: actionPage,
                pageSize: Number(actionPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
                search: actionSearchTerm,
                status: actionStatusFilter,
                visibility: actionVisibilityFilter,
                menuId: selectedActionMenuId,
                sortBy: "sort_order",
                sortOrder: "asc",
              });

        setActions(response.items);
        setActionTotalRecords(response.total);
        setActionTotalPages(response.total_pages);
      } catch (error) {
        console.error("Failed to load menu actions:", error);
        setActions([]);
        setActionTotalRecords(0);
        setActionTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load menu actions."
        );
      } finally {
        if (showTableLoading) {
          setActionsLoading(false);
        }
      }
    },
    [
      actionPage,
      actionPageSize,
      actionSearchTerm,
      actionStatusFilter,
      actionVisibilityFilter,
      selectedActionMenuId,
      showError,
    ]
  );

  useEffect(() => {
    let isMounted = true;

    const request = Promise.resolve().then(() => loadLookups());

    void request
      .then(([groupsResponse, menusResponse, actionsResponse, permissionResponse]) => {
        if (!isMounted) return;

        setAllGroups(groupsResponse.items);
        setAllMenus(menusResponse.items);
        setAllActions(actionsResponse.items);
        setPermissions(permissionResponse.items);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load navigation builder lookup data:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation builder lookup data."
        );
      });

    return () => {
      isMounted = false;
    };
  }, [loadLookups, showError]);

  useEffect(() => {
    let isMounted = true;

    const request =
      groupPageSize === "all"
        ? getAllNavigationGroups({
            search: groupSearchTerm,
            status: groupStatusFilter,
            visibility: groupVisibilityFilter,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getNavigationGroupsPage({
            page: groupPage,
            pageSize: Number(groupPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: groupSearchTerm,
            status: groupStatusFilter,
            visibility: groupVisibilityFilter,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setGroups(response.items);
        setGroupTotalRecords(response.total);
        setGroupTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load navigation groups:", error);
        setGroups([]);
        setGroupTotalRecords(0);
        setGroupTotalPages(0);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to load navigation groups."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setGroupsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    groupPage,
    groupPageSize,
    groupSearchTerm,
    groupStatusFilter,
    groupVisibilityFilter,
    showError,
  ]);

  useEffect(() => {
    let isMounted = true;

    const request =
      menuPageSize === "all"
        ? getAllMenus({
            search: menuSearchTerm,
            status: menuStatusFilter,
            visibility: menuVisibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getMenusPage({
            page: menuPage,
            pageSize: Number(menuPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: menuSearchTerm,
            status: menuStatusFilter,
            visibility: menuVisibilityFilter,
            navigationGroupId: selectedGroupId,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setMenus(response.items);
        setMenuTotalRecords(response.total);
        setMenuTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menus:", error);
        setMenus([]);
        setMenuTotalRecords(0);
        setMenuTotalPages(0);
        showError(error instanceof Error ? error.message : "Failed to load menus.");
      })
      .finally(() => {
        if (!isMounted) return;
        setMenusLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    menuPage,
    menuPageSize,
    menuSearchTerm,
    menuStatusFilter,
    menuVisibilityFilter,
    selectedGroupId,
    showError,
  ]);

  useEffect(() => {
    let isMounted = true;

    const request =
      actionPageSize === "all"
        ? getAllMenuActions({
            search: actionSearchTerm,
            status: actionStatusFilter,
            visibility: actionVisibilityFilter,
            menuId: selectedActionMenuId,
            sortBy: "sort_order",
            sortOrder: "asc",
          })
        : getMenuActionsPage({
            page: actionPage,
            pageSize: Number(actionPageSize) as 10 | 20 | 30 | 40 | 50 | 100,
            search: actionSearchTerm,
            status: actionStatusFilter,
            visibility: actionVisibilityFilter,
            menuId: selectedActionMenuId,
            sortBy: "sort_order",
            sortOrder: "asc",
          });

    void request
      .then((response) => {
        if (!isMounted) return;

        setActions(response.items);
        setActionTotalRecords(response.total);
        setActionTotalPages(response.total_pages);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Failed to load menu actions:", error);
        setActions([]);
        setActionTotalRecords(0);
        setActionTotalPages(0);
        showError(
          error instanceof Error ? error.message : "Failed to load menu actions."
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setActionsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    actionPage,
    actionPageSize,
    actionSearchTerm,
    actionStatusFilter,
    actionVisibilityFilter,
    selectedActionMenuId,
    showError,
  ]);

  const refreshLookups = async () => {
    const [groupsResponse, menusResponse, actionsResponse, permissionResponse] =
      await loadLookups();

    setAllGroups(groupsResponse.items);
    setAllMenus(menusResponse.items);
    setAllActions(actionsResponse.items);
    setPermissions(permissionResponse.items);
  };

  const handleGroupSuccess = () => {
    const wasEditing = Boolean(editingGroup);

    setDrawerMode(null);
    setEditingGroup(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing
        ? "Navigation group updated successfully."
        : "Navigation group created successfully."
    );

    void loadGroups(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleMenuSuccess = () => {
    const wasEditing = Boolean(editingMenu);

    setDrawerMode(null);
    setEditingMenu(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing ? "Menu updated successfully." : "Menu created successfully."
    );

    void loadMenus(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleActionSuccess = () => {
    const wasEditing = Boolean(editingAction);

    setDrawerMode(null);
    setEditingAction(null);
    setFormSubmitting(false);

    showSuccess(
      wasEditing
        ? "Menu action updated successfully."
        : "Menu action created successfully."
    );

    void loadActions(false);
    void refreshLookups();
    refreshLiveNavigation();
  };

  const handleCloseDrawer = () => {
    setDrawerMode(null);
    setEditingGroup(null);
    setEditingMenu(null);
    setEditingAction(null);
    setFormSubmitting(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;

    try {
      setConfirmLoading(true);

      if (confirmState.target === "group") {
        if (confirmState.action === "inactive") {
          await deactivateNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteNavigationGroup(confirmState.item.id);
          showSuccess("Navigation group permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadGroups(false);
      }

      if (confirmState.target === "menu") {
        if (confirmState.action === "inactive") {
          await deactivateMenu(confirmState.item.id);
          showSuccess("Menu marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreMenu(confirmState.item.id);
          showSuccess("Menu restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteMenu(confirmState.item.id);
          showSuccess("Menu permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadMenus(false);
      }

      if (confirmState.target === "action") {
        if (confirmState.action === "inactive") {
          await deactivateMenuAction(confirmState.item.id);
          showSuccess("Menu action marked as inactive successfully.");
        }

        if (confirmState.action === "restore") {
          await restoreMenuAction(confirmState.item.id);
          showSuccess("Menu action restored successfully.");
        }

        if (confirmState.action === "permanent_delete") {
          await permanentlyDeleteMenuAction(confirmState.item.id);
          showSuccess("Menu action permanently deleted successfully.");
        }

        setConfirmState(null);
        await loadActions(false);
      }

      await refreshLookups();
      refreshLiveNavigation();
    } catch (error) {
      console.error("Navigation builder action failed:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Navigation builder action failed. Please try again."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState(null);
  };

  const getConfirmTargetName = () => {
    if (confirmState?.target === "group") return "Group";
    if (confirmState?.target === "menu") return "Menu";
    if (confirmState?.target === "action") return "Action";

    return "";
  };

  const getConfirmTitle = () => {
    const target = getConfirmTargetName();

    if (confirmState?.action === "inactive") return `Mark ${target} as Inactive?`;
    if (confirmState?.action === "restore") return `Restore ${target}?`;
    if (confirmState?.action === "permanent_delete") {
      return `Permanently Delete ${target}?`;
    }

    return "";
  };

  const getConfirmMessage = () => {
    if (!confirmState) return "";

    const name =
      confirmState.target === "group"
        ? confirmState.item.group_title
        : confirmState.target === "menu"
          ? confirmState.item.menu_title
          : confirmState.item.action_title;

    if (confirmState.action === "inactive") {
      return `Are you sure you want to mark "${name}" as inactive?`;
    }

    if (confirmState.action === "restore") {
      return `Are you sure you want to restore "${name}"?`;
    }

    if (confirmState.action === "permanent_delete") {
      return `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`;
    }

    return "";
  };

  const getConfirmLabel = () => {
    if (confirmState?.action === "inactive") return "Mark Inactive";
    if (confirmState?.action === "restore") return "Restore";
    if (confirmState?.action === "permanent_delete") return "Permanent Delete";

    return "Confirm";
  };

  const getConfirmVariant = (): ConfirmVariant => {
    if (confirmState?.action === "restore") return "success";
    if (confirmState?.action === "inactive") return "warning";

    return "danger";
  };

  const handleGroupPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > groupTotalPages) return;
    setGroupPage(nextPage);
  };

  const handleMenuPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > menuTotalPages) return;
    setMenuPage(nextPage);
  };

  const handleActionPageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > actionTotalPages) return;
    setActionPage(nextPage);
  };

  const renderGroupsTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={groupPageSize}
        onPageSizeChange={(value) => {
          setGroupPageSize(value as CrudPageSizeOption);
          setGroupPage(1);
        }}
        onRefresh={() => {
          void loadGroups(true);
          void refreshLookups();
        }}
        onReset={() => {
          setGroupSearchTerm("");
          setGroupStatusFilter("all");
          setGroupVisibilityFilter("all");
          setGroupPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setGroupPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: groupSearchTerm,
            placeholder: "Search group.",
            onChange: (value) => {
              setGroupSearchTerm(value);
              setGroupPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: groupVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setGroupVisibilityFilter(
                value as NavigationGroupVisibilityFilter
              );
              setGroupPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: groupStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setGroupStatusFilter(value as StatusFilter);
              setGroupPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {groupsLoading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                  Loading navigation groups...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center text-slate-400">
                  No navigation group found. Click Add Group to create one.
                </td>
              </tr>
            ) : (
              groups.map((group, index) => {
                const parent = group.parent_group_id
                  ? groupById.get(group.parent_group_id)
                  : null;

                return (
                  <tr
                    key={group.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !group.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {groupPageSize === "all"
                        ? index + 1
                        : (groupPage - 1) * numericGroupPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-blue-600">
                          {renderIcon(group.group_icon, "h-5 w-5")}
                        </div>

                        <div>
                          <div className="font-black text-slate-950">
                            {group.group_title}
                          </div>
                          <div className="mt-1 text-xs font-bold text-slate-500">
                            {group.group_key}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {group.group_icon || "-"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {parent ? parent.group_title : "Root"}
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>Sort {group.sort_order}</CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>
                        {getBooleanLabel(group.is_visible)}
                      </CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudStatusBadge active={group.is_active} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <NavigationGroupRowActions
                        group={group}
                        onEdit={(selected) => {
                          setEditingGroup(selected);
                          setDrawerMode("groups");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "group",
                            action: "permanent_delete",
                            item: selected,
                          })
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
          page={groupPage}
          totalPages={groupTotalPages}
          total={groupTotalRecords}
          pageSize={numericGroupPageSize}
          onPageChange={handleGroupPageChange}
        />
      </div>
    </section>
  );

  const renderMenusTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={menuPageSize}
        onPageSizeChange={(value) => {
          setMenuPageSize(value as CrudPageSizeOption);
          setMenuPage(1);
        }}
        onRefresh={() => {
          void loadMenus(true);
          void refreshLookups();
        }}
        onReset={() => {
          setMenuSearchTerm("");
          setMenuStatusFilter("all");
          setMenuVisibilityFilter("all");
          setGroupFilter("all");
          setMenuPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setMenuPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: menuSearchTerm,
            placeholder: "Search menu.",
            onChange: (value) => {
              setMenuSearchTerm(value);
              setMenuPage(1);
            },
          },
          {
            key: "group",
            label: "Group",
            type: "select",
            value: groupFilter,
            options: [
              { value: "all", label: "All Groups" },
              ...allGroups.map((group) => ({
                value: String(group.id),
                label: group.group_title,
              })),
            ],
            onChange: (value) => {
              setGroupFilter(value);
              setMenuPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: menuVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setMenuVisibilityFilter(value as MenuVisibilityFilter);
              setMenuPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: menuStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setMenuStatusFilter(value as StatusFilter);
              setMenuPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Group</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Parent</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Route</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Level / Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {menusLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  Loading menus...
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  No menu data found. Click Add Menu to create one.
                </td>
              </tr>
            ) : (
              menus.map((menu, index) => {
                const group = menu.navigation_group_id
                  ? groupById.get(menu.navigation_group_id)
                  : null;
                const parent = menu.parent_menu_id
                  ? menuById.get(menu.parent_menu_id)
                  : null;

                return (
                  <tr
                    key={menu.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !menu.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {menuPageSize === "all"
                        ? index + 1
                        : (menuPage - 1) * numericMenuPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-black text-slate-950">
                        {menu.menu_title}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-500">
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
                        onEdit={(selected) => {
                          setEditingMenu(selected);
                          setDrawerMode("menus");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "menu",
                            action: "permanent_delete",
                            item: selected,
                          })
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
          page={menuPage}
          totalPages={menuTotalPages}
          total={menuTotalRecords}
          pageSize={numericMenuPageSize}
          onPageChange={handleMenuPageChange}
        />
      </div>
    </section>
  );

  const renderActionsTable = () => (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm shadow-sky-100/60">
      <CrudToolbar
        pageSize={actionPageSize}
        onPageSizeChange={(value) => {
          setActionPageSize(value as CrudPageSizeOption);
          setActionPage(1);
        }}
        onRefresh={() => {
          void loadActions(true);
          void refreshLookups();
        }}
        onReset={() => {
          setActionSearchTerm("");
          setActionStatusFilter("all");
          setActionVisibilityFilter("all");
          setActionMenuFilter("all");
          setActionPageSize(DEFAULT_CRUD_PAGE_SIZE);
          setActionPage(1);
        }}
        filters={[
          {
            key: "search",
            label: "Search",
            type: "search",
            value: actionSearchTerm,
            placeholder: "Search action.",
            onChange: (value) => {
              setActionSearchTerm(value);
              setActionPage(1);
            },
          },
          {
            key: "menu",
            label: "Menu",
            type: "select",
            value: actionMenuFilter,
            options: [
              { value: "all", label: "All Menus" },
              ...allMenus.map((menu) => ({
                value: String(menu.id),
                label: menu.menu_title,
              })),
            ],
            onChange: (value) => {
              setActionMenuFilter(value);
              setActionPage(1);
            },
          },
          {
            key: "visibility",
            label: "Visibility",
            type: "select",
            value: actionVisibilityFilter,
            options: [
              { value: "all", label: "All" },
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
            ],
            onChange: (value) => {
              setActionVisibilityFilter(value as MenuActionVisibilityFilter);
              setActionPage(1);
            },
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            value: actionStatusFilter,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: (value) => {
              setActionStatusFilter(value as StatusFilter);
              setActionPage(1);
            },
          },
        ]}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-sky-50/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">SL</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Menu</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Permission Key</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Button</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Sort</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Visible</th>
              <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {actionsLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  Loading menu actions...
                </td>
              </tr>
            ) : actions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                  No menu action found. Click Add Action to create one.
                </td>
              </tr>
            ) : (
              actions.map((action, index) => {
                const menu = menuById.get(action.menu_id);

                return (
                  <tr
                    key={action.id}
                    className={`transition hover:bg-sky-50/50 ${
                      !action.is_active ? "bg-slate-50 opacity-70" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-600">
                      {actionPageSize === "all"
                        ? index + 1
                        : (actionPage - 1) * numericActionPageSize + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-black text-slate-950">
                        {action.action_title}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-500">
                        {action.action_key}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {menu?.menu_title || `Menu #${action.menu_id}`}
                    </td>

                    <td className="px-5 py-4">
                      <span className="line-clamp-1 font-mono text-xs font-bold text-slate-600">
                        {action.permission_key}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold">
                          Icon: {action.button_icon || "-"}
                        </span>
                        <span className="text-xs font-bold">
                          Color: {action.button_color || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>Sort {action.sort_order}</CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudPillBadge>
                        {getBooleanLabel(action.is_visible)}
                      </CrudPillBadge>
                    </td>

                    <td className="px-5 py-4">
                      <CrudStatusBadge active={action.is_active} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <MenuActionRowActions
                        action={action}
                        onEdit={(selected) => {
                          setEditingAction(selected);
                          setDrawerMode("actions");
                        }}
                        onInactive={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "inactive",
                            item: selected,
                          })
                        }
                        onRestore={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "restore",
                            item: selected,
                          })
                        }
                        onPermanentDelete={(selected) =>
                          setConfirmState({
                            target: "action",
                            action: "permanent_delete",
                            item: selected,
                          })
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
          page={actionPage}
          totalPages={actionTotalPages}
          total={actionTotalRecords}
          pageSize={numericActionPageSize}
          onPageChange={handleActionPageChange}
        />
      </div>
    </section>
  );

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-linear-to-br from-white via-slate-50 to-sky-50 shadow-xl shadow-sky-100/60">
          <div className="relative overflow-hidden px-6 py-7">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-20 h-32 w-32 rounded-full bg-cyan-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Security Foundation
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                  Navigation Builder
                </h1>

                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                  Design, organize, and control AMS sidebar groups, menus,
                  actions, hierarchy, route paths, icons and visibility from one elegant place.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("groups");
                    setEditingGroup(null);
                    setDrawerMode("groups");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Group
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("menus");
                    setEditingMenu(null);
                    setDrawerMode("menus");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-sky-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Menu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("actions");
                    setEditingAction(null);
                    setDrawerMode("actions");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/80 px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Action
                </button>

                <button
                  type="button"
                  onClick={() => showSuccess("Export feature will be implemented in the next phase.")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => showSuccess("Import feature will be implemented in the next phase.")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
              </div>
            </div>

            <div className="relative mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total Groups"
                value={summary.totalGroups}
                hint="Sidebar sections"
                icon={<Layers3 className="h-5 w-5" />}
              />
              <SummaryCard
                label="Total Menus"
                value={summary.totalMenus}
                hint="Navigation entries"
                icon={<MenuIcon className="h-5 w-5" />}
              />
              <SummaryCard
                label="Total Actions"
                value={summary.totalActions}
                hint="Buttons and operations"
                icon={<MousePointerClick className="h-5 w-5" />}
              />
              <SummaryCard
                label="Hidden Items"
                value={summary.hiddenItems}
                hint="Groups, menus, actions"
                icon={<EyeOff className="h-5 w-5" />}
              />
            </div>
          </div>

          <div className="border-t border-sky-100 bg-white/70 px-6 py-4 backdrop-blur">
            <div className="inline-flex rounded-2xl border border-sky-100 bg-sky-50/80 p-1 shadow-sm">
              {[
                { key: "groups" as const, label: "Groups", icon: Layers3 },
                { key: "menus" as const, label: "Menus", icon: MenuIcon },
                {
                  key: "actions" as const,
                  label: "Actions",
                  icon: MousePointerClick,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition ${
                      selected
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {successMessage || errorMessage ? (
          <div>
            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "groups" ? renderGroupsTable() : null}
        {activeTab === "menus" ? renderMenusTable() : null}
        {activeTab === "actions" ? renderActionsTable() : null}
      </div>

      <CrudDrawer
        isOpen={Boolean(drawerMode)}
        title={
          drawerMode === "groups"
            ? editingGroup
              ? "Edit Navigation Group"
              : "Create Navigation Group"
            : drawerMode === "menus"
              ? editingMenu
                ? "Edit Menu"
                : "Create Menu"
              : editingAction
                ? "Edit Menu Action"
                : "Create Menu Action"
        }
        description={
          drawerMode === "groups"
            ? "Create and maintain sidebar sections, icons, ordering, visibility and group-level access."
            : drawerMode === "menus"
              ? "Create and maintain navigation menu hierarchy, route path, icon, permission key and visibility."
              : "Create and maintain menu buttons/actions, permission key, icon, color, ordering and visibility."
        }
        onClose={handleCloseDrawer}
        maxWidthClassName="max-w-4xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCloseDrawer}
              disabled={formSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={
                drawerMode === "groups"
                  ? groupFormId
                  : drawerMode === "menus"
                    ? menuFormId
                    : menuActionFormId
              }
              disabled={formSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {formSubmitting
                ? "Saving..."
                : drawerMode === "groups"
                  ? editingGroup
                    ? "Update Group"
                    : "Save Group"
                  : drawerMode === "menus"
                    ? editingMenu
                      ? "Update Menu"
                      : "Save Menu"
                    : editingAction
                      ? "Update Action"
                      : "Save Action"}
            </button>
          </>
        }
      >
        {drawerMode === "groups" ? (
          <NavigationGroupForm
            key={editingGroup ? `edit-group-${editingGroup.id}` : "create-group"}
            initialData={editingGroup}
            groups={allGroups}
            onSuccess={handleGroupSuccess}
            onCancel={handleCloseDrawer}
            formId={groupFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}

        {drawerMode === "menus" ? (
          <MenuForm
            key={editingMenu ? `edit-menu-${editingMenu.id}` : "create-menu"}
            initialData={editingMenu}
            navigationGroups={allGroups}
            menus={allMenus}
            onSuccess={handleMenuSuccess}
            onCancel={handleCloseDrawer}
            formId={menuFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}

        {drawerMode === "actions" ? (
          <MenuActionForm
            key={
              editingAction
                ? `edit-menu-action-${editingAction.id}`
                : "create-menu-action"
            }
            initialData={editingAction}
            menus={allMenus}
            permissions={permissions}
            onSuccess={handleActionSuccess}
            onCancel={handleCloseDrawer}
            formId={menuActionFormId}
            hideFooter
            onSubmittingChange={setFormSubmitting}
          />
        ) : null}
      </CrudDrawer>

      <ConfirmModal
        open={Boolean(confirmState)}
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
