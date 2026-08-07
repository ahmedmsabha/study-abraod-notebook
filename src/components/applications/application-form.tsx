"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  createApplication,
  updateApplication,
} from "@/actions/applications";
import { zodResolver } from "@/lib/forms";
import { toDateInput } from "@/lib/form-dates";
import {
  applicationCreateSchema,
  type ApplicationCreateInput,
} from "@/lib/validations";
import { ApplicationStatus } from "../../../generated/prisma/enums";
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

type ProgramOption = {
  id: string;
  name: string;
  universityName: string;
};

export function ApplicationForm({
  mode,
  applicationId,
  programs,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  applicationId?: string;
  programs: ProgramOption[];
  defaultValues?: Partial<ApplicationCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ApplicationCreateInput>({
    resolver: zodResolver(applicationCreateSchema),
    defaultValues: {
      programId: programs[0]?.id ?? "",
      status: "RESEARCHING",
      applicationPortalUrl: "",
      applicationReferenceNumber: "",
      feePaid: false,
      notes: "",
      ...defaultValues,
      submittedAt: defaultValues?.submittedAt
        ? new Date(defaultValues.submittedAt as Date | string)
        : null,
      decisionDate: defaultValues?.decisionDate
        ? new Date(defaultValues.decisionDate as Date | string)
        : null,
    },
  });

  function onSubmit(values: ApplicationCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createApplication(values)
          : await updateApplication({ id: applicationId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Application added" : "Application updated",
      );
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.programId}>
          <FieldLabel>Program</FieldLabel>
          <Controller
            control={form.control}
            name="programId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.universityName} · {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.programId]} />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value ?? "RESEARCHING")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ApplicationStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {labelize(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="submittedAt">Submitted</FieldLabel>
            <Input
              id="submittedAt"
              type="date"
              defaultValue={toDateInput(form.getValues("submittedAt"))}
              onChange={(event) =>
                form.setValue(
                  "submittedAt",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="decisionDate">Decision date</FieldLabel>
            <Input
              id="decisionDate"
              type="date"
              defaultValue={toDateInput(form.getValues("decisionDate"))}
              onChange={(event) =>
                form.setValue(
                  "decisionDate",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="portal">Application portal URL</FieldLabel>
          <Input id="portal" {...form.register("applicationPortalUrl")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="ref">Reference number</FieldLabel>
          <Input id="ref" {...form.register("applicationReferenceNumber")} />
        </Field>

        <Controller
          control={form.control}
          name="feePaid"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              Application fee paid
            </label>
          )}
        />

        <Field>
          <FieldLabel htmlFor="app-notes">Notes</FieldLabel>
          <Textarea id="app-notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
