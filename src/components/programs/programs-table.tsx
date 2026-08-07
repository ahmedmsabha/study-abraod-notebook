"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
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
import { DeadlineBadge, StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProgramDialog } from "@/components/programs/program-dialog";
import { ProgramsCsvTools } from "@/components/programs/programs-csv-tools";
import { formatDate, labelize } from "@/lib/format";
import { DegreeType } from "../../../generated/prisma/enums";

export type ProgramTableRow = {
  id: string;
  name: string;
  degreeType: string;
  mode: string;
  applicationDeadline: Date | string | null;
  tuitionAmount: number | null;
  currency: string | null;
  supervisorRequired: boolean;
  languageRequirement: string | null;
  suitableForMeScore: number | null;
  university: {
    id: string;
    name: string;
    status: string;
    country: { id: string; name: string; code: string };
  };
};

export function ProgramsTable({
  programs,
  universities,
  countries,
  defaultOpenCreate = false,
}: {
  programs: ProgramTableRow[];
  universities: Array<{ id: string; name: string }>;
  countries: Array<{ id: string; name: string }>;
  defaultOpenCreate?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("all");
  const [degreeType, setDegreeType] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((program) => {
      if (countryId !== "all" && program.university.country.id !== countryId) {
        return false;
      }
      if (degreeType !== "all" && program.degreeType !== degreeType) {
        return false;
      }
      if (!q) return true;
      return (
        program.name.toLowerCase().includes(q) ||
        program.university.name.toLowerCase().includes(q) ||
        program.university.country.name.toLowerCase().includes(q)
      );
    });
  }, [programs, query, countryId, degreeType]);

  if (programs.length === 0) {
    return (
      <EmptyState
        title="No programs yet"
        description="Add a program under a university to track deadlines and fit."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ProgramDialog
              universities={universities}
              defaultOpen={defaultOpenCreate}
            />
            <ProgramsCsvTools programs={[]} />
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search programs…"
            className="max-w-xs"
          />
          <Select value={countryId} onValueChange={(value) => setCountryId(value ?? "all")}>
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
          <Select value={degreeType} onValueChange={(value) => setDegreeType(value ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All degrees</SelectItem>
              {Object.values(DegreeType).map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProgramsCsvTools programs={filtered} />
          <ProgramDialog
            universities={universities}
            defaultOpen={defaultOpenCreate}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Degree</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Tuition</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Fit</TableHead>
              <TableHead>Uni status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No programs match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>{program.university.country.code}</TableCell>
                  <TableCell>
                    <Link
                      href={`/universities/${program.university.id}`}
                      className="hover:underline"
                    >
                      {program.university.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/programs/${program.id}`}
                      className="font-medium hover:underline"
                    >
                      {program.name}
                    </Link>
                  </TableCell>
                  <TableCell>{program.degreeType}</TableCell>
                  <TableCell>{labelize(program.mode)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{formatDate(program.applicationDeadline)}</div>
                      <DeadlineBadge date={program.applicationDeadline} />
                    </div>
                  </TableCell>
                  <TableCell>
                    {program.tuitionAmount != null
                      ? `${String(program.tuitionAmount)}${
                          program.currency ? ` ${program.currency}` : ""
                        }`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {program.supervisorRequired ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{program.languageRequirement ?? "—"}</TableCell>
                  <TableCell>{program.suitableForMeScore ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={program.university.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
