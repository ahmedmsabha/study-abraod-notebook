import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const EXAMPLE = "https://example.com";

async function clearDatabase() {
  await prisma.contactLog.deleteMany();
  await prisma.note.deleteMany();
  await prisma.place.deleteMany();
  await prisma.task.deleteMany();
  await prisma.application.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.scholarship.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.program.deleteMany();
  await prisma.university.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const owner = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Sample Student (seed)",
    },
  });

  const canada = await prisma.country.create({
    data: {
      name: "Canada",
      code: "CA",
      region: "North America",
      currency: "CAD",
      languageNotes:
        "Official languages: English and French. Most ECE graduate programs at U of T are in English.",
      visaNotes:
        "SAMPLE: Study permit required for international students. Verify IRCC requirements before applying.",
      costOfLivingNotes:
        "Toronto is relatively expensive for housing. Budget carefully for rent near campus.",
      safetyNotes: "User note: generally feel safe in campus areas; research neighborhoods before moving.",
      generalNotes: "Seed country profile for Academic Compass demo data.",
    },
  });

  const toronto = await prisma.city.create({
    data: {
      countryId: canada.id,
      name: "Toronto",
      costOfLivingEstimate: "High — rent often CAD 1,800+/month for a 1BR (verify current listings)",
      housingNotes: "User note: look at areas near subway lines (TTC) for campus access.",
      transportNotes: "TTC subway/streetcar; PRESTO card. Campus is downtown (St. George).",
      weatherNotes: "Cold winters, humid summers. Factor winter clothing into budget.",
      safetyNotes: "User research placeholder — update after visiting neighborhoods.",
    },
  });

  const uoft = await prisma.university.create({
    data: {
      countryId: canada.id,
      cityId: toronto.id,
      name: "University of Toronto",
      officialWebsite: "https://www.utoronto.ca",
      facultyOrDepartment: "Electrical and Computer Engineering (ECE)",
      universityRankingNotes:
        "SAMPLE ranking notes only — verify on official ranking sites; do not treat as official claim.",
      tuitionNotes:
        "International graduate tuition varies by program. Confirm on official SGS / ECE pages.",
      applicationPortalUrl: `${EXAMPLE}/uoft-application-portal`,
      internationalOfficeUrl: `${EXAMPLE}/uoft-international-office`,
      notes: "Seed university: University of Toronto / ECE focus for Computer Engineering MSc planning.",
      status: "SHORTLISTED",
      priority: "HIGH",
    },
  });

  const masc = await prisma.program.create({
    data: {
      universityId: uoft.id,
      name: "MASc in Electrical and Computer Engineering (Sample)",
      degreeType: "MASc",
      department: "Electrical and Computer Engineering",
      mode: "THESIS",
      duration: "2 years (typical)",
      officialUrl: `${EXAMPLE}/uoft-ece-masc`,
      applicationDeadline: new Date("2026-12-01T23:59:59.000Z"),
      intakeTerm: "Fall 2027",
      tuitionAmount: 32000,
      currency: "CAD",
      minimumGpa: "B+ equivalent (verify official calendar)",
      languageRequirement: "TOEFL/IELTS if applicable — verify ECE / SGS requirements",
      greRequired: false,
      supervisorRequired: true,
      applicationFee: 125,
      requiredDocuments: "CV, SOP, transcripts, 2–3 recommendation letters, supervisor interest (typical)",
      suitableForMeScore: 8,
      fitReason:
        "Thesis-based ECE with AI/ML-adjacent research options; strong fit for Computer Engineering background.",
      notes: "SAMPLE program record — deadlines and fees are placeholders for demo.",
    },
  });

  const msc = await prisma.program.create({
    data: {
      universityId: uoft.id,
      name: "MSc / MEng Computer Engineering Track (Sample)",
      degreeType: "MSc",
      department: "Electrical and Computer Engineering",
      mode: "MIXED",
      duration: "1–2 years depending on stream (verify)",
      officialUrl: `${EXAMPLE}/uoft-ece-msc`,
      applicationDeadline: new Date("2027-01-15T23:59:59.000Z"),
      intakeTerm: "Fall 2027",
      tuitionAmount: 45000,
      currency: "CAD",
      minimumGpa: "Verify official minimum",
      languageRequirement: "English proficiency if required",
      greRequired: false,
      supervisorRequired: false,
      applicationFee: 125,
      requiredDocuments: "CV, SOP, transcripts, recommendations",
      suitableForMeScore: 7,
      fitReason: "Coursework/mixed option useful as backup if thesis supervisor search is slow.",
      notes: "SAMPLE — clarify MEng vs MSc naming against official ECE pages.",
    },
  });

  const profAi = await prisma.professor.create({
    data: {
      universityId: uoft.id,
      fullName: "Dr. Sample A. Researcher",
      title: "Associate Professor (placeholder)",
      department: "Electrical and Computer Engineering",
      generalSpecialization: "Machine Learning / AI Systems",
      researchSpecializations: [
        "Efficient deep learning",
        "Edge AI",
        "Computer vision for robotics",
      ],
      researchKeywords: ["deep learning", "edge computing", "computer vision", "ML systems"],
      officialProfileUrl: `${EXAMPLE}/uoft-prof-ai`,
      labUrl: `${EXAMPLE}/sample-ai-lab`,
      linkedinUrl: `${EXAMPLE}/linkedin/sample-ai`,
      googleScholarUrl: `${EXAMPLE}/scholar/sample-ai`,
      personalWebsiteUrl: `${EXAMPLE}/sample-ai-home`,
      email: "sample.ai@example.com",
      acceptingStudents: "UNKNOWN",
      lastVerifiedAt: new Date("2026-07-01T00:00:00.000Z"),
      fitScore: 9,
      fitReason:
        "Research keywords align with AI + embedded/edge interests. Placeholder profile — verify acceptance status.",
      contactStatus: "RESEARCHING",
      notes: "SAMPLE professor — not a real person. Replace with verified faculty profiles.",
      programs: { connect: [{ id: masc.id }] },
    },
  });

  const profEmb = await prisma.professor.create({
    data: {
      universityId: uoft.id,
      fullName: "Dr. Sample B. Systems",
      title: "Professor (placeholder)",
      department: "Electrical and Computer Engineering",
      generalSpecialization: "Embedded Systems / Computer Engineering",
      researchSpecializations: ["Cyber-physical systems", "Real-time embedded software"],
      researchKeywords: ["embedded systems", "real-time", "IoT", "hardware-software co-design"],
      officialProfileUrl: `${EXAMPLE}/uoft-prof-embedded`,
      labUrl: `${EXAMPLE}/sample-embedded-lab`,
      linkedinUrl: `${EXAMPLE}/linkedin/sample-embedded`,
      googleScholarUrl: `${EXAMPLE}/scholar/sample-embedded`,
      email: "sample.systems@example.com",
      acceptingStudents: "YES",
      lastVerifiedAt: new Date("2026-06-15T00:00:00.000Z"),
      fitScore: 8,
      fitReason: "Strong overlap with Computer Engineering + embedded/robotics path.",
      contactStatus: "EMAIL_DRAFTED",
      notes: "SAMPLE professor — placeholder URLs only.",
      programs: { connect: [{ id: masc.id }, { id: msc.id }] },
    },
  });

  const profCloud = await prisma.professor.create({
    data: {
      universityId: uoft.id,
      fullName: "Dr. Sample C. Distributed",
      title: "Assistant Professor (placeholder)",
      department: "Electrical and Computer Engineering",
      generalSpecialization: "Cloud / Distributed Systems",
      researchSpecializations: ["Distributed ML training", "Systems for AI"],
      researchKeywords: ["distributed systems", "cloud", "systems for ML"],
      officialProfileUrl: `${EXAMPLE}/uoft-prof-cloud`,
      linkedinUrl: `${EXAMPLE}/linkedin/sample-cloud`,
      googleScholarUrl: `${EXAMPLE}/scholar/sample-cloud`,
      email: "sample.cloud@example.com",
      acceptingStudents: "UNKNOWN",
      lastVerifiedAt: new Date("2026-05-20T00:00:00.000Z"),
      fitScore: 7,
      fitReason: "Useful for cloud/distributed angle of MSc applications.",
      contactStatus: "NOT_CONTACTED",
      notes: "SAMPLE professor — verify lab openings before emailing.",
      programs: { connect: [{ id: msc.id }] },
    },
  });

  await prisma.requirement.createMany({
    data: [
      {
        programId: masc.id,
        category: "GPA",
        title: "Minimum GPA (sample)",
        details: "Official minimum must be confirmed on ECE admissions page.",
        minimumValue: "B+",
        officialSourceUrl: `${EXAMPLE}/uoft-ece-admissions`,
        verifiedAt: new Date("2026-07-01T00:00:00.000Z"),
        isCompleted: false,
        notes: "Official source vs user checklist — mark completed when documents ready.",
      },
      {
        programId: masc.id,
        category: "IELTS",
        title: "English language proof (if required)",
        details: "May be waived depending on prior education language — verify.",
        minimumValue: "Overall 7.0 (sample — verify)",
        officialSourceUrl: `${EXAMPLE}/uoft-english-req`,
        verifiedAt: null,
        isCompleted: false,
      },
      {
        programId: masc.id,
        category: "SUPERVISOR",
        title: "Identify potential supervisors",
        details: "Thesis MASc typically expects supervisor alignment.",
        officialSourceUrl: `${EXAMPLE}/uoft-ece-masc`,
        isCompleted: false,
      },
      {
        programId: masc.id,
        category: "SOP",
        title: "Statement of Purpose",
        details: "Draft research interests + fit with ECE labs.",
        isCompleted: false,
      },
      {
        programId: msc.id,
        category: "TRANSCRIPT",
        title: "Official transcripts",
        details: "Request from home university early.",
        isCompleted: false,
      },
      {
        programId: msc.id,
        category: "RECOMMENDATION",
        title: "Recommendation letters",
        details: "Typically 2–3 academic references.",
        isCompleted: false,
      },
    ],
  });

  const scholarship = await prisma.scholarship.create({
    data: {
      universityId: uoft.id,
      countryId: canada.id,
      name: "Sample ECE Entrance Scholarship (Placeholder)",
      provider: "University of Toronto / ECE (sample label)",
      officialUrl: `${EXAMPLE}/uoft-ece-funding`,
      fundingType: "PARTIAL",
      valueAmount: 10000,
      currency: "CAD",
      coverageDescription: "SAMPLE: partial tuition support — verify real awards on official pages.",
      eligibility: "Incoming international graduate students in ECE (placeholder eligibility).",
      deadline: new Date("2026-11-15T23:59:59.000Z"),
      applicationMethod: "Often automatic consideration or separate form — verify.",
      status: "RESEARCHING",
      notes: "Demo scholarship only. Do not treat amounts/deadlines as official.",
    },
  });

  await prisma.application.create({
    data: {
      programId: masc.id,
      status: "PREPARING",
      applicationPortalUrl: `${EXAMPLE}/uoft-application-portal`,
      feePaid: false,
      notes: "Seed application tracker card for MASc ECE.",
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Verify U of T ECE MASc deadline",
        description: "Confirm official deadline and required documents on ECE site.",
        dueDate: new Date("2026-09-01T00:00:00.000Z"),
        status: "TODO",
        priority: "HIGH",
        relatedUniversityId: uoft.id,
        relatedProgramId: masc.id,
      },
      {
        title: "Draft email to Dr. Sample A. Researcher",
        description: "Introduce background + ask about Fall 2027 openings.",
        dueDate: new Date("2026-08-20T00:00:00.000Z"),
        status: "IN_PROGRESS",
        priority: "URGENT",
        relatedProfessorId: profAi.id,
        relatedUniversityId: uoft.id,
      },
      {
        title: "Collect funding options for Canada",
        description: "Compare sample scholarship with external awards.",
        dueDate: new Date("2026-10-01T00:00:00.000Z"),
        status: "TODO",
        priority: "MEDIUM",
        relatedScholarshipId: scholarship.id,
        relatedUniversityId: uoft.id,
      },
    ],
  });

  await prisma.contactLog.create({
    data: {
      professorId: profEmb.id,
      date: new Date("2026-07-10T00:00:00.000Z"),
      channel: "EMAIL",
      subject: "Interest in embedded systems MASc supervision (draft log)",
      messageSummary: "Drafted outreach email; not yet sent. SAMPLE contact log.",
      outcome: "Email drafted — awaiting send",
      followUpDate: new Date("2026-08-15T00:00:00.000Z"),
    },
  });

  await prisma.place.createMany({
    data: [
      {
        cityId: toronto.id,
        name: "Sample Campus Grocery (placeholder)",
        category: "GROCERY",
        mapUrl: `${EXAMPLE}/maps/toronto-grocery`,
        websiteUrl: EXAMPLE,
        priceLevel: "$$",
        notes: "User note placeholder for local life research.",
        rating: 4.2,
      },
      {
        cityId: toronto.id,
        name: "Sample Study Cafe (placeholder)",
        category: "CAFE",
        mapUrl: `${EXAMPLE}/maps/toronto-cafe`,
        websiteUrl: EXAMPLE,
        priceLevel: "$$",
        notes: "Quiet study spot note — replace with real finds.",
        rating: 4.5,
      },
      {
        cityId: toronto.id,
        name: "Sample Housing Notes Area",
        category: "HOUSING",
        mapUrl: `${EXAMPLE}/maps/toronto-housing`,
        notes: "Neighborhood research stub near transit.",
        rating: null,
      },
    ],
  });

  await prisma.note.createMany({
    data: [
      {
        title: "Why U of T ECE?",
        content:
          "## Fit notes\n\n- Strong ECE department for AI + systems.\n- SAMPLE seed note — replace with personal research.\n\n> Distinguish **user notes** from official pages.",
        tags: ["uoft", "ece", "shortlist"],
        countryId: canada.id,
        universityId: uoft.id,
        programId: masc.id,
      },
      {
        title: "Professor outreach template",
        content:
          "Subject: Prospective MASc student — interest in [research area]\n\nKeep short; attach CV. Placeholder URLs only in seed data.",
        tags: ["email", "outreach"],
        professorId: profAi.id,
        universityId: uoft.id,
      },
      {
        title: "Funding checklist",
        content: "- Entrance awards\n- TA/RA possibilities\n- External scholarships\n\nAll amounts in seed are placeholders.",
        tags: ["funding", "canada"],
        scholarshipId: scholarship.id,
        countryId: canada.id,
      },
    ],
  });

  console.log("Seeded Academic Compass sample data:");
  console.log(`  User: ${owner.email}`);
  console.log(`  Country: ${canada.name} / City: ${toronto.name}`);
  console.log(`  University: ${uoft.name}`);
  console.log(`  Programs: ${masc.name}; ${msc.name}`);
  console.log(`  Professors: 3 sample profiles (placeholder URLs)`);
  console.log(`  Scholarship + application + tasks + places + notes`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
