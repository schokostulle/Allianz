// /js/auth.js
// Auth + Profilprüfung für Logbuch

import { supabase } from "./supabase.js";

/* ============================================
   SESSION / USER
============================================ */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/* ============================================
   PROFIL LADEN
============================================ */
export async function loadProfile() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return data;
}

/* ============================================
   REQUIRE AUTH — Rollen, Status, Zugriff
============================================ */
export async function requireAuth(roles = ["Admin", "Member"]) {
  // 1) Session prüfen
  const session = await getSession();
  if (!session) {
    window.location.href = "/index.html";
    return null;
  }

  // 2) Profil laden
  const profile = await loadProfile();
  if (!profile) {
    window.location.href = "/index.html";
    return null;
  }

  // 3) Status "aktiv" notwendig
  if (profile.status !== "aktiv") {
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.href = "/index.html";
    return null;
  }

  // 4) Rollenberechtigung prüfen
  if (!roles.includes(profile.role)) {
    window.location.href = "/index.html";
    return null;
  }

  // 5) Username + Rolle in Session übernehmen
  sessionStorage.setItem("username", profile.username);
  sessionStorage.setItem("userRole", profile.role);

  return profile;
}