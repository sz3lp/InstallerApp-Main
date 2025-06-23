-- Policies for Stripe payment integration

alter table payments enable row level security;

drop policy if exists "Payments Insert" on payments;
create policy "Allow finance/admin/system to insert payments" on payments
  for insert with check (
    auth.uid() is null or
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Admin', 'Finance')
    )
  );

create policy "Allow system to update paid invoices" on invoices
  for update using (
    auth.uid() is null or
    exists (
      select 1 from user_roles where user_id = auth.uid() and role = 'Admin'
    )
  );
