import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [countries, universities, professors, programs] = await Promise.all([
    prisma.country.count(),
    prisma.university.count(),
    prisma.professor.count(),
    prisma.program.count(),
  ]);

  if (countries < 1 || universities < 1) {
    throw new Error(
      `Expected seeded geography/university data; got countries=${countries}, universities=${universities}`,
    );
  }

  console.log("✅ Connected");
  console.log(
    `Countries: ${countries}, Universities: ${universities}, Programs: ${programs}, Professors: ${professors}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
