"use client";

import {
  Bell,
  Command,
  Loader2,
  LogOut,
  Menu,
  Search,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import EnterpriseSidebar from "./EnterpriseSidebar";
import { logout } from "@/services/auth";
import {
  NavigationProvider,
  useNavigation,
} from "@/contexts/NavigationContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { navigation, loading } = useNavigation();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {loading ? (
        <aside className="fixed left-0 top-0 hidden h-screen w-80 items-center justify-center bg-slate-950 text-white lg:flex">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="animate-spin" size={22} />
            Loading navigation...
          </div>
        </aside>
      ) : (
        <EnterpriseSidebar navigation={navigation} />
      )}

      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
                <Menu size={22} />
              </button>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Enterprise Dashboard
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Dynamic RBAC navigation is active
                </p>
              </div>
            </div>

            <div className="hidden max-w-xl flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 xl:flex">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Search menu, module, employee, audit..."
                className="ml-3 w-full bg-transparent text-sm outline-none"
              />
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-400">
                <Command size={12} /> K
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm hover:bg-slate-50">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                <UserCircle size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Super Admin
                  </p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <DashboardShell>{children}</DashboardShell>
    </NavigationProvider>
  );
}