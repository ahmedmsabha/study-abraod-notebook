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
import { ProfessorForm } from "@/components/professors/professor-form";
import type { ProfessorCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function ProfessorDialog({
  mode = "create",
  professorId,
  universities,
  programs,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  professorId?: string;
  universities: Option[];
  programs?: Option[];
  defaultValues?: Partial<ProfessorCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const label =
    triggerLabel ?? (mode === "create" ? "Add professor" : "Edit professor");

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
            {mode === "create" ? "Add professor" : "Edit professor"}
          </DialogTitle>
          <DialogDescription>
            Track research fit, links, and outreach status. Verify external facts
            before relying on them.
          </DialogDescription>
        </DialogHeader>
        <ProfessorForm
          mode={mode}
          professorId={professorId}
          universities={universities}
          programs={programs}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
