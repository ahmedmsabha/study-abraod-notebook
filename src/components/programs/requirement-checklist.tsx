"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import {
  createRequirement,
  deleteRequirement,
  toggleRequirementCompleted,
} from "@/actions/requirements";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { labelize } from "@/lib/format";

type RequirementItem = {
  id: string;
  title: string;
  category: string;
  details: string | null;
  isCompleted: boolean;
  officialSourceUrl: string | null;
};

export function RequirementChecklist({
  programId,
  requirements,
}: {
  programId: string;
  requirements: RequirementItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refreshAfter(result: { success: boolean; error?: string }) {
    if (!result.success) {
      toast.error(result.error ?? "Action failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const title = String(data.get("title") ?? "").trim();
          if (!title) return;
          startTransition(async () => {
            const result = await createRequirement({
              programId,
              title,
              category: "OTHER",
            });
            refreshAfter(result);
            if (result.success) {
              form.reset();
              toast.success("Requirement added");
            }
          });
        }}
      >
        <Input
          name="title"
          placeholder="Add requirement (e.g. IELTS 7.0)"
          disabled={pending}
        />
        <Button type="submit" disabled={pending}>
          Add
        </Button>
      </form>

      {requirements.length === 0 ? (
        <EmptyState
          title="No requirements yet"
          description="Build a checklist of GPA, language, documents, and other asks."
          className="py-10"
        />
      ) : (
        <ul className="space-y-2">
          {requirements.map((requirement) => (
            <li
              key={requirement.id}
              className="flex items-start gap-3 rounded-lg border px-3 py-2.5"
            >
              <Checkbox
                checked={requirement.isCompleted}
                disabled={pending}
                onCheckedChange={(checked) => {
                  startTransition(async () => {
                    const result = await toggleRequirementCompleted(
                      requirement.id,
                      checked === true,
                    );
                    refreshAfter(result);
                  });
                }}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={
                      requirement.isCompleted
                        ? "font-medium line-through opacity-70"
                        : "font-medium"
                    }
                  >
                    {requirement.title}
                  </p>
                  <Badge variant="outline">
                    {labelize(requirement.category)}
                  </Badge>
                </div>
                {requirement.details ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {requirement.details}
                  </p>
                ) : null}
                {requirement.officialSourceUrl ? (
                  <a
                    href={requirement.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs underline underline-offset-2"
                  >
                    Official source
                  </a>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await deleteRequirement(requirement.id);
                    refreshAfter(result);
                    if (result.success) toast.success("Requirement removed");
                  });
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
