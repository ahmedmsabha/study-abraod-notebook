import { getTranslations } from "next-intl/server";
import { listCountries } from "@/actions/countries";
import { listNotes } from "@/actions/notes";
import { listProfessors } from "@/actions/professors";
import { listPrograms } from "@/actions/programs";
import { listScholarships } from "@/actions/scholarships";
import { listUniversities } from "@/actions/universities";
import { NotesView } from "@/components/notes/notes-view";
import { PageHeader } from "@/components/shared/page-header";
import { serializeNoteForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function NotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.notes");

  const [
    notes,
    countries,
    universities,
    programs,
    professors,
    scholarships,
  ] = await Promise.all([
    listNotes(),
    listCountries(),
    listUniversities(),
    listPrograms(),
    listProfessors(),
    listScholarships(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <NotesView
        notes={notes.map((note) => ({
          ...serializeNoteForClient(note),
          professor: note.professor
            ? { id: note.professor.id, fullName: note.professor.fullName }
            : null,
        }))}
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
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
