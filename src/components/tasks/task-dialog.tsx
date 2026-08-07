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
import { TaskForm } from "@/components/tasks/task-form";
import type { TaskCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function TaskDialog({
  mode = "create",
  taskId,
  universities,
  programs,
  scholarships,
  professors,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  taskId?: string;
  universities: Option[];
  programs: Option[];
  scholarships: Option[];
  professors: Option[];
  defaultValues?: Partial<TaskCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label = triggerLabel ?? (mode === "create" ? "Add task" : "Edit task");

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
            {mode === "create" ? "Add task" : "Edit task"}
          </DialogTitle>
          <DialogDescription>
            Deadlines, follow-ups, and day-to-day application work.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          mode={mode}
          taskId={taskId}
          universities={universities}
          programs={programs}
          scholarships={scholarships}
          professors={professors}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
