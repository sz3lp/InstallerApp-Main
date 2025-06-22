alter table jobs add column if not exists qa_approved_by_user_id uuid references auth.users(id);
alter table jobs add column if not exists qa_approved_at timestamptz;
alter table jobs add column if not exists qa_rejected_by_user_id uuid references auth.users(id);
alter table jobs add column if not exists qa_rejected_at timestamptz;

alter table jobs drop constraint if exists jobs_status_check;
alter table jobs
  add constraint jobs_status_check
  check (
    status in (
      'created',
      'assigned',
      'in_progress',
      'needs_qa',
      'complete',
      'rework',
      'archived',
      'closed_pending_manager_approval',
      'approved_ready_for_invoice_payroll',
      'rejected_sent_back_for_revisions',
      'on_hold_qa_review'
    )
  );
