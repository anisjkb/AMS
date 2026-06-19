"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type { NavigationGroup } from "@/types/navigation";
import { getIcon } from "./IconMapper";

export default function EnterpriseSidebar({
  navigation,
}: {
  navigation: NavigationGroup[];
}) {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};

    navigation.forEach((group) => {
      initial[group.group_key] = true;
    });

    return initial;
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
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
          const GroupIcon = getIcon(group.group_icon);
          const isOpen = openGroups[group.group_key];

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-white/5 bg-white/3 p-2"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.group_key)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                    <GroupIcon size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      {group.group_title}
                    </p>

                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      {group.menus.length} menu
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
                  {group.menus.map((menu) => {
                    const MenuIcon = getIcon(menu.icon);
                    const isActive = pathname === menu.route_path;

                    return (
                      <Link
                        key={menu.id}
                        href={menu.route_path || "#"}
                        className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <MenuIcon
                            size={18}
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-500 group-hover:text-blue-300"
                            }
                          />
                          {menu.menu_title}
                        </span>

                        {menu.actions.length > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {menu.actions.length}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}