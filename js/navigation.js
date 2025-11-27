// /js/navigation.js
// Navigation + Logout (Supabase optional)

import { supabase } from "./supabase.js";  // korrekt relativ aus /js/

const nav = document.getElementById("nav");

if (nav) {
  nav.innerHTML = `
    <div class="nav-header">⚓ Logbuch</div>

    <nav>
      <a href="../dashboard/dashboard.html">🏠 Dashboard</a>
      <a href="../csv/csv.html">📄 CSV</a>
      <a href="../fleet/fleet.html">🚢 Flotte</a>
      <a href="../reports/reports.html">📜 Berichte</a>
      <a href="../chrono/chrono.html">⏱️ Auswertung</a>
      <a href="../diplomacy/diplomacy.html">🕊️ Diplomatie</a>
      <a href="../map/map.html">🗺️ Karte</a>
      <a href="../reservation/reservation.html">🎯 Reservierungen</a>
      <a href="../calculation/calculation.html">📐 Berechnung</a>
      <a href="../member/member.html">👥 Member</a>
      <hr>
      <a data-logout>⛩️ Logout</a>
    </nav>
  `;
}

/* ---------------------------------------------
   LOGOUT (supabase optional, sicher für GitHub Pages)
--------------------------------------------- */
document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-logout]")) return;

  try {
    await supabase.auth.signOut();
  } catch {
    // Supabase optional → ignorieren
  }

  sessionStorage.clear();

  // keine absoluten Pfade → sicher für GitHub Pages
  window.location.href = "../index.html";
});