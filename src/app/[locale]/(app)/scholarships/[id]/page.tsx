import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getScholarship } from "@/actions/scholarships";
import { listCountries } from "@/actions/countries";
import { listPrograms } from "@/actions/programs";
import { listUniversities } from "@/actions/universities";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ScholarshipDialog } from "@/components/scholarships/scholarship-dialog";
import { DeleteScholarshipButton } from "@/components/scholarships/delete-scholarship-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";
import { decimalToNumber, formatDate, labelize } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");

  const [scholarship, countries, universities, programs] = await Promise.all([
    getScholarship(id),
    listCountries(),
    listUniversities(),
    listPrograms(),
  ]);
  if (!scholarship) notFound();

  const eligibilityItems = (scholarship.eligibility ?? "")
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  const relatedPrograms = scholarship.universityId
    ? programs.filter(
        (program) => program.universityId === scholarship.universityId,
      )
    : [];

  const valueAmount = decimalToNumber(scholarship.valueAmount);

  return (
    <div className="space-y-6">
      <PageHeader
        title={scholarship.name}
        description={[
          scholarship.provider,
          scholarship.country?.name,
          scholarship.university?.name,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={scholarship.status} />
            <DeadlineBadge date={scholarship.deadline} />
            <ScholarshipDialog
              mode="edit"
              scholarshipId={scholarship.id}
              countries={countries.map((country) => ({
                id: country.id,
                name: country.name,
              }))}
              universities={universities.map((university) => ({
                id: university.id,
                name: university.name,
                countryId: university.countryId,
              }))}
              defaultValues={{
                universityId: scholarship.universityId,
                countryId: scholarship.countryId,
                name: scholarship.name,
                provider: scholarship.provider ?? "",
                officialUrl: scholarship.officialUrl ?? "",
                fundingType: scholarship.fundingType,
                valueAmount,
                currency: scholarship.currency ?? "",
                coverageDescription: scholarship.coverageDescription ?? "",
                eligibility: scholarship.eligibility ?? "",
                deadline: scholarship.deadline,
                applicationMethod: scholarship.applicationMethod ?? "",
                status: scholarship.status,
                notes: scholarship.notes ?? "",
              }}
              triggerLabel={t("edit")}
            />
            <DeleteScholarshipButton id={scholarship.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SourceCallout variant="official">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Funding type: </span>
              {labelize(scholarship.fundingType)}
            </p>
            <p>
              <span className="font-medium">Value: </span>
              {valueAmount != null
                ? `${valueAmount}${scholarship.currency ? ` ${scholarship.currency}` : ""}`
                : "—"}
            </p>
            <p>
              <span className="font-medium">Deadline: </span>
              {formatDate(scholarship.deadline)}
            </p>
            <p>
              <span className="font-medium">Method: </span>
              {scholarship.applicationMethod || "—"}
            </p>
            <p>
              <span className="font-medium">Official URL: </span>
              {scholarship.officialUrl ? (
                <a
                  href={scholarship.officialUrl}
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
            <p className="whitespace-pre-wrap">
              <span className="font-medium">Coverage: </span>
              {scholarship.coverageDescription || "—"}
            </p>
          </div>
        </SourceCallout>
        <SourceCallout variant="note">
          <p className="whitespace-pre-wrap text-sm">
            {scholarship.notes || "No personal notes yet."}
          </p>
        </SourceCallout>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eligibility checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {eligibilityItems.length === 0 ? (
            <EmptyState
              title="No eligibility notes"
              description="Add line-separated eligibility items when editing."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            eligibilityItems.map((item) => (
              <label
                key={item}
                className="flex items-start gap-3 rounded-lg border px-3 py-2 text-sm"
              >
                <Checkbox className="mt-0.5" />
                <span>{item}</span>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Connected programs ({relatedPrograms.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {relatedPrograms.length === 0 ? (
              <EmptyState
                title="No connected programs"
                description="Programs at the linked university appear here."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              relatedPrograms.map((program) => (
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
            <CardTitle>Related tasks ({scholarship.tasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scholarship.tasks.length === 0 ? (
              <EmptyState
                title="No related tasks"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              scholarship.tasks.map((task) => (
                <Link
                  key={task.id}
                  href="/tasks"
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {task.title}
                  <span className="ms-2 text-muted-foreground">
                    {labelize(task.status)} · {formatDate(task.dueDate)}
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
