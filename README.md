# V-TECH Facades

Authorised Fundermax partner in Bangalore for façade, glazing, exterior cladding and architectural surfaces. Division of V-TECH Building Systems Pvt. Ltd, Rajajinagar, Bengaluru.

## Preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Site architecture (SEO)

| URL | Intent |
| --- | --- |
| `/` | Brand + solutions overview |
| `/projects.html` | Project gallery |
| `/solutions.html` | Façade, glazing and HPL solutions |
| `/about.html` | Company and Fundermax partnership |
| `/contact.html` | Rajajinagar address + project enquiry |
| `/systems.html` | 301 → `/solutions.html` |
| `/materials.html` | 301 → `/solutions.html` |
| `/sitemap.xml` | Crawl map |
| `/robots.txt` | Crawl rules |
| `/llms.txt` | Machine-readable company facts |

Canonical host: `https://vtechfacades.com/`

## Enquire form and leads (Supabase)

“Discuss Your Project” and the contact page form share `js/inquire.js`. Submissions call the `submit_lead` Postgres function and land in the `leads` table. Extra fields (location, building type, area) are stored in `message`.

Until the new category slugs are seeded, the form maps each solution to an existing slug (`exterior-cladding`, `balcony-panels`, `interior-hpl`, or `general`).

### One-time setup

1. Open [SQL Editor](https://supabase.com/dashboard/project/rrhqipspiiafyffiqvai/sql/new) for the `vtech-facades` project.
2. Paste and **Run** [`supabase/setup.sql`](supabase/setup.sql), or just [`supabase/migrations/003_solution_categories.sql`](supabase/migrations/003_solution_categories.sql) if tables already exist.
3. Hard-refresh the site (`Cmd+Shift+R`) so `js/inquire.js?v=honest1` loads.
4. Send a test enquiry, then open **Table Editor → leads**.

Do not put the `service_role` key in the frontend. The anon key in `js/supabase-config.js` is enough.

### Day-to-day

- New category: insert a row on `categories` (unique `slug`, `label`, `sort_order`).
- Remove from the form: set `is_active` to false.
- Leads: filter `leads` by `category_slug` and `status` (`new` → `contacted` → `qualified` → `won` / `lost`).

## Motion

GSAP + ScrollTrigger and Lenis on the home page. Reduced-motion disables scroll animation.
