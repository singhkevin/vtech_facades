(() => {
  const SERVICE_OPTIONS = [
    { slug: "exterior-hpl", label: "Exterior HPL Cladding" },
    { slug: "ventilated-facade", label: "Ventilated Façade" },
    { slug: "architectural-glazing", label: "Architectural Glazing" },
    { slug: "structural-spider-glazing", label: "Structural or Spider Glazing" },
    { slug: "glass-canopy-skylight", label: "Glass Canopy or Skylight" },
    { slug: "cnc-facade-screen", label: "CNC Façade Screen" },
    { slug: "balcony-panel", label: "Balcony Panel" },
    { slug: "interior-hpl", label: "Interior HPL" },
    { slug: "other-facade", label: "Other Façade Requirement" },
  ];

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let dialog;
  let lastFocus = null;
  let pendingCategory = "";
  let pendingCta = "header";
  let pendingPartner = "";

  const LEAD_SOURCE = "V-TECH Facades Website";

  function endpoint() {
    const c = window.VTECH_LEADS || {};
    return String(c.endpoint || "")
      .trim()
      .split("#")[0]
      .replace(/\/$/, "");
  }

  function configured() {
    return Boolean(endpoint());
  }

  function solutionLabel(slug) {
    const option = SERVICE_OPTIONS.find((item) => item.slug === slug);
    return option ? option.label : slug.replace(/-/g, " ");
  }

  function fillSelect(select, selectedSlug) {
    const current = selectedSlug || select.value;
    select.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Select a solution";
    select.appendChild(blank);
    SERVICE_OPTIONS.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.label;
      select.appendChild(opt);
    });
    if (current && [...select.options].some((o) => o.value === current)) {
      select.value = current;
    }
  }

  function fillAllSelects(selectedSlug) {
    document.querySelectorAll('select[name="category_slug"]').forEach((select) => {
      fillSelect(select, selectedSlug || select.value);
    });
  }

  function setStatus(root, message, kind) {
    const el = root.querySelector("[data-inquire-status]");
    if (!el) return;
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
    fillSelect(select, pendingCategory);
    if (pendingCategory) select.value = pendingCategory;
    if (opts.note) {
      const ta = dialog.querySelector('textarea[name="message"]');
      if (ta && (!ta.value.trim() || ta.value.startsWith("I would like to"))) {
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
      setStatus(dialog, "");
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

  function composeNotes(fd, partner) {
    const lines = [];
    const projectLocation = String(fd.get("location") || "").trim();
    const building = String(fd.get("building_type") || "").trim();
    const area = String(fd.get("area") || "").trim();
    if (projectLocation) lines.push(`Project location: ${projectLocation}`);
    if (building) lines.push(`Building type: ${building}`);
    if (area) lines.push(`Approximate project area: ${area}`);
    const note = String(fd.get("message") || "").trim();
    if (note) {
      if (lines.length) lines.push("");
      lines.push(note);
    }
    const body = lines.join("\n").trim();
    if (!partner) return body;
    return body ? `[partner=${partner}] ${body}` : `[partner=${partner}]`;
  }

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const root = form.closest(".inquire-dialog, .contact-inquire, form") || form;
    const submit = form.querySelector("[data-inquire-submit]");
    const fd = new FormData(form);
    const cta = form.getAttribute("data-source-cta") || pendingCta || "form";

    if (fd.get("company")) {
      setStatus(root, "Thank you. We will be in touch.", "ok");
      form.reset();
      return;
    }

    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const selectedSlug = String(fd.get("category_slug") || "").trim();
    const notes = composeNotes(fd, pendingPartner);

    if (!name || !phone || !email || !selectedSlug) {
      setStatus(root, "Name, phone, email, and required solution are needed.", "err");
      return;
    }

    if (!configured()) {
      setStatus(root, "Enquiries are not connected yet. Call us or email vtechbuildingsystems@gmail.com.", "err");
      return;
    }

    const other_fields = {
      Solution: solutionLabel(selectedSlug),
      "Source path": `${location.pathname}${location.search}`,
      "Source CTA": cta,
    };

    const payload = {
      name,
      email,
      phone,
      display_name: name.split(/\s+/)[0] || name,
      source: LEAD_SOURCE,
      other_fields,
    };
    if (notes) payload.notes = notes;

    submit.disabled = true;
    setStatus(root, "Sending…", "pending");

    try {
      const res = await fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      const ok = res.ok && (body?.success === true || body?.ok === true || body === true);
      if (ok) {
        form.reset();
        fillAllSelects("");
        setStatus(root, "Received. The V-TECH team will follow up shortly.", "ok");
        return;
      }
      const detail = body.message || body.error || body.hint;
      setStatus(root, detail || "Could not send the enquiry. Try again or call us.", "err");
    } catch {
      setStatus(root, "Could not send the enquiry. Try again or call us.", "err");
    } finally {
      submit.disabled = false;
    }
  }

  function bindPageForms() {
    document.querySelectorAll("[data-inquire-form]").forEach((form) => {
      fillSelect(form.querySelector('select[name="category_slug"]'), "");
      form.addEventListener("submit", onSubmit);
    });
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
        <button type="button" class="inquire-close" data-inquire-close aria-label="Close enquiry form">Close</button>
        <p class="chap-label"><span>Enquiry</span> Project notes</p>
        <h2 id="inquire-title">Discuss your project with V-TECH.</h2>
        <p class="inquire-lede">Share drawings or site photographs on WhatsApp at +91 91080 42393. The form below reaches the Rajajinagar team.</p>
        <form class="inquire-form" novalidate>
          <div class="inquire-hp" aria-hidden="true">
            <label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>
          </div>
          <div class="form-grid">
            <label>Name
              <input id="inquire-name" type="text" name="name" placeholder="Your name" required autocomplete="name">
            </label>
            <label>Phone number
              <input type="tel" name="phone" placeholder="+91" required autocomplete="tel">
            </label>
            <label>Email address
              <input type="email" name="email" placeholder="you@company.com" required autocomplete="email">
            </label>
            <label>Project location
              <input type="text" name="location" placeholder="City or site" autocomplete="address-level2">
            </label>
            <label>Building type
              <select name="building_type">
                <option value="">Select building type</option>
                <option>Villa or independent residence</option>
                <option>Apartment development</option>
                <option>Commercial building</option>
                <option>Corporate office</option>
                <option>Retail store or showroom</option>
                <option>Hotel or hospitality</option>
                <option>Hospital or healthcare</option>
                <option>School or institution</option>
                <option>Industrial building</option>
                <option>Other</option>
              </select>
            </label>
            <label>Required solution
              <select id="inquire-category" name="category_slug" required>
                <option value="">Select a solution</option>
              </select>
            </label>
          </div>
          <label>Approximate project area
            <input type="text" name="area" placeholder="sq. ft or sq. m">
          </label>
          <label>Message
            <textarea name="message" placeholder="Project notes, drawings, location"></textarea>
          </label>
          <p class="inquire-status" data-inquire-status hidden></p>
          <button class="inquire" type="submit" data-inquire-submit>Send Project Enquiry</button>
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
    bindPageForms();
    fillAllSelects(pendingCategory);

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
