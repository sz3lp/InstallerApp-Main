# Installer App Development Setup

This repository contains the Vite + React Installer App located in the `installer-app/` directory.

---

## Prerequisites

- Node.js ≥ 18.x
- Supabase project with:
  - `jobs`, `job_materials`, `checklists`, `documents`, `feedback`, `user_roles` tables
  - Public storage bucket for document uploads

---

## Local Setup

1. **Navigate into the app:**
   ```bash
   cd installer-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file:**

   ```bash
   echo "VITE_SUPABASE_URL=YOUR_SUPABASE_URL" >> .env
   echo "VITE_SUPABASE_API_KEY=YOUR_SUPABASE_ANON_KEY" >> .env
   # or VITE_SUPABASE_ANON_KEY
   echo "STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET" >> .env
   echo "STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET" >> .env
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

5. **Open the printed local URL** in your browser to access the app.

Supabase Edge Functions for Stripe live in `functions/`. Deploy them via
`supabase functions deploy`.

### Running Tests

After installing dependencies, execute:

```bash
npm test
```

---

## Database Migrations

Apply migrations to provision required tables in your Supabase/Postgres instance:

```bash
psql $DATABASE_URL -f installer-app/api/migrations/001_create_audit_log.sql
psql $DATABASE_URL -f installer-app/api/migrations/002_create_job_schema.sql
psql $DATABASE_URL -f installer-app/api/migrations/003_create_user_roles.sql
psql $DATABASE_URL -f installer-app/api/migrations/004_create_feedback.sql
```

Run additional migration files in order when setting up new environments.

### User Roles

Available application roles:

- Admin
- Manager
- Installer
- Sales
- Install Manager
- Finance

Roles are assigned in the `user_roles` table and validated against the `roles` lookup table.

---

## Notes

- Tailwind CSS is preconfigured.
- Supabase client is initialized in `lib/supabaseClient.ts`.
- API route handlers live in `api/` and assume a compatible local Supabase schema.
- App uses Vite, not Next.js. Ensure no middleware from Next remains in the repo.

