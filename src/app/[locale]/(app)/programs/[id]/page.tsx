import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProgram } from "@/actions/programs";
import { listUniversities } from "@/actions/universities";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgramDialog } from "@/components/programs/program-dialog";
import { DeleteProgramButton } from "@/components/programs/delete-program-button";
import { RequirementChecklist } from "@/components/programs/requirement-checklist";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate, labelize } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");

  const [program, universities] = await Promise.all([
    getProgram(id),
    listUniversities(),
  ]);
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={program.name}
        description={`${program.university.name} · ${program.university.country.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={program.degreeType} />
            <StatusBadge value={program.mode} />
            <DeadlineBadge date={program.applicationDeadline} />
            <ProgramDialog
              mode="edit"
              programId={program.id}
              universities={universities.map((university) => ({
                id: university.id,
                name: university.name,
              }))}
              defaultValues={{
                universityId: program.universityId,
                name: program.name,
                degreeType: program.degreeType,
                department: program.department ?? "",
                mode: program.mode,
                duration: program.duration ?? "",
                officialUrl: program.officialUrl ?? "",
                applicationDeadline: program.applicationDeadline,
                intakeTerm: program.intakeTerm ?? "",
                tuitionAmount: program.tuitionAmount
                  ? Number(program.tuitionAmount)
                  : null,
                currency: program.currency ?? "",
                minimumGpa: program.minimumGpa ?? "",
                languageRequirement: program.languageRequirement ?? "",
                greRequired: program.greRequired,
                supervisorRequired: program.supervisorRequired,
                applicationFee: program.applicationFee
                  ? Number(program.applicationFee)
                  : null,
                requiredDocuments: program.requiredDocuments ?? "",
                suitableForMeScore: program.suitableForMeScore,
                fitReason: program.fitReason ?? "",
                notes: program.notes ?? "",
              }}
              triggerLabel={t("edit")}
            />
            <DeleteProgramButton id={program.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SourceCallout variant="official">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Deadline: </span>
              {formatDate(program.applicationDeadline)}
            </p>
            <p>
              <span className="font-medium">Language: </span>
              {program.languageRequirement || "—"}
            </p>
            <p>
              <span className="font-medium">GPA: </span>
              {program.minimumGpa || "—"}
            </p>
            <p>
              <span className="font-medium">Supervisor required: </span>
              {program.supervisorRequired ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Official URL: </span>
              {program.officialUrl ? (
                <a
                  href={program.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Open
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>
        </SourceCallout>
        <SourceCallout variant="note">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Fit score: </span>
              {program.suitableForMeScore ?? "—"} / 10
            </p>
            <p className="whitespace-pre-wrap">
              {program.fitReason || "No fit reason yet."}
            </p>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {program.notes || ""}
            </p>
          </div>
        </SourceCallout>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirements checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <RequirementChecklist
            programId={program.id}
            requirements={program.requirements}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Linked professors ({program.professors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {program.professors.length === 0 ? (
              <EmptyState
                title="No linked professors"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              program.professors.map((professor) => (
                <Link
                  key={professor.id}
                  href={`/professors/${professor.id}`}
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {professor.fullName}
                  <span className="ms-2 text-muted-foreground">
                    {labelize(professor.contactStatus)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Applications ({program.applications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {program.applications.length === 0 ? (
              <EmptyState
                title="No applications"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              program.applications.map((application) => (
                <Link
                  key={application.id}
                  href="/applications"
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {labelize(application.status)}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
