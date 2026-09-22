document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  wrapHeadlines();
  initNav();
  initHeader();
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
    initAtelier();
    initFooter();
    initFundermax();
  } else {
    document.getElementById("curtain")?.remove();
    initHero(false);
    initFundermaxStatic();
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
  const setOpen = (open) => {
    toggle.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "mobile-nav");
  toggle.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach((el) => el.addEventListener("click", () => setOpen(false)));
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
  const identity = document.querySelector(".hero-identity");
  const brandTitle = document.querySelector(".hero-brand-title");
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
    if (identity) {
      gsap.set(identity, { autoAlpha: 0, y: 16 });
      tl.to(identity, { autoAlpha: 1, y: 0, duration: 0.9 }, 0);
    }
    if (brandTitle) {
      gsap.set(brandTitle, { autoAlpha: 0, y: 12 });
      tl.to(brandTitle, { autoAlpha: 1, y: 0, duration: 0.85 }, 0);
    }
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
    const actions = slide.querySelector(".hero-actions");
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
    if (actions) {
      gsap.fromTo(actions, { y: 18, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.8, delay: delay + 0.42, ease: "power2.out"
      });
    }
  };

  const exitCopy = (slide) => {
    const label = slide.querySelector(".chap-label");
    const chars = slide.querySelectorAll(".char");
    const lead = slide.querySelector(".slide-lead");
    const actions = slide.querySelector(".hero-actions");
    const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
    if (chars.length) {
      tl.to(chars, { yPercent: 40, autoAlpha: 0, duration: 0.45, stagger: 0.008 }, 0);
    }
    if (label) tl.to(label, { y: -10, autoAlpha: 0, duration: 0.35 }, 0);
    if (lead) tl.to(lead, { y: 12, autoAlpha: 0, duration: 0.35 }, 0.05);
    if (actions) tl.to(actions, { y: 10, autoAlpha: 0, duration: 0.3 }, 0.05);
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
    gsap.set([badge, tabBar, identity].filter(Boolean), { autoAlpha: 0 });
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

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pin = section.querySelector(".aura-pin");
    const last = rows[rows.length - 1];
    if (!pin || !last) return;

    let natural = 0;
    const measure = () => {
      const prev = pin.style.transform;
      pin.style.transform = "none";
      natural = pin.getBoundingClientRect().top - section.getBoundingClientRect().top;
      pin.style.transform = prev;
    };

    const stick = () => {
      const viewPin = window.innerHeight * 0.16;
      const naturalTop = section.getBoundingClientRect().top + natural;
      const lastTop = last.getBoundingClientRect().top;
      const desired = Math.max(naturalTop, Math.min(viewPin, lastTop));
      pin.style.transform = `translate3d(0, ${desired - naturalTop}px, 0)`;
    };

    measure();
    stick();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      invalidateOnRefresh: true,
      onRefresh: () => {
        measure();
        stick();
      },
      onUpdate: stick
    });

    return () => {
      st.kill();
      pin.style.transform = "";
    };
  });

  mm.add("(min-width: 961px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".p1", { xPercent: -8, ease: "none", scrollTrigger: { trigger: section, scrub: true } });
    gsap.to(".p2", { xPercent: 7, ease: "none", scrollTrigger: { trigger: section, scrub: true } });
    gsap.to(".p3", { xPercent: -4, ease: "none", scrollTrigger: { trigger: section, scrub: true } });

    rows.forEach((row) => {
      const word = row.querySelector(".p-word b");
      const cap = row.querySelector("i");
      const spec = row.querySelector(".p-spec");
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
          y: 12,
          duration: 0.55,
          delay: 0.16,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
        });
      }
      if (spec) {
        gsap.from(spec, {
          autoAlpha: 0,
          y: 8,
          duration: 0.45,
          delay: 0.22,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
        });
      }
      if (orbit) {
        gsap.from(orbit, {
          scale: 0.92,
          autoAlpha: 0,
          duration: 0.45,
          delay: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 86%", toggleActions: "play none none none" }
        });
      }
    });
  });

  rows.forEach((row) => {
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

  const updatePadding = () => {
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth;
    const pad = Math.max(Math.round((window.innerWidth - cardWidth) / 2), 24);
    reel.style.paddingLeft = `${pad}px`;
    reel.style.paddingRight = `${pad}px`;
  };

  updatePadding();

  const distance = () => Math.max(reel.scrollWidth - window.innerWidth, 0);

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
        updatePadding();
        setActive();
        if (fill) fill.style.transform = `scaleX(${self.progress})`;
      }
    }
  });
  scrollTrigger = tween.scrollTrigger;

  ScrollTrigger.addEventListener("refreshInit", updatePadding);

  setActive();

  const scrollToCard = (i) => {
    if (!scrollTrigger) return;
    const progress = cards.length <= 1 ? 0 : i / (cards.length - 1);
    const y = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  ticksEl?.addEventListener("click", (e) => {
    const btn = e.target.closest(".works-tick");
    if (!btn) return;
    scrollToCard(Number(btn.dataset.i));
  });

  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      if (!card.classList.contains("is-active")) {
        scrollToCard(i);
      }
    });
  });

  window.addEventListener("resize", () => {
    updatePadding();
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
    const rest = section.querySelectorAll(".door, .offer-card, .why-card, .process-step, .sector-list li, .metrics li, .telemetry li");
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
  words.forEach((w, i) => {
    const s = document.createElement("span");
    s.className = "q-word";
    s.textContent = w;
    q.appendChild(s);
    if (i < words.length - 1) q.appendChild(document.createTextNode(" "));
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
  if (!document.querySelector(".atelier")) return;
  const mm = gsap.matchMedia();
  mm.add("(max-width: 960px)", () => {
    gsap.set(".photo-blind", { clipPath: "none" });
  });
  mm.add("(min-width: 961px)", () => {
    gsap.to(".photo-blind", {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.4,
      ease: "power3.inOut",
      scrollTrigger: { trigger: ".atelier", start: "top 65%" }
    });
  });
}

function initFooter() {
  const film = document.querySelector(".footer .film");
  if (film) {
    gsap.from(film, {
      y: 28, opacity: 0, duration: 0.9, ease: "power2.out",
      scrollTrigger: { trigger: ".footer", start: "top 78%" }
    });
  }
  gsap.from("#portrait", {
    y: 16,
    ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true }
  });
}

function hexLabel(value) {
  return String(value || "").toUpperCase();
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const lit = l / 100;
  const a = sat * Math.min(lit, 1 - lit);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = lit - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function initColourway() {
  const root = document.getElementById("spectrum");
  const elevation = document.getElementById("cw-elevation");
  const inputA = document.getElementById("cw-a");
  const inputB = document.getElementById("cw-b");
  const hexA = document.getElementById("cw-a-hex");
  const hexB = document.getElementById("cw-b-hex");
  const ratio = document.getElementById("cw-ratio");
  const ratioLabel = document.getElementById("cw-ratio-label");
  const hue = document.getElementById("cw-hue");
  const hueHint = document.getElementById("cw-hue-hint");
  const hold = document.getElementById("cw-hold");
  const inquire = document.getElementById("cw-inquire");
  if (!root || !elevation || !inputA || !inputB || !ratio) return;

  const slats = [...elevation.querySelectorAll(".cw-slat")];
  let target = "a";

  function pairingNote() {
    const mix = Number(ratio.value);
    return `Custom colourway: primary ${hexLabel(inputA.value)} / accent ${hexLabel(inputB.value)}, mix ${mix}/${100 - mix}. Please match across the specified system.`;
  }

  function paint() {
    const a = inputA.value;
    const b = inputB.value;
    const mix = Number(ratio.value);
    const primaryCount = Math.round((mix / 100) * slats.length);
    slats.forEach((slat, i) => {
      slat.style.backgroundColor = i < primaryCount ? a : b;
    });
    if (hexA) hexA.textContent = hexLabel(a);
    if (hexB) hexB.textContent = hexLabel(b);
    if (ratioLabel) ratioLabel.textContent = `${mix} / ${100 - mix}`;
    if (hueHint) hueHint.textContent = target === "a" ? "Applies to primary" : "Applies to accent";
    if (inquire) inquire.setAttribute("data-inquire-note", pairingNote());
  }

  function setTarget(next) {
    target = next;
    root.dataset.cwTarget = next;
    paint();
  }

  function applyHue(event) {
    const box = hue.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const color = hslToHex(Math.round(t * 360), 36, 38);
    const input = target === "b" ? inputB : inputA;
    input.value = color;
    paint();
  }

  inputA.addEventListener("input", () => {
    setTarget("a");
    paint();
  });
  inputB.addEventListener("input", () => {
    setTarget("b");
    paint();
  });
  inputA.addEventListener("focus", () => setTarget("a"));
  inputB.addEventListener("focus", () => setTarget("b"));
  ratio.addEventListener("input", paint);

  hue?.addEventListener("pointerdown", (event) => {
    hue.setPointerCapture(event.pointerId);
    applyHue(event);
  });
  hue?.addEventListener("pointermove", (event) => {
    if (!hue.hasPointerCapture(event.pointerId)) return;
    applyHue(event);
  });

  hold?.addEventListener("click", () => {
    addSpec(`Colourway ${hexLabel(inputA.value)} / ${hexLabel(inputB.value)}`);
  });

  paint();
}

const spec = [];
function addSpec(name) {
  if (!spec.includes(name)) spec.push(name);
  document.querySelectorAll(".spec-count").forEach((el) => {
    el.textContent = spec.length;
  });
  const list = document.getElementById("spec-list");
  list.innerHTML = spec.map((n) => `<li>${n}</li>`).join("");
  const toast = document.getElementById("toast");
  toast.textContent = `${name} held in spec box`;
  toast.classList.add("is-on");
  setTimeout(() => toast.classList.remove("is-on"), 1800);
}

function initSpec() {
  const drawer = document.getElementById("drawer");
  if (!drawer) return;
  const backdrop = document.getElementById("backdrop");
  const open = () => { drawer.classList.add("is-open"); backdrop.classList.add("is-on"); drawer.setAttribute("aria-hidden", "false"); };
  const close = () => { drawer.classList.remove("is-open"); backdrop.classList.remove("is-on"); drawer.setAttribute("aria-hidden", "true"); };
  document.getElementById("open-spec")?.addEventListener("click", open);
  document.getElementById("open-spec-nav")?.addEventListener("click", open);
  document.getElementById("close-spec")?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
}

function initFilm() {
  const film = document.getElementById("film");
  const btn = document.getElementById("expand-film");
  if (!film || !btn) return;

  const setOpen = (on) => {
    film.classList.toggle("is-full", on);
    btn.textContent = on ? "Close" : "Expand";
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Close showreel" : "Expand showreel");
    document.body.classList.toggle("film-lock", on);
    document.body.style.overflow = on ? "hidden" : "";
    if (on) {
      film.style.transform = "none";
      film.style.opacity = "1";
      document.body.appendChild(btn);
      window.__lenis?.stop?.();
      btn.focus();
    } else {
      film.appendChild(btn);
      window.__lenis?.start?.();
    }
  };

  btn.addEventListener("click", () => setOpen(!film.classList.contains("is-full")));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && film.classList.contains("is-full")) setOpen(false);
  });
}

function initFundermaxStatic() {
  initFmaxCarousel();
}

function initFundermax() {
  initFmaxCarousel();
  if (typeof gsap === "undefined") return;

  // Header & Strengths entrance
  gsap.from(".fmax-strength-card", {
    opacity: 0,
    y: 28,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    immediateRender: false,
    scrollTrigger: { trigger: ".fmax-strengths-grid", start: "top 88%", once: true }
  });

  // Product cards entrance
  gsap.from(".fmax-product-card", {
    opacity: 0,
    y: 28,
    duration: 0.75,
    stagger: 0.1,
    ease: "power2.out",
    immediateRender: false,
    scrollTrigger: { trigger: ".fmax-products-grid", start: "top 88%", once: true }
  });

  // Parallax on the giant watermark
  const watermark = document.querySelector(".fmax-watermark");
  if (watermark) {
    gsap.to(watermark, {
      y: 60,
      ease: "none",
      scrollTrigger: {
        trigger: "#fundermax",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  }
}

function initFmaxCarousel() {
  const wrap = document.getElementById("fmax-track-wrap");
  const track = document.getElementById("fmax-track");
  const slides = document.querySelectorAll(".fmax-slide");
  const btnPrev = document.getElementById("fmax-prev");
  const btnNext = document.getElementById("fmax-next");
  const currentEl = document.getElementById("fmax-slide-current");
  const totalEl = document.getElementById("fmax-slide-total");
  const progressFill = document.getElementById("fmax-progress-fill");

  if (!track || !slides.length) return;

  let currentIndex = 0;
  const total = slides.length;
  if (totalEl) totalEl.textContent = String(total).padStart(2, "0");

  function goToSlide(index) {
    if (index >= total) index = 0;
    if (index < 0) index = total - 1;
    currentIndex = index;

    const targetSlide = slides[currentIndex];
    const offset = targetSlide ? targetSlide.offsetLeft : 0;
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;

    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === currentIndex);
    });

    if (currentEl) currentEl.textContent = String(currentIndex + 1).padStart(2, "0");
    if (progressFill) progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
  }

  // Prev / Next buttons
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });
  }
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });
  }

  // Slide click selection
  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (i !== currentIndex) {
        goToSlide(i);
        resetAutoPlay();
      }
    });
  });

  // Touch Swipe & Drag
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  if (wrap) {
    wrap.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      pauseAutoPlay();
    }, { passive: true });

    wrap.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) goToSlide(currentIndex + 1);
        else goToSlide(currentIndex - 1);
      }
      resumeAutoPlay();
    }, { passive: true });

    // Mouse drag support
    wrap.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      isDragging = true;
      wrap.classList.add("is-dragging");
      pauseAutoPlay();
    });

    window.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (wrap) wrap.classList.remove("is-dragging");
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) goToSlide(currentIndex + 1);
        else goToSlide(currentIndex - 1);
      }
      resumeAutoPlay();
    });

    wrap.addEventListener("mouseenter", pauseAutoPlay);
    wrap.addEventListener("mouseleave", resumeAutoPlay);
  }

  // Auto-play timer
  let autoPlayTimer = null;
  function startAutoPlay() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 6000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function pauseAutoPlay() { stopAutoPlay(); }
  function resumeAutoPlay() { startAutoPlay(); }
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  startAutoPlay();

  // Resize listener to ensure correct alignment
  window.addEventListener("resize", () => {
    goToSlide(currentIndex);
  });

  // Initial layout
  goToSlide(0);
}

function bindFundermaxSpec() {
  const btn = document.getElementById("fmax-spec-add");
  if (!btn) return;
  const samples = ["0027 Prado Agate Grey", "0922 Amazon Wood", "Stellar Pro Matte"];
  btn.addEventListener("click", () => {
    samples.forEach((n) => addSpec(n));
    flySpecParticle(btn);
  });
}

function flySpecParticle(fromEl) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("open-spec-nav") || document.getElementById("open-spec");
  if (!target) return;
  const a = fromEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "fmax-spec-fly";
  dot.style.left = `${a.left + a.width / 2}px`;
  dot.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  if (typeof gsap !== "undefined") {
    gsap.to(dot, {
      x: dx,
      y: dy,
      scale: 0.6,
      duration: 0.55,
      ease: "power2.out",
      onComplete: () => dot.remove()
    });
  } else {
    dot.remove();
  }
}
