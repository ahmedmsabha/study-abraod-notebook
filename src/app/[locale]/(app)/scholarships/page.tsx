import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { listScholarships } from "@/actions/scholarships";
import { listUniversities } from "@/actions/universities";
import { ScholarshipsView } from "@/components/scholarships/scholarships-view";
import { PageHeader } from "@/components/shared/page-header";
import { serializeScholarshipForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function ScholarshipsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.scholarships");

  const [scholarships, countries, universities] = await Promise.all([
    listScholarships(),
    listCountries(),
    listUniversities(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ScholarshipsView
        scholarships={scholarships.map(serializeScholarshipForClient)}
        countries={countries.map((country) => ({
          id: country.id,
          name: country.name,
        }))}
        universities={universities.map((university) => ({
          id: university.id,
          name: university.name,
          countryId: university.countryId,
        }))}
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
