-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.checklists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  job_id uuid,
  step_name text,
  completed boolean DEFAULT false,
  timestamp timestamp without time zone DEFAULT now(),
  CONSTRAINT checklists_pkey PRIMARY KEY (id),
  CONSTRAINT checklists_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT gen_random_uuid(),
  contact_name text,
  contact_email text,
  address text,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  job_id uuid,
  name text,
  url text,
  uploaded_at timestamp without time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.installers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  active boolean,
  CONSTRAINT installers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.job_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL DEFAULT gen_random_uuid(),
  step_name text,
  completed boolean,
  notes text,
  CONSTRAINT job_checklists_pkey PRIMARY KEY (id)
);
CREATE TABLE public.job_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  material_id uuid NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  sale_price numeric NOT NULL,
  unit_material_cost numeric NOT NULL,
  unit_labor_cost numeric NOT NULL,
  install_location text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_materials_pkey PRIMARY KEY (id),
  CONSTRAINT job_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id),
  CONSTRAINT job_materials_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  clinic_name text,
  contact_name text,
  contact_phone text,
  status text,
  created_at timestamp without time zone DEFAULT now(),
  address text,
  assigned_to text,
  type text,
  checklist_status text,
  client_name text,
  contact_email text,
  customer_name text,
  date date,
  documents jsonb,
  due_date date,
  find text,
  install_date date,
  installer text,
  issues text,
  job_number text,
  location text,
  map text,
  notes text,
  photo text,
  public_url text,
  quantity numeric,
  scheduled_date date,
  score numeric,
  signature_captured boolean,
  unit_labor_cost numeric,
  unit_material_cost numeric,
  CONSTRAINT jobs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text,
  base_cost numeric,
  sale_price numeric,
  default_pay_rate numeric,
  category text,
  default_sale_price numeric,
  CONSTRAINT materials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['Installer'::text, 'Admin'::text, 'Manager'::text])),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL DEFAULT ''::text UNIQUE,
  full_name text,
  role text DEFAULT 'TRUE'::text,
  active boolean NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id, active)
);
