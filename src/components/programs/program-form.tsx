"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createProgram, updateProgram } from "@/actions/programs";
import { zodResolver } from "@/lib/forms";
import {
  programCreateSchema,
  type ProgramCreateInput,
} from "@/lib/validations";
import { DegreeType, ProgramMode } from "../../../generated/prisma/enums";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

type ProgramFormProps = {
  mode: "create" | "edit";
  programId?: string;
  universities: Option[];
  defaultValues?: Partial<ProgramCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ProgramForm({
  mode,
  programId,
  universities,
  defaultValues,
  onSuccess,
  onCancel,
}: ProgramFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProgramCreateInput>({
    resolver: zodResolver(programCreateSchema),
    defaultValues: {
      universityId: universities[0]?.id ?? "",
      name: "",
      degreeType: "MSc",
      department: "",
      mode: "UNKNOWN",
      duration: "",
      officialUrl: "",
      intakeTerm: "",
      tuitionAmount: null,
      currency: "",
      minimumGpa: "",
      languageRequirement: "",
      greRequired: false,
      supervisorRequired: false,
      applicationFee: null,
      requiredDocuments: "",
      suitableForMeScore: null,
      fitReason: "",
      notes: "",
      ...defaultValues,
      applicationDeadline: defaultValues?.applicationDeadline
        ? new Date(defaultValues.applicationDeadline as Date | string)
        : null,
    },
  });

  function onSubmit(values: ProgramCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProgram(values)
          : await updateProgram({ id: programId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Program added" : "Program updated");
      onSuccess?.();
      if (mode === "create") {
        router.push(`/programs/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="program-name">Program name</FieldLabel>
          <Input id="program-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.universityId}>
          <FieldLabel>University</FieldLabel>
          <Controller
            control={form.control}
            name="universityId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
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
            <FieldLabel>Degree type</FieldLabel>
            <Controller
              control={form.control}
              name="degreeType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DegreeType).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel>Mode</FieldLabel>
            <Controller
              control={form.control}
              name="mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProgramMode).map((value) => (
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
            <FieldLabel htmlFor="deadline">Application deadline</FieldLabel>
            <Input
              id="deadline"
              type="date"
              defaultValue={toDateInput(form.getValues("applicationDeadline"))}
              onChange={(event) =>
                form.setValue(
                  "applicationDeadline",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="score">Fit score (1–10)</FieldLabel>
            <Input
              id="score"
              type="number"
              min={1}
              max={10}
              {...form.register("suitableForMeScore")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="language">Language requirement</FieldLabel>
          <Input id="language" {...form.register("languageRequirement")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="gpa">Minimum GPA</FieldLabel>
          <Input id="gpa" {...form.register("minimumGpa")} />
        </Field>

        <div className="flex flex-wrap gap-4">
          <Controller
            control={form.control}
            name="supervisorRequired"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                Supervisor required
              </label>
            )}
          />
          <Controller
            control={form.control}
            name="greRequired"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                GRE required
              </label>
            )}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="fitReason">Fit reason</FieldLabel>
          <Textarea id="fitReason" rows={2} {...form.register("fitReason")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="program-notes">Notes</FieldLabel>
          <Textarea id="program-notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
