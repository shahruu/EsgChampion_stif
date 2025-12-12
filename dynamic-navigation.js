// dynamic-navigation.js
let navigationInitialized = false;

async function updateNavigation() {
  if (navigationInitialized) return;

  const nav = document.querySelector("header nav");
  if (!nav) return;

  // Identify existing nav buttons
  const membershipBtn = document.getElementById("membership-btn");
  let dashboardBtn = document.getElementById("dashboard-btn") || nav.querySelector('a[href="champion-dashboard.html"]');
  let rankingsBtn = document.getElementById("rankings-btn") || nav.querySelector('a[href="ranking.html"]');
  let logoutBtn = document.getElementById("logout-btn");
  let adminBtn = nav.querySelector('a[href="admin-review.html"]');
  let accountSettingsBtn = document.getElementById("account-settings-btn") || nav.querySelector('a[href="champion-profile.html"]');

  // Helper to create a button if missing
  function createBtn(id, text, href, primary = false) {
    const a = document.createElement("a");
    a.id = id;
    a.href = href;
    a.textContent = text;
    a.className = primary ? "btn-primary" : "btn-secondary";
    nav.appendChild(a);
    return a;
  }

  // Check if a champion is logged in
  let champion = null;
  try {
    champion = await SupabaseService.getCurrentChampion();
  } catch (_) {}

  if (!champion) {
    // Logged OUT state
    if (dashboardBtn) dashboardBtn.style.display = "none";
    if (rankingsBtn) rankingsBtn.style.display = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (adminBtn) adminBtn.style.display = "none";
    if (accountSettingsBtn) accountSettingsBtn.style.display = "none";
    if (membershipBtn) membershipBtn.style.display = "";
    navigationInitialized = true;
    return;
  }

  // Logged IN state (Champion)
  if (!dashboardBtn) {
    dashboardBtn = createBtn("dashboard-btn", "Dashboard", "champion-dashboard.html", true);
  } else {
    dashboardBtn.style.display = "";
  }

  if (!rankingsBtn) {
    rankingsBtn = createBtn("rankings-btn", "Rankings", "ranking.html", true);
  } else {
    rankingsBtn.style.display = "";
  }

  // ⭐ Add Account Settings button
  if (!accountSettingsBtn) {
    accountSettingsBtn = createBtn(
      "account-settings-btn",
      "Account Settings",
      "champion-profile.html",
      false
    );
  } else {
    accountSettingsBtn.style.display = "";
  }

  // Show Admin button if champion is admin
  if (champion.is_admin) {
    if (!adminBtn) {
      adminBtn = createBtn("admin-btn", "Admin", "admin-review.html", false);
    }
    adminBtn.style.display = "";
  } else if (adminBtn) {
    adminBtn.style.display = "none";
  }

  // Show logout button
  if (logoutBtn) {
    logoutBtn.style.display = "";
  } else {
    logoutBtn = createBtn("logout-btn", "Logout", "#", false);
  }

  // Hide membership button if logged in
  if (membershipBtn) membershipBtn.style.display = "none";

  navigationInitialized = true;
}

document.addEventListener("DOMContentLoaded", updateNavigation);

