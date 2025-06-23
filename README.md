````markdown
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
````

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file:**

   ```bash
   echo "VITE_SUPABASE_URL=YOUR_SUPABASE_URL" >> .env
   echo "VITE_SUPABASE_API_KEY=YOUR_SUPABASE_ANON_KEY" >> .env
   # or VITE_SUPABASE_ANON_KEY
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

5. **Open the printed local URL** in your browser to access the app.

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

---

## Notes

* Tailwind CSS is preconfigured.
* Supabase client is initialized in `lib/supabaseClient.ts`.
* API route handlers live in `api/` and assume a compatible local Supabase schema.
* App uses Vite, not Next.js. Ensure no middleware from Next remains in the repo.

```
```
