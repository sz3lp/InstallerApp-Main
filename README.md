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
3. Run the test suite to make sure everything works:
   ```bash
   npm test
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the printed local URL in your browser to see the app. Tailwind CSS styles are loaded automatically.

The original application structure inside `installer-app/` has not been modified.

## Database Migrations

The API relies on an `audit_log` table for recording installer activity. SQL
migration files are provided in `installer-app/api/migrations`. Run these
migrations on your Postgres database before starting the app:

```bash
psql $DATABASE_URL -f installer-app/api/migrations/001_create_audit_log.sql
```

Apply any additional migration files in the folder in order when deploying a new
environment.
