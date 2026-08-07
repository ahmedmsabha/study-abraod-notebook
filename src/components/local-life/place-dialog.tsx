"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlaceForm } from "@/components/local-life/place-form";
import type { PlaceCreateInput } from "@/lib/validations";

type CityOption = { id: string; name: string; countryId: string };

export function PlaceDialog({
  mode = "create",
  placeId,
  cities,
  defaultValues,
  triggerLabel,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  placeId?: string;
  cities: CityOption[];
  defaultValues?: Partial<PlaceCreateInput>;
  triggerLabel?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label =
    triggerLabel ?? (mode === "create" ? "Add place" : "Edit place");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        {mode === "create" ? (
          <Plus className="size-3.5" data-icon="inline-start" />
        ) : null}
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add place" : "Edit place"}
          </DialogTitle>
          <DialogDescription>
            Personal notes for restaurants, groceries, housing, and more. No map
            API — paste your own links.
          </DialogDescription>
        </DialogHeader>
        <PlaceForm
          mode={mode}
          placeId={placeId}
          cities={cities}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
