"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ScholarshipDialog } from "@/components/scholarships/scholarship-dialog";
import { formatDate, labelize } from "@/lib/format";
import {
  FundingType,
  ScholarshipStatus,
} from "../../../generated/prisma/enums";

export type ScholarshipRow = {
  id: string;
  name: string;
  provider: string | null;
  fundingType: string;
  valueAmount: number | null;
  currency: string | null;
  deadline: string | null;
  status: string;
  country: { id: string; name: string; code: string } | null;
  university: { id: string; name: string } | null;
};

type Option = { id: string; name: string };

export function ScholarshipsView({
  scholarships,
  countries,
  universities,
  defaultOpenCreate = false,
}: {
  scholarships: ScholarshipRow[];
  countries: Option[];
  universities: Array<Option & { countryId: string }>;
  defaultOpenCreate?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("all");
  const [universityId, setUniversityId] = useState("all");
  const [fundingType, setFundingType] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<"table" | "cards">("table");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter((item) => {
      if (countryId !== "all" && item.country?.id !== countryId) return false;
      if (universityId !== "all" && item.university?.id !== universityId) {
        return false;
      }
      if (fundingType !== "all" && item.fundingType !== fundingType) {
        return false;
      }
      if (status !== "all" && item.status !== status) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.provider ?? "").toLowerCase().includes(q) ||
        (item.university?.name ?? "").toLowerCase().includes(q) ||
        (item.country?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [scholarships, query, countryId, universityId, fundingType, status]);

  if (scholarships.length === 0) {
    return (
      <EmptyState
        title="No scholarships yet"
        description="Track funding opportunities and approaching deadlines."
        action={
          <ScholarshipDialog
            countries={countries}
            universities={universities}
            defaultOpen={defaultOpenCreate}
          />
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
            placeholder="Search scholarships…"
            className="max-w-xs"
          />
          <Select
            value={countryId}
            onValueChange={(value) => setCountryId(value ?? "all")}
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
            value={universityId}
            onValueChange={(value) => setUniversityId(value ?? "all")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All universities</SelectItem>
              {universities.map((university) => (
                <SelectItem key={university.id} value={university.id}>
                  {university.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={fundingType}
            onValueChange={(value) => setFundingType(value ?? "all")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Funding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All funding</SelectItem>
              {Object.values(FundingType).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.values(ScholarshipStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === "table" ? "secondary" : "outline"}
            onClick={() => setView("table")}
          >
            <List className="size-3.5" data-icon="inline-start" />
            Table
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "cards" ? "secondary" : "outline"}
            onClick={() => setView("cards")}
          >
            <LayoutGrid className="size-3.5" data-icon="inline-start" />
            Cards
          </Button>
          <ScholarshipDialog
            countries={countries}
            universities={universities}
            defaultOpen={defaultOpenCreate}
          />
        </div>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scholarship</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No scholarships match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/scholarships/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.provider ? (
                        <p className="text-xs text-muted-foreground">
                          {item.provider}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.country?.name ?? "—"}</TableCell>
                    <TableCell>{item.university?.name ?? "—"}</TableCell>
                    <TableCell>{labelize(item.fundingType)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatDate(item.deadline)}</div>
                        <DeadlineBadge date={item.deadline} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.valueAmount != null
                        ? `${item.valueAmount}${item.currency ? ` ${item.currency}` : ""}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matches"
              description="Try clearing filters."
              className="sm:col-span-2 xl:col-span-3"
            />
          ) : (
            filtered.map((item) => (
              <Card key={item.id}>
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.status} />
                    <DeadlineBadge date={item.deadline} />
                  </div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/scholarships/${item.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>{item.provider || "Unknown provider"}</p>
                  <p>
                    {item.country?.name ?? "—"}
                    {item.university ? ` · ${item.university.name}` : ""}
                  </p>
                  <p>{labelize(item.fundingType)}</p>
                  <p>Deadline: {formatDate(item.deadline)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
