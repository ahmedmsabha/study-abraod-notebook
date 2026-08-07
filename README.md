# Academic Compass

Private, single-user research notebook for planning MSc applications abroad. Track countries, universities, programs, professors, scholarships, applications, tasks, local life, and notes — with English/Arabic UI and CSV import/export for professors and programs.

Built with **Next.js 16**, React 19, Tailwind CSS v4, shadcn/ui, Prisma 7, and **Prisma Postgres**.

## Prerequisites

- Node.js 20+
- A [Prisma Postgres](https://console.prisma.io) database (or any Postgres URL compatible with `@prisma/adapter-pg`)

## Setup

```bash
npm install
```

Link your Prisma Postgres database (writes `DATABASE_URL` to `.env`):

```bash
npx prisma postgres link --database "<your-db-id>"
```

Or copy [`.env.example`](.env.example) to `.env` and set `DATABASE_URL` manually.

Then:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/en/dashboard`. Arabic RTL: `/ar/dashboard`.

## App sections

| Route | What it does |
|-------|----------------|
| Dashboard | Counts, deadlines, pipeline chart, quick actions, search |
| Countries | Grid/table + country profile (cities, universities, notes) |
| Universities | Filterable table + tabbed detail |
| Programs | Spec columns, requirements checklist, CSV import/export |
| Professors | Required research columns, contact log, CSV import/export |
| Scholarships | Table/cards, deadline badges, eligibility checklist |
| Applications | Kanban board with status dropdown |
| Tasks | List + month calendar |
| Local Life | Places by country/city/category (personal notes, no map API) |
| Notes | Markdown notes with tags and entity links |

## Localization & theme

- Locales: English (`en`, default) and Arabic (`ar`) with always-prefixed URLs
- Routing: `next-intl` via `src/proxy.ts` (Next.js 16 Proxy) and `src/i18n/*`
- Messages: `messages/en.json`, `messages/ar.json`
- Theme: light / dark / system (`next-themes`); fonts Source Serif 4 + IBM Plex Sans (+ Arabic)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:verify` | Smoke-test DB connection + seed counts |
| `npm run actions:verify` | Smoke-test Zod + multi-entity CRUD |

## Database

- ORM: Prisma 7 (`prisma-client` generator → `generated/prisma`)
- Adapter: `@prisma/adapter-pg` + `pg`
- Config: `prisma.config.ts` (URL + seed command)
- Singleton: `src/lib/prisma.ts` (server-side only)

Domain models: Country, City, University, Program, Professor, Scholarship, Requirement, Application, Task, ContactLog, Place, Note, plus auth-ready `User` stub.

Mutations use Zod 4 schemas (`src/lib/validations/`) and Server Actions (`src/actions/`). Forms use React Hook Form + `zodResolver` (`src/lib/forms.ts`).

Seed includes Canada → Toronto → University of Toronto / ECE sample programs, professors (placeholder `https://example.com` URLs only), scholarship, application, tasks, places, and notes.

CSV templates:

- [`public/templates/professors-template.csv`](public/templates/professors-template.csv)
- [`public/templates/programs-template.csv`](public/templates/programs-template.csv)

Import matches **University Name + Country** against existing universities — add the university first.

## Project structure

```
src/
  app/[locale]/(app)/   # Feature routes (loading/error boundaries included)
  actions/              # Server Actions (CRUD + CSV import)
  components/
    layout/             # Sidebar, header, shell
    shared/             # Page header, empty/loading/error, callouts
    {feature}/          # Page-specific tables, forms, boards
    ui/                 # shadcn primitives
  i18n/
  lib/
    prisma.ts
    validations/
    csv/                # Papa Parse helpers + column maps
    action-utils.ts
    forms.ts
  proxy.ts
generated/prisma/       # Prisma Client (gitignored)
prisma/
messages/
public/templates/
```

## Verify locally

```bash
npm run db:verify
npm run actions:verify
npm run lint
npm run build
```

## License

Private personal project.
