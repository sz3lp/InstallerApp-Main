create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  message text not null,
  created_at timestamptz default now(),
  dismissed boolean default false
);

alter table notifications enable row level security;

create policy "Allow IM/Admin read" on notifications for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Install Manager', 'Admin')
    )
  );

create policy "Allow IM/Admin dismiss" on notifications for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role in ('Install Manager', 'Admin')
    )
  )
  with check (dismissed = true);
