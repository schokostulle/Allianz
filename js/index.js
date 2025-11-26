import { supabase } from "/js/supabase.js";
import { loadProfile } from "/js/auth.js";

const DOMAIN = "@logbuch.fake";

const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const statusBox = document.getElementById("status");

/* TAB SWITCH */
btnLogin.addEventListener("click", () => {
  btnLogin.classList.add("active");
  btnRegister.classList.remove("active");
  loginForm.style.display = "flex";
  registerForm.style.display = "none";
  statusBox.textContent = "";
});

btnRegister.addEventListener("click", () => {
  btnRegister.classList.add("active");
  btnLogin.classList.remove("active");
  loginForm.style.display = "none";
  registerForm.style.display = "flex";
  statusBox.textContent = "";
});

/* LOGIN */
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "";

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();
    const email = username + DOMAIN;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      statusBox.textContent = "Login fehlgeschlagen";
      return;
    }

    const profile = await loadProfile();
    if (!profile) {
      statusBox.textContent = "Profil fehlt";
      return;
    }

    if (profile.status !== "aktiv") {
      statusBox.textContent = "Account blockiert";
      await supabase.auth.signOut();
      return;
    }

    window.location.href = "/dashboard/dashboard.html";
  });
}

/* REGISTRIERUNG */
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "";

    const username = registerForm.username.value.trim();
    const password = registerForm.password.value.trim();
    const email = username + DOMAIN;

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      statusBox.textContent = "Registrierung fehlgeschlagen";
      return;
    }

    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      username,
      role: "Member",
      status: "aktiv"
    });

    statusBox.textContent = "Registrierung erfolgreich";
    registerForm.reset();
  });
}