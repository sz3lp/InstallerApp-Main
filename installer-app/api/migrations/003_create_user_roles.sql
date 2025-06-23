create table if not exists user_roles (
  user_id uuid references auth.users(id) primary key,
  role text not null check (
    role in (
      'Installer',
      'Admin',
      'Manager',
      'Install Manager',
      'Sales',
      'Finance'
    )
  )
);
