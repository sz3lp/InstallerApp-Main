# SentientZone Codex Guidebook

This guidebook contains atomic Codex prompts for implementing missing features in the SentientZone ERP + FSM app.

## Phase 1 – Close Gaps

```codex
# Prompt: Complete Installer Checklist Wizard

## Context
SentientZone Installer App has a `InstallerChecklistWizard` component mounted from the Job Detail page. The current wizard steps are placeholder comments. No Supabase integration exists for checklist completion.

## Objective
Implement checklist completion functionality:
- Wizard with 3–5 sequential steps (presence confirm, material review, system test, photo upload, notes)
- Form data stored in local state and submitted to Supabase via `/checklists` table (job_id, completed, responses)
- Job status updated from `in_progress` to `needs_qa` on checklist completion

## Acceptance Criteria
- [✓] Installer sees checklist steps in sequence
- [✓] All required steps must be completed before submit
- [✓] Checklist results are saved to Supabase with job_id
- [✓] Job status updates upon submission
- [✓] Only assigned installer can complete checklist

## Constraints
- Use existing Supabase client
- useAuth() for installer ID
- Only available for `status === 'in_progress'` jobs
```

```codex
# Prompt: Installer Login Flow

## Context
SentientZone currently relies on placeholder auth hooks. A full login form and session persistence are missing.

## Objective
Implement installer authentication with:
- `LoginPage` component at `/login`
- Supabase email/password sign-in using existing client
- Redirect to installer dashboard on success
- Session stored in localStorage and verified on app load
- Access control via useAuth() context

## Acceptance Criteria
- [✓] Users can log in with valid credentials
- [✓] Failed login shows error toast
- [✓] Session persists on refresh

## Constraints
- Tailwind styling and SZButton components
- useAuth() context already exists
- Component path `installer-app/src/app/login/LoginPage.tsx`
- Persist auth state via Supabase
- Only public page without role requirement
```

```codex
# Prompt: Role-Based Navigation Guards

## Context
Many routes lack enforcement of user roles. Navigation menu should hide links the user cannot access.

## Objective
Add role-based guards with:
- Update `navConfig.js` to include requiredRole per route
- `Sidebar` component reads user role from useAuth() and filters links
- Protect routes in `App.jsx` with `<RequireRole>` wrappers
- Redirect unauthorized access to `/login`

## Acceptance Criteria
- [✓] Links hidden for unauthorized roles
- [✓] Direct navigation to protected routes redirects to login
- [✓] Admin, Manager, and Installer roles enforced consistently

## Constraints
- Reuse existing RequireRole component
- Assume components under `installer-app/src`
- Do not modify auth logic beyond reading role
```

```codex
# Prompt: Installer Profile Page

## Context
Installers need a way to update their contact info and profile photo. No such page exists.

## Objective
Create profile management with:
- `InstallerProfilePage` at `/installer/profile`
- Form fields for phone, email, avatar upload
- Data stored in `profiles` table (id, phone, email, avatar_url)
- Avatar uploaded to Supabase storage bucket
- Only logged-in installer can edit own profile

## Acceptance Criteria
- [✓] Installer can view and edit contact info
- [✓] Avatar upload replaces previous photo
- [✓] Form validates required fields

## Constraints
- Use existing Tailwind form components
- useAuth() provides user id
- Component path `installer-app/src/installer/pages/InstallerProfilePage.tsx`
```

```codex
# Prompt: Admin User Management

## Context
Admins lack a UI to create user accounts or assign roles. The `user_roles` table exists.

## Objective
Implement user management with:
- `AdminUsersPage` at `/admin/users`
- Table listing users with role dropdown
- Form modal to invite/create new user via Supabase auth
- Ability to assign or change role using `user_roles` table
- Deactivate/reactivate toggle for each user

## Acceptance Criteria
- [✓] Admin can create new users
- [✓] Roles can be changed and persisted
- [✓] Deactivated users cannot log in

## Constraints
- Use Supabase admin API
- Pages under `installer-app/src/app/admin`
- Role updates trigger RLS policies as needed
```

```codex
# Prompt: Material Types Management

## Context
Inventory relies on material type definitions that are currently missing.

## Objective
Create CRUD for material types with:
- `MaterialTypesPage` at `/admin/material-types`
- Supabase table `material_types` (id, name, unit, description)
- Forms to add, edit, delete types
- Only Admin role may modify types
- Integrate types into job material selection dropdowns

## Acceptance Criteria
- [✓] Admin can manage material type records
- [✓] Deleted types cannot be selected for jobs
- [✓] Validation for unique name

## Constraints
- Tailwind forms and tables
- useAuth() for role check
- Component location `installer-app/src/app/admin/material`
```

```codex
# Prompt: Low-Stock Inventory Alerts

## Context
Install Managers need alerts when inventory levels fall below threshold. No alert mechanism exists.

## Objective
Add low-stock alert logic with:
- `inventory_levels` table with current_qty and reorder_threshold
- Daily job to check levels and insert alerts into `notifications`
- `NotificationsPanel` for Install Manager at `/install-manager/notifications`
- Email notification using Supabase Edge Functions

## Acceptance Criteria
- [✓] Threshold defined per material type
- [✓] Alerts visible in Install Manager panel
- [✓] Email sent when stock low

## Constraints
- Use Supabase scheduled triggers
- Only Install Manager and Admin see alerts
- Components under `installer-app/src/app/install-manager`
```

```codex
# Prompt: Sync Job Material Usage to Warehouse

## Context
Material usage recorded per job should reduce warehouse stock counts. Currently only job-level usage is tracked.

## Objective
Implement stock deduction with:
- Update job completion flow to call API `/api/material-usage`
- API updates `inventory_levels` subtracting used quantities
- Transactional insert into `inventory_audit` table
- Prevent negative stock levels
- Run as part of checklist completion submit

## Acceptance Criteria
- [✓] Warehouse counts decrease after job completion
- [✓] Usage logged in audit table
- [✓] Errors shown if stock would go negative

## Constraints
- Supabase RPC or Row Level Security as needed
- Called from `InstallerChecklistWizard` submit handler
- Installer role permitted but counts scoped to job materials
```

```codex
# Prompt: Quote CRUD Pages

## Context
Quotes exist in local state only. Need persistent storage and pages for creation and editing.

## Objective
Implement quote management with:
- `QuotesPage` at `/quotes`
- Supabase table `quotes` (id, client_id, total, status, details)
- Form modal to create and edit quotes
- List view showing status tags (draft, submitted, approved)
- Sales Rep role can create and edit their own quotes

## Acceptance Criteria
- [✓] Quotes persist to Supabase
- [✓] Validation ensures client selected and totals computed
- [✓] Edit updates existing record

## Constraints
- Use Tailwind tables and forms
- Authentication via useAuth()
- Data joins to `clients` table
```

```codex
# Prompt: Quote Approval Workflow

## Context
Sales Managers must approve quotes before they become jobs. Currently a button toggles local state only.

## Objective
Add approval logic with:
- Update `QuotesPage` to show Approve button for Manager role
- `quote_approvals` table (quote_id, manager_id, approved_at)
- Changing status to `approved` triggers job creation option
- Notifications sent to Sales Rep on approval or rejection

## Acceptance Criteria
- [✓] Only Manager role can approve
- [✓] Approval recorded in database
- [✓] Sales Rep sees updated status

## Constraints
- Use existing Supabase client
- Notification via email or in-app table
- Pages under `installer-app/src/app/quotes`
```

```codex
# Prompt: Enforce Role Guards Across App

## Context
Some routes remain publicly reachable. Need universal role enforcement according to navConfig.

## Objective
Audit all routes and wrap with `<RequireRole>` where missing:
- Update `App.jsx` route tree
- Ensure unauthorized access redirects to `/login`
- Add fallback 403 page for logged-in users without required role

## Acceptance Criteria
- [✓] All protected routes checked for role
- [✓] Unauthorized users see 403 page
- [✓] No route accessible without proper role

## Constraints
- Use existing RequireRole component
- Keep route paths unchanged
- Write tests for access control in jest
```

```codex
# Prompt: Job Progress Dashboard

## Context
Install Managers need a dashboard to monitor jobs in progress. Current QA panel only updates status per job.

## Objective
Create progress dashboard with:
- `JobProgressPage` at `/install-manager/progress`
- Table listing active jobs with status, assigned installer, last update
- Poll Supabase `jobs` table for status changes
- Filter by date range and installer
- Accessible only to Manager and Admin roles

## Acceptance Criteria
- [✓] Install Manager sees real-time job statuses
- [✓] Filters by installer and date
- [✓] Links to job detail pages

## Constraints
- Use Tailwind tables
- useAuth() for role filtering
- Data loaded via Supabase `jobs` table
```

## Phase 2 – Missing Modules

```codex
# Prompt: Lead Creation Form

## Context
CRM module requires capturing new leads with contact info and source.

## Objective
Build lead entry with:
- `LeadForm` component at `/crm/leads/new`
- Supabase table `leads` (id, name, email, phone, source, status)
- Validate required contact fields
- Status defaults to `new`
- Accessible to Sales Rep role

## Acceptance Criteria
- [✓] Sales Rep can submit lead form
- [✓] Leads saved to Supabase
- [✓] Form errors shown for missing data

## Constraints
- Tailwind styling and SZButton
- useAuth() for user role
- Add to navConfig under Sales
```

```codex
# Prompt: Lead Pipeline Stages

## Context
Leads move through stages (new, contacted, quoted, won, lost). Need UI to update stage.

## Objective
Implement pipeline with:
- Kanban-style `LeadPipelinePage` at `/crm/pipeline`
- Drag cards between columns to change `status`
- Stage change triggers timestamp update in `lead_status_history`
- Sales Manager can view all leads; Sales Reps only their own
- Uses Supabase real-time updates

## Acceptance Criteria
- [✓] Leads appear in correct stage columns
- [✓] Dragging updates status in database
- [✓] History table records each change

## Constraints
- Tailwind drag-and-drop library
- useAuth() for role and user id
- Table relationships: leads -> lead_status_history
```

```codex
# Prompt: Convert Lead to Client

## Context
After a quote is approved, leads should convert into clients and associated jobs.

## Objective
Add conversion logic with:
- Button on `LeadDetailPage` to "Convert to Client"
- Creates record in `clients` table with lead info
- Optionally create a new job linked to client
- Lead status set to `converted`
- Only Sales Manager role can convert

## Acceptance Criteria
- [✓] Client record created from lead
- [✓] Lead marked as converted
- [✓] New job optionally initialized

## Constraints
- Use Supabase transactions
- Update navigation to client detail page
- Keep lead data intact for reporting
```

```codex
# Prompt: Sales Rep Contact Log

## Context
CRM module should track every interaction with a lead or client.

## Objective
Create contact log feature with:
- `contact_logs` table (id, lead_id, user_id, note, contact_date)
- Form on `LeadDetailPage` to add call/email notes
- Logs displayed in timeline order
- Editable only by author or Sales Manager

## Acceptance Criteria
- [✓] Reps can add notes to lead record
- [✓] Timeline shows user and date
- [✓] Edit/delete restricted to author or manager

## Constraints
- Tailwind components
- useAuth() for user id and role check
- Path `installer-app/src/app/crm`
```

```codex
# Prompt: Sales Manager Lead Overview

## Context
Managers need a dashboard of all leads with filters and quick stats.

## Objective
Build overview with:
- `LeadsDashboardPage` at `/crm/leads`
- Table summary with filters by rep, date, status
- Inline metrics for conversion rate and total value of quotes
- Export to CSV button
- Manager role only

## Acceptance Criteria
- [✓] Manager can filter by rep and status
- [✓] Metrics update with filters
- [✓] CSV export downloads filtered list

## Constraints
- Use Tailwind DataTable style
- Supabase queries for aggregation
- Add to navConfig under Manager
```

```codex
# Prompt: Purchase Order Creation

## Context
Warehouse inventory needs ability to order new materials from suppliers.

## Objective
Implement purchase orders with:
- `PurchaseOrdersPage` at `/inventory/purchase-orders`
- Table `purchase_orders` (id, supplier, order_date, status)
- Nested table `purchase_order_items` (order_id, material_type_id, qty)
- Form to create new PO and add items
- Status flow: draft → placed → received

## Acceptance Criteria
- [✓] Admin can create and submit POs
- [✓] Items associated with material types
- [✓] Status updates tracked

## Constraints
- Role: Admin or Install Manager
- Use Supabase for data persistence
- Forms under `installer-app/src/app/inventory`
```

```codex
# Prompt: Record Inventory Receipts

## Context
When purchase orders arrive, quantities must update warehouse stock levels.

## Objective
Add receipt workflow with:
- `ReceivePOPage` for marking orders as received
- Updates `inventory_levels` adding received quantities
- Records transaction in `inventory_audit`
- Allows partial receipt by item
- Only Admin or Install Manager role

## Acceptance Criteria
- [✓] Warehouse counts increase upon receipt
- [✓] Partial receipts supported
- [✓] Audit log saved

## Constraints
- Tailwind table inputs
- Supabase functions for transactional update
- Page path `/inventory/receive/:poId`
```

```codex
# Prompt: Allocate Items to Jobs

## Context
Warehouse inventory must track which jobs consume which materials.

## Objective
Create allocation system with:
- `job_material_allocations` table (job_id, material_type_id, qty)
- Form on job edit page to allocate materials from warehouse
- Deduct allocated qty from `inventory_levels`
- Prevent allocation if insufficient stock
- Visible to Install Manager and Admin

## Acceptance Criteria
- [✓] Allocation reduces warehouse quantities
- [✓] Prevent allocation beyond available stock
- [✓] Allocation list shown on job detail

## Constraints
- Use Supabase transactions
- Path `installer-app/src/app/install-manager`
- Role checks via useAuth()
```

```codex
# Prompt: Inventory Level Report

## Context
Managers need a report of current warehouse levels by material type.

## Objective
Build report page with:
- `InventoryReportPage` at `/inventory/report`
- Table listing all material types, on-hand qty, reserved qty, reorder threshold
- Export to CSV
- Accessible to Admin and Install Manager

## Acceptance Criteria
- [✓] Quantities computed from inventory tables
- [✓] CSV export matches table
- [✓] Page paginated if many items

## Constraints
- Tailwind DataTable
- Supabase aggregate queries
- Add route to navConfig
```

```codex
# Prompt: Restock Threshold Alerts

## Context
Warehouse module should proactively warn when stock approaches reorder point.

## Objective
Implement threshold alerts with:
- Background job to compare `inventory_levels.current_qty` to `reorder_threshold`
- Insert into `notifications` table when below threshold
- Display notifications in Install Manager dashboard
- Dismiss action removes notification

## Acceptance Criteria
- [✓] Alerts generated automatically
- [✓] Dismiss clears record
- [✓] Manager email sent with list of low items

## Constraints
- Use Supabase scheduled jobs
- Notification component exists
- Only for Admin and Install Manager roles
```

```codex
# Prompt: Install Manager Calendar View

## Context
Scheduling requires a calendar interface for Install Managers to see all jobs.

## Objective
Create calendar with:
- `InstallManagerCalendarPage` at `/install-manager/calendar`
- FullCalendar component fetching jobs from Supabase
- Drag events to reschedule dates
- Month/week/day views
- Restricted to Manager role

## Acceptance Criteria
- [✓] Jobs display on calendar with status color
- [✓] Dragging event updates job schedule in database
- [✓] Reschedule notifications sent to installer

## Constraints
- Use FullCalendar React library
- Supabase real-time updates
- Add to navConfig under Install Manager
```

```codex
# Prompt: Installer Personal Schedule

## Context
Installers need their own calendar showing assigned jobs and tasks.

## Objective
Implement personal schedule with:
- `InstallerSchedulePage` at `/installer/schedule`
- Calendar view pulling jobs assigned to logged-in installer
- Accepts ICS export link
- Show location and start/end times

## Acceptance Criteria
- [✓] Installer sees upcoming jobs only
- [✓] ICS export downloads calendar
- [✓] Cancelled jobs removed automatically

## Constraints
- useAuth() for installer id
- Tailwind for styling
- Supabase queries filtered by installer_id
```

```codex
# Prompt: Rescheduling Request Flow

## Context
Sales Reps may need to request schedule changes for upcoming installs.

## Objective
Create rescheduling request system with:
- `reschedule_requests` table (id, job_id, requested_date, reason, status)
- Form on `JobDetailPage` for Sales Rep to submit request
- Notification to Install Manager for approval/denial
- Approved requests update job schedule

## Acceptance Criteria
- [✓] Sales Rep can submit new request
- [✓] Manager can approve or deny
- [✓] Job date updates when approved

## Constraints
- Role checks for Sales Rep and Manager
- Supabase real-time notifications
- Path `installer-app/src/app/jobs`
```

```codex
# Prompt: Drag-and-Drop Scheduler

## Context
Install Managers want to visually assign installers and change dates via drag and drop.

## Objective
Enhance calendar with drag-and-drop scheduling:
- Extend `InstallManagerCalendarPage` with resource view of installers
- Drag jobs between installers or dates
- Update job assignments and dates in Supabase
- Conflict warnings if installer double-booked

## Acceptance Criteria
- [✓] Dragging updates job and installer_id
- [✓] Warning shown for overlapping jobs
- [✓] Changes persist in database

## Constraints
- Use FullCalendar resource timeline
- Real-time updates via Supabase
- Manager role only
```

```codex
# Prompt: Overbooking Validation

## Context
Scheduling must prevent installers from being assigned to overlapping jobs.

## Objective
Add validation logic with:
- Supabase function `check_overbooking(installer_id, start_time, end_time)`
- Called before inserting or updating job schedule
- Returns error if conflict detected
- Frontend shows toast with conflict message

## Acceptance Criteria
- [✓] Overlap check prevents conflicting assignments
- [✓] Error displayed to user
- [✓] Job not saved when conflict occurs

## Constraints
- Supabase RPC written in SQL
- Called from calendar drag-and-drop handler
- Applies to Manager and Sales roles
```

```codex
# Prompt: Calendar ICS Export

## Context
Installers and managers may sync schedules with external calendars.

## Objective
Provide ICS export links with:
- Endpoint `/api/calendar/:installerId.ics`
- Generates ICS file from upcoming jobs
- Link available on Installer and Manager calendar pages
- Token-based auth to prevent sharing

## Acceptance Criteria
- [✓] ICS downloads contain job events
- [✓] Links expire after 24 hours
- [✓] Unauthorized requests return 403

## Constraints
- Use existing API route pattern
- Supabase queries for job data
- Keep ICS generation lightweight
```

```codex
# Prompt: Generate Invoice From Job Usage

## Context
Invoices should be based on actual materials and labor recorded for a job.

## Objective
Implement invoice generation with:
- `invoices` table (id, job_id, total, status, issued_at)
- Function to compute total from job materials and labor rate
- Button on job completion to generate invoice draft
- Invoice status starts as `draft`
- Accessible to Admin and Sales roles

## Acceptance Criteria
- [✓] Invoice total matches materials used
- [✓] Draft invoice created on job completion
- [✓] Job marked `awaiting_payment`

## Constraints
- Supabase functions for total calculation
- Tailwind forms for invoice view
- Add to `invoices` route group
```

```codex
# Prompt: Email Invoice to Client

## Context
Once generated, invoices must be emailed to the client with a payment link.

## Objective
Add email sending with:
- Endpoint `/api/send-invoice` called from invoice page
- Uses Supabase SMTP config to send PDF invoice
- Email includes secure payment URL
- Update invoice status to `sent` on success

## Acceptance Criteria
- [✓] Client receives email with PDF attachment
- [✓] Status updates from draft to sent
- [✓] Errors logged if email fails

## Constraints
- Use existing serverless functions
- PDF generation with simple template
- Only Admin or Sales roles may send
```

```codex
# Prompt: Record Payment Receipt

## Context
Admin staff need to mark invoices as paid when funds are received.

## Objective
Create payment recording feature with:
- `payments` table (id, invoice_id, amount, received_at, method)
- Form on invoice detail to add payment
- Updating invoice status to `paid` when balance is zero
- Allow partial payments with running balance

## Acceptance Criteria
- [✓] Payments persisted to Supabase
- [✓] Invoice status auto-updates
- [✓] Partial payments reflected correctly

## Constraints
- Tailwind form components
- Roles: Admin and Sales Manager
- Payment method select (check, card, ACH)
```

```codex
# Prompt: Outstanding Invoices Report

## Context
Finance team requires a list of unpaid or overdue invoices.

## Objective
Build report with:
- `OutstandingInvoicesPage` at `/invoices/outstanding`
- Query invoices where status != 'paid'
- Sort by due date with aging buckets
- Export to CSV
- Visible to Admin role

## Acceptance Criteria
- [✓] Report lists all unpaid invoices
- [✓] Aging buckets show 30/60/90+ days
- [✓] CSV export downloads current view

## Constraints
- Supabase query filters
- Tailwind DataTable
- Add route under invoices section
```

```codex
# Prompt: Payment Gateway Integration

## Context
To accept credit card payments online, integrate with a payment processor.

## Objective
Implement payment gateway with:
- Use Stripe API for payment intents
- `PayInvoiceButton` opens Stripe checkout for invoice amount
- Webhook endpoint updates `payments` table on successful charge
- Secure environment variables for Stripe keys

## Acceptance Criteria
- [✓] Clients can pay invoices via card
- [✓] Payment recorded automatically on success
- [✓] Invoice status updates to paid

## Constraints
- External network requests permitted in edge functions
- Admin and Sales roles manage webhooks
- Test mode keys for development
```

```codex
# Prompt: Client Payment History Page

## Context
Sales and finance teams need a view of all payments made by a client.

## Objective
Create payment history with:
- `ClientPaymentsPage` at `/clients/:id/payments`
- Table of invoices and payments with dates and amounts
- Totals for lifetime revenue
- Role-based access: Sales Rep for own clients, Admin for all

## Acceptance Criteria
- [✓] Lists invoices with payment status
- [✓] Totals compute correctly
- [✓] Links to invoice detail pages

## Constraints
- Supabase joins invoices and payments
- Tailwind styling
- Add navigation link from client detail page
```

```codex
# Prompt: Refund and Partial Payment Support

## Context
Occasionally payments need to be refunded or partially applied.

## Objective
Extend payments module with:
- `refunds` table (id, payment_id, amount, reason, refunded_at)
- UI on payment detail to issue refund via Stripe API
- Invoice balance recalculated after refund
- Audit log entry for each refund

## Acceptance Criteria
- [✓] Refund transactions stored
- [✓] Invoice balance updates correctly
- [✓] Stripe refund triggered when applicable

## Constraints
- Admin role only for refunds
- Use Supabase and Stripe APIs
- Path `installer-app/src/app/invoices`
```

```codex
# Prompt: Send Payment Receipt Email

## Context
Clients expect a receipt after paying invoices.

## Objective
Automate receipt emails with:
- Trigger after successful payment (webhook or form submit)
- Email template with invoice summary and paid amount
- Option to resend from invoice detail page
- Update payment record with `receipt_sent_at`

## Acceptance Criteria
- [✓] Email sent automatically on payment
- [✓] Resend button functions
- [✓] Timestamp stored in database

## Constraints
- Use existing email sending infrastructure
- Roles: Admin and Sales
- Keep email template simple
```

```codex
# Prompt: Upload Closing Documents

## Context
Completed jobs require signed documents to be stored for future reference.

## Objective
Implement document upload with:
- `ClosingDocsPage` at `/jobs/:id/closing-docs`
- Supabase storage bucket `closing_docs`
- Upload component for PDFs/images
- Metadata stored in `job_documents` table (job_id, url, type, uploaded_by)

## Acceptance Criteria
- [✓] Installers/Managers can upload documents
- [✓] Documents linked to job record
- [✓] File type validation for PDF or image

## Constraints
- useAuth() for uploader id
- Tailwind file input styling
- Access roles: Installer, Manager, Admin
```

```codex
# Prompt: E-Sign Final Acceptance

## Context
Jobs must capture client signatures confirming work completion.

## Objective
Add e-signature feature with:
- `EsignModal` component launched from Closing Docs page
- Canvas-based signature pad saves image to storage
- Record signature URL in `job_documents` with type `signature`
- Job status moves to `closed` once signed

## Acceptance Criteria
- [✓] Client can sign on-screen
- [✓] Signature stored and linked to job
- [✓] Status updates to closed

## Constraints
- Tailwind modal components
- Supabase storage for image
- Only accessible after invoice paid
```

```codex
# Prompt: Archive Closing Documents

## Context
After job completion, documents should be archived but remain accessible.

## Objective
Create archive logic with:
- `archive_documents` script moving files to `archive` storage bucket
- Button on Closing Docs page to archive all job docs
- Archived docs marked in `job_documents` table
- Only Admin role allowed to archive

## Acceptance Criteria
- [✓] Files moved to archive bucket
- [✓] Records updated with archived flag
- [✓] Archived docs still downloadable via secure URL

## Constraints
- Supabase storage copy & remove operations
- Admin-only route
- Logging via `audit_log` table
```

```codex
# Prompt: Revenue and Margin Dashboard

## Context
Admin users require insight into company revenue and profit margins.

## Objective
Build dashboard with:
- `RevenueDashboardPage` at `/reports/revenue`
- Charts showing monthly revenue, cost, and margin
- Data aggregated from invoices and job material costs
- Date range filter
- Admin role only

## Acceptance Criteria
- [✓] Charts display revenue vs. costs
- [✓] Margin percentage computed correctly
- [✓] Filter updates data

## Constraints
- Use chart library (e.g., Chart.js)
- Supabase SQL for aggregation
- Tailwind layout
```

```codex
# Prompt: Lead-to-Close Conversion Metrics

## Context
Sales performance measured by how many leads convert to paying clients.

## Objective
Implement conversion metrics with:
- `ConversionReportPage` at `/reports/conversion`
- Calculate rates from leads → quotes → closed jobs
- Breakdown by sales rep and time period
- Export chart data to CSV

## Acceptance Criteria
- [✓] Conversion rates displayed in chart/table
- [✓] Filters by rep and date
- [✓] CSV export works

## Constraints
- Supabase queries on leads, quotes, jobs
- Manager and Admin roles
- Chart library for visualization
```

```codex
# Prompt: Installer Performance Analytics

## Context
Install Managers need metrics on installer efficiency and quality.

## Objective
Create performance dashboard with:
- `InstallerPerformancePage` at `/reports/installers`
- Metrics: average job duration, checklist completion rate, callback rate
- Filter by installer and date range
- Data from jobs and checklists tables

## Acceptance Criteria
- [✓] Charts show key performance metrics
- [✓] Filters update data in real time
- [✓] Export to CSV option

## Constraints
- Supabase aggregate queries
- Manager and Admin access
- Tailwind + Chart.js
```

```codex
# Prompt: Invoice Status Tracker & Aging Buckets

## Context
With payment logging and invoices in place, finance needs real-time visibility into outstanding accounts receivable and how long each invoice has been overdue.

## Objective
Provide an AR aging report with:
- `ARAgingReportPage` at `/admin/reports/ar-aging`
- Query `invoices` with `due_date` to calculate `days overdue` and remaining `balance_due`
- Group totals for buckets: 0-30, 31-60, 61-90, 91+ days
- Table columns: invoice ID, client, invoice date, due date, status, balance due, linked job, assigned salesperson, last payment method
- Filters for client, status, balance range, date range, and salesperson
- Highlight invoices over 90 days with urgency badges
- Export filtered results to CSV or PDF

## Acceptance Criteria
- [✓] Table lists unpaid invoices with correct days overdue
- [✓] Aging bucket summary shows total balance and invoice count
- [✓] Filters, sorting, and search update the table
- [✓] CSV or PDF export downloads the current view

## Constraints
- Supabase queries on `invoices`, `clients`, `jobs`, `users`, and `payments`
- Read-only access; no editing from this page
- Admin, Finance, and Sales Manager roles
- Tailwind DataTable styling
```
