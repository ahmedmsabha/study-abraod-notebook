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
import { UniversityForm } from "@/components/universities/university-form";
import type { UniversityCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

type UniversityDialogProps = {
  mode?: "create" | "edit";
  universityId?: string;
  countries: Option[];
  cities: Array<Option & { countryId: string }>;
  defaultValues?: Partial<UniversityCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
};

export function UniversityDialog({
  mode = "create",
  universityId,
  countries,
  cities,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: UniversityDialogProps) {
  const [open, setOpen] = useState(defaultOpen);

  const label =
    triggerLabel ?? (mode === "create" ? "Add university" : "Edit university");

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
            {mode === "create" ? "Add university" : "Edit university"}
          </DialogTitle>
          <DialogDescription>
            Shortlist schools and track admissions status.
          </DialogDescription>
        </DialogHeader>
        <UniversityForm
          mode={mode}
          universityId={universityId}
          countries={countries}
          cities={cities}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
