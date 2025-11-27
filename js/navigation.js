import { supabase } from "js/supabase.js";

const nav = document.getElementById("nav");

if (nav) {
  nav.innerHTML = `
    <div class="nav-header">⚓ Logbuch</div>

    <nav>
      <a href="/dashboard/dashboard.html">🏠 Dashboard</a>
      <a href="/csv/csv.html">📄 CSV</a>
      <a href="/fleet/fleet.html">🚢 Flotte</a>
      <a href="/reports/reports.html">📜 Berichte</a>
      <a href="/crono/crono.html">⏱️ Auswertung</a>
      <a href="/diplomacy/diplomacy.html">🕊️ Diplomatie</a>
      <a href="/map/map.html">🗺️ Karte</a>
      <a href="/reservation/reservation.html">🎯 Reservierungen</a>
      <a href="/calculation/calculation.html">📐 Berechnung</a>
      <a href="/member/member.html">👥 Member</a>
      <hr>
      <a data-logout>⛩️ Logout</a>
    </nav>
  `;
}

/* Logout handler */
document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-logout]")) return;

  await supabase.auth.signOut();
  sessionStorage.clear();
  window.location.href = "/index.html";
});