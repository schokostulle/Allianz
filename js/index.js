/* /js/index.js – Login + Registrierung + Tab-Switch */
/* Supabase-Accounts: Admin/Member + Status aktiv/blockiert */

import { supabase } from "./supabase.js";

const tabLogin     = document.getElementById("tab-login");
const tabRegister  = document.getElementById("tab-register");

const loginForm    = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const statusBox    = document.getElementById("auth-status");

const DOMAIN = "@logbuch.fake";

/* =========================================================
   TAB SWITCH
========================================================= */
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");

  loginForm.style.display = "flex";
  registerForm.style.display = "none";

  statusBox.textContent = "";
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");

  loginForm.style.display = "none";
  registerForm.style.display = "flex";

  statusBox.textContent = "";
});

/* =========================================================
   LOGIN
========================================================= */
loginForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  statusBox.textContent = "";

  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();
  const email    = username + DOMAIN;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    statusBox.textContent = "Login fehlgeschlagen.";
    return;
  }

  // Profil laden
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (!profile) {
    statusBox.textContent = "Profil nicht gefunden.";
    return;
  }

  // Status prüfen
  if (profile.status !== "aktiv") {
    statusBox.textContent = "Account ist blockiert.";
    await supabase.auth.signOut();
    return;
  }

  // Benutzerinfos für Kopfbereich merken
  sessionStorage.setItem("username", profile.username);
  sessionStorage.setItem("userRole", profile.role);

  // Weiterleitung
  window.location.href = "dashboard/dashboard.html";
});

/* =========================================================
   REGISTRIERUNG
========================================================= */
registerForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  statusBox.textContent = "";

  const username = registerForm.username.value.trim();
  const password = registerForm.password.value.trim();
  const email    = username + DOMAIN;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    statusBox.textContent = "Registrierung fehlgeschlagen.";
    return;
  }

  // Neues Profil — automatisch MEMBER & BLOCKIERT
  await supabase.from("profiles").insert({
    id: data.user.id,
    email,
    username,
    role: "Member",
    status: "blockiert"
  });

  statusBox.textContent = "Registriert. Warte auf Freischaltung.";
  registerForm.reset();
});