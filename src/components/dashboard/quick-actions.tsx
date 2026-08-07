import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/universities?new=1", label: "Add University" },
  { href: "/programs?new=1", label: "Add Program" },
  { href: "/professors?new=1", label: "Add Professor" },
  { href: "/scholarships?new=1", label: "Add Scholarship" },
  { href: "/tasks?new=1", label: "Add Task" },
] as const;

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Plus className="size-3.5" />
            {action.label}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
