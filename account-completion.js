// account-completion.js
document.addEventListener("DOMContentLoaded", async () => {
  const card = document.getElementById("account-completion-card");
  const percentEl = document.getElementById("completion-percent");
  const messageEl = document.getElementById("completion-message");
  const ctaBtn = document.getElementById("completion-cta");

  if (!card || !percentEl || !messageEl || !ctaBtn) return;

  if (typeof supabaseClient === "undefined") {
    console.warn("Supabase client not found.");
    return;
  }

  // 1 — Get the logged-in user
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !userData?.user) return;

  const user = userData.user;

  // 2 — Detect LinkedIn login
  const identities = user.identities || [];
  const isLinkedIn =
    (user.app_metadata?.provider && user.app_metadata.provider.includes("linkedin")) ||
    identities.some((id) => id.provider.includes("linkedin"));

  if (!isLinkedIn) {
    // Only LinkedIn users must complete account
    return;
  }

  // 3 — Fetch champion profile
  let champion = null;
  const { data: profile, error: profileError } = await supabaseClient
    .from("champions")
    .select("first_name, last_name, organization, primary_sector, role, country, mobile, nda_signature, cla_accepted, nda_accepted, terms_accepted")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error loading profile:", profileError);
    return;
  }

  champion = profile || {};

  // 4 — Required fields to match full sign-up depth
  const REQUIRED_FIELDS = [
    "first_name",
    "last_name",
    "country",
    "organization",
    "role",
    "primary_sector",
    "mobile",
    "nda_signature"
  ];

  const AGREEMENTS = ["cla_accepted", "nda_accepted", "terms_accepted"];

  const filled = REQUIRED_FIELDS.filter(
    (field) => champion[field] && String(champion[field]).trim() !== ""
  );

  const agreementsFilled = AGREEMENTS.filter((a) => champion[a] === true);

  const totalRequired = REQUIRED_FIELDS.length + AGREEMENTS.length;
  const currentCompleted = filled.length + agreementsFilled.length;

  const completion = Math.round((currentCompleted / totalRequired) * 100);

  // 5 — If COMPLETE, hide card
  if (completion >= 100) {
    return;
  }

  // 6 — If NOT COMPLETE, show card + redirect logic
  percentEl.textContent = `${completion}%`;

  const remaining = totalRequired - currentCompleted;
  messageEl.textContent =
    remaining <= 1
      ? "Add one more detail to finish setting up your account."
      : `Add ${remaining} more details to finish setting up your account.`;

  // When user clicks "Continue" → go to Account Settings
  ctaBtn.addEventListener("click", () => {
    window.location.href = "champion-profile.html?from=linkedin";
  });

  // Auto enforce completion: redirect user if they are NOT on account settings
  const isOnSettingsPage = window.location.pathname.includes("champion-profile.html");

  if (!isOnSettingsPage) {
    window.location.href = "champion-profile.html?force=1";
  }

  // Show card on the settings page only
  card.classList.remove("hidden");
});

