// /js/navigation.js
// Automatische Pfadkorrektur für GitHub Pages

import { supabase } from "./supabase.js";

// Prüfen, ob wir im Root oder im Modul sind
const depth = window.location.pathname.split("/").length - 2;

// root    → 1
// module  → 2

const prefix = depth === 1 ? "" : "../";

const nav = document.getElementById("nav");

if (nav) {
  nav.innerHTML = `
    <div class="nav-header">⚓ Logbuch</div>

    <nav>
      <a href="${prefix}dashboard/dashboard.html">🏠 Dashboard</a>
      <a href="${prefix}csv/csv.html">📄 CSV</a>
      <a href="${prefix}fleet/fleet.html">🚢 Flotte</a>
      <a href="${prefix}reports/reports.html">📜 Berichte</a>
      <a href="${prefix}chrono/chrono.html">⏱️ Auswertung</a>
      <a href="${prefix}diplomacy/diplomacy.html">🕊️ Diplomatie</a>
      <a href="${prefix}map/map.html">🗺️ Karte</a>
      <a href="${prefix}reservation/reservation.html">🎯 Reservierungen</a>
      <a href="${prefix}calculation/calculation.html">📐 Berechnung</a>
      <a href="${prefix}member/member.html">👥 Member</a>
      <hr>
      <a data-logout>⛩️ Logout</a>
    </nav>
  `;
}

/* Logout (funktioniert immer) */
document.addEventListener("click", async (e) => {
  if (!e.target.matches("[data-logout]")) return;

  try { await supabase.auth.signOut(); } catch {}

  sessionStorage.clear();

  window.location.href = `${prefix}index.html`;
});