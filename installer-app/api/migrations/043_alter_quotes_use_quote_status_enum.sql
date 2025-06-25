create type if not exists quote_status as enum ('draft', 'pending', 'approved', 'rejected');

alter table quotes
  alter column status type quote_status using status::quote_status,
  alter column status set default 'draft';
