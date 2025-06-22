alter table invoices
  add column if not exists discount_amount numeric default 0,
  add column if not exists discount_type text,
  add column if not exists tax_rate numeric default 0,
  add column if not exists tax_amount numeric default 0,
  add column if not exists total_fees numeric default 0,
  add column if not exists invoice_total numeric default 0;

create table if not exists invoice_fees (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount numeric not null,
  description text,
  created_at timestamptz default now()
);

alter table invoice_fees enable row level security;
create policy "InvoiceFees Select" on invoice_fees for select using (true);
create policy "InvoiceFees Insert" on invoice_fees
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales'))
  );
create policy "InvoiceFees Update" on invoice_fees
  for update using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales'))
  );
create policy "InvoiceFees Delete" on invoice_fees
  for delete using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales'))
  );
