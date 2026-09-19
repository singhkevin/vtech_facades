document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-nav");

  if (header) {
    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && menu) {
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

  const filters = document.querySelector(".project-filters");
  const tiles = [...document.querySelectorAll(".work-tile[data-tags]")];
  if (filters && tiles.length) {
    filters.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-filter]");
      if (!btn) return;
      const filter = btn.getAttribute("data-filter");
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-on", item === btn));
      tiles.forEach((tile) => {
        const tags = (tile.getAttribute("data-tags") || "").split(/\s+/);
        const show = filter === "all" || tags.includes(filter);
        tile.classList.toggle("is-hidden", !show);
        tile.hidden = !show;
      });
    });
  }
});
