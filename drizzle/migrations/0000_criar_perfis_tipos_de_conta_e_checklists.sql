create type public.app_role as enum ('cliente', 'empresa');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "users can view own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  company_name text,
  phone text,
  logo_url text,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.current_user_email()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select email from auth.users where id = auth.uid();
$$;

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  client_name text not null default '',
  client_email text not null default '',
  client_user_id uuid references public.profiles(id) on delete set null,
  intervention_number text not null default '',
  status text not null default 'concluido',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.checklists to authenticated;
grant all on public.checklists to service_role;

alter table public.checklists enable row level security;

create policy "empresa can manage own checklists"
  on public.checklists for select
  to authenticated
  using (
    created_by = auth.uid()
    or client_user_id = auth.uid()
    or lower(client_email) = lower(coalesce(public.current_user_email(), ''))
  );

create policy "empresa can insert checklists"
  on public.checklists for insert
  to authenticated
  with check (created_by = auth.uid() and public.has_role(auth.uid(), 'empresa'));

create policy "empresa can update own checklists"
  on public.checklists for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "empresa can delete own checklists"
  on public.checklists for delete
  to authenticated
  using (created_by = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(new.raw_user_meta_data->>'phone', '')
  );
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'account_type')::public.app_role, 'cliente')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.match_checklist_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_email is not null and new.client_email <> '' then
    select p.id into new.client_user_id
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(u.email) = lower(new.client_email)
    limit 1;
  end if;
  return new;
end $$;

create trigger trg_match_checklist_client
  before insert on public.checklists
  for each row execute function public.match_checklist_client();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_checklists_updated_at
  before update on public.checklists
  for each row execute function public.touch_updated_at();
