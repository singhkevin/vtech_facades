(() => {
  const FALLBACK_CATEGORIES = [
    { slug: "exterior-cladding", label: "Exterior wall cladding" },
    { slug: "balcony-panels", label: "Balcony panels" },
    { slug: "interior-hpl", label: "Interior HPL" },
    { slug: "design-assist", label: "Design assist" },
    { slug: "general", label: "General enquiry" },
  ];

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let dialog;
  let lastFocus = null;
  let pendingCategory = "";
  let pendingCta = "header";
  let pendingPartner = "";

  const PUBLIC_SUPABASE = {
    url: "https://rrhqipspiiafyffiqvai.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyaHFpcHNwaWlhZnlmZmlxdmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTk4MzksImV4cCI6MjEwNDA5NTgzOX0.f3rj2p0goZGoMul1KshlJuSqRtNteGyKDJXbzAqX-5o",
  };

  function config() {
    const c = window.VTECH_SUPABASE || {};
    const url = String(c.url || "").trim();
    const anonKey = String(c.anonKey || "").trim();
    if (url && anonKey) return { url, anonKey };
    return PUBLIC_SUPABASE;
  }

  function projectUrl() {
    const raw = (config().url || "").trim().replace(/\/$/, "");
    return raw.replace(/\/rest\/v1$/i, "");
  }

  function configured() {
    const { url, anonKey } = config();
    return Boolean(url && anonKey);
  }

  async function loadCategories() {
    if (!configured()) return FALLBACK_CATEGORIES;
    const { anonKey } = config();
    const endpoint =
      `${projectUrl()}/rest/v1/categories` +
      `?is_active=eq.true&select=slug,label,sort_order&order=sort_order.asc`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      });
      if (!res.ok) return FALLBACK_CATEGORIES;
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) return FALLBACK_CATEGORIES;
      return rows;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  }

  function fillSelect(select, categories, selectedSlug) {
    const current = selectedSlug || select.value;
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Select a system";
    select.appendChild(blank);
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.label;
      select.appendChild(opt);
    });
    if (current && [...select.options].some((o) => o.value === current)) {
      select.value = current;
    }
  }

  function setStatus(message, kind) {
    const el = dialog.querySelector("[data-inquire-status]");
    el.textContent = message || "";
    el.dataset.kind = kind || "";
    el.hidden = !message;
  }

  function openDialog(opts = {}) {
    pendingCategory = opts.category || pendingCategory;
    pendingCta = opts.cta || pendingCta || "header";
    pendingPartner = opts.partner || "";
    lastFocus = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add("inquire-lock");
    if (window.__lenis && typeof window.__lenis.stop === "function") {
      window.__lenis.stop();
    }
    const bar = document.querySelector(".quick-bar");
    if (bar) bar.inert = true;
    const select = dialog.querySelector("#inquire-category");
    if (pendingCategory) select.value = pendingCategory;
    if (opts.note) {
      const ta = dialog.querySelector('textarea[name="message"]');
      if (ta && (!ta.value.trim() || ta.value.startsWith("Custom colourway:"))) {
        ta.value = opts.note;
      }
    }
    void dialog.offsetWidth;
    dialog.classList.add("is-open");
    dialog.querySelector("#inquire-name").focus();
  }

  function closeDialog() {
    dialog.classList.remove("is-open");
    document.body.classList.remove("inquire-lock");
    if (window.__lenis && typeof window.__lenis.start === "function") {
      window.__lenis.start();
    }
    const bar = document.querySelector(".quick-bar");
    if (bar) bar.inert = false;
    const finish = () => {
      if (dialog.classList.contains("is-open")) return;
      dialog.hidden = true;
      setStatus("");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
      lastFocus = null;
      pendingCategory = "";
      pendingPartner = "";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const backdrop = dialog.querySelector(".inquire-backdrop");
    backdrop.addEventListener("transitionend", (event) => {
      if (event.propertyName === "opacity") finish();
    }, { once: true });
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !dialog.classList.contains("is-open")) return;
    const nodes = [...dialog.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function sourceCtaFrom(el) {
    return el.getAttribute("data-source-cta") || "header";
  }

  function bindTriggers() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-inquire-open]");
      if (!trigger) return;
      event.preventDefault();
      openDialog({
        category: trigger.getAttribute("data-category") || "",
        cta: sourceCtaFrom(trigger),
        partner: trigger.getAttribute("data-partner") || "",
        note: trigger.getAttribute("data-inquire-note") || "",
      });
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("[data-inquire-submit]");
    const fd = new FormData(form);

    if (fd.get("company")) {
      setStatus("Thank you. We will be in touch.", "ok");
      form.reset();
      return;
    }

    const payload = {
      name: String(fd.get("name") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      message: pendingPartner
        ? `[partner=${pendingPartner}] ${String(fd.get("message") || "").trim()}`.trim()
        : String(fd.get("message") || "").trim(),
      category_slug: String(fd.get("category_slug") || "").trim(),
      company: String(fd.get("company") || "").trim(),
      source_path: `${location.pathname}${location.search}`,
      source_cta: pendingCta,
    };

    if (!payload.name || !payload.phone || !payload.email || !payload.category_slug) {
      setStatus("Name, phone, email, and category are required.", "err");
      return;
    }

    if (!configured()) {
      setStatus("Enquiries are not connected yet. Call the studio or email us directly.", "err");
      return;
    }

    submit.disabled = true;
    setStatus("Sending…", "pending");

    const { anonKey } = config();
    const rpcBody = {
      p_name: payload.name,
      p_phone: payload.phone,
      p_email: payload.email,
      p_category_slug: payload.category_slug,
      p_message: payload.message || null,
      p_source_path: payload.source_path || null,
      p_source_cta: payload.source_cta || null,
      p_company: payload.company || null,
    };
    try {
      const res = await fetch(`${projectUrl()}/rest/v1/rpc/submit_lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(rpcBody),
      });
      const body = await res.json().catch(() => ({}));
      const ok = res.ok && (body === true || body?.ok === true || body === '{"ok":true}');
      if (ok) {
        form.reset();
        setStatus("Received. The studio will follow up shortly.", "ok");
        return;
      }
      const detail = body.message || body.error || body.hint;
      if (res.status === 404) {
        setStatus("Database is not set up yet. Run supabase/setup.sql in the SQL editor, then try again.", "err");
        return;
      }
      setStatus(detail || "Could not send the enquiry. Try again or call us.", "err");
    } catch {
      setStatus("Could not send the enquiry. Try again or call us.", "err");
    } finally {
      submit.disabled = false;
    }
  }

  function mount() {
    dialog = document.createElement("div");
    dialog.id = "inquire";
    dialog.className = "inquire-root";
    dialog.setAttribute("data-lenis-prevent", "");
    dialog.hidden = true;
    dialog.innerHTML = `
      <div class="inquire-backdrop" data-inquire-close tabindex="-1"></div>
      <div class="inquire-dialog" role="dialog" aria-modal="true" aria-labelledby="inquire-title" data-lenis-prevent>
        <button type="button" class="inquire-close" data-inquire-close aria-label="Close enquire form">Close</button>
        <p class="chap-label"><span>Enquire</span> Project notes</p>
        <h2 id="inquire-title">Tell us what you are specifying.</h2>
        <p class="inquire-lede">Name, phone, and the system you need. We reply from the Rajajinagar centre.</p>
        <form class="inquire-form" novalidate>
          <div class="inquire-hp" aria-hidden="true">
            <label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>
          </div>
          <label>Name
            <input id="inquire-name" type="text" name="name" placeholder="Your name" required autocomplete="name">
          </label>
          <label>Phone
            <input type="tel" name="phone" placeholder="+91" required autocomplete="tel">
          </label>
          <label>Email
            <input type="email" name="email" placeholder="studio@practice.com" required autocomplete="email">
          </label>
          <label>Category
            <select id="inquire-category" name="category_slug" required>
              <option value="">Select a system</option>
            </select>
          </label>
          <label>Message
            <textarea name="message" placeholder="Project notes, drawings, location"></textarea>
          </label>
          <p class="inquire-status" data-inquire-status hidden></p>
          <button class="inquire" type="submit" data-inquire-submit>Send enquiry</button>
        </form>
      </div>
    `;
    document.body.appendChild(dialog);

    dialog.querySelectorAll("[data-inquire-close]").forEach((el) => {
      el.addEventListener("click", closeDialog);
    });
    dialog.querySelector("form").addEventListener("submit", onSubmit);
    document.addEventListener("keydown", (event) => {
      if (!dialog.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
      trapFocus(event);
    });

    bindTriggers();
    loadCategories().then((cats) => {
      fillSelect(dialog.querySelector("#inquire-category"), cats, pendingCategory);
    });

    if (location.hash === "#inquire") {
      openDialog({ cta: "hash" });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
