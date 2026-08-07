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
import { NoteForm } from "@/components/notes/note-form";
import type { NoteCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function NoteDialog({
  mode = "create",
  noteId,
  countries,
  universities,
  programs,
  professors,
  scholarships,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  noteId?: string;
  countries: Option[];
  universities: Option[];
  programs: Option[];
  professors: Option[];
  scholarships: Option[];
  defaultValues?: Partial<NoteCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label = triggerLabel ?? (mode === "create" ? "Add note" : "Edit note");

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
            {mode === "create" ? "Add note" : "Edit note"}
          </DialogTitle>
          <DialogDescription>
            Markdown notes with tags and links to research entities.
          </DialogDescription>
        </DialogHeader>
        <NoteForm
          mode={mode}
          noteId={noteId}
          countries={countries}
          universities={universities}
          programs={programs}
          professors={professors}
          scholarships={scholarships}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
