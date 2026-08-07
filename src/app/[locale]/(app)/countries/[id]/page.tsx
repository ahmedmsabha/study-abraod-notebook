import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCountry } from "@/actions/countries";
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
          <CardHeader>
            <CardTitle>Cities ({country.cities.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {country.cities.length === 0 ? (
              <EmptyState
                title="No cities"
                description="Add cities from Local Life later."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              country.cities.map((city) => (
                <div
                  key={city.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  {city.name}
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
