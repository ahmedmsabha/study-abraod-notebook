"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteProgram } from "@/actions/programs";
import { Button } from "@/components/ui/button";

export function DeleteProgramButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this program and related records?")) return;
        startTransition(async () => {
          const result = await deleteProgram(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Program deleted");
          router.push("/programs");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
