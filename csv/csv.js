import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

const fileInput = document.getElementById("csv-file");
const uploadBtn = document.getElementById("csv-upload");
const clearBtn  = document.getElementById("csv-clear");
const tableBody = document.querySelector("#csv-table tbody");
const countBox  = document.getElementById("csv-count");

loadCSV();

async function loadCSV() {
  const { data, error } = await supabase
    .from("csv_storage")
    .select("file")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data?.file) {
    tableBody.innerHTML = "";
    updateCount(0);
    return;
  }

  const rows = parseCSV(data.file);
  renderTable(rows);
  updateCount(rows.length);
}

uploadBtn?.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    status.show("Keine CSV ausgewählt", "warn");
    return;
  }

  const text = await fileInput.files[0].text();

  await supabase.from("csv_storage").upsert({ id: 1, file: text });

  const rows = parseCSV(text);
  renderTable(rows);
  updateCount(rows.length);
  status.show("CSV gespeichert", "ok");
});

clearBtn?.addEventListener("click", async () => {
  await supabase.from("csv_storage").delete().eq("id", 1);
  tableBody.innerHTML = "";
  updateCount(0);
  status.show("CSV gelöscht", "ok");
});

function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length)
    .map(line => line.split(";").map(c => c.replace(/"/g, "").trim()));
}

function renderTable(rows) {
  tableBody.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");

    row.forEach((val, idx) => {
      const td = document.createElement("td");
      td.classList.add([0,1,2,4,6,9].includes(idx) ? "num" : "txt");
      td.textContent = val ?? "";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

function updateCount(n) {
  if (countBox) countBox.textContent = `Zeilen: ${n}`;
}