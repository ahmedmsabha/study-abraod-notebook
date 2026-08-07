"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createNote, updateNote } from "@/actions/notes";
import { zodResolver } from "@/lib/forms";
import { listToInput, parseCommaList } from "@/lib/form-dates";
import { noteCreateSchema, type NoteCreateInput } from "@/lib/validations";
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

type Option = { id: string; name: string };

export function NoteForm({
  mode,
  noteId,
  countries,
  universities,
  programs,
  professors,
  scholarships,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  noteId?: string;
  countries: Option[];
  universities: Option[];
  programs: Option[];
  professors: Option[];
  scholarships: Option[];
  defaultValues?: Partial<NoteCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<NoteCreateInput>({
    resolver: zodResolver(noteCreateSchema),
    defaultValues: {
      title: "",
      content: "",
      countryId: null,
      universityId: null,
      programId: null,
      professorId: null,
      scholarshipId: null,
      ...defaultValues,
      tags: defaultValues?.tags ?? [],
    },
  });

  function onSubmit(values: NoteCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createNote(values)
          : await updateNote({ id: noteId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Note added" : "Note updated");
      onSuccess?.();
      if (mode === "create") {
        router.push(`/notes/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function linkSelect(
    name:
      | "countryId"
      | "universityId"
      | "programId"
      | "professorId"
      | "scholarshipId",
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
                <SelectValue placeholder={`Link ${label.toLowerCase()}`} />
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
          <FieldLabel htmlFor="note-title">Title</FieldLabel>
          <Input id="note-title" {...form.register("title")} />
          <FieldError errors={[form.formState.errors.title]} />
        </Field>
        <Field data-invalid={!!form.formState.errors.content}>
          <FieldLabel htmlFor="note-content">Content (Markdown)</FieldLabel>
          <Textarea
            id="note-content"
            rows={8}
            placeholder="Write research notes in Markdown…"
            {...form.register("content")}
          />
          <FieldError errors={[form.formState.errors.content]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tags">Tags</FieldLabel>
          <Input
            id="tags"
            placeholder="Comma-separated tags"
            defaultValue={listToInput(form.getValues("tags"))}
            onChange={(event) =>
              form.setValue("tags", parseCommaList(event.target.value))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {linkSelect("countryId", "Country", countries)}
          {linkSelect("universityId", "University", universities)}
          {linkSelect("programId", "Program", programs)}
          {linkSelect("professorId", "Professor", professors)}
          {linkSelect("scholarshipId", "Scholarship", scholarships)}
        </div>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
