-- Categories are deactivated, never hard-deleted, so historical leads stay joinable.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leads (
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

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_category_slug_idx on public.leads (category_slug);
create index leads_status_idx on public.leads (status);
create index leads_email_phone_created_idx on public.leads (email, phone, created_at desc);

alter table public.categories enable row level security;
alter table public.leads enable row level security;

create policy "anon_read_active_categories"
  on public.categories
  for select
  to anon
  using (is_active = true);

-- No anon insert/update/delete on categories or leads.
-- The submit-lead Edge Function inserts with the service role.

insert into public.categories (slug, label, sort_order) values
  ('exterior-cladding', 'Exterior wall cladding', 10),
  ('balcony-panels', 'Balcony panels', 20),
  ('interior-hpl', 'Interior HPL', 30),
  ('design-assist', 'Design assist', 40),
  ('general', 'General enquiry', 90);
