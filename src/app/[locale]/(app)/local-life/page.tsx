import { getTranslations } from "next-intl/server";
import { listCities } from "@/actions/cities";
import { listCountries } from "@/actions/countries";
import { listPlaces } from "@/actions/places";
import { LocalLifeView } from "@/components/local-life/local-life-view";
import { PageHeader } from "@/components/shared/page-header";
import { prepareLocalePage } from "@/lib/page";

export default async function LocalLifePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.localLife");

  const [places, countries, cities] = await Promise.all([
    listPlaces(),
    listCountries(),
    listCities(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <LocalLifeView
        places={places}
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
