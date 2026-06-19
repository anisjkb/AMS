import {
  BadgeCheck,
  BadgeX,
  Building2,
  ChevronDown,
  Circle,
  Download,
  GitBranch,
  LayoutDashboard,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  GitBranch,
  Network,
  BadgeCheck,
  Users,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  BadgeX,
  Download,
  Upload,
  ChevronDown,
};

export function getIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Circle;
  return iconMap[iconName] ?? Circle;
}