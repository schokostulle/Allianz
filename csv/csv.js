// /csv/csv.js
// CSV beim Aufrufen der Seite IMMER aus Supabase laden

import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

const tableBody = document.querySelector("#csv-table tbody");

/* =====================================
   BEIM SEITENAUFRUF LADEN
===================================== */
loadCSV();

async function loadCSV() {
  const { data, error } = await supabase
    .from("csv_storage")
    .select("file")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data || !data.file) {
    tableBody.innerHTML = "";
    return;
  }

  const rows = parseCSV(data.file);
  renderTable(rows);
}

/* =====================================
   PARSER
===================================== */
function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length)
    .map(line => line.split(";").map(c => c.replace(/"/g, "").trim()));
}

/* =====================================
   TABELLEN-RENDER
===================================== */
function renderTable(rows) {
  tableBody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");
    r.forEach((val, i) => {
      const td = document.createElement("td");
      td.classList.add([0,1,2,4,6,9].includes(i) ? "num" : "txt");
      td.textContent = val;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}