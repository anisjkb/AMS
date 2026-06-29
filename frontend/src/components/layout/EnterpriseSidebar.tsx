//src\components\layout\EnterpriseSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";
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
};

function SidebarMenuItem({
  menu,
  pathname,
  depth,
  openMenus,
  onToggleMenu,
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

  const itemClassName = `group flex w-full items-center justify-between rounded-xl py-3 pr-3 text-left text-sm font-semibold transition ${
    activeLike
      ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

  const itemStyle = {
    paddingLeft: `${12 + depth * MENU_INDENT_STEP}px`,
  };

  const iconClassName = activeLike
    ? "text-white"
    : "text-slate-500 group-hover:text-blue-300";

  const badgeClassName = activeLike
    ? "bg-white/20 text-white"
    : "bg-slate-800 text-slate-400";

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
          <div className="mt-1 space-y-1 border-l border-white/10 pl-2">
            {children.map((child) => (
              <SidebarMenuItem
                key={child.id}
                menu={child}
                pathname={pathname}
                depth={depth + 1}
                openMenus={openMenus}
                onToggleMenu={onToggleMenu}
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
        className="group flex w-full cursor-not-allowed items-center justify-between rounded-xl py-3 pr-3 text-left text-sm font-semibold text-slate-500 opacity-70"
        style={itemStyle}
      >
        <span className="flex min-w-0 items-center gap-3">
          {renderIcon(menu.icon, 18, "text-slate-600")}
          <span className="truncate">{menu.menu_title}</span>
        </span>
      </button>
    );
  }

  return (
    <Link href={menu.route_path} className={itemClassName} style={itemStyle}>
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

export default function EnterpriseSidebar({
  navigation,
}: {
  navigation: NavigationGroup[];
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
    <aside className="fixed left-0 top-0 hidden h-screen w-80 overflow-y-auto border-r border-white/10 bg-slate-950 text-white shadow-2xl lg:block">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/25">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight">AMS</h1>
            <p className="text-xs font-medium text-slate-400">
              Audit Management System
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-4 p-4">
        {navigation.map((group) => {
          const isOpen =
            Boolean(openGroups[group.group_key]) ||
            Boolean(activeOpenGroups[group.group_key]);
          const totalMenus = countMenus(group.menus);

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-white/5 bg-white/3 p-2"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.group_key, isOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                    {renderIcon(group.group_icon, 19)}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-100">
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
                      onToggleMenu={toggleMenu}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
