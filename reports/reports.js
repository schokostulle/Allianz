// /reports/reports.js

import { status } from "../js/status.js";

const input = document.getElementById("report-input");
const processBtn = document.getElementById("report-process");
const tableBody = document.querySelector("#report-table tbody");

const reportEntries = [];

/* ========================================================= */
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

/* ========================================================= */
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

/* ========================================================= */
function parseDateTimeFromLines(lines) {
  const r = /(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})/;
  for (const l of lines) {
    const m = l.match(r);
    if (m) return `${m[1]} ${m[2]}`;
  }
  return lines.length ? lines[0] : "";
}

/* ========================================================= */
function extractCoords(line) {
  const m = line.match(/\((\d+):(\d+):(\d+)\)/);
  return m ? {
    oz: +m[1] || 0,
    ig: +m[2] || 0,
    inn: +m[3] || 0
  } : { oz: 0, ig: 0, inn: 0 };
}

/* ========================================================= */
function parseUnitsBlock(lines, startIdx, endIdx, target) {
  const flat = [];

  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (!line) continue;

    const low = line.toLowerCase();
    if (low.startsWith("gesamt") || low.startsWith("verluste")) continue;

    const t = line.split(/\s+/);
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

/* ========================================================= */
function assignUnit(name, total, loss, target) {
  const n = name.toLowerCase();

  if (n.startsWith("fregatte")) { target.fregatte = total; target.fregatte_v = loss; }
  else if (n.startsWith("handelskogge")) { target.handelskogge = total; target.handelskogge_v = loss; }
  else if (n.startsWith("kolonialschiff")) { target.kolonialschiff = total; target.kolonialschiff_v = loss; }
  else if (n.startsWith("steinschleuderer")) { target.steinschleuderer = total; target.steinschleuderer_v = loss; }
  else if (n.startsWith("lanzenträger")) { target.lanzenträger = total; target.lanzenträger_v = loss; }
  else if (n.startsWith("langbogenschütze")) { target.langbogenschütze = total; target.langbogenschütze_v = loss; }
  else if (n.startsWith("kanonen")) { target.kanonen = total; target.kanonen_v = loss; }
}

/* ========================================================= */
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

/* ========================================================= */
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
  attacker.date2 = datetime;
  Object.assign(attacker, extractCoords(lines[idxAtt]));

  defender.date1 = datetime;
  defender.date2 = datetime;
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

  for (let i = idxDef + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (!line.startsWith("zerstörung") && !line.startsWith("kollateralschaden")) continue;

    const name = lines[i].split(/\s+/)[1];
    let lvl = 0;

    const m = lines[i].match(/\((\d+)\s*auf\s*(\d+)\)/i);
    if (m) lvl = +m[2] || 0;
    if (/\(keine\)/i.test(lines[i])) lvl = 0;

    parseBuildingLevel(name, lvl, defender);
  }

  const idxSpy = lines.findIndex(l => l.toLowerCase().startsWith("spähbericht"));
  if (idxSpy !== -1) {
    const idxGeb = lines.findIndex((l, x) => x > idxSpy && l.toLowerCase().startsWith("gebäude"));
    const idxFor = lines.findIndex((l, x) => x > idxSpy && l.toLowerCase().startsWith("forschungen"));
    const idxRes = lines.findIndex((l, x) => x > idxSpy && l.toLowerCase().startsWith("rohstoffe"));

    if (idxGeb !== -1) {
      let last = null;
      const end = idxFor !== -1 ? idxFor : idxRes !== -1 ? idxRes : lines.length;

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
      let last = null;
      const end = idxRes !== -1 ? idxRes : lines.length;

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

/* ========================================================= */
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

    cols.forEach((v, i) => {
      const td = document.createElement("td");
      td.textContent = v;
      td.className = i <= 3 ? "txt" : "num";
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/* ========================================================= */
processBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  const res = parseReport(text);
  if (!res) {
    status.show("Bericht unvollständig.", "warn");
    return;
  }

  reportEntries.unshift(res.attacker);
  reportEntries.unshift(res.defender);

  renderTable();
  input.value = "";
});