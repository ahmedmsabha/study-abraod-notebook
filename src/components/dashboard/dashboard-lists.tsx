import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import type { DashboardData } from "@/lib/data/dashboard";

export function DashboardLists({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming program deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingProgramDeadlines.length === 0 ? (
            <EmptyState
              title="No deadlines in the next 60 days"
              description="Program application deadlines will appear here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            data.upcomingProgramDeadlines.map((program) => (
              <Link
                key={program.id}
                href={`/programs/${program.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{program.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {program.university.name} · {program.university.country.code}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(program.applicationDeadline)}
                  </p>
                  <DeadlineBadge date={program.applicationDeadline} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scholarship deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.upcomingScholarshipDeadlines.length === 0 ? (
            <EmptyState
              title="No scholarship deadlines soon"
              description="Funding deadlines within 60 days show here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            data.upcomingScholarshipDeadlines.map((item) => (
              <Link
                key={item.id}
                href={`/scholarships/${item.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.university?.name ?? item.country?.name ?? "General"}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.deadline)}
                  </p>
                  <DeadlineBadge date={item.deadline} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professors to contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.professorsToContact.length === 0 ? (
            <EmptyState
              title="Inbox clear"
              description="Professors needing outreach will appear here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            data.professorsToContact.map((professor) => (
              <Link
                key={professor.id}
                href={`/professors/${professor.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{professor.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {professor.university.name} ·{" "}
                    {professor.university.country.code}
                  </p>
                </div>
                <StatusBadge value={professor.contactStatus} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks due soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.openTasks.length === 0 ? (
            <EmptyState
              title="No open tasks"
              description="Upcoming and undated open tasks show here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            data.openTasks.map((task) => (
              <Link
                key={task.id}
                href="/tasks"
                className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge value={task.status} />
                  <StatusBadge value={task.priority} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
