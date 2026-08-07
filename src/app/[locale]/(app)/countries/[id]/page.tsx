import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCountry } from "@/actions/countries";
import { CityDialog } from "@/components/cities/city-dialog";
import { DeleteCityButton } from "@/components/cities/delete-city-button";
import { CountryDialog } from "@/components/countries/country-dialog";
import { DeleteCountryButton } from "@/components/countries/delete-country-button";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { prepareLocalePage } from "@/lib/page";

export default async function CountryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");
  const country = await getCountry(id);
  if (!country) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={country.name}
        description={`${country.region ?? "Region unset"}${
          country.currency ? ` · ${country.currency}` : ""
        }`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{country.code}</Badge>
            <CountryDialog
              mode="edit"
              countryId={country.id}
              defaultValues={{
                name: country.name,
                code: country.code,
                region: country.region ?? "",
                currency: country.currency ?? "",
                languageNotes: country.languageNotes ?? "",
                visaNotes: country.visaNotes ?? "",
                costOfLivingNotes: country.costOfLivingNotes ?? "",
                safetyNotes: country.safetyNotes ?? "",
                generalNotes: country.generalNotes ?? "",
              }}
              triggerLabel={t("edit")}
            />
            <DeleteCountryButton id={country.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SourceCallout variant="official">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Visa: </span>
              {country.visaNotes || "—"}
            </p>
            <p>
              <span className="font-medium">Language: </span>
              {country.languageNotes || "—"}
            </p>
            <p>
              <span className="font-medium">Cost of living: </span>
              {country.costOfLivingNotes || "—"}
            </p>
            <p>
              <span className="font-medium">Safety: </span>
              {country.safetyNotes || "—"}
            </p>
          </div>
        </SourceCallout>
        <SourceCallout variant="note">
          <p className="text-sm whitespace-pre-wrap">
            {country.generalNotes || "No personal notes yet."}
          </p>
        </SourceCallout>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle>Cities ({country.cities.length})</CardTitle>
            <CityDialog
              lockCountryId
              defaultValues={{ countryId: country.id }}
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {country.cities.length === 0 ? (
              <EmptyState
                title="No cities"
                description="Add a city to attach universities and local places."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              country.cities.map((city) => (
                <div
                  key={city.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <span>{city.name}</span>
                  <div className="flex flex-wrap gap-1.5">
                    <CityDialog
                      mode="edit"
                      cityId={city.id}
                      lockCountryId
                      defaultValues={{
                        countryId: country.id,
                        name: city.name,
                        costOfLivingEstimate: city.costOfLivingEstimate ?? "",
                        housingNotes: city.housingNotes ?? "",
                        transportNotes: city.transportNotes ?? "",
                        weatherNotes: city.weatherNotes ?? "",
                        safetyNotes: city.safetyNotes ?? "",
                      }}
                      triggerLabel={t("edit")}
                    />
                    <DeleteCityButton id={city.id} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Universities ({country.universities.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {country.universities.length === 0 ? (
              <EmptyState
                title="No universities"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              country.universities.map((university) => (
                <Link
                  key={university.id}
                  href={`/universities/${university.id}`}
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {university.name}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scholarships ({country.scholarships.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {country.scholarships.length === 0 ? (
              <EmptyState
                title="No scholarships"
                className="border-0 bg-transparent py-6"
              />
            ) : (
              country.scholarships.map((scholarship) => (
                <Link
                  key={scholarship.id}
                  href="/scholarships"
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  {scholarship.name}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
