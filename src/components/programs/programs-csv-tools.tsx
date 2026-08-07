"use client";

import { useRef, useTransition } from "react";
import { Download, FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { importProgramsFromCsv } from "@/actions/programs";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  downloadCsv,
  parseCsvText,
  PROGRAM_CSV_COLUMNS,
  programsToCsvRows,
  type ProgramExportSource,
} from "@/lib/csv";
import { cn } from "@/lib/utils";

export function ProgramsCsvTools({
  programs,
}: {
  programs: ProgramExportSource[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function exportFiltered() {
    if (programs.length === 0) {
      toast.error("No programs to export with the current filters.");
      return;
    }
    downloadCsv(
      `programs-export-${new Date().toISOString().slice(0, 10)}.csv`,
      programsToCsvRows(programs),
      PROGRAM_CSV_COLUMNS,
    );
    toast.success(`Exported ${programs.length} program(s)`);
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

      const result = await importProgramsFromCsv(rows);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { created, skipped, requirementsCreated, errors: importErrors } =
        result.data;
      if (created > 0) {
        toast.success(
          `Imported ${created} program(s)${
            requirementsCreated
              ? `, ${requirementsCreated} requirement(s)`
              : ""
          }${skipped ? `, skipped ${skipped}` : ""}`,
        );
      } else {
        toast.error(`No programs imported. Skipped ${skipped}.`);
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
        href="/templates/programs-template.csv"
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
