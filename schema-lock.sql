--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  SELECT '00000000-0000-0000-0000-000000000000'::uuid;
$$;


ALTER FUNCTION auth.uid() OWNER TO postgres;

--
-- Name: create_job_with_materials(text, text, date, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_job_with_materials(p_clinic_name text, p_address text, p_start_time date, p_installer uuid, p_materials jsonb) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  new_job_id uuid;
begin
  insert into jobs (clinic_name, address, scheduled_date, assigned_to, status)
  values (p_clinic_name, p_address, p_start_time, p_installer, 'assigned')
  returning id into new_job_id;

  if p_materials is not null then
    insert into job_materials (job_id, material_id, quantity)
    select new_job_id,
           (m->>'material_id')::uuid,
           (m->>'quantity')::int
    from jsonb_array_elements(p_materials) as m;
  end if;

  return new_job_id;
end;
$$;


ALTER FUNCTION public.create_job_with_materials(p_clinic_name text, p_address text, p_start_time date, p_installer uuid, p_materials jsonb) OWNER TO postgres;

--
-- Name: create_pending_user(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_pending_user(email text, role text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  insert into public.users (email, role, status)
  values (email, role, 'pending')
  on conflict (email) do nothing;
end;
$$;


ALTER FUNCTION public.create_pending_user(email text, role text) OWNER TO postgres;

--
-- Name: decrement_inventory(uuid, uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_inventory(installer_id_input uuid, material_id_input uuid, amount integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  update installer_inventory
  set quantity = quantity - amount
  where installer_id = installer_id_input
    and material_id = material_id_input;
end;
$$;


ALTER FUNCTION public.decrement_inventory(installer_id_input uuid, material_id_input uuid, amount integer) OWNER TO postgres;

--
-- Name: generate_invoice_for_job(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_invoice_for_job(p_job_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
declare
  inv_id uuid;
  client uuid;
  sub numeric;
begin
  select client_id into client from jobs where id = p_job_id;
  if client is null then
    raise exception 'Job not found';
  end if;

  select sum(jmu.quantity * m.retail_price)
    into sub
    from job_materials_used jmu
    join materials m on jmu.material_id = m.id
    where jmu.job_id = p_job_id;

  insert into invoices(job_id, client_id, created_by, invoice_date, status, subtotal, total_due)
    values(p_job_id, client, auth.uid(), now(), 'draft', coalesce(sub,0), coalesce(sub,0))
    returning id into inv_id;

  insert into invoice_line_items(invoice_id, material_id, description, quantity, unit_price, line_total)
    select inv_id, m.id, m.name, jmu.quantity, m.retail_price, jmu.quantity * m.retail_price
    from job_materials_used jmu
    join materials m on jmu.material_id = m.id
    where jmu.job_id = p_job_id;

  return inv_id;
end;
$$;


ALTER FUNCTION public.generate_invoice_for_job(p_job_id uuid) OWNER TO postgres;

--
-- Name: log_lead_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_lead_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  if new.status is distinct from old.status then
    insert into lead_status_history(lead_id, old_status, new_status, changed_by)
    values (old.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.log_lead_status_change() OWNER TO postgres;

--
-- Name: log_material_usage(uuid, uuid, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_material_usage(_job_id uuid, _material_id uuid, _quantity numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into job_quantities_completed (job_id, material_id, quantity, recorded_by)
  values (_job_id, _material_id, _quantity, auth.uid());
end;
$$;


ALTER FUNCTION public.log_material_usage(_job_id uuid, _material_id uuid, _quantity numeric) OWNER TO postgres;

--
-- Name: set_lead_audit_fields(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_lead_audit_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION public.set_lead_audit_fields() OWNER TO postgres;

--
-- Name: convert_quote_to_job(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.convert_quote_to_job(quote_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
  quote_record record;
  new_job_id uuid;
begin
  -- Fetch quote
  select * into quote_record from quotes where id = quote_id;
  if not found then
    raise exception 'Quote not found';
  end if;

  if quote_record.status <> 'approved' then
    raise exception 'Quote must be approved';
  end if;

  -- Create job
  insert into jobs (client_id, quote_id, status, created_by)
  values (quote_record.client_id, quote_id, 'created', auth.uid())
  returning id into new_job_id;

  -- Copy quote items into job materials
  insert into job_materials (job_id, material_id, quantity)
  select new_job_id, material_id, quantity
  from quote_items
  where quote_id = quote_id;

  -- Update quote status
  update quotes set status = 'converted_to_job' where id = quote_id;

  return new_job_id;
end;
$$;

ALTER FUNCTION public.convert_quote_to_job(quote_id uuid) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text,
    full_name text
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid NOT NULL,
    actor_id uuid,
    event text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    description text NOT NULL,
    completed boolean DEFAULT false
);


ALTER TABLE public.checklist_items OWNER TO postgres;

--
-- Name: checklists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    completed boolean DEFAULT false,
    responses jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.checklists OWNER TO postgres;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text,
    contact_name text,
    contact_email text,
    address text
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    installer_name text,
    job_number text,
    date date,
    score integer,
    issues text[],
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- Name: installer_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installer_inventory (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    installer_id uuid,
    material_id uuid,
    quantity integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.installer_inventory OWNER TO postgres;

--
-- Name: invoice_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_fees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    amount numeric NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.invoice_fees OWNER TO postgres;

--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_line_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    material_id uuid,
    description text,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL
);


ALTER TABLE public.invoice_line_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    client_id uuid,
    created_by uuid,
    invoice_date timestamp with time zone DEFAULT now(),
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal numeric DEFAULT 0,
    tax numeric DEFAULT 0,
    discount numeric DEFAULT 0,
    total_due numeric DEFAULT 0,
    amount_paid numeric DEFAULT 0,
    payment_status text DEFAULT 'unpaid'::text,
    payment_method text,
    paid_at timestamp with time zone,
    discount_amount numeric DEFAULT 0,
    discount_type text,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_fees numeric DEFAULT 0,
    invoice_total numeric DEFAULT 0
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: job_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_materials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    material_id uuid,
    quantity integer NOT NULL,
    used_quantity integer DEFAULT 0
);


ALTER TABLE public.job_materials OWNER TO postgres;

--
-- Name: job_materials_used; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_materials_used (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    material_id uuid,
    quantity integer NOT NULL,
    installer_id uuid,
    photo_url text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.job_materials_used OWNER TO postgres;

--
-- Name: job_qa_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_qa_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    reviewer_user_id uuid,
    review_action text NOT NULL,
    review_comments text,
    reviewed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_qa_reviews_review_action_check CHECK ((review_action = ANY (ARRAY['approve'::text, 'reject'::text, 'hold'::text])))
);


ALTER TABLE public.job_qa_reviews OWNER TO postgres;

--
-- Name: job_quantities_completed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_quantities_completed (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    material_id uuid,
    quantity_completed integer NOT NULL,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.job_quantities_completed OWNER TO postgres;

--
-- Name: job_signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_id uuid NOT NULL,
    signed_by text NOT NULL,
    signature_url text NOT NULL,
    signed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.job_signatures OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_name text NOT NULL,
    contact_name text NOT NULL,
    contact_phone text NOT NULL,
    scheduled_date timestamp with time zone,
    assigned_to uuid,
    status text DEFAULT 'created'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    client_id uuid,
    template_type text,
    created_by uuid,
    origin_lead_id uuid,
    qa_approved_by_user_id uuid,
    qa_approved_at timestamp with time zone,
    qa_rejected_by_user_id uuid,
    qa_rejected_at timestamp with time zone,
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['created'::text, 'assigned'::text, 'in_progress'::text, 'needs_qa'::text, 'complete'::text, 'rework'::text, 'archived'::text, 'ready_for_invoice'::text, 'invoiced'::text, 'paid'::text])))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: lead_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_status_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    lead_id uuid NOT NULL,
    old_status text,
    new_status text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lead_status_history OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_name text NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    address text,
    sales_rep_id uuid,
    status text DEFAULT 'new'::text NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT leads_status_check CHECK ((status = ANY (ARRAY['new'::text, 'attempted_contact'::text, 'appointment_scheduled'::text, 'consultation_complete'::text, 'proposal_sent'::text, 'waiting'::text, 'won'::text, 'lost'::text, 'closed'::text])))
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text,
    retail_price numeric
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    job_id uuid,
    client_id uuid,
    amount numeric NOT NULL,
    payment_method text,
    reference_number text,
    payment_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    logged_by_user_id uuid,
    note text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    user_id uuid NOT NULL,
    phone text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: qa_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qa_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    reviewer_id uuid,
    decision text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT qa_reviews_decision_check CHECK ((decision = ANY (ARRAY['approved'::text, 'rework'::text])))
);


ALTER TABLE public.qa_reviews OWNER TO postgres;

--
-- Name: signed_checklists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signed_checklists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    job_id uuid,
    installer_id uuid,
    signature_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.signed_checklists OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    role text NOT NULL
);

ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role text NOT NULL,
    CONSTRAINT user_roles_role_check CHECK ((role = ANY (ARRAY['Installer'::text, 'Admin'::text, 'Manager'::text, 'Sales'::text, 'Install Manager'::text, 'Finance'::text])))
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    user_id uuid NOT NULL,
    onboarding_version integer DEFAULT 1,
    onboarding_completed_tasks jsonb DEFAULT '[]'::jsonb,
    onboarding_dismissed_at timestamp with time zone
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text,
    role text,
    status text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: checklists checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: installer_inventory installer_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installer_inventory
    ADD CONSTRAINT installer_inventory_pkey PRIMARY KEY (id);


--
-- Name: invoice_fees invoice_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT invoice_fees_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_materials job_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials
    ADD CONSTRAINT job_materials_pkey PRIMARY KEY (id);


--
-- Name: job_materials_used job_materials_used_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials_used
    ADD CONSTRAINT job_materials_used_pkey PRIMARY KEY (id);


--
-- Name: job_qa_reviews job_qa_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_qa_reviews
    ADD CONSTRAINT job_qa_reviews_pkey PRIMARY KEY (id);


--
-- Name: job_quantities_completed job_quantities_completed_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_quantities_completed
    ADD CONSTRAINT job_quantities_completed_pkey PRIMARY KEY (id);


--
-- Name: job_signatures job_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_signatures
    ADD CONSTRAINT job_signatures_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: lead_status_history lead_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_status_history
    ADD CONSTRAINT lead_status_history_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);


--
-- Name: qa_reviews qa_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_reviews
    ADD CONSTRAINT qa_reviews_pkey PRIMARY KEY (id);


--
-- Name: signed_checklists signed_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signed_checklists
    ADD CONSTRAINT signed_checklists_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: leads trg_leads_set_audit; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_leads_set_audit BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_lead_audit_fields();


--
-- Name: leads trg_leads_set_audit_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_leads_set_audit_insert BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_lead_audit_fields();


--
-- Name: leads trg_log_lead_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_log_lead_status_change AFTER UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.log_lead_status_change();


--
-- Name: checklist_items checklist_items_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: checklists checklists_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: installer_inventory installer_inventory_installer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installer_inventory
    ADD CONSTRAINT installer_inventory_installer_id_fkey FOREIGN KEY (installer_id) REFERENCES auth.users(id);


--
-- Name: installer_inventory installer_inventory_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installer_inventory
    ADD CONSTRAINT installer_inventory_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: invoice_fees invoice_fees_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_fees
    ADD CONSTRAINT invoice_fees_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_line_items invoice_line_items_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: invoices invoices_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: job_materials job_materials_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials
    ADD CONSTRAINT job_materials_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_materials job_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials
    ADD CONSTRAINT job_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: job_materials_used job_materials_used_installer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials_used
    ADD CONSTRAINT job_materials_used_installer_id_fkey FOREIGN KEY (installer_id) REFERENCES auth.users(id);


--
-- Name: job_materials_used job_materials_used_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials_used
    ADD CONSTRAINT job_materials_used_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_materials_used job_materials_used_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_materials_used
    ADD CONSTRAINT job_materials_used_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: job_qa_reviews job_qa_reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_qa_reviews
    ADD CONSTRAINT job_qa_reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_qa_reviews job_qa_reviews_reviewer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_qa_reviews
    ADD CONSTRAINT job_qa_reviews_reviewer_user_id_fkey FOREIGN KEY (reviewer_user_id) REFERENCES auth.users(id);


--
-- Name: job_quantities_completed job_quantities_completed_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_quantities_completed
    ADD CONSTRAINT job_quantities_completed_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_quantities_completed job_quantities_completed_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_quantities_completed
    ADD CONSTRAINT job_quantities_completed_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id);


--
-- Name: job_quantities_completed job_quantities_completed_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_quantities_completed
    ADD CONSTRAINT job_quantities_completed_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: job_signatures job_signatures_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_signatures
    ADD CONSTRAINT job_signatures_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: jobs jobs_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: jobs jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: jobs jobs_origin_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_origin_lead_id_fkey FOREIGN KEY (origin_lead_id) REFERENCES public.leads(id);


--
-- Name: jobs jobs_qa_approved_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_qa_approved_by_user_id_fkey FOREIGN KEY (qa_approved_by_user_id) REFERENCES auth.users(id);


--
-- Name: jobs jobs_qa_rejected_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_qa_rejected_by_user_id_fkey FOREIGN KEY (qa_rejected_by_user_id) REFERENCES auth.users(id);


--
-- Name: lead_status_history lead_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_status_history
    ADD CONSTRAINT lead_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: lead_status_history lead_status_history_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_status_history
    ADD CONSTRAINT lead_status_history_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: leads leads_sales_rep_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_sales_rep_id_fkey FOREIGN KEY (sales_rep_id) REFERENCES auth.users(id);


--
-- Name: leads leads_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: payments payments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: payments payments_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: payments payments_logged_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_logged_by_user_id_fkey FOREIGN KEY (logged_by_user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: qa_reviews qa_reviews_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_reviews
    ADD CONSTRAINT qa_reviews_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: qa_reviews qa_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qa_reviews
    ADD CONSTRAINT qa_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id);


--
-- Name: signed_checklists signed_checklists_installer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signed_checklists
    ADD CONSTRAINT signed_checklists_installer_id_fkey FOREIGN KEY (installer_id) REFERENCES auth.users(id);


--
-- Name: signed_checklists signed_checklists_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signed_checklists
    ADD CONSTRAINT signed_checklists_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: jobs Allow insert by authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert by authenticated users" ON public.jobs FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: jobs Allow user access to own records; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow user access to own records" ON public.jobs FOR SELECT USING ((auth.uid() = created_by));


--
-- Name: clients Clients Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients Insert" ON public.clients FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text]))))));


--
-- Name: clients Clients Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients Select" ON public.clients FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text]))))));


--
-- Name: clients Clients Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Clients Update" ON public.clients FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text]))))));


--
-- Name: installer_inventory InstallerInventory Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InstallerInventory Insert" ON public.installer_inventory FOR INSERT WITH CHECK (((installer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));

-- Name: jobs Allow rescheduling by Manager/Admin; Type: POLICY; Schema: public; Owner: postgres

CREATE POLICY "Allow rescheduling by Manager/Admin" ON public.jobs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Manager'::text, 'Admin'::text])))))) WITH CHECK (true);


--
-- Name: installer_inventory InstallerInventory Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InstallerInventory Select" ON public.installer_inventory FOR SELECT USING (((installer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: installer_inventory InstallerInventory Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InstallerInventory Update" ON public.installer_inventory FOR UPDATE USING (((installer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: invoice_fees InvoiceFees Delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceFees Delete" ON public.invoice_fees FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoice_fees InvoiceFees Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceFees Insert" ON public.invoice_fees FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoice_fees InvoiceFees Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceFees Select" ON public.invoice_fees FOR SELECT USING (true);


--
-- Name: invoice_fees InvoiceFees Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceFees Update" ON public.invoice_fees FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoice_line_items InvoiceLineItems Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceLineItems Insert" ON public.invoice_line_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoice_line_items InvoiceLineItems Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceLineItems Select" ON public.invoice_line_items FOR SELECT USING (true);


--
-- Name: invoice_line_items InvoiceLineItems Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "InvoiceLineItems Update" ON public.invoice_line_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoices Invoices Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Invoices Insert" ON public.invoices FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: invoices Invoices Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Invoices Select" ON public.invoices FOR SELECT USING (true);


--
-- Name: invoices Invoices Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Invoices Update" ON public.invoices FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text]))))));


--
-- Name: job_materials_used JobMaterialsUsed Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobMaterialsUsed Insert" ON public.job_materials_used FOR INSERT WITH CHECK (((installer_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_materials_used.job_id) AND (jobs.assigned_to = auth.uid()))))));


--
-- Name: job_materials_used JobMaterialsUsed Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobMaterialsUsed Select" ON public.job_materials_used FOR SELECT USING (((installer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: job_qa_reviews JobQAReviews Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobQAReviews Insert" ON public.job_qa_reviews FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text]))))));


--
-- Name: job_qa_reviews JobQAReviews Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobQAReviews Select" ON public.job_qa_reviews FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text]))))));


--
-- Name: job_quantities_completed JobQuantitiesCompleted Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobQuantitiesCompleted Insert" ON public.job_quantities_completed FOR INSERT WITH CHECK (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_quantities_completed.job_id) AND (jobs.assigned_to = auth.uid()))))));


--
-- Name: job_quantities_completed JobQuantitiesCompleted Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "JobQuantitiesCompleted Select" ON public.job_quantities_completed FOR SELECT USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: jobs Jobs Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Jobs Insert" ON public.jobs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text]))))));


--
-- Name: jobs Jobs Select Assigned; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Jobs Select Assigned" ON public.jobs FOR SELECT USING (((assigned_to = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: jobs Jobs Update Assigned; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Jobs Update Assigned" ON public.jobs FOR UPDATE USING (((assigned_to = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: lead_status_history Lead status history access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Lead status history access" ON public.lead_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text]))))));


--
-- Name: leads Leads Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Leads Insert" ON public.leads FOR INSERT WITH CHECK (((sales_rep_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text])))))));


--
-- Name: leads Leads Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Leads Select" ON public.leads FOR SELECT USING (((sales_rep_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text])))))));


--
-- Name: leads Leads Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Leads Update" ON public.leads FOR UPDATE USING (((sales_rep_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Sales'::text, 'Manager'::text, 'Admin'::text])))))));


--
-- Name: payments Payments Delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Payments Delete" ON public.payments FOR DELETE USING (false);


--
-- Name: payments Payments Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Payments Insert" ON public.payments FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text, 'Sales'::text, 'Installer'::text]))))));


--
-- Name: payments Payments Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Payments Select" ON public.payments FOR SELECT USING (true);


--
-- Name: payments Payments Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Payments Update" ON public.payments FOR UPDATE USING (false);


--
-- Name: profiles Profiles Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Profiles Insert" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Profiles Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Profiles Select" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Profiles Update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Profiles Update" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: qa_reviews QAReviews Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "QAReviews Insert" ON public.qa_reviews FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text]))))));


--
-- Name: qa_reviews QAReviews Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "QAReviews Select" ON public.qa_reviews FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text]))))));


--
-- Name: signed_checklists SignedChecklists Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "SignedChecklists Insert" ON public.signed_checklists FOR INSERT WITH CHECK (((installer_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = signed_checklists.job_id) AND (jobs.assigned_to = auth.uid()))))));


--
-- Name: signed_checklists SignedChecklists Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "SignedChecklists Select" ON public.signed_checklists FOR SELECT USING (((installer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Manager'::text])))))));


--
-- Name: job_signatures User can access signatures for their jobs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can access signatures for their jobs" ON public.job_signatures FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_signatures.job_id) AND (jobs.assigned_to = auth.uid())))));


--
-- Name: job_signatures User can insert signatures for assigned job; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "User can insert signatures for assigned job" ON public.job_signatures FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_signatures.job_id) AND (jobs.assigned_to = auth.uid())))));


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: installer_inventory; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.installer_inventory ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_fees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invoice_fees ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_line_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: job_materials_used; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_materials_used ENABLE ROW LEVEL SECURITY;

--
-- Name: job_materials; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_materials ENABLE ROW LEVEL SECURITY;

--
-- Name: job_qa_reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_qa_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: job_quantities_completed; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_quantities_completed ENABLE ROW LEVEL SECURITY;

--
-- Name: job_signatures; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.job_signatures ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_status_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: materials; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: qa_reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.qa_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: signed_checklists; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.signed_checklists ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_funnel_metrics; Type: VIEW; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.lead_funnel_metrics AS
 SELECT
   l.sales_rep_id,
   u.email AS sales_rep_email,
   count(DISTINCT l.id) AS total_leads,
   count(DISTINCT q.id) AS leads_with_quotes,
   count(DISTINCT j.id) AS leads_converted_to_jobs,
   round((count(DISTINCT q.id)::numeric / NULLIF(count(DISTINCT l.id), 0)) * 100, 1) AS quote_conversion_rate,
   round((count(DISTINCT j.id)::numeric / NULLIF(count(DISTINCT l.id), 0)) * 100, 1) AS job_conversion_rate
 FROM leads l
 LEFT JOIN quotes q ON l.id = q.lead_id
 LEFT JOIN jobs j ON q.id = j.quote_id
 LEFT JOIN auth.users u ON l.sales_rep_id = u.id
 GROUP BY l.sales_rep_id, u.email;

--
-- Name: leads Allow Admin/Sales/Manager to view funnel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow Admin/Sales/Manager to view funnel" ON public.leads FOR SELECT
    USING ((EXISTS ( SELECT 1
           FROM public.user_roles
          WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text, 'Manager'::text]))))));

--
-- Name: quotes Allow Admin/Sales/Manager to view funnel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow Admin/Sales/Manager to view funnel" ON public.quotes FOR SELECT
    USING ((EXISTS ( SELECT 1
           FROM public.user_roles
          WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text, 'Manager'::text]))))));

--
-- Name: jobs Allow Admin/Sales/Manager to view funnel; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow Admin/Sales/Manager to view funnel" ON public.jobs FOR SELECT
    USING ((EXISTS ( SELECT 1
           FROM public.user_roles
          WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['Admin'::text, 'Sales'::text, 'Manager'::text]))))));

--
-- PostgreSQL database dump complete
--

