create or replace view lead_funnel_metrics as
select
  sales_rep_id,
  count(*) filter (where status = 'new') as leads_new,
  count(*) filter (where status = 'contacted') as leads_contacted,
  count(*) filter (where status = 'quoted') as leads_quoted,
  count(*) filter (where status = 'converted') as leads_converted,
  count(*) as total_leads,
  round(100.0 * count(*) filter (where status = 'converted') / nullif(count(*), 0), 2) as conversion_rate,
  avg(quote_created_at - created_at) as avg_time_to_quote,
  avg(job_created_at - created_at) as avg_time_to_job
from (
  select
    l.id,
    l.sales_rep_id,
    l.status,
    l.created_at,
    (select min(q.created_at) from quotes q where q.lead_id = l.id) as quote_created_at,
    (select min(j.created_at) from jobs j where j.lead_id = l.id) as job_created_at
  from leads l
) enriched
group by sales_rep_id;

alter view lead_funnel_metrics enable row level security;

create policy "Allow sales, managers, admins to view lead funnel metrics"
on lead_funnel_metrics
for select
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role in ('Sales', 'Manager', 'Admin')
  )
);
