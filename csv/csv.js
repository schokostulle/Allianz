// /csv/csv.js
// EXISTIERENDE SUPABASE-DATEN LADEN (ALLE ZEILEN), CSV ERSETZT SPÄTER ALLES

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn  = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");
const countBox  = document.getElementById("csv-count");

/* ============================================================
   INITIAL LADEN – ALLE VORHANDENEN ZEILEN ZEIGEN
============================================================ */
loadCSV();

async function loadCSV() {
  const { data, error } = await supabase
    .from("csv_storage")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    status.show("Fehler beim Laden", "error");
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = "";
    updateCount(0);
    return;
  }

  renderTable(data);
  updateCount(data.length);
}

/* ============================================================
   CSV HOCHLADEN – ALTE SUPABASE DATEN LÖSCHEN → NEU SCHREIBEN
============================================================ */
uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    status.show("Keine CSV ausgewählt", "warn");
    return;
  }

  const file = fileInput.files[0];
  const text = await file.text();
  const parsed = parseCSV(text);

  // alte Zeilen entfernen
  await supabase.from("csv_storage").delete().neq("id", 0);

  // neue Zeilen einfügen
  const insertRows = parsed.map(r => ({
    oz: r[0],
    ig: r[1],
    inn: r[2],
    inselname: r[3],
    sid: r[4],
    spielername: r[5],
    aid: r[6],
    allianz_kuerzel: r[7],
    allianz_name: r[8],
    punkte: r[9]
  }));

  const { error } = await supabase
    .from("csv_storage")
    .insert(insertRows);

  if (error) {
    status.show("Upload Fehler", "error");
    return;
  }

  renderTable(insertRows);
  updateCount(insertRows.length);

  status.show("CSV gespeichert", "ok");
});

/* ============================================================
   CSV LÖSCHEN
============================================================ */
clearBtn?.addEventListener("click", async () => {
  await supabase.from("csv_storage").delete().neq("id", 0);
  tableBody.innerHTML = "";
  updateCount(0);
  status.show("CSV gelöscht", "ok");
});

/* ============================================================
   PARSER
============================================================ */
function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length)
    .map(line => line.split(";").map(c => c.replace(/"/g, "").trim()));
}

/* ============================================================
   RENDER
============================================================ */
function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

    const cells = [
      row.oz, row.ig, row.inn, row.inselname,
      row.sid, row.spielername, row.aid,
      row.allianz_kuerzel, row.allianz_name, row.punkte
    ];

    cells.forEach((val, idx) => {
      const td = document.createElement("td");
      td.textContent = val ?? "";
      td.classList.add([0,1,2,4,6,9].includes(idx) ? "num" : "txt");
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/* ============================================================
   COUNTER
============================================================ */
function updateCount(n) {
  if (countBox) countBox.textContent = `Zeilen: ${n}`;
}