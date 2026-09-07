(() => {
  let deferredPrompt = window.__vtechInstall || null;
  let lastFocus = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    window.__vtechInstall = event;
    revealInstall();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.__vtechInstall = null;
    hideInstall();
  });

  if ("serviceWorker" in navigator) {
    const register = () => {
      navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
  }

  const ready = () => {
    ensureSheet();
    bindInstall();
    if (isStandalone()) hideInstall();
    else revealInstall();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    const ua = navigator.userAgent || "";
    return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function revealInstall() {
    if (isStandalone()) return;
    document.body.classList.add("can-install");
    document.querySelectorAll("[data-install-app]").forEach((el) => {
      el.hidden = false;
    });
  }

  function hideInstall() {
    document.body.classList.remove("can-install");
    document.querySelectorAll("[data-install-app]").forEach((el) => {
      el.hidden = true;
    });
    closeSheet();
  }

  function bindInstall() {
    document.querySelectorAll("[data-install-app]").forEach((el) => {
      if (el.dataset.bound === "1") return;
      el.dataset.bound = "1";
      el.addEventListener("click", (event) => {
        event.preventDefault();
        install();
      });
    });
  }

  async function install() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => ({ outcome: "dismissed" }));
      deferredPrompt = null;
      window.__vtechInstall = null;
      if (choice.outcome === "accepted") hideInstall();
      return;
    }
    openSheet();
  }

  function ensureSheet() {
    if (document.getElementById("install-root")) return;
    const root = document.createElement("div");
    root.className = "inquire-root";
    root.id = "install-root";
    root.hidden = true;
    root.innerHTML = `
      <div class="inquire-backdrop" data-install-dismiss></div>
      <div class="inquire-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <button type="button" class="inquire-close" data-install-dismiss>Close</button>
        <p class="eyebrow">Home screen</p>
        <h2 id="install-title">Install VTech Facades</h2>
        <p class="inquire-lede">Add the studio as an app. It opens full-screen and keeps the last pages you visited available offline.</p>
        <ol class="install-steps"></ol>
      </div>
    `;
    document.body.appendChild(root);
    root.addEventListener("click", (event) => {
      if (event.target.closest("[data-install-dismiss]")) closeSheet();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("is-open")) closeSheet();
    });
  }

  function openSheet() {
    const root = document.getElementById("install-root");
    if (!root) return;
    const steps = root.querySelector(".install-steps");
    if (steps) {
      steps.innerHTML = isIos()
        ? "<li>Tap the <b>Share</b> button in Safari.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b> to confirm.</li>"
        : "<li>Open the browser menu, or the install icon in the address bar.</li><li>Choose <b>Install VTech Facades</b> or <b>Install app</b>.</li><li>Confirm to add it to your dock or home screen.</li>";
    }
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("inquire-lock");
    if (window.__lenis && typeof window.__lenis.stop === "function") window.__lenis.stop();
    void root.offsetWidth;
    root.classList.add("is-open");
    root.querySelector("[data-install-dismiss]")?.focus();
  }

  function closeSheet() {
    const root = document.getElementById("install-root");
    if (!root || !root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    document.body.classList.remove("inquire-lock");
    if (window.__lenis && typeof window.__lenis.start === "function") window.__lenis.start();
    const finish = () => {
      if (root.classList.contains("is-open")) return;
      root.hidden = true;
    };
    root.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 280);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
})();
