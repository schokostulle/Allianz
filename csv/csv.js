// /csv/csv.js
// CSV-Modul – Supabase-Speicher (Feld file) + dauerhafte Tabellen-Ansicht

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

/* DOM-Elemente */
const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn  = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");
const countBox  = document.getElementById("csv-count");

// ============================================================
// INITIAL LADEN – immer letzte gespeicherte CSV anzeigen
// ============================================================
loadCSV();

async function loadCSV() {
  try {
    const { data, error } = await supabase
      .from("csv_storage")
      .select("id, file")
      .order("id", { ascending: false });

    if (error || !data || !data.file) {
      tableBody.innerHTML = "";
      updateRowCount(0);
      return;
    }

    const rows = parseCSV(data.file);
    renderTable(rows);
    updateRowCount(rows.length);
  } catch {
    tableBody.innerHTML = "";
    updateRowCount(0);
    status.show("Fehler beim Laden der CSV.", "error");
  }
}

// ============================================================
// CSV HOCHLADEN – ersetzt vorherige Datei logisch (neuer Datensatz)
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
      .insert({ file: text });

    const rows = parseCSV(text);
    renderTable(rows);
    updateRowCount(rows.length);

    status.show("CSV gespeichert.", "ok");
  } catch {
    status.show("Fehler beim Speichern der CSV.", "error");
  }
});

// ============================================================
// CSV LÖSCHEN – Ansicht leeren, Daten in DB optional mitlöschen
// ============================================================
clearBtn?.addEventListener("click", async () => {
  try {
    await supabase.from("csv_storage").delete().neq("id", 0);
    tableBody.innerHTML = "";
    updateRowCount(0);
    status.show("CSV gelöscht.", "ok");
  } catch {
    status.show("Fehler beim Löschen der CSV.", "error");
  }
});

// ============================================================
// CSV PARSER
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
// TABELLE RENDERN
// ============================================================
function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

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

// ============================================================
// ZEILENANZAHL
// ============================================================
function updateRowCount(count) {
  if (countBox) {
    countBox.textContent = `Zeilen: ${count}`;
  }
}