"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createContactLog } from "@/actions/contact-logs";
import { zodResolver } from "@/lib/forms";
import {
  contactLogCreateSchema,
  type ContactLogCreateInput,
} from "@/lib/validations";
import { ContactChannel } from "../../../generated/prisma/enums";
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

function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ContactLogForm({
  professorId,
  onSuccess,
  onCancel,
}: {
  professorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ContactLogCreateInput>({
    resolver: zodResolver(contactLogCreateSchema),
    defaultValues: {
      professorId,
      date: new Date(),
      channel: "EMAIL",
      subject: "",
      messageSummary: "",
      outcome: "",
      followUpDate: null,
    },
  });

  function onSubmit(values: ContactLogCreateInput) {
    startTransition(async () => {
      const result = await createContactLog(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Contact log added");
      form.reset({
        professorId,
        date: new Date(),
        channel: "EMAIL",
        subject: "",
        messageSummary: "",
        outcome: "",
        followUpDate: null,
      });
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contact-date">Date</FieldLabel>
            <Input
              id="contact-date"
              type="date"
              defaultValue={toDateInput(form.getValues("date"))}
              onChange={(event) =>
                form.setValue(
                  "date",
                  event.target.value ? new Date(event.target.value) : null,
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel>Channel</FieldLabel>
            <Controller
              control={form.control}
              name="channel"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "EMAIL")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ContactChannel).map((value) => (
                      <SelectItem key={value} value={value}>
                        {labelize(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.channel]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="subject">Subject</FieldLabel>
          <Input id="subject" {...form.register("subject")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="messageSummary">Message summary</FieldLabel>
          <Textarea
            id="messageSummary"
            rows={3}
            {...form.register("messageSummary")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="outcome">Outcome</FieldLabel>
          <Textarea id="outcome" rows={2} {...form.register("outcome")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="followUpDate">Follow-up date</FieldLabel>
          <Input
            id="followUpDate"
            type="date"
            defaultValue={toDateInput(form.getValues("followUpDate"))}
            onChange={(event) =>
              form.setValue(
                "followUpDate",
                event.target.value ? new Date(event.target.value) : null,
              )
            }
          />
        </Field>
      </FieldGroup>
      <FormActions
        pending={pending}
        onCancel={onCancel}
        submitLabel="Add contact log"
      />
    </form>
  );
}
