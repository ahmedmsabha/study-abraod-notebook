"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteScholarship } from "@/actions/scholarships";
import { Button } from "@/components/ui/button";

export function DeleteScholarshipButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this scholarship?")) return;
        startTransition(async () => {
          const result = await deleteScholarship(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Scholarship deleted");
          router.push("/scholarships");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
