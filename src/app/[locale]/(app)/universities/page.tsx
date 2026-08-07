import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { listCities } from "@/actions/cities";
import { listUniversities } from "@/actions/universities";
import { UniversitiesTable } from "@/components/universities/universities-table";
import { PageHeader } from "@/components/shared/page-header";
import { prepareLocalePage } from "@/lib/page";

export default async function UniversitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.universities");

  const [universities, countries, cities] = await Promise.all([
    listUniversities(),
    listCountries(),
    listCities(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <UniversitiesTable
        universities={universities}
        countries={countries.map((country) => ({
          id: country.id,
          name: country.name,
        }))}
        cities={cities.map((city) => ({
          id: city.id,
          name: city.name,
          countryId: city.countryId,
        }))}
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
