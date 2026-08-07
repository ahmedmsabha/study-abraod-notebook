"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  createUniversity,
  updateUniversity,
} from "@/actions/universities";
import { zodResolver } from "@/lib/forms";
import {
  universityCreateSchema,
  type UniversityCreateInput,
} from "@/lib/validations";
import {
  Priority,
  UniversityStatus,
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

type UniversityFormProps = {
  mode: "create" | "edit";
  universityId?: string;
  countries: Option[];
  cities: Array<Option & { countryId: string }>;
  defaultValues?: Partial<UniversityCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function UniversityForm({
  mode,
  universityId,
  countries,
  cities,
  defaultValues,
  onSuccess,
  onCancel,
}: UniversityFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<UniversityCreateInput>({
    resolver: zodResolver(universityCreateSchema),
    defaultValues: {
      countryId: countries[0]?.id ?? "",
      cityId: null,
      name: "",
      officialWebsite: "",
      facultyOrDepartment: "",
      universityRankingNotes: "",
      tuitionNotes: "",
      applicationPortalUrl: "",
      internationalOfficeUrl: "",
      notes: "",
      status: "RESEARCHING",
      priority: "MEDIUM",
      ...defaultValues,
    },
  });

  const countryId = form.watch("countryId");
  const cityOptions = cities.filter((city) => city.countryId === countryId);

  function onSubmit(values: UniversityCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createUniversity(values)
          : await updateUniversity({ id: universityId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "University added" : "University updated");
      onSuccess?.();
      if (mode === "create") {
        router.push(`/universities/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="uni-name">Name</FieldLabel>
          <Input id="uni-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.countryId}>
            <FieldLabel>Country</FieldLabel>
            <Controller
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("cityId", null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.countryId]} />
          </Field>

          <Field>
            <FieldLabel>City</FieldLabel>
            <Controller
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <Select
                  value={field.value ?? "__none__"}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? null : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
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
            <FieldLabel>Status</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UniversityStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {labelize(status)}
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
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Priority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {labelize(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="faculty">Faculty / department</FieldLabel>
          <Input id="faculty" {...form.register("facultyOrDepartment")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="website">Official website</FieldLabel>
          <Input id="website" {...form.register("officialWebsite")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="portal">Application portal URL</FieldLabel>
          <Input id="portal" {...form.register("applicationPortalUrl")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="tuition">Tuition notes</FieldLabel>
          <Textarea id="tuition" rows={2} {...form.register("tuitionNotes")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
