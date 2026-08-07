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
import { ProgramForm } from "@/components/programs/program-form";
import type { ProgramCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function ProgramDialog({
  mode = "create",
  programId,
  universities,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  programId?: string;
  universities: Option[];
  defaultValues?: Partial<ProgramCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const label =
    triggerLabel ?? (mode === "create" ? "Add program" : "Edit program");

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
            {mode === "create" ? "Add program" : "Edit program"}
          </DialogTitle>
          <DialogDescription>
            Track deadlines, fit, and admission requirements.
          </DialogDescription>
        </DialogHeader>
        <ProgramForm
          mode={mode}
          programId={programId}
          universities={universities}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
