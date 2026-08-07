/**
 * Smoke-test Zod validation + round-trip CRUD against seeded Prisma Postgres.
 * Run: npm run actions:verify
 */
import "dotenv/config";
import {
  createCountry,
  deleteCountry,
  listCountries,
  updateCountry,
} from "../src/actions/countries";
import {
  createUniversity,
  deleteUniversity,
  listUniversities,
} from "../src/actions/universities";
import {
  createProgram,
  deleteProgram,
  listPrograms,
} from "../src/actions/programs";
import {
  createProfessor,
  deleteProfessor,
  listProfessors,
} from "../src/actions/professors";
import {
  createTask,
  deleteTask,
  listTasks,
} from "../src/actions/tasks";
import {
  createNote,
  deleteNote,
  listNotes,
} from "../src/actions/notes";
import { countryCreateSchema } from "../src/lib/validations";
import { prisma } from "../src/lib/prisma";

async function assertOk<T>(
  label: string,
  result: {
    success: true;
    data: T;
  } | {
    success: false;
    error: string;
    fieldErrors?: Record<string, string[]>;
  },
): Promise<T> {
  if (!result.success) {
    const details = result.fieldErrors
      ? ` ${JSON.stringify(result.fieldErrors)}`
      : "";
    throw new Error(`${label} failed: ${result.error}${details}`);
  }
  return result.data;
}

async function main() {
  const invalid = countryCreateSchema.safeParse({ name: "", code: "x" });
  if (invalid.success) {
    throw new Error("Expected invalid country payload to fail validation");
  }

  // Clean leftover smoke rows from interrupted runs
  const existingCountries = await listCountries();
  for (const country of existingCountries) {
    if (country.code.startsWith("SM") || country.name.startsWith("Smoke ")) {
      await deleteCountry(country.id);
    }
  }

  const stamp = Date.now().toString().slice(-6);
  const code = `SM${stamp}`.slice(0, 8);

  const country = await assertOk(
    "createCountry",
    await createCountry({
      name: `Smoke Country ${stamp}`,
      code,
      region: "Test",
      currency: "USD",
    }),
  );

  await assertOk(
    "updateCountry",
    await updateCountry({
      id: country.id,
      generalNotes: "Verified by scripts/verify-actions.ts",
    }),
  );

  const university = await assertOk(
    "createUniversity",
    await createUniversity({
      countryId: country.id,
      name: `Smoke University ${stamp}`,
      status: "RESEARCHING",
      priority: "MEDIUM",
    }),
  );

  const program = await assertOk(
    "createProgram",
    await createProgram({
      universityId: university.id,
      name: `Smoke Program ${stamp}`,
      degreeType: "MSc",
      mode: "THESIS",
      supervisorRequired: true,
      languageRequirement: "English",
    }),
  );

  const professor = await assertOk(
    "createProfessor",
    await createProfessor({
      universityId: university.id,
      fullName: `Dr. Smoke Professor ${stamp}`,
      generalSpecialization: "Machine Learning",
      researchSpecializations: ["Edge AI"],
      acceptingStudents: "UNKNOWN",
      contactStatus: "NOT_CONTACTED",
      fitScore: 7,
      programIds: [program.id],
    }),
  );

  const task = await assertOk(
    "createTask",
    await createTask({
      title: `Smoke Task ${stamp}`,
      status: "TODO",
      priority: "HIGH",
      relatedUniversityId: university.id,
      relatedProgramId: program.id,
      relatedProfessorId: professor.id,
    }),
  );

  const note = await assertOk(
    "createNote",
    await createNote({
      title: `Smoke Note ${stamp}`,
      content: "## Smoke\nVerified markdown note.",
      tags: ["smoke", "verify"],
      universityId: university.id,
      programId: program.id,
      professorId: professor.id,
    }),
  );

  const [countries, universities, programs, professors, tasks, notes] =
    await Promise.all([
      listCountries(),
      listUniversities(),
      listPrograms(),
      listProfessors(),
      listTasks(),
      listNotes(),
    ]);

  const found = {
    country: countries.some((item) => item.id === country.id),
    university: universities.some((item) => item.id === university.id),
    program: programs.some((item) => item.id === program.id),
    professor: professors.some((item) => item.id === professor.id),
    task: tasks.some((item) => item.id === task.id),
    note: notes.some((item) => item.id === note.id),
  };

  if (Object.values(found).some((value) => !value)) {
    throw new Error(`List checks failed: ${JSON.stringify(found)}`);
  }

  await assertOk("deleteNote", await deleteNote(note.id));
  await assertOk("deleteTask", await deleteTask(task.id));
  await assertOk("deleteProfessor", await deleteProfessor(professor.id));
  await assertOk("deleteProgram", await deleteProgram(program.id));
  await assertOk("deleteUniversity", await deleteUniversity(university.id));
  await assertOk("deleteCountry", await deleteCountry(country.id));

  console.log("CRUD smoke test passed:", {
    countryId: country.id,
    universityId: university.id,
    programId: program.id,
    professorId: professor.id,
    taskId: task.id,
    noteId: note.id,
    validationRejectedEmptyName: !invalid.success,
    seedStillPresent: {
      countries: countries.length,
      universities: universities.length,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
