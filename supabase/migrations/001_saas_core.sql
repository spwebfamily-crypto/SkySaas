create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  plan text not null check (plan in ('free', 'explorer', 'pro', 'business')),
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_status_idx
  on public.subscriptions(user_id, status, current_period_end desc);

create table if not exists public.search_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('cash', 'miles')),
  query jsonb not null,
  provider_status jsonb not null default '[]'::jsonb,
  result_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists search_history_user_created_idx
  on public.search_history(user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.increment_search_usage(target_date date default ((now() at time zone 'utc')::date))
returns public.search_usage
language plpgsql
security invoker
as $$
declare
  usage_row public.search_usage;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.search_usage (user_id, usage_date, count)
  values (auth.uid(), target_date, 1)
  on conflict (user_id, usage_date)
  do update set
    count = public.search_usage.count + 1,
    updated_at = now()
  returning * into usage_row;

  return usage_row;
end;
$$;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.search_usage enable row level security;
alter table public.search_history enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
for select using (auth.uid() = user_id);

drop policy if exists "search_usage_select_own" on public.search_usage;
create policy "search_usage_select_own" on public.search_usage
for select using (auth.uid() = user_id);

drop policy if exists "search_usage_insert_own" on public.search_usage;
create policy "search_usage_insert_own" on public.search_usage
for insert with check (auth.uid() = user_id);

drop policy if exists "search_usage_update_own" on public.search_usage;
create policy "search_usage_update_own" on public.search_usage
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "search_history_select_own" on public.search_history;
create policy "search_history_select_own" on public.search_history
for select using (auth.uid() = user_id);

drop policy if exists "search_history_insert_own" on public.search_history;
create policy "search_history_insert_own" on public.search_history
for insert with check (auth.uid() = user_id);
