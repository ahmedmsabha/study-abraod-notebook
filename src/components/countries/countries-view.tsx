"use client";

import { useState } from "react";
import { LayoutGrid, TableIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { CountryDialog } from "@/components/countries/country-dialog";

type CountryRow = {
  id: string;
  name: string;
  code: string;
  region: string | null;
  currency: string | null;
  _count: {
    cities: number;
    universities: number;
    scholarships: number;
  };
};

export function CountriesView({ countries }: { countries: CountryRow[] }) {
  const [view, setView] = useState<"grid" | "table">("grid");

  if (countries.length === 0) {
    return (
      <EmptyState
        title="No countries yet"
        description="Add your first study destination to start organizing research."
        action={<CountryDialog />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {countries.length} {countries.length === 1 ? "country" : "countries"}
        </p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            <Button
              type="button"
              size="icon-sm"
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => setView("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={view === "table" ? "secondary" : "ghost"}
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <TableIcon className="size-3.5" />
            </Button>
          </div>
          <CountryDialog />
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {countries.map((country) => (
            <Link key={country.id} href={`/countries/${country.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{country.name}</CardTitle>
                    <Badge variant="outline">{country.code}</Badge>
                  </div>
                  <CardDescription>
                    {country.region ?? "Region unset"}
                    {country.currency ? ` · ${country.currency}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{country._count.universities} universities</span>
                  <span>·</span>
                  <span>{country._count.cities} cities</span>
                  <span>·</span>
                  <span>{country._count.scholarships} scholarships</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Universities</TableHead>
                <TableHead>Cities</TableHead>
                <TableHead>Scholarships</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell>
                    <Link
                      href={`/countries/${country.id}`}
                      className="font-medium hover:underline"
                    >
                      {country.name}
                    </Link>
                  </TableCell>
                  <TableCell>{country.code}</TableCell>
                  <TableCell>{country.region ?? "—"}</TableCell>
                  <TableCell>{country._count.universities}</TableCell>
                  <TableCell>{country._count.cities}</TableCell>
                  <TableCell>{country._count.scholarships}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
