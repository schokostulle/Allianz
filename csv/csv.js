// /csv/csv.js
// CSV-Modul – Supabase Speicherung + Tabellen-Rendering
// Final Version mit vollständiger Row-Range + Performance-Optimierung

import { supabase } from "js/supabase.js";
import { status } from "js/status.js";

/* DOM Elemente */
const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");

/* ============================================================
   INITIAL LADEN
============================================================ */
loadFromSupabase();

/* ============================================================
   CSV AUS SUPABASE LADEN (MIT RANGE FIX)
============================================================ */
async function loadFromSupabase() {
  tableBody.innerHTML = "";

  // Anzahl der Zeilen bestimmen (HEAD-Request)
  const countReq = await supabase
    .from("csv_storage")
    .select("*", { count: "exact", head: true });

  if (countReq.error) {
    status.show("Fehler beim Zählen", "error");
    return;
  }

  const total = countReq.count ?? 0;

  if (total === 0) {
    status.show("Keine CSV-Daten vorhanden", "info");
    return;
  }

  // ALLE ROWS LADEN
  const { data, error } = await supabase
    .from("csv_storage")
    .select("*")
    .order("id", { ascending: true })
    .range(0, total);

  if (error) {
    status.show("Fehler beim Laden", "error");
    return;
  }

  data.forEach(row => renderRow(row));
  status.show(`${data.length} Zeilen geladen`, "ok");
}

/* ============================================================
   CSV UPLOAD
============================================================ */
uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    status.show("Keine Datei ausgewählt", "warn");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    const text = e.target.result;
    const parsed = parseCSV(text);

    if (!parsed || parsed.length === 0) {
      status.show("CSV ist leer oder ungültig", "error");
      return;
    }

    /* --- ALTE CSV LÖSCHEN --- */
    await supabase.from("csv_storage").delete().neq("id", 0);

    /* --- NEUE DATEN EINFÜGEN --- */
    const payload = parsed.map(row => ({
      oz: row[0],
      ig: row[1],
      inn: row[2],
      inselname: row[3],
      sid: row[4],
      spielername: row[5],
      aid: row[6],
      allianz_kuerzel: row[7],
      allianz_name: row[8],
      punkte: row[9]
    }));

    const { error } = await supabase.from("csv_storage").insert(payload);

    if (error) {
      status.show("Upload fehlgeschlagen", "error");
      return;
    }

    status.show("CSV erfolgreich gespeichert", "ok");
    loadFromSupabase();
  };

  reader.readAsText(file, "UTF-8");
});

/* ============================================================
   CSV LÖSCHEN
============================================================ */
clearBtn.addEventListener("click", async () => {
  await supabase.from("csv_storage").delete().neq("id", 0);
  tableBody.innerHTML = "";
  status.show("CSV gelöscht", "ok");
});

/* ============================================================
   CSV PARSER – entfernt Quotes & trimmt
============================================================ */
function parseCSV(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line =>
      line.split(";").map(cell =>
        cell.replace(/"/g, "").trim()
      )
    );
}

/* ============================================================
   RENDER EINER ZEILE
============================================================ */
function renderRow(row) {
  const tr = document.createElement("tr");

  const cells = [
    row.oz,
    row.ig,
    row.inn,
    row.inselname,
    row.sid,
    row.spielername,
    row.aid,
    row.allianz_kuerzel,
    row.allianz_name,
    row.punkte
  ];

  cells.forEach((val, idx) => {
    const td = document.createElement("td");

    // numerische Spalten
    if ([0, 1, 2, 4, 6, 9].includes(idx)) {
      td.classList.add("num");
    } else {
      td.classList.add("txt");
    }

    td.textContent = val ?? "";
    tr.appendChild(td);
  });

  tableBody.appendChild(tr);
}