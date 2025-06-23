create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id),
  job_id uuid references jobs(id),
  client_id uuid references clients(id),
  amount numeric not null,
  payment_method text,
  reference_number text,
  payment_date timestamptz default now(),
  created_at timestamptz default now(),
  logged_by_user_id uuid references auth.users(id)
);

alter table payments enable row level security;

create policy "Payments Select" on payments for select using (true);

create policy "Payments Insert" on payments
  for insert with check (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager','Sales','Installer','Finance')
    )
  );

create policy "Payments Update" on payments
  for update using (
    false
  );

create policy "Payments Delete" on payments
  for delete using (false);
