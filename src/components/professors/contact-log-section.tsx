"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteContactLog } from "@/actions/contact-logs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ContactLogForm } from "@/components/professors/contact-log-form";
import { formatDate } from "@/lib/format";

export type ContactLogItem = {
  id: string;
  date: Date | string;
  channel: string;
  subject: string | null;
  messageSummary: string | null;
  outcome: string | null;
  followUpDate: Date | string | null;
};

export function ContactLogSection({
  professorId,
  logs,
}: {
  professorId: string;
  logs: ContactLogItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!window.confirm("Delete this contact log entry?")) return;
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteContactLog(id);
      setPendingId(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Contact log deleted");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Contact log ({logs.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-3.5" data-icon="inline-start" />
            Add log
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add contact log</DialogTitle>
              <DialogDescription>
                Record outreach, replies, and follow-up dates.
              </DialogDescription>
            </DialogHeader>
            <ContactLogForm
              professorId={professorId}
              onCancel={() => setOpen(false)}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.length === 0 ? (
          <EmptyState
            title="No outreach logged yet"
            description="Track emails and meetings here."
            className="border-0 bg-transparent py-6"
          />
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border px-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{formatDate(log.date)}</span>
                    <StatusBadge value={log.channel} />
                  </div>
                  {log.subject ? (
                    <p className="font-medium">{log.subject}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending && pendingId === log.id}
                  onClick={() => onDelete(log.id)}
                  aria-label="Delete contact log"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {log.messageSummary ? (
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {log.messageSummary}
                </p>
              ) : null}
              {log.outcome ? (
                <p className="mt-2">
                  <span className="font-medium">Outcome: </span>
                  {log.outcome}
                </p>
              ) : null}
              {log.followUpDate ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Follow-up: {formatDate(log.followUpDate)}
                </p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
