import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardLists } from "@/components/dashboard/dashboard-lists";
import {
  GlobalSearch,
  type SearchItem,
} from "@/components/dashboard/global-search";
import { getDashboardData } from "@/lib/data/dashboard";
import { prepareLocalePage } from "@/lib/page";
import { listCountries } from "@/actions/countries";
import { listUniversities } from "@/actions/universities";
import { listPrograms } from "@/actions/programs";
import { listProfessors } from "@/actions/professors";
import { listScholarships } from "@/actions/scholarships";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await prepareLocalePage(params);
  const t = await getTranslations("Pages.dashboard");

  const [data, countries, universities, programs, professors, scholarships] =
    await Promise.all([
      getDashboardData(),
      listCountries(),
      listUniversities(),
      listPrograms(),
      listProfessors(),
      listScholarships(),
    ]);

  const searchItems: SearchItem[] = [
    ...countries.map((item) => ({
      id: item.id,
      type: "Country" as const,
      title: item.name,
      subtitle: item.code,
      href: `/countries/${item.id}`,
    })),
    ...universities.map((item) => ({
      id: item.id,
      type: "University" as const,
      title: item.name,
      subtitle: item.country.name,
      href: `/universities/${item.id}`,
    })),
    ...programs.map((item) => ({
      id: item.id,
      type: "Program" as const,
      title: item.name,
      subtitle: item.university.name,
      href: `/programs/${item.id}`,
    })),
    ...professors.map((item) => ({
      id: item.id,
      type: "Professor" as const,
      title: item.fullName,
      subtitle: item.university.name,
      href: `/professors/${item.id}`,
    })),
    ...scholarships.map((item) => ({
      id: item.id,
      type: "Scholarship" as const,
      title: item.name,
      subtitle: item.university?.name ?? item.country?.name,
      href: `/scholarships/${item.id}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <StatCards counts={data.counts} />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <PipelineChart pipeline={data.pipeline} />
        <div className="space-y-4">
          <QuickActions />
          <GlobalSearch items={searchItems} />
        </div>
      </div>
      <DashboardLists data={data} />
    </div>
  );
}
