import { supabase } from "../js/supabase.js";
import { status } from "../js/status.js";

const tableBody = document.querySelector("#member-table tbody");

loadMembers();

/* ============================================================
   Mitglieder laden
============================================================ */
async function loadMembers() {
  tableBody.innerHTML = "";

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    status.show("Fehler beim Laden der Benutzer", "error");
    return;
  }

  data.forEach(user => renderRow(user));
}

/* ============================================================
   Tabellenzeile erstellen
============================================================ */
function renderRow(user) {
  const tr = document.createElement("tr");

  const isSuperadmin = user.role === "Superadmin";

  tr.innerHTML = `
    <td>${user.email}</td>
    <td>${user.username}</td>
    <td>${user.role}</td>
    <td>${user.status}</td>
    <td>${user.deleted ? "Ja" : "Nein"}</td>
    <td class="actions"></td>
  `;

  const actions = tr.querySelector(".actions");

  if (!isSuperadmin) {
    actions.appendChild(btn("Aktivieren", () => updateStatus(user.id, "aktiv")));
    actions.appendChild(btn("Blockieren", () => updateStatus(user.id, "blockiert")));

    if (user.role === "Admin") {
      actions.appendChild(btn("Zu Member", () => updateRole(user.id, "Member")));
    } else if (user.role === "Member") {
      actions.appendChild(btn("Zu Admin", () => updateRole(user.id, "Admin")));
    }

    if (!user.deleted) {
      actions.appendChild(btn("Soft-Delete", () => softDelete(user.id, true)));
    } else {
      actions.appendChild(btn("Restore", () => softDelete(user.id, false)));
    }
  } else {
    actions.innerHTML = `<span class="locked">Superadmin</span>`;
  }

  tableBody.appendChild(tr);
}

/* ============================================================
   Buttons
============================================================ */
function btn(label, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}

/* ============================================================
   Updates
============================================================ */

async function updateStatus(id, statusValue) {
  const { error } = await supabase
    .from("profiles")
    .update({ status: statusValue })
    .eq("id", id);

  if (error) return status.show("Fehler beim Status ändern", "error");
  status.show(`Status geändert zu ${statusValue}`, "ok");
  loadMembers();
}

async function updateRole(id, roleValue) {
  const { error } = await supabase
    .from("profiles")
    .update({ role: roleValue })
    .eq("id", id);

  if (error) return status.show("Fehler beim Rollenwechsel", "error");
  status.show(`Rolle geändert zu ${roleValue}`, "ok");
  loadMembers();
}

async function softDelete(id, del) {
  const { error } = await supabase
    .from("profiles")
    .update({ deleted: del, status: del ? "blockiert" : "aktiv" })
    .eq("id", id);

  if (error) return status.show("Fehler beim Soft-Delete", "error");
  status.show(del ? "Benutzer deaktiviert" : "Benutzer wiederhergestellt", "ok");
  loadMembers();
}