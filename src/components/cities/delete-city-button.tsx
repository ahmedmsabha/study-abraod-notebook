"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteCity } from "@/actions/cities";
import { Button } from "@/components/ui/button";

export function DeleteCityButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this city and its local places?")) return;
        startTransition(async () => {
          const result = await deleteCity(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("City deleted");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
