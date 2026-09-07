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
    menu.querySelectorAll("a, [data-install-app]").forEach((el) => el.addEventListener("click", () => setOpen(false)));
  }
});
