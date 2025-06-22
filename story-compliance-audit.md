# SentientZone Story Compliance Audit

This document compares the current repository implementation against the canonical ERP + FSM user stories. Status key:

- ✅ Fully implemented
- ⚠️ Partially implemented / mocked
- ❌ Missing

| Module | User Story ID | Description | Status | Notes |
|--------|---------------|-------------|--------|-------|
| User Management | 1 | Admin manages user accounts | ❌ | No user creation UI; only auth stub |
| User Management | 2 | Admin assigns roles | ⚠️ | `user_roles` table exists but no UI | 
| User Management | 3 | Admin deactivates/reactivates accounts | ❌ | No functionality |
| User Management | 4 | Sales Manager views directory of reps/installers | ❌ | Not implemented |
| User Management | 5 | Installer updates own profile | ❌ | Not implemented |
| Inventory | 6 | Admin defines material types & attributes | ❌ | Materials table referenced but migration missing |
| Inventory | 7 | Install Manager receives low‑stock alerts | ❌ | No alert system |
| Inventory | 8 | Installer views materials for assigned jobs | ✅ | `JobDetailPage` shows job materials |
| Inventory | 9 | Install Manager adjusts on‑hand quantities after jobs | ⚠️ | Materials usage tracked per job but no global inventory update |
| Quoting & Job Creation | 10 | Sales Rep creates client lead | ✅ | `ClientsPage` creates clients via Supabase |
| Quoting & Job Creation | 11 | Sales Rep selects rooms & sensors per room | ⚠️ | Quote form and job builder allow manual entry only |
| Quoting & Job Creation | 12 | Pricing rules/margins applied | ❌ | No pricing logic |
| Quoting & Job Creation | 13 | Sales Manager reviews and approves quotes | ⚠️ | Approve button only updates local state |
| Scheduling | 14 | Sales Manager assigns Install Manager & schedule | ⚠️ | Jobs can be created and assigned, but no calendar UI |
| Scheduling | 15 | Install Manager views calendar of jobs | ❌ | Dashboard lists jobs only |
| Scheduling | 16 | Installer sees personal schedule | ⚠️ | Appointment summary lists jobs; not full schedule |
| Scheduling | 17 | Sales Rep requests rescheduling | ❌ | Not implemented |
| On‑Site Job Mgmt | 18 | Installer views job details | ✅ | Detailed `JobDetailPage` |
| On‑Site Job Mgmt | 19 | Installer logs material usage | ✅ | Materials table with update inputs |
| On‑Site Job Mgmt | 20 | Installer completes checklist | ✅ | `InstallerChecklistWizard` |
| On‑Site Job Mgmt | 21 | Install Manager monitors job progress | ⚠️ | QA panel updates status but not real‑time |
| Invoicing & Payments | 22 | Generate invoice from actual usage | ❌ | `InvoicesPage` contains mock data |
| Invoicing & Payments | 23 | Sales Rep sends invoices | ❌ | No sending mechanism |
| Invoicing & Payments | 24 | Admin records payment receipt | ⚠️ | `PaymentsPage` uses local state only |
| Invoicing & Payments | 25 | Report outstanding invoices | ❌ | Not implemented |
| Reporting & Analytics | 26 | Admin revenue/margin dashboards | ⚠️ | `ReportsPage` shows static placeholders |
| Reporting & Analytics | 27 | Lead‑to‑close conversion rates | ❌ | Missing |
| Reporting & Analytics | 28 | Avg install times per room | ❌ | Missing |
| Reporting & Analytics | 29 | Installer performance stats | ❌ | Missing |

### Role-Based Access Summary
Routes and guards from `App.jsx`:

```
<Route element={<RequireRoleOutlet role="Installer" />}> … </Route>
<Route element={<RequireRoleOutlet role="Admin" />}> … </Route>
<Route element={<RequireRoleOutlet role="Manager" />}> … </Route>
<RequireRole role={["Manager", "Admin"]}> … </RequireRole>
```
Key mappings:
- `Installer` routes: `/`, `/appointments`, `/activity`, `/ifi`, `/job/:jobId`, `/mock-jobs`, `/installer/dashboard`, `/installer/jobs/:id`
- `Admin` routes: `/admin/jobs/new`, `/admin/jobs/:id`
- `Manager` routes: `/manager/review`
- `Manager` or `Admin` routes: `/install-manager`, `/install-manager/job/new`, `/clients`, `/quotes`, `/invoices`, `/payments`, `/messages`, `/time-tracking`, `/reports`
- `/feedback` protected by `RequireRole(["Installer","Manager","Admin"])`

Source lines: see `App.jsx` lines 30‑125 for route definitions.

### Persistence Layer Map
| Feature | Storage |
|---------|---------|
| Jobs, Job Materials, Checklist Items, Clinics, User Roles, Audit Log | Supabase tables |
| Appointment summary, activity logs, IFI scores, feedback | LocalStorage (mock) |
| Quotes, Invoices, Payments, Messages, Time tracking, Reports | Local component state only |
| Document uploads | Supabase storage bucket |

Examples:
- LocalStorage usage: `useInstallerData.js` lines 100‑189
- Supabase job creation: `NewJobBuilderPage.tsx` lines 92‑119
- Local invoices state: `InvoicesPage.tsx` lines 1‑27

### Suggested Refactor Tasks
- Implement real authentication (sign in/out) and user management UI; integrate with `user_roles` for role assignment.
- Add missing migration and CRUD pages for `materials` table; support inventory thresholds and alerts.
- Replace localStorage/mock data (appointments, activity logs, IFI, invoices, payments, quotes) with Supabase tables and queries.
- ~~Protect `/feedback` route with `<RequireRole>` or `<RequireAuth>` to prevent anonymous access.~~ (implemented)
- Provide calendar views for job scheduling and installer availability.
- Implement pricing rule logic in quoting to compute margins automatically.
- Generate invoices from job data and enable sending via email; track payment status in database.
- Expand reporting pages to use real aggregated metrics (revenue, lead conversion, install times, installer performance).

### Fix Sprint Plan
1. **Sprint 1**
   - Finalize authentication flow and user management UI.
   - Protect remaining routes with `RequireRole`.
   - Ship migrations and CRUD screens for `materials` with low-stock alerts.
2. **Sprint 2**
   - Replace localStorage/mock data with Supabase tables (appointments, activity logs, IFI, quotes, invoices, payments).
   - Implement pricing rule logic in quoting.
   - Introduce calendar views for scheduling and installer availability.
3. **Sprint 3**
   - Generate invoices from job data, enable email sending, and track payments in database.
   - Build analytics dashboards with real metrics for Admin, Sales Manager, and Install Manager.
