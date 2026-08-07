"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScholarshipForm } from "@/components/scholarships/scholarship-form";
import type { ScholarshipCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function ScholarshipDialog({
  mode = "create",
  scholarshipId,
  countries,
  universities,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  scholarshipId?: string;
  countries: Option[];
  universities: Array<Option & { countryId: string }>;
  defaultValues?: Partial<ScholarshipCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label =
    triggerLabel ??
    (mode === "create" ? "Add scholarship" : "Edit scholarship");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        {mode === "create" ? (
          <Plus className="size-3.5" data-icon="inline-start" />
        ) : null}
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add scholarship" : "Edit scholarship"}
          </DialogTitle>
          <DialogDescription>
            Track funding deadlines, eligibility, and application status.
          </DialogDescription>
        </DialogHeader>
        <ScholarshipForm
          mode={mode}
          scholarshipId={scholarshipId}
          countries={countries}
          universities={universities}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
