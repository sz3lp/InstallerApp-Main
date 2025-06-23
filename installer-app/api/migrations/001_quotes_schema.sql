-- ENUM for quote status
create type if not exists quote_status as enum ('draft', 'pending', 'approved', 'rejected');

-- quotes table
create table if not exists quotes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  status quote_status default 'draft',
  total_price numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- quote line items
create table if not exists quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes(id) on delete cascade,
  material_id uuid references materials(id) on delete set null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  line_total numeric(12,2) generated always as (quantity * unit_price) stored
);
