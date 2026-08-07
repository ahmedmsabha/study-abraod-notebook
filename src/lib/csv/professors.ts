import {
  AcceptingStudents,
  ContactStatus,
} from "../../../generated/prisma/enums";
import {
  PROFESSOR_CSV_COLUMNS,
  type ProfessorCsvRow,
} from "@/lib/csv/columns";
import { cell } from "@/lib/csv/download";
import { universityLookupKey } from "@/lib/csv/lookup";

export { universityLookupKey };

export type ProfessorExportSource = {
  fullName: string;
  generalSpecialization: string | null;
  researchSpecializations: string[];
  linkedinUrl: string | null;
  officialProfileUrl: string | null;
  labUrl: string | null;
  googleScholarUrl: string | null;
  email: string | null;
  acceptingStudents: string;
  fitScore: number | null;
  contactStatus: string;
  notes: string | null;
  university: {
    name: string;
    country: { name: string };
  };
};

export function professorToCsvRow(
  professor: ProfessorExportSource,
): ProfessorCsvRow {
  return {
    "University Name": professor.university.name,
    Country: professor.university.country.name,
    "Professor Name": professor.fullName,
    "General Specialization": cell(professor.generalSpecialization),
    "Detailed Research Specialization": cell(
      professor.researchSpecializations,
    ),
    "LinkedIn URL": cell(professor.linkedinUrl),
    "Official Profile URL": cell(professor.officialProfileUrl),
    "Lab URL": cell(professor.labUrl),
    "Google Scholar URL": cell(professor.googleScholarUrl),
    Email: cell(professor.email),
    "Accepting Students": professor.acceptingStudents,
    "Fit Score": professor.fitScore == null ? "" : String(professor.fitScore),
    "Contact Status": professor.contactStatus,
    Notes: cell(professor.notes),
  };
}

export function professorsToCsvRows(
  professors: ProfessorExportSource[],
): ProfessorCsvRow[] {
  return professors.map(professorToCsvRow);
}

export { PROFESSOR_CSV_COLUMNS };

function parseEnum<T extends Record<string, string>>(
  enumObject: T,
  raw: string | undefined,
  fallback: T[keyof T],
): T[keyof T] {
  if (!raw?.trim()) return fallback;
  const normalized = raw.trim().toUpperCase().replaceAll(" ", "_");
  const values = Object.values(enumObject) as T[keyof T][];
  const match = values.find((value) => value === normalized);
  return match ?? fallback;
}

function parseScore(raw: string | undefined): number | null {
  if (!raw?.trim()) return null;
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < 1 || n > 10) return null;
  return n;
}

function splitList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export type ParsedProfessorImport = {
  universityName: string;
  countryName: string;
  fullName: string;
  generalSpecialization: string | null;
  researchSpecializations: string[];
  linkedinUrl: string | null;
  officialProfileUrl: string | null;
  labUrl: string | null;
  googleScholarUrl: string | null;
  email: string | null;
  acceptingStudents: (typeof AcceptingStudents)[keyof typeof AcceptingStudents];
  fitScore: number | null;
  contactStatus: (typeof ContactStatus)[keyof typeof ContactStatus];
  notes: string | null;
};

export function parseProfessorCsvRow(
  row: Record<string, string>,
  rowIndex: number,
): { data?: ParsedProfessorImport; error?: string } {
  const universityName = row["University Name"]?.trim() ?? "";
  const countryName = row.Country?.trim() ?? "";
  const fullName = row["Professor Name"]?.trim() ?? "";

  if (!universityName || !countryName || !fullName) {
    return {
      error: `Row ${rowIndex + 2}: University Name, Country, and Professor Name are required.`,
    };
  }

  const emailRaw = row.Email?.trim() || null;
  const linkedinUrl = row["LinkedIn URL"]?.trim() || null;
  const officialProfileUrl = row["Official Profile URL"]?.trim() || null;
  const labUrl = row["Lab URL"]?.trim() || null;
  const googleScholarUrl = row["Google Scholar URL"]?.trim() || null;

  return {
    data: {
      universityName,
      countryName,
      fullName,
      generalSpecialization: row["General Specialization"]?.trim() || null,
      researchSpecializations: splitList(
        row["Detailed Research Specialization"],
      ),
      linkedinUrl,
      officialProfileUrl,
      labUrl,
      googleScholarUrl,
      email: emailRaw,
      acceptingStudents: parseEnum(
        AcceptingStudents,
        row["Accepting Students"],
        AcceptingStudents.UNKNOWN,
      ),
      fitScore: parseScore(row["Fit Score"]),
      contactStatus: parseEnum(
        ContactStatus,
        row["Contact Status"],
        ContactStatus.NOT_CONTACTED,
      ),
      notes: row.Notes?.trim() || null,
    },
  };
}
