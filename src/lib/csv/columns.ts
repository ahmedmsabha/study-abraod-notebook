/** Canonical CSV column headers (match public/templates). */

export const PROFESSOR_CSV_COLUMNS = [
  "University Name",
  "Country",
  "Professor Name",
  "General Specialization",
  "Detailed Research Specialization",
  "LinkedIn URL",
  "Official Profile URL",
  "Lab URL",
  "Google Scholar URL",
  "Email",
  "Accepting Students",
  "Fit Score",
  "Contact Status",
  "Notes",
] as const;

export type ProfessorCsvColumn = (typeof PROFESSOR_CSV_COLUMNS)[number];

export type ProfessorCsvRow = Record<ProfessorCsvColumn, string>;

export const PROGRAM_CSV_COLUMNS = [
  "Country",
  "University Name",
  "Program Name",
  "Degree Type",
  "Department",
  "Official URL",
  "Deadline",
  "Tuition Notes",
  "Language Requirement",
  "GPA Requirement",
  "Supervisor Required",
  "Required Documents",
  "Fit Reason",
  "Notes",
] as const;

export type ProgramCsvColumn = (typeof PROGRAM_CSV_COLUMNS)[number];

export type ProgramCsvRow = Record<ProgramCsvColumn, string>;
