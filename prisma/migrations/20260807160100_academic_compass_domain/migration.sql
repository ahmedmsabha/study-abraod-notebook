-- CreateEnum
CREATE TYPE "UniversityStatus" AS ENUM ('RESEARCHING', 'SHORTLISTED', 'APPLYING', 'APPLIED', 'OFFERED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('MSc', 'MEng', 'MASc', 'MPhil', 'PhD', 'Other');

-- CreateEnum
CREATE TYPE "ProgramMode" AS ENUM ('THESIS', 'COURSEWORK', 'MIXED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AcceptingStudents" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NOT_CONTACTED', 'FOLLOWING', 'RESEARCHING', 'EMAIL_DRAFTED', 'EMAILED', 'REPLIED', 'MEETING', 'NOT_A_FIT');

-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('FULL', 'PARTIAL', 'TUITION_WAIVER', 'STIPEND', 'RESEARCH_ASSISTANTSHIP', 'TEACHING_ASSISTANTSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('RESEARCHING', 'ELIGIBLE', 'APPLYING', 'APPLIED', 'AWARDED', 'NOT_ELIGIBLE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequirementCategory" AS ENUM ('GPA', 'TOEFL', 'IELTS', 'GRE', 'CV', 'SOP', 'RECOMMENDATION', 'TRANSCRIPT', 'PORTFOLIO', 'INTERVIEW', 'SUPERVISOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('RESEARCHING', 'PREPARING', 'READY_TO_SUBMIT', 'SUBMITTED', 'INTERVIEW', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ContactChannel" AS ENUM ('EMAIL', 'LINKEDIN', 'WEBSITE', 'MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('RESTAURANT', 'GROCERY', 'CAFE', 'HOUSING', 'TRANSPORT', 'HOSPITAL', 'STUDY_SPACE', 'GYM', 'OTHER');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT,
    "currency" TEXT,
    "languageNotes" TEXT,
    "visaNotes" TEXT,
    "costOfLivingNotes" TEXT,
    "safetyNotes" TEXT,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costOfLivingEstimate" TEXT,
    "housingNotes" TEXT,
    "transportNotes" TEXT,
    "weatherNotes" TEXT,
    "safetyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "cityId" TEXT,
    "name" TEXT NOT NULL,
    "officialWebsite" TEXT,
    "facultyOrDepartment" TEXT,
    "universityRankingNotes" TEXT,
    "tuitionNotes" TEXT,
    "applicationPortalUrl" TEXT,
    "internationalOfficeUrl" TEXT,
    "notes" TEXT,
    "status" "UniversityStatus" NOT NULL DEFAULT 'RESEARCHING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeType" "DegreeType" NOT NULL DEFAULT 'MSc',
    "department" TEXT,
    "mode" "ProgramMode" NOT NULL DEFAULT 'UNKNOWN',
    "duration" TEXT,
    "officialUrl" TEXT,
    "applicationDeadline" TIMESTAMP(3),
    "intakeTerm" TEXT,
    "tuitionAmount" DECIMAL(12,2),
    "currency" TEXT,
    "minimumGpa" TEXT,
    "languageRequirement" TEXT,
    "greRequired" BOOLEAN NOT NULL DEFAULT false,
    "supervisorRequired" BOOLEAN NOT NULL DEFAULT false,
    "applicationFee" DECIMAL(12,2),
    "requiredDocuments" TEXT,
    "suitableForMeScore" INTEGER,
    "fitReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "generalSpecialization" TEXT,
    "researchSpecializations" TEXT[],
    "researchKeywords" TEXT[],
    "officialProfileUrl" TEXT,
    "labUrl" TEXT,
    "linkedinUrl" TEXT,
    "googleScholarUrl" TEXT,
    "personalWebsiteUrl" TEXT,
    "email" TEXT,
    "acceptingStudents" "AcceptingStudents" NOT NULL DEFAULT 'UNKNOWN',
    "lastVerifiedAt" TIMESTAMP(3),
    "fitScore" INTEGER,
    "fitReason" TEXT,
    "contactStatus" "ContactStatus" NOT NULL DEFAULT 'NOT_CONTACTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "universityId" TEXT,
    "countryId" TEXT,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "officialUrl" TEXT,
    "fundingType" "FundingType" NOT NULL DEFAULT 'OTHER',
    "valueAmount" DECIMAL(12,2),
    "currency" TEXT,
    "coverageDescription" TEXT,
    "eligibility" TEXT,
    "deadline" TIMESTAMP(3),
    "applicationMethod" TEXT,
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'RESEARCHING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "category" "RequirementCategory" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "details" TEXT,
    "minimumValue" TEXT,
    "officialSourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'RESEARCHING',
    "submittedAt" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "applicationPortalUrl" TEXT,
    "applicationReferenceNumber" TEXT,
    "feePaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "relatedUniversityId" TEXT,
    "relatedProgramId" TEXT,
    "relatedScholarshipId" TEXT,
    "relatedProfessorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLog" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" "ContactChannel" NOT NULL DEFAULT 'EMAIL',
    "subject" TEXT,
    "messageSummary" TEXT,
    "outcome" TEXT,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PlaceCategory" NOT NULL DEFAULT 'OTHER',
    "mapUrl" TEXT,
    "websiteUrl" TEXT,
    "priceLevel" TEXT,
    "notes" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "countryId" TEXT,
    "universityId" TEXT,
    "programId" TEXT,
    "professorId" TEXT,
    "scholarshipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProgramProfessors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramProfessors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE INDEX "Country_region_idx" ON "Country"("region");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "Country"("name");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "City"("countryId");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "University_countryId_idx" ON "University"("countryId");

-- CreateIndex
CREATE INDEX "University_cityId_idx" ON "University"("cityId");

-- CreateIndex
CREATE INDEX "University_status_idx" ON "University"("status");

-- CreateIndex
CREATE INDEX "University_priority_idx" ON "University"("priority");

-- CreateIndex
CREATE INDEX "University_name_idx" ON "University"("name");

-- CreateIndex
CREATE INDEX "Program_universityId_idx" ON "Program"("universityId");

-- CreateIndex
CREATE INDEX "Program_degreeType_idx" ON "Program"("degreeType");

-- CreateIndex
CREATE INDEX "Program_applicationDeadline_idx" ON "Program"("applicationDeadline");

-- CreateIndex
CREATE INDEX "Program_suitableForMeScore_idx" ON "Program"("suitableForMeScore");

-- CreateIndex
CREATE INDEX "Professor_universityId_idx" ON "Professor"("universityId");

-- CreateIndex
CREATE INDEX "Professor_contactStatus_idx" ON "Professor"("contactStatus");

-- CreateIndex
CREATE INDEX "Professor_acceptingStudents_idx" ON "Professor"("acceptingStudents");

-- CreateIndex
CREATE INDEX "Professor_fitScore_idx" ON "Professor"("fitScore");

-- CreateIndex
CREATE INDEX "Professor_fullName_idx" ON "Professor"("fullName");

-- CreateIndex
CREATE INDEX "Scholarship_universityId_idx" ON "Scholarship"("universityId");

-- CreateIndex
CREATE INDEX "Scholarship_countryId_idx" ON "Scholarship"("countryId");

-- CreateIndex
CREATE INDEX "Scholarship_fundingType_idx" ON "Scholarship"("fundingType");

-- CreateIndex
CREATE INDEX "Scholarship_status_idx" ON "Scholarship"("status");

-- CreateIndex
CREATE INDEX "Scholarship_deadline_idx" ON "Scholarship"("deadline");

-- CreateIndex
CREATE INDEX "Requirement_programId_idx" ON "Requirement"("programId");

-- CreateIndex
CREATE INDEX "Requirement_category_idx" ON "Requirement"("category");

-- CreateIndex
CREATE INDEX "Requirement_isCompleted_idx" ON "Requirement"("isCompleted");

-- CreateIndex
CREATE INDEX "Application_programId_idx" ON "Application"("programId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_relatedUniversityId_idx" ON "Task"("relatedUniversityId");

-- CreateIndex
CREATE INDEX "Task_relatedProgramId_idx" ON "Task"("relatedProgramId");

-- CreateIndex
CREATE INDEX "Task_relatedScholarshipId_idx" ON "Task"("relatedScholarshipId");

-- CreateIndex
CREATE INDEX "Task_relatedProfessorId_idx" ON "Task"("relatedProfessorId");

-- CreateIndex
CREATE INDEX "ContactLog_professorId_idx" ON "ContactLog"("professorId");

-- CreateIndex
CREATE INDEX "ContactLog_date_idx" ON "ContactLog"("date");

-- CreateIndex
CREATE INDEX "ContactLog_followUpDate_idx" ON "ContactLog"("followUpDate");

-- CreateIndex
CREATE INDEX "Place_cityId_idx" ON "Place"("cityId");

-- CreateIndex
CREATE INDEX "Place_category_idx" ON "Place"("category");

-- CreateIndex
CREATE INDEX "Note_countryId_idx" ON "Note"("countryId");

-- CreateIndex
CREATE INDEX "Note_universityId_idx" ON "Note"("universityId");

-- CreateIndex
CREATE INDEX "Note_programId_idx" ON "Note"("programId");

-- CreateIndex
CREATE INDEX "Note_professorId_idx" ON "Note"("professorId");

-- CreateIndex
CREATE INDEX "Note_scholarshipId_idx" ON "Note"("scholarshipId");

-- CreateIndex
CREATE INDEX "Note_title_idx" ON "Note"("title");

-- CreateIndex
CREATE INDEX "_ProgramProfessors_B_index" ON "_ProgramProfessors"("B");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedUniversityId_fkey" FOREIGN KEY ("relatedUniversityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedProgramId_fkey" FOREIGN KEY ("relatedProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedScholarshipId_fkey" FOREIGN KEY ("relatedScholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_relatedProfessorId_fkey" FOREIGN KEY ("relatedProfessorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLog" ADD CONSTRAINT "ContactLog_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramProfessors" ADD CONSTRAINT "_ProgramProfessors_A_fkey" FOREIGN KEY ("A") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramProfessors" ADD CONSTRAINT "_ProgramProfessors_B_fkey" FOREIGN KEY ("B") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
