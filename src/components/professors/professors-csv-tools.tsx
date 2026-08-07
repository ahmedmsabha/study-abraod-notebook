"use client";

import { useRef, useTransition } from "react";
import { Download, FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { importProfessorsFromCsv } from "@/actions/professors";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  downloadCsv,
  parseCsvText,
  PROFESSOR_CSV_COLUMNS,
  professorsToCsvRows,
  type ProfessorExportSource,
} from "@/lib/csv";
import { cn } from "@/lib/utils";

export function ProfessorsCsvTools({
  professors,
}: {
  professors: ProfessorExportSource[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function exportFiltered() {
    if (professors.length === 0) {
      toast.error("No professors to export with the current filters.");
      return;
    }
    downloadCsv(
      `professors-export-${new Date().toISOString().slice(0, 10)}.csv`,
      professorsToCsvRows(professors),
      PROFESSOR_CSV_COLUMNS,
    );
    toast.success(`Exported ${professors.length} professor(s)`);
  }

  function onFileSelected(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const text = await file.text();
      const { rows, errors } = parseCsvText<Record<string, string>>(text);
      if (errors.length > 0) {
        toast.error(errors[0] ?? "CSV parse failed");
        return;
      }
      if (rows.length === 0) {
        toast.error("CSV has no data rows.");
        return;
      }

      const result = await importProfessorsFromCsv(rows);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { created, skipped, errors: importErrors } = result.data;
      if (created > 0) {
        toast.success(`Imported ${created} professor(s)${skipped ? `, skipped ${skipped}` : ""}`);
      } else {
        toast.error(`No professors imported. Skipped ${skipped}.`);
      }
      if (importErrors[0]) {
        toast.message(importErrors[0], {
          description:
            importErrors.length > 1
              ? `+${importErrors.length - 1} more issue(s)`
              : undefined,
        });
      }
      router.refresh();
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={exportFiltered}
        disabled={pending}
      >
        <Download className="size-3.5" data-icon="inline-start" />
        Export CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" data-icon="inline-start" />
        Import CSV
      </Button>
      <a
        href="/templates/professors-template.csv"
        download
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        <FileDown className="size-3.5" data-icon="inline-start" />
        Template
      </a>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => onFileSelected(event.target.files?.[0])}
      />
    </div>
  );
}
