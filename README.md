# VTech Facades

Authorized Fundermax partner for exterior cladding, balcony panels and wall systems. Division of V-Tech Building Systems Pvt. Ltd, Rajajinagar, Bengaluru.

## Preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Site architecture (SEO)

| URL | Intent |
| --- | --- |
| `/` | Brand + systems overview |
| `/about.html` | Company, founders, Fundermax partnership |
| `/systems.html` | Exterior, balcony, interior HPL |
| `/materials.html` | Sample / specification |
| `/projects.html` | Works gallery |
| `/contact.html` | NAP + enquire modal |
| `/sitemap.xml` | Crawl map |
| `/robots.txt` | Crawl rules |
| `/llms.txt` | Machine-readable company facts |

Canonical host: `https://vtechfacades.com/`

## Enquire form and leads (Supabase)

Inquire CTAs open a shared modal (`js/inquire.js`). Submissions call the `submit_lead` Postgres function and land in the `leads` table.

### One-time setup

1. Open [SQL Editor](https://supabase.com/dashboard/project/rrhqipspiiafyffiqvai/sql/new) for the `vtech-facades` project.
2. Paste and **Run** all of [`supabase/setup.sql`](supabase/setup.sql). You should see `categories` and `leads` under Table Editor.
3. Hard-refresh the site (`Cmd+Shift+R`) so `js/inquire.js?v=leads1` loads.
4. Send a test enquiry, then open **Table Editor → leads**.

Do not put the `service_role` key in the frontend. The anon key in `js/supabase-config.js` is enough.

### Day-to-day

- New category: insert a row on `categories` (unique `slug`, `label`, `sort_order`).
- Remove from the form: set `is_active` to false.
- Leads: filter `leads` by `category_slug` and `status` (`new` → `contacted` → `qualified` → `won` / `lost`).

## Motion

GSAP + ScrollTrigger, Lenis, Three.js hero panel. Reduced-motion disables scroll animation and WebGL.
