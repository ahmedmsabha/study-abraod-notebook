"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  className?: string;
  label?: string;
  rows?: number;
};

export function LoadingState({
  className,
  label,
  rows = 4,
}: LoadingStateProps) {
  const t = useTranslations("Common");

  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label ?? t("loading")}</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
