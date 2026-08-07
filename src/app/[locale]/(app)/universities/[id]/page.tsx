import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUniversity } from "@/actions/universities";
import { listCountries } from "@/actions/countries";
import { listCities } from "@/actions/cities";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { UniversityDialog } from "@/components/universities/university-dialog";
import { DeleteUniversityButton } from "@/components/universities/delete-university-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");

  const [university, countries, cities] = await Promise.all([
    getUniversity(id),
    listCountries(),
    listCities(),
  ]);
  if (!university) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={university.name}
        description={`${university.country.name}${
          university.city ? ` · ${university.city.name}` : ""
        }${
          university.facultyOrDepartment
            ? ` · ${university.facultyOrDepartment}`
            : ""
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={university.status} />
            <StatusBadge value={university.priority} />
            <UniversityDialog
              mode="edit"
              universityId={university.id}
              countries={countries.map((country) => ({
                id: country.id,
                name: country.name,
              }))}
              cities={cities.map((city) => ({
                id: city.id,
                name: city.name,
                countryId: city.countryId,
              }))}
              defaultValues={{
                countryId: university.countryId,
                cityId: university.cityId,
                name: university.name,
                officialWebsite: university.officialWebsite ?? "",
                facultyOrDepartment: university.facultyOrDepartment ?? "",
                universityRankingNotes: university.universityRankingNotes ?? "",
                tuitionNotes: university.tuitionNotes ?? "",
                applicationPortalUrl: university.applicationPortalUrl ?? "",
                internationalOfficeUrl: university.internationalOfficeUrl ?? "",
                notes: university.notes ?? "",
                status: university.status,
                priority: university.priority,
              }}
              triggerLabel={t("edit")}
            />
            <DeleteUniversityButton id={university.id} />
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="programs">
            Programs ({university.programs.length})
          </TabsTrigger>
          <TabsTrigger value="professors">
            Professors ({university.professors.length})
          </TabsTrigger>
          <TabsTrigger value="scholarships">
            Scholarships ({university.scholarships.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({university.linkedNotes.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({university.tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SourceCallout variant="official">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Website: </span>
                  {university.officialWebsite ? (
                    <a
                      href={university.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      {university.officialWebsite}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
                <p>
                  <span className="font-medium">Portal: </span>
                  {university.applicationPortalUrl || "—"}
                </p>
                <p>
                  <span className="font-medium">Tuition: </span>
                  {university.tuitionNotes || "—"}
                </p>
                <p>
                  <span className="font-medium">Ranking notes: </span>
                  {university.universityRankingNotes || "—"}
                </p>
              </div>
            </SourceCallout>
            <SourceCallout variant="note">
              <p className="text-sm whitespace-pre-wrap">
                {university.notes || "No personal notes yet."}
              </p>
            </SourceCallout>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="mt-4">
          <EntityList
            emptyTitle="No programs"
            items={university.programs.map((program) => ({
              id: program.id,
              title: program.name,
              meta: `${program.degreeType} · deadline ${formatDate(program.applicationDeadline)}`,
              href: `/programs/${program.id}`,
            }))}
          />
        </TabsContent>

        <TabsContent value="professors" className="mt-4">
          <EntityList
            emptyTitle="No professors"
            items={university.professors.map((professor) => ({
              id: professor.id,
              title: professor.fullName,
              meta: professor.generalSpecialization ?? professor.contactStatus,
              href: `/professors/${professor.id}`,
            }))}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4">
          <EntityList
            emptyTitle="No scholarships"
            items={university.scholarships.map((scholarship) => ({
              id: scholarship.id,
              title: scholarship.name,
              meta: formatDate(scholarship.deadline),
              href: `/scholarships/${scholarship.id}`,
            }))}
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <EntityList
            emptyTitle="No linked notes"
            items={university.linkedNotes.map((note) => ({
              id: note.id,
              title: note.title,
              meta: formatDate(note.updatedAt),
              href: `/notes/${note.id}`,
            }))}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <EntityList
            emptyTitle="No tasks"
            items={university.tasks.map((task) => ({
              id: task.id,
              title: task.title,
              meta: `${task.status} · ${formatDate(task.dueDate)}`,
              href: "/tasks",
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EntityList({
  items,
  emptyTitle,
}: {
  emptyTitle: string;
  items: Array<{ id: string; title: string; meta?: string; href: string }>;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        className="border-dashed"
        description="Related records will appear here."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{items.length} items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="block rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <p className="font-medium">{item.title}</p>
            {item.meta ? (
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            ) : null}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
