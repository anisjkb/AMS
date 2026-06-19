import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const sidebarMenus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: "dashboard.view",
    children: [],
  },
  {
    title: "Organization",
    icon: Building2,
    permission: "menu.organization.view",
    children: [
      { title: "Company", href: "/companies", permission: "menu.company.view" },
      { title: "Branch", href: "/branches", permission: "menu.branch.view" },
      { title: "Department", href: "/departments", permission: "menu.department.view" },
      { title: "Designation", href: "/designations", permission: "menu.designation.view" },
      { title: "Employee", href: "/employees", permission: "menu.employee.view" },
    ],
  },
  {
    title: "Audit Universe",
    icon: ClipboardCheck,
    permission: "menu.audit.view",
    children: [
      { title: "Audit Universe", href: "/audit-universe", permission: "menu.audit_universe.view" },
      { title: "Audit Plan", href: "/audit-plan", permission: "menu.audit_plan.view" },
      { title: "Audit Program", href: "/audit-program", permission: "menu.audit_program.view" },
      { title: "Audit Assignment", href: "/audit-assignment", permission: "menu.audit_assignment.view" },
    ],
  },
  {
    title: "Execution",
    icon: FolderKanban,
    permission: "menu.execution.view",
    children: [
      { title: "Working Paper", href: "/working-papers", permission: "menu.working_paper.view" },
      { title: "Observation", href: "/observations", permission: "menu.observation.view" },
      { title: "Evidence", href: "/evidence", permission: "menu.evidence.view" },
    ],
  },
  {
    title: "Reporting",
    icon: BarChart3,
    permission: "menu.reporting.view",
    children: [
      { title: "Audit Report", href: "/audit-reports", permission: "menu.audit_report.view" },
      { title: "CAPA", href: "/capa", permission: "menu.capa.view" },
      { title: "Follow Up", href: "/follow-up", permission: "menu.follow_up.view" },
    ],
  },
  {
    title: "Administration",
    icon: Settings,
    permission: "menu.admin.view",
    children: [
      { title: "Users", href: "/users", permission: "menu.user.view" },
      { title: "Roles", href: "/roles", permission: "menu.role.view" },
      { title: "Permissions", href: "/permissions", permission: "menu.permission.view" },
      { title: "Settings", href: "/settings", permission: "menu.settings.view" },
    ],
  },
];