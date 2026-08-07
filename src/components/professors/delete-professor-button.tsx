"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteProfessor } from "@/actions/professors";
import { Button } from "@/components/ui/button";

export function DeleteProfessorButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this professor and contact history?")) {
          return;
        }
        startTransition(async () => {
          const result = await deleteProfessor(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Professor deleted");
          router.push("/professors");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
