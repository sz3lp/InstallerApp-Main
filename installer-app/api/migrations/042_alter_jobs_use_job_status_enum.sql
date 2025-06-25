alter table jobs drop constraint if exists jobs_status_check;

alter table jobs
  alter column status type job_status using status::job_status,
  alter column status set default 'created';
