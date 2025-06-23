-- Add Stripe session tracking
alter table invoices
  add column if not exists stripe_session_id text;

create or replace function initiate_stripe_payment(invoice_id uuid)
returns void as $$
begin
  -- placeholder body, logic handled in edge function
  return;
end;
$$ language plpgsql;

create policy "Admin sets stripe_session_id" on invoices
  for update using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'Admin')
  );

create policy "Stripe system inserts payments" on payments
  for insert using (auth.role() = 'service_role');
