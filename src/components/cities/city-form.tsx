"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createCity, updateCity } from "@/actions/cities";
import { zodResolver } from "@/lib/forms";
import { cityCreateSchema, type CityCreateInput } from "@/lib/validations";
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

type CityFormProps = {
  mode: "create" | "edit";
  cityId?: string;
  countries?: Option[];
  lockCountryId?: boolean;
  defaultValues?: Partial<CityCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CityForm({
  mode,
  cityId,
  countries = [],
  lockCountryId = false,
  defaultValues,
  onSuccess,
  onCancel,
}: CityFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<CityCreateInput>({
    resolver: zodResolver(cityCreateSchema),
    defaultValues: {
      countryId: defaultValues?.countryId ?? countries[0]?.id ?? "",
      name: "",
      costOfLivingEstimate: "",
      housingNotes: "",
      transportNotes: "",
      weatherNotes: "",
      safetyNotes: "",
      ...defaultValues,
    },
  });

  function onSubmit(values: CityCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCity(values)
          : await updateCity({ id: cityId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            form.setError(key as keyof CityCreateInput, {
              message: messages?.[0],
            });
          }
        }
        return;
      }

      toast.success(mode === "create" ? "City added" : "City updated");
      onSuccess?.();
      router.refresh();
    });
  }

  const showCountrySelect = !lockCountryId && countries.length > 0;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {showCountrySelect ? (
          <Field data-invalid={!!form.formState.errors.countryId}>
            <FieldLabel>Country</FieldLabel>
            <Controller
              control={form.control}
              name="countryId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => field.onChange(value ?? "")}
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
        ) : (
          <input type="hidden" {...form.register("countryId")} />
        )}

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="city-name">Name</FieldLabel>
          <Input id="city-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="costOfLivingEstimate">
            Cost of living estimate
          </FieldLabel>
          <Input
            id="costOfLivingEstimate"
            placeholder="e.g. CAD 1,800–2,400 / month"
            {...form.register("costOfLivingEstimate")}
          />
        </Field>

        {(
          [
            ["housingNotes", "Housing notes"],
            ["transportNotes", "Transport notes"],
            ["weatherNotes", "Weather notes"],
            ["safetyNotes", "Safety notes"],
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
