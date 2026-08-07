"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteUniversity } from "@/actions/universities";
import { Button } from "@/components/ui/button";

export function DeleteUniversityButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this university and related records?")) {
          return;
        }
        startTransition(async () => {
          const result = await deleteUniversity(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("University deleted");
          router.push("/universities");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
