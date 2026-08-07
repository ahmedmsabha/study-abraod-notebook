import { getTranslations } from "next-intl/server";
import { listApplications } from "@/actions/applications";
import { listPrograms } from "@/actions/programs";
import { ApplicationsBoard } from "@/components/applications/applications-board";
import { PageHeader } from "@/components/shared/page-header";
import { serializeApplicationForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.applications");

  const [applications, programs] = await Promise.all([
    listApplications(),
    listPrograms(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ApplicationsBoard
        applications={applications.map(serializeApplicationForClient)}
        programs={programs.map((program) => ({
          id: program.id,
          name: program.name,
          universityName: program.university.name,
        }))}
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
