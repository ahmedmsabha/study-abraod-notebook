"use client";

import { useMemo, useState, useTransition } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, List, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { formatDate, labelize } from "@/lib/format";
import { TaskPriority, TaskStatus } from "../../../generated/prisma/enums";
import { cn } from "@/lib/utils";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
  priority: string;
  relatedUniversityId: string | null;
  relatedProgramId: string | null;
  relatedScholarshipId: string | null;
  relatedProfessorId: string | null;
  relatedUniversity: { id: string; name: string } | null;
  relatedProgram: { id: string; name: string } | null;
  relatedScholarship: { id: string; name: string } | null;
  relatedProfessor: { id: string; fullName: string } | null;
};

type Option = { id: string; name: string };

function relatedLabel(task: TaskRow) {
  if (task.relatedUniversity) return task.relatedUniversity.name;
  if (task.relatedProgram) return task.relatedProgram.name;
  if (task.relatedScholarship) return task.relatedScholarship.name;
  if (task.relatedProfessor) return task.relatedProfessor.fullName;
  return "—";
}

export function TasksView({
  tasks,
  universities,
  programs,
  scholarships,
  professors,
  defaultOpenCreate = false,
}: {
  tasks: TaskRow[];
  universities: Option[];
  programs: Option[];
  scholarships: Option[];
  professors: Option[];
  defaultOpenCreate?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [relation, setRelation] = useState("all");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (status !== "all" && task.status !== status) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (relation === "university" && !task.relatedUniversityId) return false;
      if (relation === "program" && !task.relatedProgramId) return false;
      if (relation === "scholarship" && !task.relatedScholarshipId) return false;
      if (relation === "professor" && !task.relatedProfessorId) return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q) ||
        relatedLabel(task).toLowerCase().includes(q)
      );
    });
  }, [tasks, query, status, priority, relation]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  function onDelete(id: string) {
    if (!window.confirm("Delete this task?")) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteTask(id);
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Task deleted");
      router.refresh();
    });
  }

  const dialogProps = {
    universities,
    programs,
    scholarships,
    professors,
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Add deadlines and follow-ups for your applications."
        action={<TaskDialog {...dialogProps} defaultOpen={defaultOpenCreate} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks…"
            className="max-w-xs"
          />
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.values(TaskStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value ?? "all")}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {Object.values(TaskPriority).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={relation}
            onValueChange={(value) => setRelation(value ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Related" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any relation</SelectItem>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="program">Program</SelectItem>
              <SelectItem value="scholarship">Scholarship</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "list" ? "secondary" : "outline"}
            onClick={() => setView("list")}
          >
            <List className="size-3.5" data-icon="inline-start" />
            List
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "calendar" ? "secondary" : "outline"}
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="size-3.5" data-icon="inline-start" />
            Calendar
          </Button>
          <TaskDialog {...dialogProps} defaultOpen={defaultOpenCreate} />
        </div>
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Related</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No tasks match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <p className="font-medium">{task.title}</p>
                      {task.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatDate(task.dueDate)}</div>
                        <DeadlineBadge date={task.dueDate} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={task.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={task.priority} />
                    </TableCell>
                    <TableCell>{relatedLabel(task)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TaskDialog
                          mode="edit"
                          taskId={task.id}
                          {...dialogProps}
                          defaultValues={{
                            title: task.title,
                            description: task.description ?? "",
                            dueDate: task.dueDate
                              ? new Date(task.dueDate)
                              : null,
                            status: task.status as never,
                            priority: task.priority as never,
                            relatedUniversityId: task.relatedUniversityId,
                            relatedProgramId: task.relatedProgramId,
                            relatedScholarshipId: task.relatedScholarshipId,
                            relatedProfessorId: task.relatedProfessorId,
                          }}
                          triggerLabel="Edit"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={pending && pendingId === task.id}
                          onClick={() => onDelete(task.id)}
                          aria-label="Delete task"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>{format(month, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setMonth(
                    startOfMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    ),
                  )
                }
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setMonth(startOfMonth(new Date()))}
              >
                Today
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setMonth(
                    startOfMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    ),
                  )
                }
              >
                Next
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="bg-muted/40 px-2 py-1.5 text-center text-xs font-medium"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day) => {
                const dayTasks = filtered.filter(
                  (task) => task.dueDate && isSameDay(new Date(task.dueDate), day),
                );
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-24 bg-background p-1.5",
                      !isSameMonth(day, month) && "bg-muted/20 text-muted-foreground",
                    )}
                  >
                    <div className="mb-1 text-xs font-medium">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-foreground"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 ? (
                        <p className="text-[10px] text-muted-foreground">
                          +{dayTasks.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
