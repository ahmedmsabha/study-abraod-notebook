import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfessor } from "@/actions/professors";
import { listPrograms } from "@/actions/programs";
import { listUniversities } from "@/actions/universities";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { LastVerified } from "@/components/shared/last-verified";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfessorDialog } from "@/components/professors/professor-dialog";
import { DeleteProfessorButton } from "@/components/professors/delete-professor-button";
import { ContactLogSection } from "@/components/professors/contact-log-section";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate, labelize } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

function ExternalLink({
  href,
  children,
}: {
  href: string | null | undefined;
  children: ReactNode;
}) {
  if (!href) return <span>—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2"
    >
      {children}
    </a>
  );
}

export default async function ProfessorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");

  const [professor, universities, programs] = await Promise.all([
    getProfessor(id),
    listUniversities(),
    listPrograms(),
  ]);
  if (!professor) notFound();

  const universityPrograms = programs
    .filter((program) => program.universityId === professor.universityId)
    .map((program) => ({ id: program.id, name: program.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={professor.fullName}
        description={`${professor.university.name} · ${professor.university.country.name}${
          professor.title ? ` · ${professor.title}` : ""
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={professor.contactStatus} />
            <StatusBadge value={professor.acceptingStudents} />
            <LastVerified date={professor.lastVerifiedAt} />
            <ProfessorDialog
              mode="edit"
              professorId={professor.id}
              universities={universities.map((university) => ({
                id: university.id,
                name: university.name,
              }))}
              programs={universityPrograms}
              defaultValues={{
                universityId: professor.universityId,
                fullName: professor.fullName,
                title: professor.title ?? "",
                department: professor.department ?? "",
                generalSpecialization: professor.generalSpecialization ?? "",
                researchSpecializations: professor.researchSpecializations,
                researchKeywords: professor.researchKeywords,
                officialProfileUrl: professor.officialProfileUrl ?? "",
                labUrl: professor.labUrl ?? "",
                linkedinUrl: professor.linkedinUrl ?? "",
                googleScholarUrl: professor.googleScholarUrl ?? "",
                personalWebsiteUrl: professor.personalWebsiteUrl ?? "",
                email: professor.email ?? "",
                acceptingStudents: professor.acceptingStudents,
                lastVerifiedAt: professor.lastVerifiedAt,
                fitScore: professor.fitScore,
                fitReason: professor.fitReason ?? "",
                contactStatus: professor.contactStatus,
                notes: professor.notes ?? "",
                programIds: professor.programs.map((program) => program.id),
              }}
              triggerLabel={t("edit")}
            />
            <DeleteProfessorButton id={professor.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SourceCallout variant="official">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Department: </span>
              {professor.department || "—"}
            </p>
            <p>
              <span className="font-medium">General specialization: </span>
              {professor.generalSpecialization || "—"}
            </p>
            <p>
              <span className="font-medium">
                Detailed research specialization:{" "}
              </span>
              {professor.researchSpecializations.length > 0
                ? professor.researchSpecializations.join("; ")
                : "—"}
            </p>
            <p>
              <span className="font-medium">Keywords: </span>
              {professor.researchKeywords.length > 0
                ? professor.researchKeywords.join(", ")
                : "—"}
            </p>
            <p>
              <span className="font-medium">Email: </span>
              {professor.email || "—"}
            </p>
            <p>
              <span className="font-medium">Accepting students: </span>
              {labelize(professor.acceptingStudents)}
            </p>
            <p>
              <span className="font-medium">LinkedIn: </span>
              <ExternalLink href={professor.linkedinUrl}>Open</ExternalLink>
            </p>
            <p>
              <span className="font-medium">Official profile: </span>
              <ExternalLink href={professor.officialProfileUrl}>
                Open
              </ExternalLink>
            </p>
            <p>
              <span className="font-medium">Lab: </span>
              <ExternalLink href={professor.labUrl}>Open</ExternalLink>
            </p>
            <p>
              <span className="font-medium">Google Scholar: </span>
              <ExternalLink href={professor.googleScholarUrl}>
                Open
              </ExternalLink>
            </p>
            <p>
              <span className="font-medium">Personal site: </span>
              <ExternalLink href={professor.personalWebsiteUrl}>
                Open
              </ExternalLink>
            </p>
          </div>
        </SourceCallout>

        <SourceCallout variant="note">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Research fit score: </span>
              {professor.fitScore ?? "—"} / 10
            </p>
            <p className="whitespace-pre-wrap">
              <span className="font-medium">Why this professor fits me: </span>
              {professor.fitReason || "No fit reason yet."}
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {professor.notes || ""}
            </p>
          </div>
        </SourceCallout>
      </div>

      <ContactLogSection
        professorId={professor.id}
        logs={professor.contactLogs.map((log) => ({
          ...log,
          date: log.date.toISOString(),
          followUpDate: log.followUpDate
            ? log.followUpDate.toISOString()
            : null,
        }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Related programs ({professor.programs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {professor.programs.length === 0 ? (
              <EmptyState
                title="No linked programs"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              professor.programs.map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {program.name}
                  <span className="ms-2 text-muted-foreground">
                    {program.degreeType}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related tasks ({professor.tasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {professor.tasks.length === 0 ? (
              <EmptyState
                title="No related tasks"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              professor.tasks.map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {task.title}
                  <span className="ms-2 text-muted-foreground">
                    {labelize(task.status)}
                    {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
