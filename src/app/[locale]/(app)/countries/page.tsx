import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { CountriesView } from "@/components/countries/countries-view";
import { PageHeader } from "@/components/shared/page-header";
import { prepareLocalePage } from "@/lib/page";

export default async function CountriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await prepareLocalePage(params);
  const t = await getTranslations("Pages.countries");
  const countries = await listCountries();

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CountriesView countries={countries} />
    </div>
  );
}
