//src\components\layout\EnterpriseSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck, X } from "lucide-react";
import { createElement, useMemo, useState } from "react";

import type { NavigationGroup, NavigationMenu } from "@/types/navigation";
import { getIcon } from "./IconMapper";

const renderIcon = (
  iconName: string | null,
  size: number,
  className?: string
) => {
  const IconComponent = getIcon(iconName);
  return createElement(IconComponent, { size, className });
};

const MENU_INDENT_STEP = 16;

const menuHasActivePath = (
  menu: NavigationMenu,
  pathname: string
): boolean => {
  return (
    menu.route_path === pathname ||
    menu.children.some((child) => menuHasActivePath(child, pathname))
  );
};

const groupHasActivePath = (
  group: NavigationGroup,
  pathname: string
): boolean => {
  return group.menus.some((menu) => menuHasActivePath(menu, pathname));
};

const countMenus = (menus: NavigationMenu[]): number => {
  return menus.reduce(
    (total, menu) => total + 1 + countMenus(menu.children),
    0
  );
};

const buildActiveOpenGroups = (
  navigation: NavigationGroup[],
  pathname: string
): Record<string, boolean> => {
  return navigation.reduce<Record<string, boolean>>((acc, group) => {
    acc[group.group_key] =
      group.group_key === "dashboard" || groupHasActivePath(group, pathname);

    return acc;
  }, {});
};

type SidebarMenuItemProps = {
  menu: NavigationMenu;
  pathname: string;
  depth: number;
  openMenus: Record<string, boolean>;
  onToggleMenu: (menuKey: string, isCurrentlyOpen: boolean) => void;
  onNavigate?: () => void;
};

function SidebarMenuItem({
  menu,
  pathname,
  depth,
  openMenus,
  onToggleMenu,
  onNavigate,
}: SidebarMenuItemProps) {
  const children = menu.children ?? [];
  const hasChildren = children.length > 0;
  const isActive = Boolean(menu.route_path && pathname === menu.route_path);
  const hasActiveChild = children.some((child) =>
    menuHasActivePath(child, pathname)
  );
  const isOpen = hasActiveChild || Boolean(openMenus[menu.menu_key]);
  const actionCount = menu.actions.length;
  const activeLike = isActive || hasActiveChild;

  const itemClassName = `group flex w-full items-center justify-between rounded-2xl border py-3 pr-3 text-left text-sm font-semibold transition ${
    activeLike
      ? "border-blue-200 bg-linear-to-r from-blue-50 via-sky-50 to-white text-blue-700 shadow-sm shadow-blue-100/70"
      : "border-transparent text-slate-700 hover:border-sky-100 hover:bg-white/90 hover:text-slate-950 hover:shadow-sm"
  }`;

  const itemStyle = {
    paddingLeft: `${12 + depth * MENU_INDENT_STEP}px`,
  };

  const iconClassName = activeLike
    ? "text-blue-600"
    : "text-slate-400 group-hover:text-blue-600";

  const badgeClassName = activeLike
    ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200/70"
    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200";

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => onToggleMenu(menu.menu_key, isOpen)}
          className={itemClassName}
          style={itemStyle}
        >
          <span className="flex min-w-0 items-center gap-3">
            {renderIcon(menu.icon, 18, iconClassName)}
            <span className="truncate">{menu.menu_title}</span>
          </span>

          <span className="flex items-center gap-2">
            {actionCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClassName}`}
              >
                {actionCount}
              </span>
            )}

            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-400 transition ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        {isOpen && (
          <div className="mt-1 space-y-1 border-l border-sky-100 pl-2">
            {children.map((child) => (
              <SidebarMenuItem
                key={child.id}
                menu={child}
                pathname={pathname}
                depth={depth + 1}
                openMenus={openMenus}
                onToggleMenu={onToggleMenu}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!menu.route_path) {
    return (
      <button
        type="button"
        disabled
        className="group flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-transparent py-3 pr-3 text-left text-sm font-semibold text-slate-400 opacity-70"
        style={itemStyle}
      >
        <span className="flex min-w-0 items-center gap-3">
          {renderIcon(menu.icon, 18, "text-slate-300")}
          <span className="truncate">{menu.menu_title}</span>
        </span>
      </button>
    );
  }

  return (
    <Link
      href={menu.route_path}
      className={itemClassName}
      style={itemStyle}
      onClick={() => onNavigate?.()}
    >
      <span className="flex min-w-0 items-center gap-3">
        {renderIcon(menu.icon, 18, iconClassName)}
        <span className="truncate">{menu.menu_title}</span>
      </span>

      {actionCount > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClassName}`}
        >
          {actionCount}
        </span>
      )}
    </Link>
  );
}

type SidebarContentProps = {
  navigation: NavigationGroup[];
  pathname: string;
  activeOpenGroups: Record<string, boolean>;
  openGroups: Record<string, boolean>;
  openMenus: Record<string, boolean>;
  onToggleGroup: (groupKey: string, isCurrentlyOpen: boolean) => void;
  onToggleMenu: (menuKey: string, isCurrentlyOpen: boolean) => void;
  onNavigate?: () => void;
  onClose?: () => void;
  showClose?: boolean;
};

function SidebarContent({
  navigation,
  pathname,
  activeOpenGroups,
  openGroups,
  openMenus,
  onToggleGroup,
  onToggleMenu,
  onNavigate,
  onClose,
  showClose = false,
}: SidebarContentProps) {
  return (
    <>
      <div className="sticky top-0 z-20 border-b border-sky-100 bg-white/85 px-6 py-5 shadow-sm shadow-sky-100/50 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/80">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                AMS
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Audit Management System
              </p>
            </div>
          </div>

          {showClose ? (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onClose}
              className="rounded-xl border border-sky-100 bg-white/90 p-2 text-slate-600 shadow-sm shadow-sky-100/60 transition hover:bg-sky-50 hover:text-blue-700"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>
      </div>

      <nav className="space-y-3 p-4">
        {navigation.map((group) => {
          const isOpen =
            Boolean(openGroups[group.group_key]) ||
            Boolean(activeOpenGroups[group.group_key]);
          const hasActiveGroup = groupHasActivePath(group, pathname);
          const totalMenus = countMenus(group.menus);

          return (
            <div
              key={group.id}
              className={`rounded-3xl border p-2 transition ${
                hasActiveGroup
                  ? "border-blue-200 bg-white/85 shadow-sm shadow-blue-100/70"
                  : "border-sky-100 bg-white/60 shadow-sm shadow-sky-100/40"
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => onToggleGroup(group.group_key, isOpen)}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/90 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${
                      hasActiveGroup
                        ? "bg-white text-blue-600 ring-blue-100 shadow-sm shadow-blue-100/80"
                        : "bg-white/85 text-slate-500 ring-sky-100"
                    }`}
                  >
                    {renderIcon(group.group_icon, 19)}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {group.group_title}
                    </p>

                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      {totalMenus} menu
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2 space-y-1 pl-2">
                  {group.menus.map((menu) => (
                    <SidebarMenuItem
                      key={menu.id}
                      menu={menu}
                      pathname={pathname}
                      depth={0}
                      openMenus={openMenus}
                      onToggleMenu={onToggleMenu}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default function EnterpriseSidebar({
  navigation,
  mobileOpen = false,
  onMobileClose,
}: {
  navigation: NavigationGroup[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const activeOpenGroups = useMemo(
    () => buildActiveOpenGroups(navigation, pathname),
    [navigation, pathname]
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string, isCurrentlyOpen: boolean) => {
    setOpenGroups((prev) => {
      if (isCurrentlyOpen) {
        return {
          ...prev,
          [groupKey]: false,
        };
      }

      return navigation.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.group_key] = group.group_key === groupKey;
        return acc;
      }, {});
    });
  };

  const toggleMenu = (menuKey: string, isCurrentlyOpen: boolean) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !isCurrentlyOpen,
    }));
  };

  return (
    <>
      <aside className="fixed left-0 top-0 hidden h-screen w-80 overflow-y-auto border-r border-sky-100 bg-linear-to-b from-white via-slate-50 to-sky-50 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:block">
        <SidebarContent
          navigation={navigation}
          pathname={pathname}
          activeOpenGroups={activeOpenGroups}
          openGroups={openGroups}
          openMenus={openMenus}
          onToggleGroup={toggleGroup}
          onToggleMenu={toggleMenu}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={onMobileClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <aside className="relative h-full w-80 max-w-[86vw] overflow-y-auto border-r border-sky-100 bg-linear-to-b from-white via-slate-50 to-sky-50 text-slate-900 shadow-2xl">
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              activeOpenGroups={activeOpenGroups}
              openGroups={openGroups}
              openMenus={openMenus}
              onToggleGroup={toggleGroup}
              onToggleMenu={toggleMenu}
              onNavigate={onMobileClose}
              onClose={onMobileClose}
              showClose
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
