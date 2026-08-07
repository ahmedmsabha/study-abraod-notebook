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
import { ApplicationForm } from "@/components/applications/application-form";
import type { ApplicationCreateInput } from "@/lib/validations";

type ProgramOption = {
  id: string;
  name: string;
  universityName: string;
};

export function ApplicationDialog({
  mode = "create",
  applicationId,
  programs,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  applicationId?: string;
  programs: ProgramOption[];
  defaultValues?: Partial<ApplicationCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label =
    triggerLabel ??
    (mode === "create" ? "Add application" : "Edit application");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        {mode === "create" ? (
          <Plus className="size-3.5" data-icon="inline-start" />
        ) : null}
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add application" : "Edit application"}
          </DialogTitle>
          <DialogDescription>
            Track each program through the admissions pipeline.
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm
          mode={mode}
          applicationId={applicationId}
          programs={programs}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
