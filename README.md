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

## Enquire form and leads (Privyr)

“Discuss Your Project” and the contact page form share `js/inquire.js`. Submissions POST straight to Privyr’s Incoming Webhook (no Cloudflare / backend). The webhook URL lives in `js/leads-config.js`.

Mapped fields: name, email, phone, display_name, notes (location / building / area / message), source (`V-TECH Facades Website`), and `other_fields` (Solution, Source path, Source CTA).

### Setup

1. Copy the Incoming Webhook URL from Privyr → Integrations → Incoming Webhook into `js/leads-config.js` as `endpoint` (omit any `#fragment`).
2. Hard-refresh so `?v=privyr2` scripts load.
3. Submit a test enquiry on `/contact.html` and confirm the lead in Privyr.

### Local test

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/contact.html — no Worker required.

### Production

Deploy the static site as usual (HTML/CSS/JS). Leads already go to Privyr from the browser; nothing else to host.

**Note:** The webhook path embeds account auth and is visible in page source. Anyone who finds it can POST leads to your Privyr. That matches Privyr’s website-webhook model; rotate the URL in Privyr if it is abused.

## Motion

GSAP + ScrollTrigger and Lenis on the home page. Reduced-motion disables scroll animation.
