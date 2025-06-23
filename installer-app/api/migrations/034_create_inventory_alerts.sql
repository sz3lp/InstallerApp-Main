create table if not exists inventory_alerts (
  id uuid primary key default uuid_generate_v4(),
  material_id uuid references materials(id),
  current_stock numeric,
  threshold numeric,
  alert_timestamp timestamptz default now(),
  is_resolved boolean default false
);

create or replace function generate_inventory_alerts()
returns void
language plpgsql
security definer
as $$
begin
  insert into inventory_alerts (material_id, current_stock, threshold)
  select
    material_id,
    quantity,
    reorder_threshold
  from inventory_levels
  where quantity < reorder_threshold
    and not exists (
      select 1 from inventory_alerts
      where material_id = inventory_levels.material_id
        and is_resolved = false
    );
end;
$$;

alter table inventory_alerts enable row level security;

create policy "Allow view for Managers/Admins"
  on inventory_alerts for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('Manager', 'Admin')
    )
  );

create policy "Allow resolve for Managers/Admins"
  on inventory_alerts for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('Manager', 'Admin')
    )
  )
  with check (is_resolved = true);
