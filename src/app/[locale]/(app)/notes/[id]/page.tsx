import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getNote } from "@/actions/notes";
import { listCountries } from "@/actions/countries";
import { listProfessors } from "@/actions/professors";
import { listPrograms } from "@/actions/programs";
import { listScholarships } from "@/actions/scholarships";
import { listUniversities } from "@/actions/universities";
import { PageHeader } from "@/components/shared/page-header";
import { SourceCallout } from "@/components/shared/source-callout";
import { NoteDialog } from "@/components/notes/note-dialog";
import { DeleteNoteButton } from "@/components/notes/delete-note-button";
import { NoteMarkdown } from "@/components/notes/note-markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  await prepareLocalePage(params);
  const t = await getTranslations("Common");

  const [
    note,
    countries,
    universities,
    programs,
    professors,
    scholarships,
  ] = await Promise.all([
    getNote(id),
    listCountries(),
    listUniversities(),
    listPrograms(),
    listProfessors(),
    listScholarships(),
  ]);
  if (!note) notFound();

  const links = [
    note.country
      ? { href: `/countries/${note.country.id}`, label: note.country.name }
      : null,
    note.university
      ? {
          href: `/universities/${note.university.id}`,
          label: note.university.name,
        }
      : null,
    note.program
      ? { href: `/programs/${note.program.id}`, label: note.program.name }
      : null,
    note.professor
      ? {
          href: `/professors/${note.professor.id}`,
          label: note.professor.fullName,
        }
      : null,
    note.scholarship
      ? {
          href: `/scholarships/${note.scholarship.id}`,
          label: note.scholarship.name,
        }
      : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={note.title}
        description={`Updated ${formatDate(note.updatedAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <NoteDialog
              mode="edit"
              noteId={note.id}
              countries={countries.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
              universities={universities.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
              programs={programs.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
              professors={professors.map((item) => ({
                id: item.id,
                name: item.fullName,
              }))}
              scholarships={scholarships.map((item) => ({
                id: item.id,
                name: item.name,
              }))}
              defaultValues={{
                title: note.title,
                content: note.content,
                tags: note.tags,
                countryId: note.countryId,
                universityId: note.universityId,
                programId: note.programId,
                professorId: note.professorId,
                scholarshipId: note.scholarshipId,
              }}
              triggerLabel={t("edit")}
            />
            <DeleteNoteButton id={note.id} />
          </div>
        }
      />

      {note.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <SourceCallout variant="note">
        <NoteMarkdown content={note.content} />
      </SourceCallout>

      <Card>
        <CardHeader>
          <CardTitle>Linked entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked entities.</p>
          ) : (
            links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
              >
                {link.label}
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
