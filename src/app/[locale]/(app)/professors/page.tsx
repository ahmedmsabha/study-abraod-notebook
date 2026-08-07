import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { listProfessors } from "@/actions/professors";
import { listUniversities } from "@/actions/universities";
import { ProfessorsTable } from "@/components/professors/professors-table";
import { PageHeader } from "@/components/shared/page-header";
import { serializeProfessorForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ProfessorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.professors");

  const [professors, universities, countries] = await Promise.all([
    listProfessors(),
    listUniversities(),
    listCountries(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ProfessorsTable
        professors={professors.map(serializeProfessorForClient)}
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
