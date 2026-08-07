import { Badge } from "@/components/ui/badge";
import { deadlineTone, labelize } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={cn("font-normal", className)}>
      {labelize(value)}
    </Badge>
  );
}

export function DeadlineBadge({
  date,
}: {
  date?: Date | string | null;
}) {
  const tone = deadlineTone(date);
  if (tone === "none") {
    return <Badge variant="outline">No deadline</Badge>;
  }

  const labels = {
    overdue: "Overdue",
    week: "Within 7 days",
    month: "Within 30 days",
    future: "Upcoming",
  } as const;

  const variants = {
    overdue: "destructive",
    week: "default",
    month: "secondary",
    future: "outline",
  } as const;

  return <Badge variant={variants[tone]}>{labels[tone]}</Badge>;
}
