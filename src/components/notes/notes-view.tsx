"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoteDialog } from "@/components/notes/note-dialog";
import { formatDate } from "@/lib/format";

export type NoteRow = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  country: { id: string; name: string } | null;
  university: { id: string; name: string } | null;
  program: { id: string; name: string } | null;
  professor: { id: string; fullName: string } | null;
  scholarship: { id: string; name: string } | null;
};

type Option = { id: string; name: string };

function linkedLabel(note: NoteRow) {
  return (
    note.university?.name ||
    note.program?.name ||
    note.professor?.fullName ||
    note.scholarship?.name ||
    note.country?.name ||
    null
  );
}

export function NotesView({
  notes,
  countries,
  universities,
  programs,
  professors,
  scholarships,
  defaultOpenCreate = false,
}: {
  notes: NoteRow[];
  countries: Option[];
  universities: Option[];
  programs: Option[];
  professors: Option[];
  scholarships: Option[];
  defaultOpenCreate?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const note of notes) {
      for (const value of note.tags) set.add(value);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (tag !== "all" && !note.tags.includes(tag)) return false;
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.tags.some((value) => value.toLowerCase().includes(q)) ||
        (linkedLabel(note) ?? "").toLowerCase().includes(q)
      );
    });
  }, [notes, query, tag]);

  const dialogProps = {
    countries,
    universities,
    programs,
    professors,
    scholarships,
  };

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Capture research notes in Markdown and link them to entities."
        action={<NoteDialog {...dialogProps} defaultOpen={defaultOpenCreate} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes…"
            className="max-w-xs"
          />
          <Select value={tag} onValueChange={(value) => setTag(value ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {allTags.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NoteDialog {...dialogProps} defaultOpen={defaultOpenCreate} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try another search or tag."
            className="md:col-span-2 xl:col-span-3"
          />
        ) : (
          filtered.map((note) => (
            <Card key={note.id}>
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/notes/${note.id}`}
                    className="hover:underline"
                  >
                    {note.title}
                  </Link>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(note.updatedAt)}
                  {linkedLabel(note) ? ` · ${linkedLabel(note)}` : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-4 text-sm text-muted-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                {note.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((value) => (
                      <Badge key={value} variant="secondary">
                        {value}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
