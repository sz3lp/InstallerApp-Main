create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  job_id uuid references jobs(id),
  client_id uuid references clients(id),
  payment_method text,
  reference_number text,
  amount numeric not null,
  payment_date timestamptz default now(),
  logged_by_user_id uuid references auth.users(id)
);

alter table payments enable row level security;

create policy "Payments Select" on payments
  for select using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Finance'))
  );

create policy "Payments Insert" on payments
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Finance'))
  );
