import {
  CalendarDays,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MapPinned,
  NotebookPen,
  School,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href:
    | "/dashboard"
    | "/countries"
    | "/universities"
    | "/programs"
    | "/professors"
    | "/scholarships"
    | "/applications"
    | "/tasks"
    | "/local-life"
    | "/notes";
  labelKey:
    | "dashboard"
    | "countries"
    | "universities"
    | "programs"
    | "professors"
    | "scholarships"
    | "applications"
    | "tasks"
    | "localLife"
    | "notes";
  icon: LucideIcon;
};

export type NavGroup = {
  id: "main" | "research" | "planning";
  labelKey: "main" | "research" | "planning";
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "main",
    labelKey: "main",
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/applications", labelKey: "applications", icon: FileText },
      { href: "/tasks", labelKey: "tasks", icon: CalendarDays },
    ],
  },
  {
    id: "research",
    labelKey: "research",
    items: [
      { href: "/countries", labelKey: "countries", icon: Compass },
      { href: "/universities", labelKey: "universities", icon: School },
      { href: "/programs", labelKey: "programs", icon: GraduationCap },
      { href: "/professors", labelKey: "professors", icon: Users },
      { href: "/scholarships", labelKey: "scholarships", icon: Wallet },
    ],
  },
  {
    id: "planning",
    labelKey: "planning",
    items: [
      { href: "/local-life", labelKey: "localLife", icon: MapPinned },
      { href: "/notes", labelKey: "notes", icon: NotebookPen },
    ],
  },
];

export const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/countries", labelKey: "countries", icon: Compass },
  { href: "/universities", labelKey: "universities", icon: School },
  { href: "/programs", labelKey: "programs", icon: GraduationCap },
  { href: "/professors", labelKey: "professors", icon: Users },
  { href: "/scholarships", labelKey: "scholarships", icon: Wallet },
  { href: "/applications", labelKey: "applications", icon: FileText },
  { href: "/tasks", labelKey: "tasks", icon: CalendarDays },
  { href: "/local-life", labelKey: "localLife", icon: MapPinned },
  { href: "/notes", labelKey: "notes", icon: NotebookPen },
];
