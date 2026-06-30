"use client";

import { createElement } from "react";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Building,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  ChevronRight,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Contact,
  Database,
  Download,
  Factory,
  FileBadge,
  FileCheck2,
  FileCog,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GitBranch,
  Home,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  MapPin,
  Menu,
  MessagesSquare,
  Network,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  UserRoundCog,
  Users,
  UsersRound,
} from "lucide-react";

export const iconMap = {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Building,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  ChevronRight,
  Circle,
  ClipboardCheck,
  ClipboardList,
  Contact,
  Database,
  Download,
  Factory,
  FileBadge,
  FileCheck2,
  FileCog,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GitBranch,
  Home,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  MapPin,
  Menu,
  MessagesSquare,
  Network,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  UserRoundCog,
  Users,
  UsersRound,

  // Backward compatible aliases from DB seed / older menu data
  Dashboard: LayoutDashboard,
  Organization: Building2,
  Security: ShieldCheck,
  Audit: ClipboardCheck,
  Company: Building2,
  Branch: GitBranch,
  Department: FolderTree,
  Designation: UserCheck,
  Employee: Users,
  Permission: LockKeyhole,
  Role: Shield,
  User: UserCog,
  MenuPermission: ListChecks,
  MenuActionPermission: CheckSquare,
  AuditSubject: BookOpenCheck,
  AuditEntity: Building,
  BusinessActivity: Network,
  ExchangeListing: Landmark,
  EntityAddress: MapPin,
  EntityContact: Contact,
  EntityDirector: UsersRound,
  EntityLicense: FileBadge,
  EntityFacility: Factory,
  FinancialSnapshot: ChartNoAxesCombined,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

export function getIconComponent(iconName?: string | null): LucideIcon {
  if (!iconName) return Circle;

  return iconMap[iconName as IconName] ?? Circle;
}

export function getMenuIcon(iconName?: string | null): LucideIcon {
  return getIconComponent(iconName);
}

export function getLucideIcon(iconName?: string | null): LucideIcon {
  return getIconComponent(iconName);
}


export function getIcon(iconName?: string | null): LucideIcon {
  return getIconComponent(iconName);
}

export function IconMapper({
  name,
  iconName,
  className,
  strokeWidth,
}: {
  name?: string | null;
  iconName?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(getIconComponent(name ?? iconName), { className, strokeWidth });
}

export default IconMapper;


