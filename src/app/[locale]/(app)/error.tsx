"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/shared/error-state";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");

  return (
    <ErrorState
      title={t("errorTitle")}
      description={t("errorDescription")}
      onRetry={reset}
      retryLabel={t("retry")}
    />
  );
}
