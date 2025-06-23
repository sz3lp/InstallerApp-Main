create or replace view revenue_by_month as
select
  date_trunc('month', invoice_date) as month,
  count(*) as invoice_count,
  sum(total_due) as total_invoiced,
  sum(amount_paid) as total_paid,
  sum(total_due - amount_paid) as outstanding
from invoices
group by month
order by month desc;

alter table invoices drop policy if exists "Invoices Select";
create policy "Allow Admin/Finance to read invoices" on invoices for select
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role in ('Admin', 'Finance')
  )
);
