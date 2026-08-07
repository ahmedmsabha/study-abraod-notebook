import { format, formatDistanceToNow, isPast, differenceInCalendarDays } from "date-fns";

export function formatDate(
  value?: Date | string | null,
  pattern = "MMM d, yyyy",
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, pattern);
}

export function formatRelative(
  value?: Date | string | null,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function deadlineTone(
  value?: Date | string | null,
): "overdue" | "week" | "month" | "future" | "none" {
  if (!value) return "none";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "none";
  if (isPast(date)) return "overdue";
  const days = differenceInCalendarDays(date, new Date());
  if (days <= 7) return "week";
  if (days <= 30) return "month";
  return "future";
}

export function labelize(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function decimalToNumber(
  value: { toNumber?: () => number } | number | string | null | undefined,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof value.toNumber === "function") {
    const n = value.toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(String(value));
  return Number.isFinite(n) ? n : null;
}

/** Make Prisma rows safe to pass into Client Components (Decimal → number). */
export function serializeProgramForClient<
  T extends {
    tuitionAmount?: unknown;
    applicationFee?: unknown;
    applicationDeadline?: Date | string | null;
  },
>(program: T) {
  return {
    ...program,
    tuitionAmount: decimalToNumber(program.tuitionAmount as never),
    applicationFee: decimalToNumber(program.applicationFee as never),
    applicationDeadline: program.applicationDeadline
      ? new Date(program.applicationDeadline).toISOString()
      : null,
  };
}

export function serializeProfessorForClient<
  T extends {
    lastVerifiedAt?: Date | string | null;
  },
>(professor: T) {
  return {
    ...professor,
    lastVerifiedAt: professor.lastVerifiedAt
      ? new Date(professor.lastVerifiedAt).toISOString()
      : null,
  };
}

export function toIsoDate(
  value?: Date | string | null,
): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function toDateInputValue(value?: Date | string | null): string {
  const iso = toIsoDate(value);
  return iso ? iso.slice(0, 10) : "";
}

export function serializeScholarshipForClient<
  T extends {
    valueAmount?: unknown;
    deadline?: Date | string | null;
  },
>(scholarship: T) {
  return {
    ...scholarship,
    valueAmount: decimalToNumber(scholarship.valueAmount as never),
    deadline: toIsoDate(scholarship.deadline),
  };
}

export function serializeApplicationForClient<T extends {
  id: string;
  status: string;
  notes: string | null;
  submittedAt?: Date | string | null;
  decisionDate?: Date | string | null;
  program: {
    id: string;
    name: string;
    applicationDeadline?: Date | string | null;
    university: {
      id: string;
      name: string;
      country: { id: string; name: string; code: string };
    };
    tasks?: Array<{
      id: string;
      title: string;
      dueDate?: Date | string | null;
      status: string;
      priority: string;
    }>;
  };
}>(application: T) {
  return {
    id: application.id,
    status: application.status,
    notes: application.notes,
    submittedAt: toIsoDate(application.submittedAt),
    decisionDate: toIsoDate(application.decisionDate),
    program: {
      id: application.program.id,
      name: application.program.name,
      applicationDeadline: toIsoDate(application.program.applicationDeadline),
      university: application.program.university,
      tasks: (application.program.tasks ?? []).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: toIsoDate(task.dueDate),
      })),
    },
  };
}

export function serializeTaskForClient<
  T extends { dueDate?: Date | string | null },
>(task: T) {
  return {
    ...task,
    dueDate: toIsoDate(task.dueDate),
  };
}

export function serializeNoteForClient<
  T extends {
    createdAt?: Date | string;
    updatedAt?: Date | string;
  },
>(note: T) {
  return {
    ...note,
    createdAt: toIsoDate(note.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoDate(note.updatedAt) ?? new Date().toISOString(),
  };
}
