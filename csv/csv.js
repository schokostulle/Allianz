// /csv/csv.js
// CSV → strukturierte Zeilen in Supabase (csv_storage) mit Batch-Load/-Insert

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn  = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");
const countBox  = document.getElementById("csv-count");

const PAGE_SIZE = 1000;
const INSERT_BATCH = 500;

/* =====================================
   INITIAL: ALLE ZEILEN LADEN
===================================== */
loadCSV();

async function loadCSV() {
  const allRows = await fetchAllRows();
  tableBody.innerHTML = "";

  if (!allRows || allRows.length === 0) {
    updateCount(0);
    return;
  }

  renderTable(allRows);
  updateCount(allRows.length);
}

/* =====================================
   ALLE ZEILEN AUS SUPABASE HOLEN (PAGINIERT)
===================================== */
async function fetchAllRows() {
  let all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("csv_storage")
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      status.show("Fehler beim Laden der CSV.", "error");
      return [];
    }

    if (!data || data.length === 0) {
      break;
    }

    all = all.concat(data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return all;
}

/* =====================================
   CSV HOCHLADEN → ALTE DATEN ERSETZEN
===================================== */
uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    status.show("Keine CSV ausgewählt.", "warn");
    return;
  }

  const file = fileInput.files[0];
  const text = await file.text();
  const parsed = parseCSV(text);

  if (!parsed.length) {
    status.show("CSV ist leer.", "warn");
    return;
  }

  // Alte Daten löschen
  const { error: delError } = await supabase
    .from("csv_storage")
    .delete()
    .neq("id", 0);

  if (delError) {
    status.show("Fehler beim Löschen alter Daten.", "error");
    return;
  }

  // Neue Daten in Batches einfügen
  const rows = parsed.map(r => ({
    oz: r[0] ? Number(r[0]) : null,
    ig: r[1] ? Number(r[1]) : null,
    inn: r[2] ? Number(r[2]) : null,
    inselname: r[3] || null,
    sid: r[4] ? Number(r[4]) : null,
    spielername: r[5] || null,
    aid: r[6] ? Number(r[6]) : null,
    allianz_kuerzel: r[7] || null,
    allianz_name: r[8] || null,
    punkte: r[9] ? Number(r[9]) : null
  }));

  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const chunk = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("csv_storage")
      .insert(chunk);

    if (error) {
      status.show("Fehler beim Speichern der CSV.", "error");
      return;
    }
  }

  renderTable(rows);
  updateCount(rows.length);
  status.show("CSV gespeichert.", "ok");
});

/* =====================================
   CSV LÖSCHEN
===================================== */
clearBtn?.addEventListener("click", async () => {
  const { error } = await supabase
    .from("csv_storage")
    .delete()
    .neq("id", 0);

  if (error) {
    status.show("Fehler beim Löschen.", "error");
    return;
  }

  tableBody.innerHTML = "";
  updateCount(0);
  status.show("CSV gelöscht.", "ok");
});

/* =====================================
   CSV PARSER
===================================== */
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

/* =====================================
   TABELLEN-RENDERING
===================================== */
function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
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
      if ([0, 1, 2, 4, 6, 9].includes(idx)) {
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

/* =====================================
   COUNTER
===================================== */
function updateCount(n) {
  if (countBox) {
    countBox.textContent = `Zeilen: ${n}`;
  }
}