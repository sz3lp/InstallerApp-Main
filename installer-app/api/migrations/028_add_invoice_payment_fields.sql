alter table invoices
  add column if not exists amount_paid numeric default 0,
  add column if not exists payment_status text default 'unpaid',
  add column if not exists payment_method text,
  add column if not exists paid_at timestamptz;

alter table payments
  add column if not exists note text;
