import Papa from "papaparse";

export function downloadCsv(
  filename: string,
  rows: Record<string, string | number | boolean | null | undefined>[],
  columns?: readonly string[],
) {
  const normalized = columns
    ? rows.map((row) => {
        const next: Record<string, string> = {};
        for (const column of columns) {
          const value = row[column];
          next[column] = value == null ? "" : String(value);
        }
        return next;
      })
    : rows;

  const csv = Papa.unparse(normalized, columns ? { columns: [...columns] } : undefined);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseCsvText<T extends Record<string, string>>(
  text: string,
): { rows: T[]; errors: string[] } {
  const result = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  const errors = result.errors.map(
    (error) => `Row ${error.row ?? "?"}: ${error.message}`,
  );

  return {
    rows: result.data.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim() !== ""),
    ),
    errors,
  };
}

export function cell(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}
