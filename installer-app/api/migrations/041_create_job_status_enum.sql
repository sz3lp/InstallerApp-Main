create type if not exists job_status as enum (
  'created',
  'assigned',
  'in_progress',
  'needs_qa',
  'complete',
  'rework',
  'archived',
  'ready_for_invoice',
  'invoiced',
  'paid'
);
