-- Expand enquiry categories to match public solutions.
-- Deactivate old labels instead of deleting, so historical leads stay joinable.

insert into public.categories (slug, label, sort_order, is_active) values
  ('exterior-hpl', 'Exterior HPL Cladding', 10, true),
  ('ventilated-facade', 'Ventilated Façade', 20, true),
  ('architectural-glazing', 'Architectural Glazing', 30, true),
  ('structural-spider-glazing', 'Structural or Spider Glazing', 40, true),
  ('glass-canopy-skylight', 'Glass Canopy or Skylight', 50, true),
  ('cnc-facade-screen', 'CNC Façade Screen', 60, true),
  ('balcony-panel', 'Balcony Panel', 70, true),
  ('interior-hpl', 'Interior HPL', 80, true),
  ('other-facade', 'Other Façade Requirement', 90, true)
on conflict (slug) do update set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true;

update public.categories
set is_active = false
where slug in ('exterior-cladding', 'balcony-panels', 'design-assist', 'general')
  and slug not in (
    'exterior-hpl',
    'ventilated-facade',
    'architectural-glazing',
    'structural-spider-glazing',
    'glass-canopy-skylight',
    'cnc-facade-screen',
    'balcony-panel',
    'interior-hpl',
    'other-facade'
  );
