import {
  FileText,
  GraduationCap,
  School,
  Users,
  Wallet,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/data/dashboard";

const items = [
  { key: "universities", label: "Universities", icon: School },
  { key: "programs", label: "Programs", icon: GraduationCap },
  { key: "professors", label: "Professors", icon: Users },
  { key: "scholarships", label: "Scholarships", icon: Wallet },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "openTasks", label: "Open tasks", icon: ListTodo },
] as const;

export function StatCards({ counts }: { counts: DashboardData["counts"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map(({ key, label, icon: Icon }) => (
        <Card key={key} size="sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold tracking-tight">
              {counts[key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
