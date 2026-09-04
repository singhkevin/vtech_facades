document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  wrapHeadlines();
  initNav();
  initHeader();
  initSpec();
  initFilters();
  initTilt();
  initFilm();
  initProgress();

  if (typeof gsap === "undefined") {
    document.getElementById("curtain")?.remove();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce) {
    initCursor();
    initLenis();
    playCurtain();
    initHero(true);
    initHeroParallax();
    initParallax();
    initReel();
    initChoreography();
    initQuote();
    initCounters();
    initAtelier();
    initFooter();
  } else {
    document.getElementById("curtain")?.remove();
    initHero(false);
    revealQuoteInstant();
  }
});

function wrapHeadlines() {
  document.querySelectorAll(".split-headline").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    text.split(/(\s+)/).forEach((token) => {
      if (/^\s+$/.test(token)) {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      const word = document.createElement("span");
      word.className = "word";
      [...token].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        word.appendChild(span);
      });
      el.appendChild(word);
    });
  });
}

function initLenis() {
  const lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

function playCurtain() {
  const word = document.getElementById("curtain-word");
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(word, { letterSpacing: "0.28em", duration: 1.15 }, 0.15)
    .to(".curtain-panel.left", { xPercent: -101, duration: 1.05 }, 0.85)
    .to(".curtain-panel.right", { xPercent: 101, duration: 1.05 }, 0.85)
    .to(word, { opacity: 0, duration: 0.45 }, 0.9)
    .set("#curtain", { display: "none" });
}

function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  let x = 0, y = 0, rx = 0, ry = 0;
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  });
  const follow = () => {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(follow);
  };
  follow();
  document.querySelectorAll("[data-cursor='hover'], a, button").forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
  });
}

function initHeader() {
  const header = document.getElementById("site-header");
  const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-nav");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("is-open");
    menu.classList.toggle("is-open");
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    toggle.classList.remove("is-open");
    menu.classList.remove("is-open");
  }));
}

function initProgress() {
  const bar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }, { passive: true });
}

function initHero(animate) {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const tabs = [...document.querySelectorAll(".hero-tabs button")];
  const fills = tabs.map((t) => t.querySelector(".fill"));
  const badge = document.querySelector(".hero-badge");
  const tabBar = document.querySelector(".hero-tabs");
  let i = 0;
  let timer;
  let busy = false;
  let chromeReady = false;
  const DURATION = 8;
  const CROSS = 1.2;

  gsap.set(slides, { autoAlpha: 0 });
  gsap.set(slides[0], { autoAlpha: 1 });
  slides[0].classList.add("is-active");

  const playFill = (idx) => {
    fills.forEach((f) => {
      if (!f) return;
      gsap.killTweensOf(f);
      gsap.set(f, { width: 0 });
    });
    if (fills[idx]) {
      gsap.fromTo(fills[idx], { width: "0%" }, { width: "100%", duration: DURATION, ease: "none" });
    }
  };

  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(() => show(i + 1), DURATION * 1000);
  };

  const revealChrome = () => {
    if (chromeReady || !animate) return;
    chromeReady = true;
    const tl = gsap.timeline({ delay: 1.4, defaults: { ease: "power3.out" } });
    if (badge) {
      gsap.set(badge, { autoAlpha: 0, y: 14 });
      tl.to(badge, { autoAlpha: 0.82, y: 0, duration: 0.9 }, 0);
    }
    if (tabBar) {
      gsap.set(tabBar, { autoAlpha: 0, y: 18 });
      tl.to(tabBar, { autoAlpha: 1, y: 0, duration: 0.85 }, 0.12);
    }
  };

  const enterCopy = (slide, delay = 0) => {
    const label = slide.querySelector(".chap-label");
    const chars = slide.querySelectorAll(".char");
    const lead = slide.querySelector(".slide-lead");
    const img = slide.querySelector(".slide-img");

    if (img) {
      gsap.fromTo(img, { scale: 1.08 }, {
        scale: 1.02, duration: DURATION + CROSS, ease: "none", delay
      });
    }
    if (label) {
      gsap.fromTo(label, { y: 16, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.out", delay
      });
    }
    if (chars.length) {
      gsap.fromTo(chars, { yPercent: 115, autoAlpha: 0 }, {
        yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.015, ease: "power3.out", delay: delay + 0.1
      });
    }
    if (lead) {
      gsap.fromTo(lead, { y: 22, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.85, delay: delay + 0.32, ease: "power2.out"
      });
    }
  };

  const exitCopy = (slide) => {
    const label = slide.querySelector(".chap-label");
    const chars = slide.querySelectorAll(".char");
    const lead = slide.querySelector(".slide-lead");
    const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
    if (chars.length) {
      tl.to(chars, { yPercent: 40, autoAlpha: 0, duration: 0.45, stagger: 0.008 }, 0);
    }
    if (label) tl.to(label, { y: -10, autoAlpha: 0, duration: 0.35 }, 0);
    if (lead) tl.to(lead, { y: 12, autoAlpha: 0, duration: 0.35 }, 0.05);
    return tl;
  };

  const show = (n) => {
    const next = ((n % slides.length) + slides.length) % slides.length;
    if (busy || next === i) return;

    const prev = i;
    busy = true;
    i = next;

    tabs.forEach((t, idx) => t.classList.toggle("is-on", idx === i));
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    playFill(i);

    if (!animate) {
      gsap.set(slides[prev], { autoAlpha: 0 });
      gsap.set(slides[i], { autoAlpha: 1 });
      busy = false;
      arm();
      return;
    }

    const incoming = slides[i];
    const outgoing = slides[prev];

    const tl = gsap.timeline({
      onComplete: () => {
        busy = false;
        arm();
      }
    });

    tl.add(exitCopy(outgoing), 0);
    tl.to(outgoing, { autoAlpha: 0, duration: CROSS, ease: "power2.inOut" }, 0.15);
    tl.set(incoming, { autoAlpha: 1 }, 0.2);
    tl.add(() => enterCopy(incoming, 0), 0.35);
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    if (busy) return;
    clearTimeout(timer);
    show(Number(tab.dataset.i));
  }));

  if (animate) {
    gsap.set([badge, tabBar].filter(Boolean), { autoAlpha: 0 });
    revealChrome();
    enterCopy(slides[0], 1.2);
  }
  playFill(0);
  arm();
}

function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  let px = 0;
  let py = 0;
  let cx = 0;
  let cy = 0;

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - 0.5;
    py = (e.clientY - r.top) / r.height - 0.5;
  });

  const tick = () => {
    cx += (px - cx) * 0.06;
    cy += (py - cy) * 0.06;
    const active = hero.querySelector(".hero-slide.is-active .slide-img");
    if (active) {
      active.style.translate = `${cx * -18}px ${cy * -10}px`;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

function initParallax() {
  const section = document.querySelector(".parallax");
  if (!section) return;

  const rows = gsap.utils.toArray(".p-row", section);
  section.classList.add("is-live");
  rows[0]?.classList.add("is-on");

  gsap.to(".aura-word", {
    xPercent: -6,
    ease: "none",
    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
  });
  gsap.to(".p1", { xPercent: -14, ease: "none", scrollTrigger: { trigger: section, scrub: true } });
  gsap.to(".p2", { xPercent: 12, ease: "none", scrollTrigger: { trigger: section, scrub: true } });
  gsap.to(".p3", { xPercent: -8, ease: "none", scrollTrigger: { trigger: section, scrub: true } });

  rows.forEach((row) => {
    const word = row.querySelector(".p-word b");
    const cap = row.querySelector("i");
    const orbit = row.querySelector(".p-orbit");

    if (word) {
      gsap.from(word, {
        yPercent: 110,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
      });
    }
    if (cap) {
      gsap.from(cap, {
        autoAlpha: 0,
        y: 14,
        duration: 0.7,
        delay: 0.16,
        ease: "power2.out",
        scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
      });
    }
    if (orbit) {
      gsap.from(orbit, {
        scale: 0.72,
        autoAlpha: 0,
        duration: 0.55,
        delay: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
      });
    }

    ScrollTrigger.create({
      trigger: row,
      start: "top 62%",
      end: "bottom 38%",
      onEnter: () => setActiveRow(rows, row),
      onEnterBack: () => setActiveRow(rows, row)
    });
  });
}

function setActiveRow(rows, active) {
  rows.forEach((row) => row.classList.toggle("is-on", row === active));
}

function initReel() {
  const wrap = document.getElementById("pin-wrap");
  const reel = document.getElementById("reel");
  if (!wrap || !reel) return;

  const cards = [...reel.querySelectorAll(".proj")];
  const fill = document.getElementById("works-fill");
  const current = document.getElementById("works-current");
  const total = document.getElementById("works-total");
  const ticksEl = document.getElementById("works-chapter-ticks");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (total) total.textContent = String(cards.length).padStart(2, "0");
  if (ticksEl) {
    ticksEl.innerHTML = cards
      .map((_, i) => `<button type="button" class="works-tick${i === 0 ? " is-on" : ""}" data-i="${i}" aria-label="Project ${String(i + 1).padStart(2, "0")}"></button>`)
      .join("");
  }

  const distance = () => Math.max(reel.scrollWidth - window.innerWidth + 80, 0);

  const setActive = () => {
    const focusX = window.innerWidth * 0.5;
    let best = 0;
    let bestDist = Infinity;

    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const d = Math.abs(mid - focusX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
      if (!reduce) {
        const img = card.querySelector(".proj-img");
        if (img) {
          const offset = (mid - focusX) / window.innerWidth;
          img.style.setProperty("--parallax", `${(offset * -42).toFixed(2)}px`);
        }
      }
    });

    cards.forEach((card, i) => card.classList.toggle("is-active", i === best));
    if (current) current.textContent = String(best + 1).padStart(2, "0");
    ticksEl?.querySelectorAll(".works-tick").forEach((tick, i) => {
      tick.classList.toggle("is-on", i === best);
    });
  };

  let scrollTrigger;
  const tween = gsap.to(reel, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: wrap,
      start: "top top",
      pin: true,
      scrub: 0.55,
      anticipatePin: 1,
      end: () => `+=${distance()}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (fill) fill.style.transform = `scaleX(${self.progress})`;
        setActive();
      },
      onRefresh: (self) => {
        setActive();
        if (fill) fill.style.transform = `scaleX(${self.progress})`;
      }
    }
  });
  scrollTrigger = tween.scrollTrigger;

  setActive();

  ticksEl?.addEventListener("click", (e) => {
    const btn = e.target.closest(".works-tick");
    if (!btn || !scrollTrigger) return;
    const i = Number(btn.dataset.i);
    const progress = cards.length <= 1 ? 0 : i / (cards.length - 1);
    const y = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  });
}

function initTilt() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const host = card.closest(".proj");
      if (host && !host.classList.contains("is-active")) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 5;
      const ry = (x - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initChoreography() {
  document.querySelectorAll("section").forEach((section) => {
    const label = section.querySelector(".reveal-label");
    const head = section.querySelector(".reveal-head");
    const rest = section.querySelectorAll(".door, .swatches, .metrics, .atelier-p, .telemetry, .film");
    if (label) {
      gsap.from(label, {
        y: 16, opacity: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 78%" }
      });
    }
    if (head) {
      gsap.from(head, {
        y: 36, opacity: 0, duration: 1, delay: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%" }
      });
    }
    if (rest.length) {
      gsap.from(rest, {
        y: 28, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.16, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 72%" }
      });
    }
  });
}

function initQuote() {
  const q = document.getElementById("quote");
  if (!q) return;
  const words = q.textContent.trim().split(/\s+/);
  q.textContent = "";
  words.forEach((w) => {
    const s = document.createElement("span");
    s.className = "q-word";
    s.textContent = w + " ";
    q.appendChild(s);
  });
  gsap.to(".q-word", {
    opacity: 1,
    duration: 0.6,
    stagger: 0.045,
    ease: "power2.out",
    scrollTrigger: { trigger: q, start: "top 75%" }
  });
}

function revealQuoteInstant() {
  document.querySelectorAll(".q-word").forEach((w) => { w.style.opacity = 1; });
}

function initCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            const n = decimals ? obj.v.toFixed(decimals) : Math.round(obj.v);
            el.textContent = `${prefix}${n}${suffix}`;
          }
        });
      }
    });
  });
}

function initAtelier() {
  gsap.to(".photo-blind", {
    clipPath: "inset(0 0% 0 0)",
    duration: 1.4,
    ease: "power3.inOut",
    scrollTrigger: { trigger: ".atelier", start: "top 65%" }
  });
}

function initFooter() {
  gsap.from("#portrait", {
    y: 40,
    ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true }
  });
}

function initFilters() {
  const chips = document.querySelectorAll(".chip[data-f]");
  const cards = [...document.querySelectorAll(".swatch")];
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      const f = chip.dataset.f;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.c === f;
        card.classList.toggle("is-out", !show);
        gsap.to(card, { opacity: show ? 1 : 0, scale: show ? 1 : 0.96, duration: 0.35, ease: "power2.out" });
      });
    });
  });
  cards.forEach((card) => card.addEventListener("click", () => addSpec(card.dataset.n)));
}

const spec = [];
function addSpec(name) {
  if (!spec.includes(name)) spec.push(name);
  document.getElementById("spec-count").textContent = spec.length;
  const list = document.getElementById("spec-list");
  list.innerHTML = spec.map((n) => `<li>${n}</li>`).join("");
  const toast = document.getElementById("toast");
  toast.textContent = `${name} held in spec box`;
  toast.classList.add("is-on");
  setTimeout(() => toast.classList.remove("is-on"), 1800);
}

function initSpec() {
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("backdrop");
  const open = () => { drawer.classList.add("is-open"); backdrop.classList.add("is-on"); drawer.setAttribute("aria-hidden", "false"); };
  const close = () => { drawer.classList.remove("is-open"); backdrop.classList.remove("is-on"); drawer.setAttribute("aria-hidden", "true"); };
  document.getElementById("open-spec")?.addEventListener("click", open);
  document.getElementById("close-spec")?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
}

function initFilm() {
  const film = document.getElementById("film");
  const btn = document.getElementById("expand-film");
  if (!film || !btn) return;
  btn.addEventListener("click", () => {
    const on = film.classList.toggle("is-full");
    btn.textContent = on ? "Close" : "Expand";
    document.body.style.overflow = on ? "hidden" : "";
  });
}
