# Implementation Coverage Audit

This document maps current code in the **SentientZone Installer & Manager** repo against the canonical ERP and FSM user stories. Status key:

- ✅ complete – functionality present and integrated with Supabase
- ⚠️ partial – implemented but missing flow or reliant on mock data
- ❌ missing – story not represented in code
- 🐛 broken – code exists but not functional
- 🔁 duplicated – logic repeated or conflicting

## Findings

### Auth & RLS

- **Auth Provider** in `src/lib/hooks/useAuth.tsx` handles session and reads roles from `user_roles` table. Sign‑in/out flows exist via `LoginPage.tsx`. ✅
- **Route protection** uses `RequireRole` components and is configured in `App.jsx` but imports and routes show duplicates. ⚠️ (duplicated entries / inconsistent guards)
- **Row level security** migrations for `jobs` and `qa_reviews` exist in `api/migrations/007_jobs_rls.sql` and `009_create_qa_reviews.sql`. ✅

### CRM – Leads & Clients

- `LeadsPage.tsx` with `useLeads` hook supports lead creation and status updates via Supabase. History modal uses `lead_status_history`. ✅
- Conversion of lead to client/job implemented in `leadEvents.ts` and called from `useLeads` but event functions mostly log to console. ⚠️
- No Kanban pipeline or dedicated lead form route. ❌
- `ClientsPage.tsx` provides CRUD for clinics stored in `clinics` table. ✅

### ERP – Quotes, Invoices, Payments

- `QuotesPage.tsx` stores quotes locally and can create jobs on approval via `useJobs`. Lacks Supabase persistence and real approval workflow. ⚠️
- `InvoicesPage.tsx` and `PaymentsPage.tsx` use local arrays only. ❌ for persistence.
- No outstanding invoices reporting, payment gateway or receipt emailing. ❌

### FSM – Jobs & Checklists

- `InstallManagerDashboard` with supporting hooks (`useJobs`, `MaterialTable`, `QAReviewPanel`) performs CRUD on `jobs` and `job_materials` tables. ✅
- `InstallerJobPage.tsx` allows installers to start jobs, log material usage, view documents and complete the `InstallerChecklistWizard`. ✅
- Checklist completion inserts into `checklists` table and updates job status via `updateStatus` hook. ✅
- Inventory decrement via RPC `decrement_inventory` in `MaterialUsage` component. ✅
- Calendar scheduling and rescheduling flows absent. ❌

### Reporting & Analytics

- `ReportsPage.tsx` is a placeholder with static content. ❌
- No dashboard pages for revenue, conversion, or installer performance. ❌

### Miscellaneous

- Many pages (Messages, Time Tracking) contain mock data without persistence. ⚠️
- `App.jsx` contains repeated imports and route definitions, indicating merge conflicts. 🔁

## Summary Table

| Domain | Story / Feature | Status | Related Files |
|-------|-----------------|--------|---------------|
| Auth | Login form & session | ✅ | `src/app/login/LoginPage.tsx` |
| Auth | Role-based guards | ⚠️ | `src/App.jsx`, `src/components/auth/RequireAuth.tsx` |
| Auth | User management UI | ❌ | |
| CRM | Lead CRUD & status | ✅ | `src/app/crm/LeadsPage.tsx`, `src/lib/hooks/useLeads.ts` |
| CRM | Lead → client conversion | ⚠️ | `src/lib/leadEvents.ts` |
| CRM | Pipeline board & Kanban | ❌ | |
| ERP | Client management | ✅ | `src/app/clients/ClientsPage.tsx`, `src/lib/hooks/useClinics.ts` |
| ERP | Quote management | ⚠️ | `src/app/quotes/QuotesPage.tsx` |
| ERP | Invoices & payments | ❌ | `src/app/invoices/InvoicesPage.tsx`, `src/app/payments/PaymentsPage.tsx` |
| ERP | Outstanding invoices report | ❌ | |
| FSM | Job builder & material table | ✅ | `src/app/install-manager/job/NewJobBuilderPage.tsx` |
| FSM | Installer job detail with checklist | ✅ | `src/app/installer/jobs/InstallerJobPage.tsx` |
| FSM | QA review and closeout | ✅ | `src/app/install-manager/QAReviewPanel.tsx` |
| FSM | Calendar scheduling | ❌ | |
| Reporting | Revenue/margin dashboards | ❌ | |
| Reporting | Lead conversion metrics | ❌ | |

## Next Steps

1. Clean up duplicated imports and routes in `App.jsx`; ensure each protected route uses `RequireRole` consistently.
2. Replace local state mocks (quotes, invoices, payments, messages, time tracking) with Supabase tables and API routes.
3. Implement Kanban-style pipeline and dedicated lead form to complete CRM flow.
4. Build inventory alerts and calendar scheduling features from the guidebook prompts.
5. Add reporting pages with real aggregated metrics.

