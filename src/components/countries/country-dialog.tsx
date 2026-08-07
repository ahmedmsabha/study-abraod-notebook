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
import { CountryForm } from "@/components/countries/country-form";
import type { CountryCreateInput } from "@/lib/validations";

type CountryDialogProps = {
  mode?: "create" | "edit";
  countryId?: string;
  defaultValues?: Partial<CountryCreateInput>;
  triggerLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CountryDialog({
  mode = "create",
  countryId,
  defaultValues,
  triggerLabel,
  open: controlledOpen,
  onOpenChange,
}: CountryDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const label =
    triggerLabel ?? (mode === "create" ? "Add country" : "Edit country");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined ? (
        <DialogTrigger render={<Button size="sm" />}>
          {mode === "create" ? <Plus className="size-3.5" data-icon="inline-start" /> : null}
          {label}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add country" : "Edit country"}
          </DialogTitle>
          <DialogDescription>
            Track visa, cost of living, and destination notes.
          </DialogDescription>
        </DialogHeader>
        <CountryForm
          mode={mode}
          countryId={countryId}
          defaultValues={defaultValues}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
