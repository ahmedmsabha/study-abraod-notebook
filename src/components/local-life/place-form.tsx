"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createPlace, updatePlace } from "@/actions/places";
import { zodResolver } from "@/lib/forms";
import { placeCreateSchema, type PlaceCreateInput } from "@/lib/validations";
import { PlaceCategory } from "../../../generated/prisma/enums";
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

type CityOption = { id: string; name: string; countryId: string };

export function PlaceForm({
  mode,
  placeId,
  cities,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  placeId?: string;
  cities: CityOption[];
  defaultValues?: Partial<PlaceCreateInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<PlaceCreateInput>({
    resolver: zodResolver(placeCreateSchema),
    defaultValues: {
      cityId: cities[0]?.id ?? "",
      name: "",
      category: "OTHER",
      mapUrl: "",
      websiteUrl: "",
      priceLevel: "",
      notes: "",
      rating: null,
      ...defaultValues,
    },
  });

  function onSubmit(values: PlaceCreateInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPlace(values)
          : await updatePlace({ id: placeId!, ...values });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Place added" : "Place updated");
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="place-name">Name</FieldLabel>
          <Input id="place-name" {...form.register("name")} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.cityId}>
          <FieldLabel>City</FieldLabel>
          <Controller
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.cityId]} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "OTHER")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PlaceCategory).map((value) => (
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
            <FieldLabel htmlFor="rating">Rating (0–5)</FieldLabel>
            <Input
              id="rating"
              type="number"
              min={0}
              max={5}
              step="0.1"
              {...form.register("rating")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="priceLevel">Price level</FieldLabel>
            <Input
              id="priceLevel"
              placeholder="e.g. $, $$, $$$"
              {...form.register("priceLevel")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
            <Input id="websiteUrl" {...form.register("websiteUrl")} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="mapUrl">Map URL</FieldLabel>
          <Input id="mapUrl" {...form.register("mapUrl")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="place-notes">Notes</FieldLabel>
          <Textarea id="place-notes" rows={3} {...form.register("notes")} />
        </Field>
      </FieldGroup>
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}
