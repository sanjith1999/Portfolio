# Portfolio Website

Personal portfolio site built with Next.js, TypeScript, Material UI, and MongoDB.

## What This App Includes

- Public portfolio pages with project cards and project detail view.
- Admin area for creating/editing/deleting projects.
- Rich block-based project editor (headings, text, lists, image, equation, code, columns).
- JWT cookie authentication for admin-only operations.
- Multiple UI themes with a floating theme selector.

## Tech Stack

- Framework: Next.js (App Router), React, TypeScript
- UI: MUI, styled-components, framer-motion
- Data: MongoDB via Mongoose
- State: Zustand

## Project Structure

```text
src/
  app/
    api/                  # Route handlers (auth, projects, uploads, images, users)
    admin/                # Admin pages
    components/           # Shared UI + editor components
    models/               # Mongoose models
  lib/                    # Auth, DB connection, validation, rate limit helpers
  store/                  # Zustand stores
  types/                  # Shared domain types (Project/Block)
```

## Environment Variables

Create `.env.local` with:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production app
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run node-based automated tests
- `npm run format`: Format source files

## API Notes

- Public read:
  - `GET /api/projects/visible`
  - `GET /api/projects/[id]` (only if project is visible, unless admin token exists)
  - `GET /api/get-image?id=...`
- Admin-protected:
  - `GET/POST /api/projects`
  - `PUT/DELETE /api/projects/[id]`
  - `POST /api/upload`
  - `GET/POST /api/users`

All protected endpoints validate admin role from the JWT cookie (`token`).

## Maintainability Guidelines

- Keep shared project types in `src/types/project.ts` as the single source of truth.
- Keep API logic in route handlers thin by using `src/lib/*` helpers.
- Prefer adding validations in `src/lib/validation.ts` when request shapes evolve.
- Add tests for any auth or data-flow change, especially around protected APIs.
