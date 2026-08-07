"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createCountry, updateCountry } from "@/actions/countries";
import { zodResolver } from "@/lib/forms";
import {
  countryCreateSchema,
  type CountryCreateInput,
} from "@/lib/validations";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormActions } from "@/components/shared/form-actions";

type CountryFormProps = {
  mode: "create" | "edit";
  countryId?: string;
  defaultValues?: Partial<CountryCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CountryForm({
  mode,
  countryId,
  defaultValues,
  onSuccess,
  onCancel,
}: CountryFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<CountryCreateInput>({
    resolver: zodResolver(countryCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "",
      currency: "",
      languageNotes: "",
      visaNotes: "",
      costOfLivingNotes: "",
      safetyNotes: "",
      generalNotes: "",
      ...defaultValues,
    },
  });

  function onSubmit(values: CountryCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCountry(values)
          : await updateCountry({ id: countryId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof CountryCreateInput, {
              message: messages?.[0],
            });
          }
        }
        return;
      }

      toast.success(mode === "create" ? "Country added" : "Country updated");
      onSuccess?.();
      if (mode === "create") {
        router.push(`/countries/${result.data.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" {...form.register("name")} />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.code}>
            <FieldLabel htmlFor="code">Code</FieldLabel>
            <Input id="code" placeholder="CA" {...form.register("code")} />
            <FieldError errors={[form.formState.errors.code]} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="region">Region</FieldLabel>
            <Input id="region" {...form.register("region")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <Input id="currency" {...form.register("currency")} />
          </Field>
        </div>
        {(
          [
            ["languageNotes", "Language notes"],
            ["visaNotes", "Visa notes"],
            ["costOfLivingNotes", "Cost of living notes"],
            ["safetyNotes", "Safety notes"],
            ["generalNotes", "General notes"],
          ] as const
        ).map(([name, label]) => (
          <Field key={name}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <Textarea id={name} rows={3} {...form.register(name)} />
          </Field>
        ))}
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
