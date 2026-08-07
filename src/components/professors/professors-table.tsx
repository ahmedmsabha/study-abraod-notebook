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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfessorDialog } from "@/components/professors/professor-dialog";
import { ProfessorsCsvTools } from "@/components/professors/professors-csv-tools";
import { formatDate, labelize } from "@/lib/format";
import {
  AcceptingStudents,
  ContactStatus,
} from "../../../generated/prisma/enums";

export type ProfessorTableRow = {
  id: string;
  fullName: string;
  generalSpecialization: string | null;
  researchSpecializations: string[];
  researchKeywords: string[];
  linkedinUrl: string | null;
  officialProfileUrl: string | null;
  labUrl: string | null;
  googleScholarUrl: string | null;
  email: string | null;
  acceptingStudents: string;
  fitScore: number | null;
  contactStatus: string;
  lastVerifiedAt: string | null;
  notes: string | null;
  university: {
    id: string;
    name: string;
    country: { id: string; name: string; code: string };
  };
};

type Option = { id: string; name: string };

function ExternalLink({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (!href) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm underline underline-offset-2"
    >
      {label}
    </a>
  );
}

export function ProfessorsTable({
  professors,
  universities,
  countries,
  defaultOpenCreate = false,
}: {
  professors: ProfessorTableRow[];
  universities: Option[];
  countries: Option[];
  defaultOpenCreate?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("all");
  const [universityId, setUniversityId] = useState("all");
  const [contactStatus, setContactStatus] = useState("all");
  const [acceptingStudents, setAcceptingStudents] = useState("all");
  const [specialization, setSpecialization] = useState("");
  const [keyword, setKeyword] = useState("");

  const universityOptions = useMemo(() => {
    if (countryId === "all") return universities;
    const idsInCountry = new Set(
      professors
        .filter((professor) => professor.university.country.id === countryId)
        .map((professor) => professor.university.id),
    );
    return universities.filter((university) => idsInCountry.has(university.id));
  }, [universities, countryId, professors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const spec = specialization.trim().toLowerCase();
    const kw = keyword.trim().toLowerCase();

    return professors.filter((professor) => {
      if (
        countryId !== "all" &&
        professor.university.country.id !== countryId
      ) {
        return false;
      }
      if (universityId !== "all" && professor.university.id !== universityId) {
        return false;
      }
      if (contactStatus !== "all" && professor.contactStatus !== contactStatus) {
        return false;
      }
      if (
        acceptingStudents !== "all" &&
        professor.acceptingStudents !== acceptingStudents
      ) {
        return false;
      }
      if (
        spec &&
        !(professor.generalSpecialization ?? "").toLowerCase().includes(spec)
      ) {
        return false;
      }
      if (kw) {
        const haystack = [
          ...professor.researchKeywords,
          ...professor.researchSpecializations,
          professor.generalSpecialization ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      if (!q) return true;
      return (
        professor.fullName.toLowerCase().includes(q) ||
        professor.university.name.toLowerCase().includes(q) ||
        professor.university.country.name.toLowerCase().includes(q) ||
        (professor.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [
    professors,
    query,
    countryId,
    universityId,
    contactStatus,
    acceptingStudents,
    specialization,
    keyword,
  ]);

  if (professors.length === 0) {
    return (
      <EmptyState
        title="No professors yet"
        description="Add supervisors manually or import from the CSV template."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ProfessorDialog
              universities={universities}
              defaultOpen={defaultOpenCreate}
            />
            <ProfessorsCsvTools professors={[]} />
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search professors…"
            className="max-w-xs"
          />
          <Select
            value={countryId}
            onValueChange={(value) => {
              setCountryId(value ?? "all");
              setUniversityId("all");
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
            value={universityId}
            onValueChange={(value) => setUniversityId(value ?? "all")}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All universities</SelectItem>
              {universityOptions.map((university) => (
                <SelectItem key={university.id} value={university.id}>
                  {university.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            placeholder="General specialization"
            className="max-w-[12rem]"
          />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Research keyword"
            className="max-w-[11rem]"
          />
          <Select
            value={acceptingStudents}
            onValueChange={(value) => setAcceptingStudents(value ?? "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Accepting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any accepting</SelectItem>
              {Object.values(AcceptingStudents).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={contactStatus}
            onValueChange={(value) => setContactStatus(value ?? "all")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Contact status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any contact status</SelectItem>
              {Object.values(ContactStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ProfessorsCsvTools professors={filtered} />
          <ProfessorDialog
            universities={universities}
            defaultOpen={defaultOpenCreate}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {professors.length} professors
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>University Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Professor Name</TableHead>
              <TableHead>General Specialization</TableHead>
              <TableHead>Detailed Research Specialization</TableHead>
              <TableHead>LinkedIn URL</TableHead>
              <TableHead>Official Profile</TableHead>
              <TableHead>Lab Website</TableHead>
              <TableHead>Google Scholar</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Accepting Students</TableHead>
              <TableHead>Fit Score</TableHead>
              <TableHead>Contact Status</TableHead>
              <TableHead>Last Verified</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="h-24 text-center">
                  No professors match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((professor) => (
                <TableRow key={professor.id}>
                  <TableCell>
                    <Link
                      href={`/universities/${professor.university.id}`}
                      className="hover:underline"
                    >
                      {professor.university.name}
                    </Link>
                  </TableCell>
                  <TableCell>{professor.university.country.name}</TableCell>
                  <TableCell>
                    <Link
                      href={`/professors/${professor.id}`}
                      className="font-medium hover:underline"
                    >
                      {professor.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {professor.generalSpecialization ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[16rem] whitespace-normal">
                    {professor.researchSpecializations.length > 0
                      ? professor.researchSpecializations.join("; ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <ExternalLink href={professor.linkedinUrl} label="LinkedIn" />
                  </TableCell>
                  <TableCell>
                    <ExternalLink
                      href={professor.officialProfileUrl}
                      label="Profile"
                    />
                  </TableCell>
                  <TableCell>
                    <ExternalLink href={professor.labUrl} label="Lab" />
                  </TableCell>
                  <TableCell>
                    <ExternalLink
                      href={professor.googleScholarUrl}
                      label="Scholar"
                    />
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate">
                    {professor.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={professor.acceptingStudents} />
                  </TableCell>
                  <TableCell>{professor.fitScore ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={professor.contactStatus} />
                  </TableCell>
                  <TableCell>
                    {formatDate(professor.lastVerifiedAt)}
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate">
                    {professor.notes ?? "—"}
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
