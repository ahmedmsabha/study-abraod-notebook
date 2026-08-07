"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  createScholarship,
  updateScholarship,
} from "@/actions/scholarships";
import { zodResolver } from "@/lib/forms";
import { toDateInput } from "@/lib/form-dates";
import {
  scholarshipCreateSchema,
  type ScholarshipCreateInput,
} from "@/lib/validations";
import {
  FundingType,
  ScholarshipStatus,
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

export function ScholarshipForm({
  mode,
  scholarshipId,
  countries,
  universities,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  scholarshipId?: string;
  countries: Option[];
  universities: Array<Option & { countryId: string }>;
  defaultValues?: Partial<ScholarshipCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ScholarshipCreateInput>({
    resolver: zodResolver(scholarshipCreateSchema),
    defaultValues: {
      universityId: null,
      countryId: null,
      name: "",
      provider: "",
      officialUrl: "",
      fundingType: "OTHER",
      valueAmount: null,
      currency: "",
      coverageDescription: "",
      eligibility: "",
      applicationMethod: "",
      status: "RESEARCHING",
      notes: "",
      ...defaultValues,
      deadline: defaultValues?.deadline
        ? new Date(defaultValues.deadline as Date | string)
        : null,
    },
  });

  function onSubmit(values: ScholarshipCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createScholarship(values)
          : await updateScholarship({ id: scholarshipId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Scholarship added" : "Scholarship updated",
      );
      onSuccess?.();
      if (mode === "create") {
        router.push(`/scholarships/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="scholarship-name">Name</FieldLabel>
          <Input id="scholarship-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Country</FieldLabel>
            <Controller
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : (value ?? null))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No country</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel>University</FieldLabel>
            <Controller
              control={form.control}
              name="universityId"
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : (value ?? null))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No university</SelectItem>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
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
            <FieldLabel htmlFor="provider">Provider</FieldLabel>
            <Input id="provider" {...form.register("provider")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="officialUrl">Official URL</FieldLabel>
            <Input id="officialUrl" {...form.register("officialUrl")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Funding type</FieldLabel>
            <Controller
              control={form.control}
              name="fundingType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "OTHER")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FundingType).map((value) => (
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
                    {Object.values(ScholarshipStatus).map((value) => (
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

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="valueAmount">Value</FieldLabel>
            <Input
              id="valueAmount"
              type="number"
              step="0.01"
              {...form.register("valueAmount")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <Input id="currency" {...form.register("currency")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <Input
              id="deadline"
              type="date"
              defaultValue={toDateInput(form.getValues("deadline"))}
              onChange={(event) =>
                form.setValue(
                  "deadline",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="coverage">Coverage</FieldLabel>
          <Textarea id="coverage" rows={2} {...form.register("coverageDescription")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="eligibility">
            Eligibility (one item per line)
          </FieldLabel>
          <Textarea id="eligibility" rows={4} {...form.register("eligibility")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="applicationMethod">Application method</FieldLabel>
          <Input id="applicationMethod" {...form.register("applicationMethod")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="scholarship-notes">Notes</FieldLabel>
          <Textarea id="scholarship-notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
