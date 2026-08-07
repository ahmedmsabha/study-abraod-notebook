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
import { CityForm } from "@/components/cities/city-form";
import type { CityCreateInput } from "@/lib/validations";

type Option = { id: string; name: string };

export function CityDialog({
  mode = "create",
  cityId,
  countries = [],
  lockCountryId = false,
  defaultValues,
  triggerLabel,
  triggerVariant,
  defaultOpen = false,
}: {
  mode?: "create" | "edit";
  cityId?: string;
  countries?: Option[];
  lockCountryId?: boolean;
  defaultValues?: Partial<CityCreateInput>;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label = triggerLabel ?? (mode === "create" ? "Add city" : "Edit city");
  const variant =
    triggerVariant ?? (mode === "edit" ? "outline" : "default");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant={variant} />}>
        {mode === "create" ? (
          <Plus className="size-3.5" data-icon="inline-start" />
        ) : null}
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add city" : "Edit city"}
          </DialogTitle>
          <DialogDescription>
            Local life research — housing, transport, weather, and safety notes.
          </DialogDescription>
        </DialogHeader>
        <CityForm
          mode={mode}
          cityId={cityId}
          countries={countries}
          lockCountryId={lockCountryId}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
