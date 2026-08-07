import { getTranslations } from "next-intl/server";
import { listProfessors } from "@/actions/professors";
import { listPrograms } from "@/actions/programs";
import { listScholarships } from "@/actions/scholarships";
import { listTasks } from "@/actions/tasks";
import { listUniversities } from "@/actions/universities";
import { TasksView } from "@/components/tasks/tasks-view";
import { PageHeader } from "@/components/shared/page-header";
import { serializeTaskForClient } from "@/lib/format";
import { prepareLocalePage } from "@/lib/page";

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  await prepareLocalePage(params);
  const { new: isNew } = await searchParams;
  const t = await getTranslations("Pages.tasks");

  const [tasks, universities, programs, scholarships, professors] =
    await Promise.all([
      listTasks(),
      listUniversities(),
      listPrograms(),
      listScholarships(),
      listProfessors(),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <TasksView
        tasks={tasks.map(serializeTaskForClient)}
        universities={universities.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        programs={programs.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        scholarships={scholarships.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        professors={professors.map((item) => ({
          id: item.id,
          name: item.fullName,
        }))}
        defaultOpenCreate={isNew === "1"}
      />
    </div>
  );
}
