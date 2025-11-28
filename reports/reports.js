// /reports/reports.js – geprüft & aktualisiert

import { status } from "../js/status.js";

const input = document.getElementById("report-input");
const processBtn = document.getElementById("report-process");
const tableBody = document.querySelector("#report-table tbody");

const reportEntries = [];

/* =========================================================
   Grundstruktur Tabellenzeile
========================================================= */
function createEmptyEntry() {
  return {
    date1: "",
    oz: 0,
    ig: 0,
    inn: 0,
    date2: "",

    fregatte: 0, fregatte_v: 0,
    handelskogge: 0, handelskogge_v: 0,
    kolonialschiff: 0, kolonialschiff_v: 0,
    steinschleuderer: 0, steinschleuderer_v: 0,
    lanzenträger: 0, lanzenträger_v: 0,
    langbogenschütze: 0, langbogenschütze_v: 0,
    kanonen: 0, kanonen_v: 0,

    hauptgebäude: 0,
    goldbergwerk: 0,
    steinbruch: 0,
    holzfällerhütte: 0,
    universität: 0,
    baracke: 0,
    werft: 0,
    lagerhaus: 0,
    steinwall: 0,

    lanze: 0,
    schild: 0,
    langbogen: 0,
    kanone: 0
  };
}

/* =========================================================
   Vorverarbeitung
========================================================= */
function preprocessLines(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(l => {
      let line = l.trim();
      line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      line = line.replace(/[*_`]/g, "");
      return line;
    })
    .filter(l => l !== "" && l.toLowerCase() !== "löschen");
}

/* =========================================================
   Datum
========================================================= */
function parseDateTimeFromLines(lines) {
  const r = /(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})/;
  for (const l of lines) {
    const m = l.match(r);
    if (m) return `${m[1]} ${m[2]}`;
  }
  return lines[0] || "";
}

/* =========================================================
   Koordinaten
========================================================= */
function extractCoords(line) {
  const m = line.match(/\((\d+):(\d+):(\d+)\)/);
  return m ? {
    oz: +m[1] || 0,
    ig: +m[2] || 0,
    inn: +m[3] || 0
  } : { oz: 0, ig: 0, inn: 0 };
}

/* =========================================================
   Einheitenblock
========================================================= */
function parseUnitsBlock(lines, startIdx, endIdx, target) {
  const flat = [];

  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (!line) continue;

    const low = line.toLowerCase();
    if (low.startsWith("gesamt") || low.startsWith("verluste")) continue;

    const t = line.split(/\s+/).filter(Boolean);
    for (const x of t) {
      if (/^\d+$/.test(x)) flat.push({ type: "n", v: x });
      else flat.push({ type: "w", v: x });
    }
  }

  let i = 0;
  while (i < flat.length) {
    if (flat[i].type === "w") {
      const name = flat[i].v;
      i++;

      while (i < flat.length && flat[i].type !== "n") i++;
      if (i >= flat.length) break;
      const total = +flat[i].v || 0;
      i++;

      if (i < flat.length && flat[i].type === "w") i++;

      let loss = 0;
      if (i < flat.length && flat[i].type === "n") {
        loss = +flat[i].v || 0;
        i++;
      }

      assignUnit(name, total, loss, target);
    } else i++;
  }
}

/* =========================================================
   Einheiten zuweisen
========================================================= */
function assignUnit(name, total, loss, t) {
  const n = name.toLowerCase();

  if (n.startsWith("fregatte")) { t.fregatte = total; t.fregatte_v = loss; }
  else if (n.startsWith("handelskogge")) { t.handelskogge = total; t.handelskogge_v = loss; }
  else if (n.startsWith("kolonialschiff")) { t.kolonialschiff = total; t.kolonialschiff_v = loss; }
  else if (n.startsWith("steinschleuderer")) { t.steinschleuderer = total; t.steinschleuderer_v = loss; }
  else if (n.startsWith("lanzenträger")) { t.lanzenträger = total; t.lanzenträger_v = loss; }
  else if (n.startsWith("langbogenschütze")) { t.langbogenschütze = total; t.langbogenschütze_v = loss; }
  else if (n.startsWith("kanonen")) { t.kanonen = total; t.kanonen_v = loss; }
}

/* =========================================================
   Gebäude/Forschungen
========================================================= */
function parseBuildingLevel(name, lvl, t) {
  const n = name.toLowerCase();

  if (n.startsWith("haupt")) t.hauptgebäude = lvl;
  else if (n.startsWith("gold")) t.goldbergwerk = lvl;
  else if (n.startsWith("steinbruch")) t.steinbruch = lvl;
  else if (n.startsWith("holz")) t.holzfällerhütte = lvl;
  else if (n.startsWith("uni")) t.universität = lvl;
  else if (n.startsWith("baracke")) t.baracke = lvl;
  else if (n.startsWith("werft")) t.werft = lvl;
  else if (n.startsWith("lagerhaus")) t.lagerhaus = lvl;
  else if (n.startsWith("steinwall")) t.steinwall = lvl;
}

function parseResearchLevel(name, lvl, t) {
  const n = name.toLowerCase();

  if (n.startsWith("lanze")) t.lanze = lvl;
  else if (n.startsWith("schild")) t.schild = lvl;
  else if (n.startsWith("langbogen")) t.langbogen = lvl;
  else if (n.startsWith("kanone")) t.kanone = lvl;
}

/* =========================================================
   Bericht parsen – MIT FIX
========================================================= */
function parseReport(text) {
  const lines = preprocessLines(text);
  if (!lines.length) return null;

  const datetime = parseDateTimeFromLines(lines);

  const idxAtt = lines.findIndex(l => l.toLowerCase().includes("einheiten des angreifers"));
  const idxDef = lines.findIndex(l => l.toLowerCase().includes("einheiten des verteidigers"));
  if (idxAtt === -1 || idxDef === -1) return null;

  const attacker = createEmptyEntry();
  const defender = createEmptyEntry();

  attacker.date1 = datetime;
  defender.date1 = datetime;

  Object.assign(attacker, extractCoords(lines[idxAtt]));
  Object.assign(defender, extractCoords(lines[idxDef]));

  parseUnitsBlock(lines, idxAtt + 1, idxDef, attacker);

  let endDef = lines.length;
  for (let i = idxDef + 1; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (
      l.startsWith("zerstörung") ||
      l.startsWith("kollateralschaden") ||
      l.startsWith("spähbericht") ||
      l.startsWith("gebäude")
    ) {
      endDef = i;
      break;
    }
  }

  parseUnitsBlock(lines, idxDef + 1, endDef, defender);

  /* =========================================================
     FIXED BLOCK: Zerstörung & Kollateralschaden
  ========================================================== */
  for (let i = idxDef + 1; i < lines.length; i++) {
    const raw = lines[i];
    const low = raw.toLowerCase();

    if (!low.startsWith("zerstörung") && !low.startsWith("kollateralschaden")) continue;

    // ---------------------------
    // 1) Einzeilige Variante
    // ---------------------------
    const m1 = raw.match(/(Zerstörung|Kollateralschaden)\s+([A-Za-zÄÖÜäöüß]+)\s+\((\d+)\s*auf\s*(\d+)\)/i);
    if (m1) {
      const building = m1[2];
      const newLevel = parseInt(m1[4], 10) || 0;
      parseBuildingLevel(building, newLevel, defender);
      continue;
    }

    // ---------------------------
    // 2) Mehrzeilige Variante
    // ---------------------------
    const nameLine = lines[i + 1] || "";
    const lvlLine = lines[i + 2] || "";

    const m2 = lvlLine.match(/\((\d+)\s*auf\s*(\d+)\)/i);
    if (m2) {
      const building = nameLine.trim();
      const newLevel = parseInt(m2[2], 10) || 0;
      parseBuildingLevel(building, newLevel, defender);
      i += 2;
      continue;
    }
  }

  /* =========================================================
     Gebäude/Forschungen aus Spähbericht
  ========================================================== */
  const idxSpy = lines.findIndex(l => l.toLowerCase().startsWith("spähbericht"));

  if (idxSpy !== -1) {
    const idxGeb = lines.findIndex((l, i) => i > idxSpy && l.toLowerCase().startsWith("gebäude"));
    const idxFor = lines.findIndex((l, i) => i > idxSpy && l.toLowerCase().startsWith("forschungen"));
    const idxRes = lines.findIndex((l, i) => i > idxSpy && l.toLowerCase().startsWith("rohstoffe"));

    if (idxGeb !== -1) {
      const end = idxFor !== -1 ? idxFor : idxRes !== -1 ? idxRes : lines.length;

      let last = null;
      for (let i = idxGeb + 1; i < end; i++) {
        const line = lines[i];
        const m = line.match(/stufe\s*(\d+)/i);

        if (m) {
          const lvl = +m[1] || 0;
          if (last) parseBuildingLevel(last, lvl, defender);
          else parseBuildingLevel(line.split(" ")[0], lvl, defender);
          last = null;
        } else last = line;
      }
    }

    if (idxFor !== -1) {
      const end = idxRes !== -1 ? idxRes : lines.length;

      let last = null;
      for (let i = idxFor + 1; i < end; i++) {
        const line = lines[i];
        const m = line.match(/stufe\s*(\d+)/i);

        if (m) {
          const lvl = +m[1] || 0;
          if (last) parseResearchLevel(last, lvl, defender);
          else parseResearchLevel(line.split(" ")[0], lvl, defender);
          last = null;
        } else last = line;
      }
    }
  }

  return { attacker, defender };
}

/* =========================================================
   Tabelle rendern
========================================================= */
function renderTable() {
  tableBody.innerHTML = "";

  reportEntries.forEach(e => {
    const tr = document.createElement("tr");

    const cols = [
      e.date1, e.oz, e.ig, e.inn,
      e.fregatte, e.fregatte_v,
      e.handelskogge, e.handelskogge_v,
      e.kolonialschiff, e.kolonialschiff_v,
      e.steinschleuderer, e.steinschleuderer_v,
      e.lanzenträger, e.lanzenträger_v,
      e.langbogenschütze, e.langbogenschütze_v,
      e.kanonen, e.kanonen_v,
      e.hauptgebäude, e.goldbergwerk, e.steinbruch,
      e.holzfällerhütte, e.universität, e.baracke,
      e.werft, e.lagerhaus, e.steinwall,
      e.lanze, e.schild, e.langbogen, e.kanone
    ];

    cols.forEach((v, colIndex) => {
      const td = document.createElement("td");
      td.textContent = v ?? "";
      td.className = colIndex === 0 ? "txt" : "num";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/* =========================================================
   Bericht verarbeiten
========================================================= */
processBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  const r = parseReport(text);
  if (!r) {
    status.show("Bericht unvollständig oder fehlerhaft.", "warn");
    return;
  }

  reportEntries.unshift(r.attacker);
  reportEntries.unshift(r.defender);

  renderTable();
  input.value = "";
});