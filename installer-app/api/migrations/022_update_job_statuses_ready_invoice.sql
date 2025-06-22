alter table jobs drop constraint if exists jobs_status_check;
alter table jobs
  add constraint jobs_status_check
  check (status in ('created','assigned','in_progress','needs_qa','complete','rework','archived','ready_for_invoice'));
