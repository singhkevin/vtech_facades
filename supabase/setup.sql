-- Idempotent setup: tables, RLS, seed, and RPC so the static site can capture leads
-- without a deployed Edge Function. Safe to run more than once.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  message text,
  category_id uuid references public.categories (id),
  category_slug text not null,
  category_label text not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  source_path text,
  source_cta text,
  user_agent text,
  notes text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_category_slug_idx on public.leads (category_slug);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_email_phone_created_idx on public.leads (email, phone, created_at desc);

alter table public.categories enable row level security;
alter table public.leads enable row level security;

drop policy if exists "anon_read_active_categories" on public.categories;
create policy "anon_read_active_categories"
  on public.categories
  for select
  to anon
  using (is_active = true);

insert into public.categories (slug, label, sort_order) values
  ('exterior-hpl', 'Exterior HPL Cladding', 10),
  ('ventilated-facade', 'Ventilated Façade', 20),
  ('architectural-glazing', 'Architectural Glazing', 30),
  ('structural-spider-glazing', 'Structural or Spider Glazing', 40),
  ('glass-canopy-skylight', 'Glass Canopy or Skylight', 50),
  ('cnc-facade-screen', 'CNC Façade Screen', 60),
  ('balcony-panel', 'Balcony Panel', 70),
  ('interior-hpl', 'Interior HPL', 80),
  ('other-facade', 'Other Façade Requirement', 90)
on conflict (slug) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true;

update public.categories
set is_active = false
where slug in ('exterior-cladding', 'balcony-panels', 'design-assist', 'general');

create or replace function public.submit_lead(
  p_name text,
  p_phone text,
  p_email text,
  p_category_slug text,
  p_message text default null,
  p_source_path text default null,
  p_source_cta text default null,
  p_company text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  cat public.categories%rowtype;
  recent_id uuid;
begin
  if coalesce(trim(p_company), '') <> '' then
    return json_build_object('ok', true);
  end if;

  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_email), '') = ''
     or coalesce(trim(p_category_slug), '') = '' then
    raise exception 'Name, phone, email, and category are required.';
  end if;

  if p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid email is required.';
  end if;

  select * into cat
  from public.categories
  where slug = trim(p_category_slug) and is_active = true;

  if not found then
    raise exception 'Choose an active category.';
  end if;

  select id into recent_id
  from public.leads
  where email = lower(trim(p_email))
    and phone = trim(p_phone)
    and created_at > now() - interval '10 minutes'
  limit 1;

  if recent_id is not null then
    raise exception 'This enquiry was already received. We will be in touch.';
  end if;

  insert into public.leads (
    name, phone, email, message,
    category_id, category_slug, category_label,
    status, source_path, source_cta
  ) values (
    trim(p_name),
    trim(p_phone),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_message, '')), ''),
    cat.id,
    cat.slug,
    cat.label,
    'new',
    nullif(trim(coalesce(p_source_path, '')), ''),
    nullif(trim(coalesce(p_source_cta, '')), '')
  );

  return json_build_object('ok', true);
end;
$$;

revoke all on function public.submit_lead(
  text, text, text, text, text, text, text, text
) from public;
grant execute on function public.submit_lead(
  text, text, text, text, text, text, text, text
) to anon, authenticated;

notify pgrst, 'reload schema';
