"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createTask, updateTask } from "@/actions/tasks";
import { zodResolver } from "@/lib/forms";
import { toDateInput } from "@/lib/form-dates";
import { taskCreateSchema, type TaskCreateInput } from "@/lib/validations";
import { TaskPriority, TaskStatus } from "../../../generated/prisma/enums";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormActions } from "@/components/shared/form-actions";
import { labelize } from "@/lib/format";

type Option = { id: string; name: string };

export function TaskForm({
  mode,
  taskId,
  universities,
  programs,
  scholarships,
  professors,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  taskId?: string;
  universities: Option[];
  programs: Option[];
  scholarships: Option[];
  professors: Option[];
  defaultValues?: Partial<TaskCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<TaskCreateInput>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      relatedUniversityId: null,
      relatedProgramId: null,
      relatedScholarshipId: null,
      relatedProfessorId: null,
      ...defaultValues,
      dueDate: defaultValues?.dueDate
        ? new Date(defaultValues.dueDate as Date | string)
        : null,
    },
  });

  function onSubmit(values: TaskCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTask(values)
          : await updateTask({ id: taskId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Task added" : "Task updated");
      onSuccess?.();
      router.refresh();
    });
  }

  function optionalSelect(
    name:
      | "relatedUniversityId"
      | "relatedProgramId"
      | "relatedScholarshipId"
      | "relatedProfessorId",
    label: string,
    options: Option[],
  ) {
    return (
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Select
              value={field.value ?? "none"}
              onValueChange={(value) =>
                field.onChange(value === "none" ? null : (value ?? null))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Optional ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.title}>
          <FieldLabel htmlFor="task-title">Title</FieldLabel>
          <Input id="task-title" {...form.register("title")} />
          <FieldError errors={[form.formState.errors.title]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="task-description">Description</FieldLabel>
          <Textarea
            id="task-description"
            rows={3}
            {...form.register("description")}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input
              id="dueDate"
              type="date"
              defaultValue={toDateInput(form.getValues("dueDate"))}
              onChange={(event) =>
                form.setValue(
                  "dueDate",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "TODO")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map((value) => (
                      <SelectItem key={value} value={value}>
                        {labelize(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "MEDIUM")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskPriority).map((value) => (
                      <SelectItem key={value} value={value}>
                        {labelize(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
        {optionalSelect("relatedUniversityId", "University", universities)}
        {optionalSelect("relatedProgramId", "Program", programs)}
        {optionalSelect("relatedScholarshipId", "Scholarship", scholarships)}
        {optionalSelect("relatedProfessorId", "Professor", professors)}
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
