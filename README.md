<div align="center">

# 📊 Project Tracker

**Projects, tasks, customers and working hours – all in one place.**
A web app for agencies: the team keeps track of everything, customers see the status of their projects.

![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Directus](https://img.shields.io/badge/Backend-Directus-6644FF?logo=directus&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A522.12-339933?logo=nodedotjs&logoColor=white)

[Features](#-features) · [Quick start](#-quick-start) · [Usage](#️-usage) · [Architecture](#️-architecture) · [Development](#️-development)

</div>

---

## 🎯 What is it?

Project Tracker is an internal project management tool. In everyday work it answers three questions:

| Question | Where do I find the answer? |
| -------- | --------------------------- |
| *What are we working on right now?* | **Dashboard**, **Projects**, **Tasks** |
| *How much time goes into which project?* | **Time tracking**, weekly chart on the dashboard |
| *What is due when?* | **Calendar** |

The app is only the user interface. All data lives in a **[Directus](https://directus.io)** backend, which also manages users and roles.

## ✨ Features

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, Segoe UI, sans-serif','fontSize':'15px','lineColor':'#94a3b8'}}}%%
flowchart LR
    PT(["<b>📊 Project<br/>Tracker</b>"]):::root

    PT --> D["📈 <b>Dashboard</b>"]:::dash
    D --> D1["Project stats"]:::dash
    D --> D2["My tasks this week"]:::dash
    D --> D3["Working-time chart"]:::dash

    PT --> P["📁 <b>Projects</b>"]:::proj
    P --> P1["List with status filter"]:::proj
    P --> P2["Create new project"]:::proj

    PT --> T["✅ <b>Tasks</b>"]:::task
    T --> T1["Create new task"]:::task
    T --> T2["Priority & due date"]:::task

    PT --> C["🏢 <b>Company profile</b>"]:::comp
    C --> C1["Customer contacts"]:::comp
    C --> C2["Contact persons"]:::comp
    C --> C3["Locations"]:::comp

    PT --> TT["⏱️ <b>Time tracking</b>"]:::time
    TT --> TT1["Book time on tasks"]:::time
    TT --> TT2["Edit & delete entries"]:::time

    PT --> CAL["📅 <b>Calendar</b>"]:::cal
    CAL --> CAL1["Day, week, month"]:::cal
    CAL --> CAL2["Due dates"]:::cal

    PT --> S["⚙️ <b>Settings</b>"]:::set
    S --> S1["Profile & avatar"]:::set
    S --> S2["Password"]:::set
    S --> S3["Notifications"]:::set

    classDef root fill:#4f46e5,stroke:#312e81,color:#ffffff,stroke-width:3px
    classDef dash fill:#fef3c7,stroke:#f59e0b,color:#78350f
    classDef proj fill:#dcfce7,stroke:#22c55e,color:#14532d
    classDef task fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95
    classDef comp fill:#fce7f3,stroke:#ec4899,color:#831843
    classDef time fill:#cffafe,stroke:#06b6d4,color:#164e63
    classDef cal fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    classDef set fill:#e2e8f0,stroke:#64748b,color:#1e293b
```

- **Dashboard** – key figures, this week's tasks, booked working time and customer contacts at a glance.
- **Projects** – list with status filter and a form for new projects.
- **Tasks** – tasks with priority and due date, which can also be created straight from a project.
- **Company profile** – customer companies with contact persons, locations and notes.
- **Time tracking** – book working time on tasks, edit and delete entries.
- **Calendar** – due dates in day, week and month view.
- **Settings** – profile data, avatar, password and notifications.
- **Roles and permissions** – customers only see what is meant for them.
- **Bilingual** – German (default) and English.

## 👥 Roles

| Role | Dashboard | Projects | Tasks | Company profile | Time | Calendar | Settings |
| ---- | :-------: | :------: | :---: | :-------------: | :--: | :------: | :------: |
| **Administrator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Agentur Mitarbeiter** (agency employee) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Kunden** (customer) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

With an unknown or missing role the app only shows the dashboard. Tasks and time entries are also blocked for customers in the API (HTTP 403).

> The role names are matched exactly as written above, so create them with these names in Directus.

## 🚀 Quick start

**Requirements:** [Node.js](https://nodejs.org) ≥ 22.12 and a reachable Directus instance.

```bash
# 1. Install dependencies
npm install

# 2. Add your credentials
cp apps/web/.env.example apps/web/.env

# 3. Start the development server
npm run dev
```

The app is then available at the address Astro prints in the terminal (usually <http://localhost:4321>).

### Configuration

In `apps/web/.env`:

| Variable | Meaning |
| -------- | ------- |
| `DIRECTUS_URL` | Address of your Directus instance, e.g. `https://directus.example.com` |
| `DIRECTUS_TOKEN` | Static access token of a Directus user |

> 🔒 The `.env` file contains credentials. Never commit it to Git.

### Production

```bash
npm run build   # build the app
npm run start   # start the Node server (apps/web/dist/server/entry.mjs)
```

The time zone is fixed to `Europe/Berlin`, so due dates and working hours look the same everywhere.

## 🖱️ Usage

### Workflow at a glance

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, Segoe UI, sans-serif','fontSize':'18px','lineColor':'#94a3b8'}}}%%
flowchart TB
    A(["🔑 <b>Sign in</b>"]):::start --> B["📊 <b>Dashboard</b> — your overview"]:::step
    B --> C["📁 <b>Create a project</b>"]:::step
    C --> D["✅ <b>Add tasks</b> to the project"]:::step
    D --> E["⏱️ <b>Book time</b> on tasks"]:::done
    D --> F["📅 <b>Check due dates</b> in the calendar"]:::done

    classDef start fill:#4f46e5,stroke:#312e81,color:#ffffff,stroke-width:2px
    classDef step fill:#e0e7ff,stroke:#6366f1,color:#312e81,stroke-width:2px
    classDef done fill:#dcfce7,stroke:#22c55e,color:#14532d,stroke-width:2px
```

### Step by step

1. **Sign in** – Enter your email and password on `/login`. With "stay signed in" the session lasts longer.
2. **Find your way around** – Use the sidebar on the left to switch between areas. There you can also switch teams and open your profile.
3. **Create a project** – Under **Projects**, click the create button. Fill in basics, schedule and notes, then save.
4. **Add tasks** – Under **Tasks**, create a new task, assign it to a project and set priority and due date.
5. **Book time** – Under **Time tracking**, book working time on a task. Entries can be edited or deleted later.
6. **Check due dates** – In the **Calendar**, switch between day, week and month. If a day has many entries, "more" shows the full list.
7. **Personalise** – Under **Settings**, change your profile, avatar, password and notifications.

### Pages

| Area | Address | Purpose |
| ---- | ------- | ------- |
| Dashboard | `/` | Overview |
| Projects | `/projects` | Project list, new project |
| Tasks | `/tasks` | Task management |
| Company profile | `/company-profile` | Customers, contact persons, locations |
| Time tracking | `/time-tracking` | Working hours |
| Calendar | `/calendar` | Due dates |
| Settings | `/settings` | Profile and account |

## 🏗️ Architecture

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, Segoe UI, sans-serif','fontSize':'18px','lineColor':'#94a3b8'}}}%%
flowchart TB
    U(["👤 <b>Browser</b>"]):::user

    subgraph WEB["&nbsp;apps/web · Astro + React (Node server)&nbsp;"]
        direction TB
        MW["🛡️ <b>Middleware</b> — checks session & role"]:::guard
        P["📄 <b>Pages</b> (.astro)"]:::app
        C["⚛️ <b>React components</b>"]:::app
        API["🔌 <b>API routes</b> (/api/*)"]:::app
        S["🧩 <b>Services</b> — handler · validation · mapper · repository"]:::app
        MW --> P --> C -- fetch --> API --> S
    end

    UI["🎨 <b>packages/ui</b> — shared shadcn/ui components"]:::ui
    D[("🗄️ <b>Directus</b> — data · users · roles")]:::db

    U --> MW
    C -.- UI
    S -- Directus SDK --> D

    style WEB fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,stroke-dasharray:6 4,color:#334155
    classDef user fill:#4f46e5,stroke:#312e81,color:#ffffff,stroke-width:2px
    classDef guard fill:#fef3c7,stroke:#f59e0b,color:#78350f,stroke-width:2px
    classDef app fill:#e0e7ff,stroke:#6366f1,color:#312e81,stroke-width:2px
    classDef ui fill:#fce7f3,stroke:#ec4899,color:#831843,stroke-width:2px
    classDef db fill:#dcfce7,stroke:#22c55e,color:#14532d,stroke-width:2px
```

Every request first passes through the **middleware**. It checks the sign-in, renews sessions automatically and loads the role. Only `/login` is public. The API routes talk to Directus with the signed-in user's token, so Directus itself checks permissions on every access.

### Anatomy of a feature

Every feature (projects, tasks, time entries …) is layered the same way, from the form down to the database:

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'Inter, Segoe UI, sans-serif','fontSize':'18px','lineColor':'#94a3b8'}}}%%
flowchart TB
    A["📝 <b>Form</b> — React component the user fills in"]:::a
    B["🌐 <b>client</b> — sends the request with fetch"]:::b
    C["🔌 <b>handlers</b> — API route receives it"]:::c
    D["✔️ <b>validation</b> — checks the input"]:::d
    E["🔁 <b>mapper</b> — translates form ↔ Directus fields"]:::e
    F["🗄️ <b>repository</b> — talks to Directus via the SDK"]:::f
    A --> B --> C --> D --> E --> F

    classDef a fill:#e0e7ff,stroke:#6366f1,color:#312e81,stroke-width:2px
    classDef b fill:#cffafe,stroke:#06b6d4,color:#164e63,stroke-width:2px
    classDef c fill:#ede9fe,stroke:#8b5cf6,color:#4c1d95,stroke-width:2px
    classDef d fill:#fef3c7,stroke:#f59e0b,color:#78350f,stroke-width:2px
    classDef e fill:#fce7f3,stroke:#ec4899,color:#831843,stroke-width:2px
    classDef f fill:#dcfce7,stroke:#22c55e,color:#14532d,stroke-width:2px
```

### Folder structure

```text
Project-Manager/
├── apps/
│   └── web/                     The application
│       └── src/
│           ├── pages/           Pages and API routes (/api/*)
│           ├── components/      React components per area
│           ├── services/        Business logic per feature
│           ├── lib/             Auth, roles, navigation, helpers
│           ├── hooks/           React hooks
│           ├── i18n/            Texts in German / English
│           └── middleware.ts    Session and access protection
├── packages/
│   └── ui/                      Shared shadcn/ui building blocks
├── docs/                        Plans and drafts
├── turbo.json                   Monorepo tasks (Turborepo)
└── package.json                 npm workspaces
```

### Tech stack

| Area | Used |
| ---- | ---- |
| Framework | [Astro](https://astro.build) 7 (server rendering, Node adapter) |
| UI | [React](https://react.dev) 19, [shadcn/ui](https://ui.shadcn.com), [Tailwind CSS](https://tailwindcss.com) 4 |
| Tables / state | TanStack Table, Zustand |
| Backend | [Directus](https://directus.io) via `@directus/sdk` |
| Language | TypeScript |
| Quality | ESLint, Prettier, Vitest |
| Monorepo | npm workspaces and Turborepo |

## 🛠️ Development

Run all commands from the repository root:

| Command | Effect |
| ------- | ------ |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start the built server |
| `npm run test` | Tests (Vitest) |
| `npm run lint` | Lint the code (ESLint) |
| `npm run typecheck` | Check types |
| `npm run format` | Format the code (Prettier) |

### Add a shadcn/ui component

```bash
npx shadcn@latest add button -c apps/web
```

### Add a new page

Menu entries are defined in one place only: [`apps/web/src/lib/navigation.ts`](apps/web/src/lib/navigation.ts). The sidebar and the role permissions ([`roles.ts`](apps/web/src/lib/auth/roles.ts)) are derived from it.
