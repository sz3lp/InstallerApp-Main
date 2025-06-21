# Installer App Development Setup

This repository contains the extracted Vite + React installer application in the `installer-app/` directory.

## Running the App

1. Navigate into the app folder:
   ```bash
   cd installer-app
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file containing your Supabase credentials:
   ```bash
   echo "VITE_SUPABASE_URL=YOUR_SUPABASE_URL" >> .env
   echo "VITE_SUPABASE_API_KEY=YOUR_SUPABASE_ANON_KEY" >> .env
   ```
4. Start the development server:

   ```bash

   ```

5. Open the printed local URL in your browser to see the app. Tailwind CSS styles are loaded automatically.

   ```

   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
7. Open the printed local URL in your browser to see the app. Tailwind CSS styles are loaded automatically.

The original application structure inside `installer-app/` has not been modified.

## Database Migrations

The API relies on an `audit_log` table for recording installer activity. SQL
migration files are provided in `installer-app/api/migrations`. Run these
migrations on your Postgres database before starting the app:

```bash
psql $DATABASE_URL -f installer-app/api/migrations/001_create_audit_log.sql
psql $DATABASE_URL -f installer-app/api/migrations/002_create_job_schema.sql
psql $DATABASE_URL -f installer-app/api/migrations/003_create_user_roles.sql
```

Apply any additional migration files in the folder in order when deploying a new
environment.
