"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteNote } from "@/actions/notes";
import { Button } from "@/components/ui/button";

export function DeleteNoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this note?")) return;
        startTransition(async () => {
          const result = await deleteNote(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Note deleted");
          router.push("/notes");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
