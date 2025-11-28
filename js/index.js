/* /js/index.js – Minimaler Startscreen Handler */
/* Keine Authentifizierung, keine Registrierung */

const btnLogin = document.getElementById("login-btn");

if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    // Da index.html im ROOT liegt → direkter relativer Pfad!
    window.location.href = "dashboard/dashboard.html";
  });
}