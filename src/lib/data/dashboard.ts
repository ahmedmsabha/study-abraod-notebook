import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "../../../generated/prisma/enums";

const PIPELINE_ORDER: ApplicationStatus[] = [
  "RESEARCHING",
  "PREPARING",
  "READY_TO_SUBMIT",
  "SUBMITTED",
  "INTERVIEW",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export async function getDashboardData() {
  const now = new Date();
  const in60Days = new Date(now);
  in60Days.setDate(in60Days.getDate() + 60);
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  const [
    universityCount,
    programCount,
    professorCount,
    scholarshipCount,
    applicationCount,
    openTaskCount,
    applicationsByStatus,
    upcomingProgramDeadlines,
    upcomingScholarshipDeadlines,
    professorsToContact,
    openTasks,
  ] = await Promise.all([
    prisma.university.count(),
    prisma.program.count(),
    prisma.professor.count(),
    prisma.scholarship.count(),
    prisma.application.count(),
    prisma.task.count({
      where: { status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.program.findMany({
      where: {
        applicationDeadline: { gte: now, lte: in60Days },
      },
      orderBy: { applicationDeadline: "asc" },
      take: 8,
      include: {
        university: {
          select: {
            id: true,
            name: true,
            country: { select: { name: true, code: true } },
          },
        },
      },
    }),
    prisma.scholarship.findMany({
      where: {
        deadline: { gte: now, lte: in60Days },
      },
      orderBy: { deadline: "asc" },
      take: 6,
      include: {
        university: { select: { name: true } },
        country: { select: { name: true, code: true } },
      },
    }),
    prisma.professor.findMany({
      where: {
        contactStatus: {
          in: ["NOT_CONTACTED", "FOLLOWING", "EMAIL_DRAFTED", "RESEARCHING"],
        },
      },
      orderBy: [{ fitScore: "desc" }, { updatedAt: "desc" }],
      take: 6,
      include: {
        university: {
          select: {
            name: true,
            country: { select: { name: true, code: true } },
          },
        },
      },
    }),
    prisma.task.findMany({
      where: {
        status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] },
        OR: [{ dueDate: null }, { dueDate: { lte: weekAhead } }],
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      take: 6,
    }),
  ]);

  const statusCounts = Object.fromEntries(
    PIPELINE_ORDER.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;

  for (const row of applicationsByStatus) {
    statusCounts[row.status] = row._count._all;
  }

  const pipeline = PIPELINE_ORDER.map((status) => ({
    status,
    count: statusCounts[status],
  }));

  return {
    counts: {
      universities: universityCount,
      programs: programCount,
      professors: professorCount,
      scholarships: scholarshipCount,
      applications: applicationCount,
      openTasks: openTaskCount,
    },
    pipeline,
    upcomingProgramDeadlines,
    upcomingScholarshipDeadlines,
    professorsToContact,
    openTasks,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
