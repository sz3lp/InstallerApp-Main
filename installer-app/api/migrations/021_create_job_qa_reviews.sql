create table if not exists job_qa_reviews (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id),
  review_action text not null check (review_action in ('approve','reject','hold')),
  review_comments text,
  reviewed_at timestamptz not null default now()
);

alter table job_qa_reviews enable row level security;

create policy "JobQAReviews Select" on job_qa_reviews
  for select using (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );

create policy "JobQAReviews Insert" on job_qa_reviews
  for insert with check (
    exists (
      select 1 from user_roles where user_id = auth.uid() and role in ('Admin','Manager','Install Manager')
    )
  );
