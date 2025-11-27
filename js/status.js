// /js/status.js

export const status = (() => {
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

    // Reset class
    bar.className = "";
    bar.classList.add("show", `status-${type}`);

    clearTimeout(timeout);
    timeout = setTimeout(clear, duration);
  }

  function clear() {
    if (!bar) return;

    bar.classList.remove("show");

    setTimeout(() => {
      bar.className = "hidden";
      bar.textContent = "";
    }, 250);
  }

  return { show, clear };
})();