// /csv/csv.js
// CSV dauerhaft in Supabase speichern + im Frontend anzeigen

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

/* DOM */
const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn  = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");
const countBox  = document.getElementById("csv-count");

/* ============================================================
   INITIAL LADEN – CSV aus Supabase anzeigen
============================================================ */
loadCSV();

async function loadCSV() {
  const { data, error } = await supabase
    .from("csv_storage")
    .select("file")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data || !data.file) {
    tableBody.innerHTML = "";
    updateCount(0);
    return;
  }

  const rows = parseCSV(data.file);
  renderTable(rows);
  updateCount(rows.length);
}

/* ============================================================
   CSV HOCHLADEN – ersetzt gesamten Inhalt (id = 1)
============================================================ */
uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files?.length) {
    status.show("Keine CSV ausgewählt", "warn");
    return;
  }

  const file = fileInput.files[0];
  const text = await file.text();
  const rows = parseCSV(text);

  const { error } = await supabase
    .from("csv_storage")
    .upsert({ id: 1, file: text });

  if (error) {
    status.show("Upload fehlgeschlagen", "error");
    return;
  }

  renderTable(rows);
  updateCount(rows.length);
  status.show("CSV gespeichert", "ok");
});

/* ============================================================
   CSV LÖSCHEN – Tabelle + DB-Eintrag entfernen
============================================================ */
clearBtn?.addEventListener("click", async () => {
  await supabase.from("csv_storage").delete().eq("id", 1);

  tableBody.innerHTML = "";
  updateCount(0);

  status.show("CSV gelöscht", "ok");
});

/* ============================================================
   PARSER – Semikolon, keine Kopfzeile
============================================================ */
function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length)
    .map(line => line.split(";").map(c => c.replace(/"/g, "").trim()));
}

/* ============================================================
   TABELLE
============================================================ */
function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

    row.forEach((val, idx) => {
      const td = document.createElement("td");

      if ([0,1,2,4,6,9].includes(idx)) td.classList.add("num");
      else td.classList.add("txt");

      td.textContent = val;
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/* ============================================================
   COUNTER
============================================================ */
function updateCount(count) {
  if (countBox) countBox.textContent = `Zeilen: ${count}`;
}