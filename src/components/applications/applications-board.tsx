"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { updateApplicationStatus } from "@/actions/applications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DeadlineBadge } from "@/components/shared/status-badge";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { formatDate, labelize } from "@/lib/format";
import { ApplicationStatus } from "../../../generated/prisma/enums";

const BOARD_COLUMNS = [
  ApplicationStatus.RESEARCHING,
  ApplicationStatus.PREPARING,
  ApplicationStatus.READY_TO_SUBMIT,
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
] as const;

export type ApplicationBoardItem = {
  id: string;
  status: string;
  notes: string | null;
  program: {
    id: string;
    name: string;
    applicationDeadline: string | null;
    university: {
      id: string;
      name: string;
      country: { id: string; name: string; code: string };
    };
    tasks: Array<{
      id: string;
      title: string;
      dueDate: string | null;
      status: string;
      priority: string;
    }>;
  };
};

type ProgramOption = {
  id: string;
  name: string;
  universityName: string;
};

export function ApplicationsBoard({
  applications,
  programs,
  defaultOpenCreate = false,
}: {
  applications: ApplicationBoardItem[];
  programs: ProgramOption[];
  defaultOpenCreate?: boolean;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, ApplicationBoardItem[]>();
    for (const column of BOARD_COLUMNS) map.set(column, []);
    map.set(ApplicationStatus.WITHDRAWN, []);

    for (const application of applications) {
      const key = map.has(application.status)
        ? application.status
        : ApplicationStatus.RESEARCHING;
      map.get(key)!.push(application);
    }
    return map;
  }, [applications]);

  function onStatusChange(id: string, status: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await updateApplicationStatus({ id, status });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated");
      router.refresh();
    });
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Start tracking a program through the admissions pipeline."
        action={
          <ApplicationDialog
            programs={programs}
            defaultOpen={defaultOpenCreate}
          />
        }
      />
    );
  }

  const columns = [
    ...BOARD_COLUMNS,
    ...(grouped.get(ApplicationStatus.WITHDRAWN)?.length
      ? [ApplicationStatus.WITHDRAWN]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ApplicationDialog
          programs={programs}
          defaultOpen={defaultOpenCreate}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => {
          const items = grouped.get(column) ?? [];
          return (
            <div
              key={column}
              className="w-72 shrink-0 rounded-xl border bg-muted/20"
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                <h2 className="text-sm font-medium">{labelize(column)}</h2>
                <span className="text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 p-2">
                {items.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Empty
                  </p>
                ) : (
                  items.map((application) => {
                    const nextTask = application.program.tasks[0];
                    return (
                      <Card key={application.id} className="shadow-none">
                        <CardHeader className="space-y-2 p-3">
                          <CardTitle className="text-sm leading-snug">
                            {application.program.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {application.program.university.name} ·{" "}
                            {application.program.university.country.code}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3 p-3 pt-0">
                          <div className="space-y-1 text-xs">
                            <p>
                              Deadline:{" "}
                              {formatDate(
                                application.program.applicationDeadline,
                              )}
                            </p>
                            <DeadlineBadge
                              date={application.program.applicationDeadline}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Next task:{" "}
                            {nextTask
                              ? `${nextTask.title}${
                                  nextTask.dueDate
                                    ? ` (${formatDate(nextTask.dueDate)})`
                                    : ""
                                }`
                              : "None"}
                          </p>
                          <Select
                            value={application.status}
                            onValueChange={(value) => {
                              if (value) onStatusChange(application.id, value);
                            }}
                            disabled={pending && pendingId === application.id}
                          >
                            <SelectTrigger className="h-8 w-full text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ApplicationStatus).map((value) => (
                                <SelectItem key={value} value={value}>
                                  {labelize(value)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <ApplicationDialog
                            mode="edit"
                            applicationId={application.id}
                            programs={programs}
                            defaultValues={{
                              programId: application.program.id,
                              status: application.status as never,
                              notes: application.notes ?? "",
                            }}
                            triggerLabel="Edit"
                          />
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
