create or replace view revenue_by_month as
select
  date_trunc('month', invoice_date) as month,
  sum(total_due) as total_invoiced,
  sum(coalesce(p.amount, 0)) as total_paid,
  sum(total_due) - sum(coalesce(p.amount, 0)) as outstanding_balance
from invoices i
left join payments p on p.invoice_id = i.id
group by month
order by month desc;

alter view revenue_by_month enable row level security;

create policy "Allow finance/admin to view revenue"
on revenue_by_month
for select
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role in ('Admin', 'Manager', 'Finance')
  )
);
