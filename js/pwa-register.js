(() => {
  if (!("serviceWorker" in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register);
})();
