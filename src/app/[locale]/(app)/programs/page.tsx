import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { listPrograms } from "@/actions/programs";
import { listUniversities } from "@/actions/universities";
import { ProgramsTable } from "@/components/programs/programs-table";
import { PageHeader } from "@/components/shared/page-header";
import { serializeProgramForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ProgramsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.programs");

  const [programs, universities, countries] = await Promise.all([
    listPrograms(),
    listUniversities(),
    listCountries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ProgramsTable
        programs={programs.map(serializeProgramForClient)}
        universities={universities.map((university) => ({
          id: university.id,
          name: university.name,
        }))}
        countries={countries.map((country) => ({
          id: country.id,
          name: country.name,
        }))}
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
