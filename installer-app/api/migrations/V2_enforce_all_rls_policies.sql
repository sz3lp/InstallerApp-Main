alter table jobs enable row level security;
create policy "Allow user access to own records" on jobs for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on jobs for insert with check (auth.uid() = created_by);

alter table materials enable row level security;
create policy "Allow user access to own records" on materials for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on materials for insert with check (auth.uid() = created_by);

alter table invoices enable row level security;
create policy "Allow user access to own records" on invoices for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on invoices for insert with check (auth.uid() = created_by);

alter table payments enable row level security;
create policy "Allow user access to own records" on payments for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on payments for insert with check (auth.uid() = created_by);

alter table clients enable row level security;
create policy "Allow user access to own records" on clients for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on clients for insert with check (auth.uid() = created_by);

alter table job_quantities_completed enable row level security;
create policy "Allow user access to own records" on job_quantities_completed for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on job_quantities_completed for insert with check (auth.uid() = created_by);

alter table job_install_measures enable row level security;
create policy "Allow user access to own records" on job_install_measures for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on job_install_measures for insert with check (auth.uid() = created_by);

alter table job_signatures enable row level security;
create policy "Allow user access to own records" on job_signatures for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on job_signatures for insert with check (auth.uid() = created_by);

alter table job_attachments enable row level security;
create policy "Allow user access to own records" on job_attachments for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on job_attachments for insert with check (auth.uid() = created_by);

alter table installer_checklists enable row level security;
create policy "Allow user access to own records" on installer_checklists for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on installer_checklists for insert with check (auth.uid() = created_by);

alter table qa_reviews enable row level security;
create policy "Allow user access to own records" on qa_reviews for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on qa_reviews for insert with check (auth.uid() = created_by);

alter table leads enable row level security;
create policy "Allow user access to own records" on leads for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on leads for insert with check (auth.uid() = created_by);

alter table inventory_levels enable row level security;
create policy "Allow user access to own records" on inventory_levels for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on inventory_levels for insert with check (auth.uid() = created_by);

alter table users enable row level security;
create policy "Allow user access to own records" on users for select using (auth.uid() = created_by);
create policy "Allow insert by authenticated users" on users for insert with check (auth.uid() = created_by);
