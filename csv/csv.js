// /csv/csv.js
// CSV-Modul – Supabase Speicherung + Tabellen-Rendering

import { supabase } from "./js/supabase.js";
import { status } from "./js/status.js";

/* DOM Elemente */
const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");

/* ============================================
   INITIAL LADEN
============================================ */
loadFromSupabase();

/* ============================================
   CSV AUS SUPABASE LADEN
============================================ */
async function loadFromSupabase() {
  tableBody.innerHTML = "";

  const { data, error } = await supabase
    .from("csv_storage")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    status.show("Fehler beim Laden", "error");
    return;
  }

  if (!data || data.length === 0) {
    status.show("Keine CSV-Daten vorhanden", "info");
    return;
  }

  data.forEach(row => renderRow(row));
}

/* ============================================
   CSV UPLOAD
============================================ */
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

    /* --- Alte Tabelle vollständig löschen --- */
    await supabase.from("csv_storage").delete().neq("id", 0);

    /* --- Neue Zeilen einfügen --- */
    const insertPayload = parsed.map(row => ({
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

    const { error } = await supabase.from("csv_storage").insert(insertPayload);

    if (error) {
      status.show("Upload fehlgeschlagen", "error");
      return;
    }

    status.show("CSV erfolgreich gespeichert", "ok");
    loadFromSupabase();
  };

  reader.readAsText(file, "UTF-8");
});

/* ============================================
   CSV LÖSCHEN
============================================ */
clearBtn.addEventListener("click", async () => {
  await supabase.from("csv_storage").delete().neq("id", 0);
  tableBody.innerHTML = "";
  status.show("CSV gelöscht", "ok");
});

/* ============================================
   CSV PARSER
   → entfernt Quotes
   → trimmt Leerzeichen
============================================ */
function parseCSV(text) {
  const rows = text
    .split("\n")
    .map(r => r.trim())
    .filter(r => r.length > 0)
    .map(line =>
      line.split(";").map(cell =>
        cell.replace(/"/g, "").trim()
      )
    );

  return rows;
}

/* ============================================
   RENDER
============================================ */
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

  cells.forEach((value, index) => {
    const td = document.createElement("td");

    // numerische Spalten
    if ([0, 1, 2, 4, 6, 9].includes(index)) {
      td.classList.add("num");
    } else {
      td.classList.add("txt");
    }

    td.textContent = value ?? "";
    tr.appendChild(td);
  });

  tableBody.appendChild(tr);
}