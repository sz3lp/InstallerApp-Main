create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id),
  client_id uuid references clients(id),
  created_by uuid references auth.users(id),
  invoice_date timestamptz default now(),
  status text not null default 'draft',
  subtotal numeric default 0,
  tax numeric default 0,
  discount numeric default 0,
  total_due numeric default 0
);

create table if not exists invoice_line_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  material_id uuid references materials(id),
  description text,
  quantity int not null,
  unit_price numeric not null,
  line_total numeric not null
);

alter table invoices enable row level security;
create policy "Invoices Select" on invoices for select using (true);
create policy "Invoices Insert" on invoices
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales','Install Manager'))
  );
create policy "Invoices Update" on invoices
  for update using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales','Install Manager'))
  );

alter table invoice_line_items enable row level security;
create policy "InvoiceLineItems Select" on invoice_line_items for select using (true);
create policy "InvoiceLineItems Insert" on invoice_line_items
  for insert with check (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales','Install Manager'))
  );
create policy "InvoiceLineItems Update" on invoice_line_items
  for update using (
    exists (select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Sales','Install Manager'))
  );
