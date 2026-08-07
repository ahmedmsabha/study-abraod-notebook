"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type FormActionsProps = {
  pending?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
};

export function FormActions({
  pending,
  onCancel,
  submitLabel,
}: FormActionsProps) {
  const t = useTranslations("Common");

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          {t("cancel")}
        </Button>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t("loading") : (submitLabel ?? t("save"))}
      </Button>
    </div>
  );
}
