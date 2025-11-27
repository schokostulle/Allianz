// /csv/csv.js
// CSV-Modul – Supabase-Speicher (ein Feld file) + Tabellen-Rendering

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

/* DOM-Elemente */
const fileInput   = document.getElementById("csv-file");
const uploadBtn   = document.getElementById("csv-upload");
const clearBtn    = document.getElementById("csv-clear");
const tableBody   = document.querySelector("#csv-table tbody");
const nameSpan    = document.getElementById("csv-name"); // optional, falls vorhanden

// ============================================================
// INITIAL LADEN
// ============================================================
loadCSV();


// ============================================================
// CSV LADEN (ein Datensatz, Feld: file)
// ============================================================
async function loadCSV() {
  try {
    const { data, error } = await supabase
      .from("csv_storage")
      .select("file")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      status.show("Fehler beim Laden der CSV.", "error");
      tableBody.innerHTML = "";
      if (nameSpan) nameSpan.textContent = "Fehler";
      return;
    }

    if (!data || !data.file) {
      tableBody.innerHTML = "";
      if (nameSpan) nameSpan.textContent = "Keine Datei";
      return;
    }

    const rows = parseCSV(data.file);
    renderTable(rows);
    if (nameSpan) nameSpan.textContent = "CSV aus Speicher";
  } catch {
    status.show("Fehler beim Laden der CSV.", "error");
    tableBody.innerHTML = "";
    if (nameSpan) nameSpan.textContent = "Fehler";
  }
}


// ============================================================
// CSV HOCHLADEN (ersetzt bisherigen Inhalt komplett)
// ============================================================
uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    status.show("Keine CSV ausgewählt.", "warn");
    return;
  }

  try {
    const file = fileInput.files[0];
    const text = await file.text();

    await supabase
      .from("csv_storage")
      .upsert({ id: 1, file: text }); // ein Datensatz, id = 1

    const rows = parseCSV(text);
    renderTable(rows);

    if (nameSpan) nameSpan.textContent = file.name;
    status.show("CSV gespeichert.", "ok");
  } catch {
    status.show("Fehler beim Speichern der CSV.", "error");
  }
});


// ============================================================
// CSV LÖSCHEN
// ============================================================
clearBtn?.addEventListener("click", async () => {
  try {
    await supabase
      .from("csv_storage")
      .delete()
      .eq("id", 1);

    tableBody.innerHTML = "";
    if (nameSpan) nameSpan.textContent = "Keine Datei";
    status.show("CSV gelöscht.", "ok");
  } catch {
    status.show("Fehler beim Löschen der CSV.", "error");
  }
});


// ============================================================
// CSV PARSER – Semikolon-getrennt, keine Kopfzeile
// ============================================================
function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line =>
      line.split(";").map(cell =>
        cell.replace(/"/g, "").trim()
      )
    );
}


// ============================================================
// TABELLE RENDERN – nutzt globale Tabellenklassen (style.css)
// ============================================================
function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

    // Erwartete Struktur:
    // [0] Oz (num)
    // [1] Ig (num)
    // [2] In (num)
    // [3] Inselname (txt)
    // [4] SID (num)
    // [5] Spielername (txt)
    // [6] AID (num)
    // [7] Allianzk. (txt)
    // [8] Allianzname (txt)
    // [9] Punkte (num)

    row.forEach((val, index) => {
      const td = document.createElement("td");

      if ([0, 1, 2, 4, 6, 9].includes(index)) {
        td.classList.add("num");
      } else {
        td.classList.add("txt");
      }

      td.textContent = val ?? "";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}