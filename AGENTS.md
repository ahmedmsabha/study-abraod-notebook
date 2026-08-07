You are a senior full-stack engineer and UX designer. Build a production-quality personal web application called “Academic Compass”.

Purpose:
This is a private, single-user research notebook for a Computer Engineering student planning MSc applications abroad. It must centralize and organize:
1. Countries
2. Universities
3. Academic programs
4. Professors and research supervisors
5. Scholarships and funding opportunities
6. Admission requirements
7. Application tasks and deadlines
8. Personal notes, email/contact history, and saved links
9. Local life research for each city, including restaurants, grocery stores, neighborhoods, transportation, and safety notes

Primary user profile:
- Computer Engineering student
- Interested in AI, Machine Learning, Data Science, Computer Engineering, Embedded Systems, Software Engineering, Cloud/Distributed Systems, Robotics, and related MSc programs
- Needs to track universities mainly in Canada, the UK, Europe, and other study-abroad destinations
- The interface should support Arabic and English, with English as default and Arabic RTL support

Technical stack:
- Next.js 15+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- PostgreSQL hosted on Neon
- Prisma ORM
- Zod for validation
- React Hook Form for forms
- Lucide icons
- TanStack Table for advanced tables
- Recharts for dashboard charts
- CSV import/export using a reliable library
- Use local single-user mode initially; structure the database so authentication can be added later
- Use server actions or route handlers for mutations
- Use clean architecture and reusable UI components

Do not use MongoDB. Use Neon PostgreSQL with Prisma because the app contains highly relational data.

Build the project incrementally. First provide:
1. The project folder structure
2. Prisma schema
3. Environment variables template
4. Setup commands
5. Seed data
6. Then implement the pages and features

Core data entities and relationships:

Country:
- id
- name
- code
- region
- currency
- languageNotes
- visaNotes
- costOfLivingNotes
- safetyNotes
- generalNotes
- createdAt
- updatedAt

City:
- id
- countryId
- name
- costOfLivingEstimate
- housingNotes
- transportNotes
- weatherNotes
- safetyNotes
- createdAt
- updatedAt

University:
- id
- countryId
- cityId (optional)
- name
- officialWebsite
- facultyOrDepartment
- universityRankingNotes
- tuitionNotes
- applicationPortalUrl
- internationalOfficeUrl
- notes
- status: RESEARCHING | SHORTLISTED | APPLYING | APPLIED | OFFERED | REJECTED | ARCHIVED
- priority: LOW | MEDIUM | HIGH
- createdAt
- updatedAt

Program:
- id
- universityId
- name
- degreeType: MSc | MEng | MASc | MPhil | PhD | Other
- department
- mode: THESIS | COURSEWORK | MIXED | UNKNOWN
- duration
- officialUrl
- applicationDeadline
- intakeTerm
- tuitionAmount
- currency
- minimumGpa
- languageRequirement
- greRequired
- supervisorRequired
- applicationFee
- requiredDocuments
- suitableForMeScore from 1 to 10
- fitReason
- notes
- createdAt
- updatedAt

Professor:
- id
- universityId
- fullName
- title
- department
- generalSpecialization
- researchSpecializations (array or related normalized table)
- researchKeywords
- officialProfileUrl
- labUrl
- linkedinUrl
- googleScholarUrl
- personalWebsiteUrl
- email
- acceptingStudents: YES | NO | UNKNOWN
- lastVerifiedAt
- fitScore from 1 to 10
- contactStatus: NOT_CONTACTED | FOLLOWING | RESEARCHING | EMAIL_DRAFTED | EMAILED | REPLIED | MEETING | NOT_A_FIT
- notes
- createdAt
- updatedAt

Scholarship:
- id
- universityId (optional)
- countryId (optional)
- name
- provider
- officialUrl
- fundingType: FULL | PARTIAL | TUITION_WAIVER | STIPEND | RESEARCH_ASSISTANTSHIP | TEACHING_ASSISTANTSHIP | OTHER
- valueAmount
- currency
- coverageDescription
- eligibility
- deadline
- applicationMethod
- status: RESEARCHING | ELIGIBLE | APPLYING | APPLIED | AWARDED | NOT_ELIGIBLE | EXPIRED
- notes
- createdAt
- updatedAt

Requirement:
- id
- programId
- category: GPA | TOEFL | IELTS | GRE | CV | SOP | RECOMMENDATION | TRANSCRIPT | PORTFOLIO | INTERVIEW | SUPERVISOR | OTHER
- title
- details
- minimumValue
- officialSourceUrl
- verifiedAt
- isCompleted
- notes
- createdAt
- updatedAt

Application:
- id
- programId
- status: RESEARCHING | PREPARING | READY_TO_SUBMIT | SUBMITTED | INTERVIEW | OFFERED | ACCEPTED | REJECTED | WITHDRAWN
- submittedAt
- decisionDate
- applicationPortalUrl
- applicationReferenceNumber
- feePaid
- notes
- createdAt
- updatedAt

Task:
- id
- title
- description
- dueDate
- status: TODO | IN_PROGRESS | DONE | BLOCKED
- priority: LOW | MEDIUM | HIGH | URGENT
- relatedUniversityId (optional)
- relatedProgramId (optional)
- relatedScholarshipId (optional)
- relatedProfessorId (optional)
- createdAt
- updatedAt

ContactLog:
- id
- professorId
- date
- channel: EMAIL | LINKEDIN | WEBSITE | MEETING | OTHER
- subject
- messageSummary
- outcome
- followUpDate
- createdAt
- updatedAt

Place:
- id
- cityId
- name
- category: RESTAURANT | GROCERY | CAFE | HOUSING | TRANSPORT | HOSPITAL | STUDY_SPACE | GYM | OTHER
- mapUrl
- websiteUrl
- priceLevel
- notes
- rating
- createdAt
- updatedAt

Note:
- id
- title
- content
- tags
- countryId (optional)
- universityId (optional)
- programId (optional)
- professorId (optional)
- scholarshipId (optional)
- createdAt
- updatedAt

Required pages:

1. Dashboard:
- Overview cards for total universities, programs, professors, scholarships, applications, and tasks
- Upcoming deadlines section
- Application pipeline chart
- Professors to contact this week
- Scholarships with approaching deadlines
- Quick actions: Add University, Add Program, Add Professor, Add Scholarship, Add Task
- Search bar across all entities

2. Countries page:
- Grid and table views
- Country profile page with cities, universities, scholarships, visa notes, cost notes, and local places

3. Universities page:
- Advanced searchable/sortable/filterable table
- Filters: country, status, priority, degree type, research area
- University details page with tabs:
  Overview, Programs, Professors, Scholarships, Requirements, Notes, Tasks, Local Life
- Ability to add a university manually in a modal/form

4. Programs page:
- Table with columns:
  Country, University, Program, Degree Type, Mode, Deadline, Tuition, Supervisor Required, Language Requirement, Fit Score, Status
- Program detail page with requirements checklist and linked professors/scholarships

5. Professors page:
- Main table must include exactly these important columns:
  University Name
  Country
  Professor Name
  General Specialization
  Detailed Research Specialization
  LinkedIn URL
- Also include optional columns:
  Official Profile, Lab Website, Google Scholar, Email, Accepting Students, Fit Score, Contact Status, Last Verified, Notes
- Support filtering by country, university, general specialization, research keyword, accepting students, and contact status
- Show professor details with research interests, links, notes, contact log, and related programs
- Add a “Research Fit” score and a “Why this professor fits me” field
- Add a button to export filtered professors to CSV
- Add a CSV import tool with a downloadable sample template

6. Scholarships page:
- Table and card view
- Filters by country, university, funding type, deadline, and application status
- Deadline warning badges: overdue, within 7 days, within 30 days, future
- Detail page with eligibility checklist and connected programs

7. Application Tracker page:
- Kanban board with columns:
  Researching, Preparing, Ready to Submit, Submitted, Interview, Offered, Accepted, Rejected
- Drag and drop if practical; otherwise provide status dropdown
- Every application card shows university, program, deadline, and next task

8. Tasks and Calendar page:
- List view and calendar view
- Deadline and follow-up reminders
- Filter by type and related entity

9. Local Life page:
- Browse places by country and city
- Support restaurants, groceries, cafes, study spaces, housing notes, transportation, hospitals, and other useful places
- Keep it personal and note-focused; do not integrate map APIs initially

10. Notes page:
- Markdown-supported rich notes
- Tagging
- Full-text search
- Link notes to universities, professors, programs, scholarships, and countries

CSV requirements:
Implement import and export for:
A. Professors CSV:
University Name, Country, Professor Name, General Specialization, Detailed Research Specialization, LinkedIn URL, Official Profile URL, Lab URL, Google Scholar URL, Email, Accepting Students, Fit Score, Contact Status, Notes

B. Programs and requirements CSV:
Country, University Name, Program Name, Degree Type, Department, Official URL, Deadline, Tuition Notes, Language Requirement, GPA Requirement, Supervisor Required, Required Documents, Fit Reason, Notes

Seed data:
Create realistic but clearly labeled sample data for:
- University of Toronto in Canada
- Electrical and Computer Engineering department
- Several example professors with placeholder URLs only, not fabricated personal claims
- MSc/MASc example programs
- Sample scholarship and application requirements
Use “https://example.com” for all demo social and profile links unless a valid official link is explicitly supplied by the user.

Design requirements:
- Modern, calm, academic look
- Responsive desktop-first layout with good mobile usability
- Sidebar navigation
- Dark mode and light mode
- Clean dashboard
- Accessible forms, labels, validation errors, keyboard navigation
- Empty states, loading states, error states, toast notifications
- No fake API calls or fake completion claims
- Do not scrape LinkedIn
- Include a visible “Last verified” field for external facts such as professor availability, deadlines, and requirements
- Clearly distinguish user notes from official-source information

Deliverable quality:
- Write clean, maintainable, typed TypeScript
- Use Prisma migrations and seed script
- Add README instructions for local development and Neon deployment
- Add .env.example
- Include all database CRUD operations
- Include sample CSV templates in the public folder
- Do not leave incomplete placeholder components
- Make pragmatic choices and explain them briefly before implementing each major section

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
