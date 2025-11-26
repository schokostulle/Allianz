import { supabase } from "/js/supabase.js";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function loadProfile() {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireAuth(allowedRoles = ["Admin", "Member"]) {
  const session = await getSession();
  if (!session) {
    window.location.href = "/index.html";
    return;
  }

  const profile = await loadProfile();
  if (!profile) {
    window.location.href = "/index.html";
    return;
  }

  if (!allowedRoles.includes(profile.role)) {
    window.location.href = "/index.html";
    return;
  }

  if (profile.status !== "aktiv") {
    window.location.href = "/index.html";
    return;
  }

  sessionStorage.setItem("username", profile.username);
  sessionStorage.setItem("userRole", profile.role);

  return profile;
}