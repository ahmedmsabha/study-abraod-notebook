"use client";

import { useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deletePlace } from "@/actions/places";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PlaceDialog } from "@/components/local-life/place-dialog";
import { CityDialog } from "@/components/cities/city-dialog";
import { labelize } from "@/lib/format";
import { PlaceCategory } from "../../../generated/prisma/enums";

export type PlaceRow = {
  id: string;
  name: string;
  category: string;
  mapUrl: string | null;
  websiteUrl: string | null;
  priceLevel: string | null;
  notes: string | null;
  rating: number | null;
  cityId: string;
  city: {
    id: string;
    name: string;
    country: { id: string; name: string; code: string };
  };
};

type Option = { id: string; name: string };
type CityOption = Option & { countryId: string };

export function LocalLifeView({
  places,
  countries,
  cities,
  defaultOpenCreate = false,
}: {
  places: PlaceRow[];
  countries: Option[];
  cities: CityOption[];
  defaultOpenCreate?: boolean;
}) {
  const router = useRouter();
  const [countryId, setCountryId] = useState("all");
  const [cityId, setCityId] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cityOptions = useMemo(() => {
    if (countryId === "all") return cities;
    return cities.filter((city) => city.countryId === countryId);
  }, [cities, countryId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((place) => {
      if (countryId !== "all" && place.city.country.id !== countryId) {
        return false;
      }
      if (cityId !== "all" && place.cityId !== cityId) return false;
      if (category !== "all" && place.category !== category) return false;
      if (!q) return true;
      return (
        place.name.toLowerCase().includes(q) ||
        place.city.name.toLowerCase().includes(q) ||
        (place.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [places, countryId, cityId, category, query]);

  function onDelete(id: string) {
    if (!window.confirm("Delete this place?")) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deletePlace(id);
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Place deleted");
      router.refresh();
    });
  }

  if (places.length === 0 && cities.length === 0) {
    return (
      <EmptyState
        title="No cities yet"
        description="Add a city first, then log restaurants, groceries, and housing notes."
        action={
          countries.length === 0 ? undefined : (
            <CityDialog countries={countries} />
          )
        }
      />
    );
  }

  if (places.length === 0) {
    return (
      <EmptyState
        title="No places yet"
        description="Save restaurants, groceries, study spaces, and housing notes."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CityDialog countries={countries} triggerVariant="outline" />
            <PlaceDialog cities={cities} defaultOpen={defaultOpenCreate} />
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places…"
            className="max-w-xs"
          />
          <Select
            value={countryId}
            onValueChange={(value) => {
              setCountryId(value ?? "all");
              setCityId("all");
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={cityId}
            onValueChange={(value) => setCityId(value ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cityOptions.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "all")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.values(PlaceCategory).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <CityDialog countries={countries} triggerVariant="outline" />
          <PlaceDialog cities={cities} defaultOpen={defaultOpenCreate} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try another country, city, or category."
            className="sm:col-span-2 xl:col-span-3"
          />
        ) : (
          filtered.map((place) => (
            <Card key={place.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={place.category} />
                  {place.priceLevel ? (
                    <span className="text-xs text-muted-foreground">
                      {place.priceLevel}
                    </span>
                  ) : null}
                  {place.rating != null ? (
                    <span className="text-xs text-muted-foreground">
                      ★ {place.rating}
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-base">{place.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {place.city.name}, {place.city.country.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-note/60 bg-note px-3 py-2 text-note-foreground">
                  <p className="mb-1 text-xs font-medium">Your note</p>
                  <p className="whitespace-pre-wrap text-sm">
                    {place.notes || "No personal notes yet."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {place.mapUrl ? (
                    <a
                      href={place.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Map
                    </a>
                  ) : null}
                  {place.websiteUrl ? (
                    <a
                      href={place.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <PlaceDialog
                    mode="edit"
                    placeId={place.id}
                    cities={cities}
                    defaultValues={{
                      cityId: place.cityId,
                      name: place.name,
                      category: place.category as never,
                      mapUrl: place.mapUrl ?? "",
                      websiteUrl: place.websiteUrl ?? "",
                      priceLevel: place.priceLevel ?? "",
                      notes: place.notes ?? "",
                      rating: place.rating,
                    }}
                    triggerLabel="Edit"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={pending && pendingId === place.id}
                    onClick={() => onDelete(place.id)}
                    aria-label="Delete place"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
