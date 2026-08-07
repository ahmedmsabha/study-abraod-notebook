import { DegreeType } from "../../../generated/prisma/enums";
import {
  PROGRAM_CSV_COLUMNS,
  type ProgramCsvRow,
} from "@/lib/csv/columns";
import { cell } from "@/lib/csv/download";
import { formatDate } from "@/lib/format";

export type ProgramExportSource = {
  name: string;
  degreeType: string;
  department?: string | null;
  officialUrl?: string | null;
  applicationDeadline: Date | string | null;
  currency?: string | null;
  tuitionAmount?: number | null;
  languageRequirement: string | null;
  minimumGpa?: string | null;
  supervisorRequired: boolean;
  requiredDocuments?: string | null;
  fitReason?: string | null;
  notes?: string | null;
  university: {
    name: string;
    country: { name: string };
  };
};

export function programToCsvRow(program: ProgramExportSource): ProgramCsvRow {
  const tuitionNotes =
    program.tuitionAmount != null
      ? `${program.tuitionAmount}${program.currency ? ` ${program.currency}` : ""}`
      : "";

  return {
    Country: program.university.country.name,
    "University Name": program.university.name,
    "Program Name": program.name,
    "Degree Type": program.degreeType,
    Department: cell(program.department),
    "Official URL": cell(program.officialUrl),
    Deadline:
      program.applicationDeadline == null
        ? ""
        : formatDate(program.applicationDeadline, "yyyy-MM-dd"),
    "Tuition Notes": tuitionNotes,
    "Language Requirement": cell(program.languageRequirement),
    "GPA Requirement": cell(program.minimumGpa),
    "Supervisor Required": program.supervisorRequired ? "TRUE" : "FALSE",
    "Required Documents": cell(program.requiredDocuments),
    "Fit Reason": cell(program.fitReason),
    Notes: cell(program.notes),
  };
}

export function programsToCsvRows(
  programs: ProgramExportSource[],
): ProgramCsvRow[] {
  return programs.map(programToCsvRow);
}

export { PROGRAM_CSV_COLUMNS };

function parseDegreeType(raw: string | undefined): string {
  if (!raw?.trim()) return DegreeType.Other;
  const normalized = raw.trim();
  const match = Object.values(DegreeType).find(
    (value) => value.toLowerCase() === normalized.toLowerCase(),
  );
  return match ?? DegreeType.Other;
}

function parseBool(raw: string | undefined): boolean {
  if (!raw?.trim()) return false;
  const value = raw.trim().toLowerCase();
  return value === "true" || value === "yes" || value === "1";
}

export type ParsedProgramImport = {
  universityName: string;
  countryName: string;
  name: string;
  degreeType: string;
  department: string | null;
  officialUrl: string | null;
  applicationDeadline: Date | null;
  tuitionNotes: string | null;
  languageRequirement: string | null;
  minimumGpa: string | null;
  supervisorRequired: boolean;
  requiredDocuments: string | null;
  fitReason: string | null;
  notes: string | null;
};

export function parseProgramCsvRow(
  row: Record<string, string>,
  rowIndex: number,
): { data?: ParsedProgramImport; error?: string } {
  const universityName = row["University Name"]?.trim() ?? "";
  const countryName = row.Country?.trim() ?? "";
  const name = row["Program Name"]?.trim() ?? "";

  if (!universityName || !countryName || !name) {
    return {
      error: `Row ${rowIndex + 2}: Country, University Name, and Program Name are required.`,
    };
  }

  const deadlineRaw = row.Deadline?.trim();
  let applicationDeadline: Date | null = null;
  if (deadlineRaw) {
    const parsed = new Date(deadlineRaw);
    if (Number.isNaN(parsed.getTime())) {
      return {
        error: `Row ${rowIndex + 2}: Invalid deadline "${deadlineRaw}".`,
      };
    }
    applicationDeadline = parsed;
  }

  return {
    data: {
      universityName,
      countryName,
      name,
      degreeType: parseDegreeType(row["Degree Type"]),
      department: row.Department?.trim() || null,
      officialUrl: row["Official URL"]?.trim() || null,
      applicationDeadline,
      tuitionNotes: row["Tuition Notes"]?.trim() || null,
      languageRequirement: row["Language Requirement"]?.trim() || null,
      minimumGpa: row["GPA Requirement"]?.trim() || null,
      supervisorRequired: parseBool(row["Supervisor Required"]),
      requiredDocuments: row["Required Documents"]?.trim() || null,
      fitReason: row["Fit Reason"]?.trim() || null,
      notes: row.Notes?.trim() || null,
    },
  };
}
