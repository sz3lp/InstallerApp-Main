create or replace view lead_funnel_metrics as
select
  l.sales_rep_id,
  u.email as sales_rep_email,
  count(distinct l.id) as total_leads,
  count(distinct q.id) as leads_with_quotes,
  count(distinct j.id) as leads_converted_to_jobs,
  round((count(distinct q.id)::numeric / nullif(count(distinct l.id), 0)) * 100, 1) as quote_conversion_rate,
  round((count(distinct j.id)::numeric / nullif(count(distinct l.id), 0)) * 100, 1) as job_conversion_rate
from leads l
left join quotes q on l.id = q.lead_id
left join jobs j on q.id = j.quote_id
left join auth.users u on l.sales_rep_id = u.id
group by l.sales_rep_id, u.email;

alter table leads enable row level security;
create policy if not exists "Allow Admin/Sales/Manager to view funnel" on leads for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Admin','Sales','Manager')
    )
  );

alter table quotes enable row level security;
create policy if not exists "Allow Admin/Sales/Manager to view funnel" on quotes for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Admin','Sales','Manager')
    )
  );

alter table jobs enable row level security;
create policy if not exists "Allow Admin/Sales/Manager to view funnel" on jobs for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Admin','Sales','Manager')
    )
  );
