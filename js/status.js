const status = (() => {
  let bar = null;
  let timeout = null;

  function init() {
    bar = document.getElementById("status-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "status-bar";
      bar.className = "hidden";
      document.body.appendChild(bar);
    }
  }

  function show(msg, type = "info", duration = 2000) {
    if (!bar) init();

    bar.textContent = msg;

    bar.style.background =
      type === "ok" ? "var(--color-ok)" :
      type === "warn" ? "var(--color-warn)" :
      type === "error" ? "var(--color-error)" :
      "var(--color-info)";

    bar.classList.remove("hidden");
    bar.classList.add("show");

    clearTimeout(timeout);
    timeout = setTimeout(() => clear(), duration);
  }

  function clear() {
    if (!bar) return;

    bar.classList.remove("show");

    setTimeout(() => {
      bar.classList.add("hidden");
      bar.textContent = "";
    }, 300);
  }

  return { show, clear };
})();