"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteCountry } from "@/actions/countries";
import { Button } from "@/components/ui/button";

export function DeleteCountryButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this country and related records?")) return;
        startTransition(async () => {
          const result = await deleteCountry(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Country deleted");
          router.push("/countries");
          router.refresh();
        });
      }}
    >
      Delete
    </Button>
  );
}
