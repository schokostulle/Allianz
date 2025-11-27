// /csv/csv.js
// CSV-Modul – Supabase Speicherung + Tabellen-Rendering

import { supabase } from "../js/supabase.js";

/* optionale Status-Hilfe – funktioniert auch ohne status.js */
function showStatus(msg, type = "info") {
  if (window.status && typeof status.show === "function") {
    status.show(msg, type);
  } else {
    console.log(`[${type}] ${msg}`);
  }
}

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
  const { data, error } = await supabase
    .from("csv_storage")
    .select("*")
    .order("id", { ascending: true });
    .range(0, total);

  tableBody.innerHTML = "";

  if (error) {
    showStatus("Fehler beim Laden", "error");
    return;
  }

  if (!data || data.length === 0) {
    showStatus("Keine CSV-Daten vorhanden", "info");
    return;
  }

  data.forEach(row => renderRow(row));
}

/* ============================================
   CSV UPLOAD
============================================ */
if (uploadBtn) {
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
      showStatus("Keine Datei ausgewählt", "warn");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const parsedRows = parseCSV(text);

      if (!parsedRows || parsedRows.length === 0) {
        showStatus("CSV leer oder ungültig", "error");
        return;
      }

      const del = await supabase.from("csv_storage").delete().neq("id", 0);
      if (del.error) {
        showStatus("Fehler beim Löschen", "error");
        return;
      }

      const insertPayload = parsedRows.map(row => ({
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

      const { error } = await supabase
        .from("csv_storage")
        .insert(insertPayload);

      if (error) {
        showStatus("Upload fehlgeschlagen", "error");
        return;
      }

      showStatus("CSV gespeichert", "ok");
      loadFromSupabase();
    };

    reader.readAsText(file, "UTF-8");
  });
}

/* ============================================
   CSV LÖSCHEN
============================================ */
if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    const { error } = await supabase
      .from("csv_storage")
      .delete()
      .neq("id", 0);

    if (error) {
      showStatus("Fehler beim Löschen", "error");
      return;
    }

    tableBody.innerHTML = "";
    showStatus("CSV gelöscht", "ok");
  });
}

/* ============================================
   CSV PARSER
============================================ */
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

/* ============================================
   TABELLE RENDERN
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

  cells.forEach((val, index) => {
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
}