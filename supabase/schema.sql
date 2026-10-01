create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'student'
              check (role in ('student', 'admin')),
  full_name   text,
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $func$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$func$;

create table if not exists public.members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  role         text check (char_length(role) <= 160),
  area         text check (char_length(area) <= 160),
  image        text,
  icon_name    text,
  color        text,
  quote        text check (char_length(quote) <= 600),
  tag          text,
  category     text not null
               check (category in ('lideranca','astronomia_fisica',
                                   'biotec_quimica','tecnologia_robotica',
                                   'terra_exatas','outros')),
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  full_name   text check (char_length(full_name) <= 200),
  category    text,
  type        text,
  color       text,
  description text check (char_length(description) <= 600),
  logo        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  summary      text check (char_length(summary) <= 1200),
  content      text check (char_length(content) <= 20000),
  pillar       text not null default 'geral'
               check (pillar in ('investigacao','tecnologia','astronomia',
                                 'biotecnologia','geral')),
  status       text not null default 'draft'
               check (status in ('draft','in_progress','review',
                                 'approved','featured')),
  cover_image  text,
  tags         text[] default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.site_config (
  id          integer primary key default 1 check (id = 1),
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.profiles    enable row level security;
alter table public.members     enable row level security;
alter table public.partners    enable row level security;
alter table public.projects    enable row level security;
alter table public.site_config enable row level security;

alter table public.profiles    force row level security;
alter table public.members     force row level security;
alter table public.partners    force row level security;
alter table public.projects    force row level security;
alter table public.site_config force row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists members_public_read on public.members;
create policy members_public_read on public.members
  for select using (true);

drop policy if exists members_admin_write on public.members;
create policy members_admin_write on public.members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists partners_public_read on public.partners;
create policy partners_public_read on public.partners
  for select using (true);

drop policy if exists partners_admin_write on public.partners;
create policy partners_admin_write on public.partners
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists config_public_read on public.site_config;
create policy config_public_read on public.site_config
  for select using (true);

drop policy if exists config_admin_write on public.site_config;
create policy config_admin_write on public.site_config
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select using (
    status in ('approved','featured')
    or owner_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists projects_owner_insert on public.projects;
create policy projects_owner_insert on public.projects
  for insert with check (owner_id = auth.uid());

drop policy if exists projects_owner_update on public.projects;
create policy projects_owner_update on public.projects
  for update
  using (owner_id = auth.uid() and status in ('draft','in_progress'))
  with check (owner_id = auth.uid() and status in ('draft','in_progress'));

drop policy if exists projects_owner_delete on public.projects;
create policy projects_owner_delete on public.projects
  for delete using (owner_id = auth.uid() and status = 'draft');

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 4194304,
        array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());
