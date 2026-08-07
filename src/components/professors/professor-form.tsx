"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createProfessor, updateProfessor } from "@/actions/professors";
import { zodResolver } from "@/lib/forms";
import {
  professorCreateSchema,
  type ProfessorCreateInput,
} from "@/lib/validations";
import {
  AcceptingStudents,
  ContactStatus,
} from "../../../generated/prisma/enums";
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

type ProfessorFormProps = {
  mode: "create" | "edit";
  professorId?: string;
  universities: Option[];
  programs?: Option[];
  defaultValues?: Partial<ProfessorCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function listToInput(value?: string[] | string | null) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

export function ProfessorForm({
  mode,
  professorId,
  universities,
  programs = [],
  defaultValues,
  onSuccess,
  onCancel,
}: ProfessorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfessorCreateInput>({
    resolver: zodResolver(professorCreateSchema),
    defaultValues: {
      universityId: universities[0]?.id ?? "",
      fullName: "",
      title: "",
      department: "",
      generalSpecialization: "",
      officialProfileUrl: "",
      labUrl: "",
      linkedinUrl: "",
      googleScholarUrl: "",
      personalWebsiteUrl: "",
      email: "",
      acceptingStudents: "UNKNOWN",
      fitScore: null,
      fitReason: "",
      contactStatus: "NOT_CONTACTED",
      notes: "",
      programIds: [],
      ...defaultValues,
      researchSpecializations: defaultValues?.researchSpecializations ?? [],
      researchKeywords: defaultValues?.researchKeywords ?? [],
      lastVerifiedAt: defaultValues?.lastVerifiedAt
        ? new Date(defaultValues.lastVerifiedAt as Date | string)
        : null,
    },
  });

  function onSubmit(values: ProfessorCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProfessor(values)
          : await updateProfessor({ id: professorId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Professor added" : "Professor updated",
      );
      onSuccess?.();
      if (mode === "create") {
        router.push(`/professors/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.fullName}>
          <FieldLabel htmlFor="fullName">Professor name</FieldLabel>
          <Input id="fullName" {...form.register("fullName")} />
          <FieldError errors={[form.formState.errors.fullName]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.universityId}>
          <FieldLabel>University</FieldLabel>
          <Controller
            control={form.control}
            name="universityId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.universityId]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" {...form.register("title")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <Input id="department" {...form.register("department")} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="generalSpecialization">
            General specialization
          </FieldLabel>
          <Input
            id="generalSpecialization"
            {...form.register("generalSpecialization")}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="researchSpecializations">
            Detailed research specialization
          </FieldLabel>
          <Textarea
            id="researchSpecializations"
            rows={2}
            placeholder="Comma-separated topics"
            defaultValue={listToInput(
              form.getValues("researchSpecializations"),
            )}
            onChange={(event) =>
              form.setValue(
                "researchSpecializations",
                event.target.value
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="researchKeywords">Research keywords</FieldLabel>
          <Input
            id="researchKeywords"
            placeholder="Comma-separated keywords"
            defaultValue={listToInput(form.getValues("researchKeywords"))}
            onChange={(event) =>
              form.setValue(
                "researchKeywords",
                event.target.value
                  .split(",")
                  .map((part) => part.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="linkedinUrl">LinkedIn URL</FieldLabel>
            <Input id="linkedinUrl" {...form.register("linkedinUrl")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="officialProfileUrl">
              Official profile URL
            </FieldLabel>
            <Input
              id="officialProfileUrl"
              {...form.register("officialProfileUrl")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="labUrl">Lab URL</FieldLabel>
            <Input id="labUrl" {...form.register("labUrl")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="googleScholarUrl">Google Scholar URL</FieldLabel>
            <Input
              id="googleScholarUrl"
              {...form.register("googleScholarUrl")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="personalWebsiteUrl">
              Personal website URL
            </FieldLabel>
            <Input
              id="personalWebsiteUrl"
              {...form.register("personalWebsiteUrl")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Accepting students</FieldLabel>
            <Controller
              control={form.control}
              name="acceptingStudents"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "UNKNOWN")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AcceptingStudents).map((value) => (
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
            <FieldLabel>Contact status</FieldLabel>
            <Controller
              control={form.control}
              name="contactStatus"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value ?? "NOT_CONTACTED")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContactStatus).map((value) => (
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="fitScore">Research fit score (1–10)</FieldLabel>
            <Input
              id="fitScore"
              type="number"
              min={1}
              max={10}
              {...form.register("fitScore")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastVerifiedAt">Last verified</FieldLabel>
            <Input
              id="lastVerifiedAt"
              type="date"
              defaultValue={toDateInput(form.getValues("lastVerifiedAt"))}
              onChange={(event) =>
                form.setValue(
                  "lastVerifiedAt",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="fitReason">Why this professor fits me</FieldLabel>
          <Textarea id="fitReason" rows={3} {...form.register("fitReason")} />
        </Field>

        {programs.length > 0 ? (
          <Field>
            <FieldLabel>Linked programs</FieldLabel>
            <Controller
              control={form.control}
              name="programIds"
              render={({ field }) => (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {programs.map((program) => {
                    const checked = (field.value ?? []).includes(program.id);
                    return (
                      <label
                        key={program.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            const next = new Set(field.value ?? []);
                            if (event.target.checked) next.add(program.id);
                            else next.delete(program.id);
                            field.onChange([...next]);
                          }}
                        />
                        {program.name}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
