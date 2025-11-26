export function buildKopf(title) {
  const container = document.getElementById("kopf");
  if (!container) return;

  const username = sessionStorage.getItem("username") || "Gast";
  const role = sessionStorage.getItem("userRole") || "";

  container.innerHTML = `
    <div class="kopf-line1">
      <span class="kopf-user">${username} ${role}</span>
    </div>
    <div class="kopf-line2">
      <span class="kopf-title">${title}</span>
    </div>
  `;
}