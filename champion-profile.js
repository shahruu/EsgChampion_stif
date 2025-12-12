// champion-profile.js
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient === 'undefined') {
    console.error('supabaseClient not found on profile page');
    return;
  }

  const form = document.getElementById('account-settings-form');
  const statusEl = document.getElementById('save-status');

  const $ = (id) => document.getElementById(id);

  // 1. Get the logged-in user
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !userData?.user) {
    window.location.href = "champion-login.html";
    return;
  }

  const user = userData.user;

  // 2. Fetch champion profile row
  let champion = null;

  const { data, error } = await supabaseClient
    .from("champions")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error loading profile:", error);
  }

  champion = data || {};

  // 3. Prefill the form with existing values
  $("#email").value = user.email || "";
  $("#first_name").value = champion.first_name || "";
  $("#last_name").value = champion.last_name || "";
  $("#country").value = champion.country || "";
  $("#organization").value = champion.organization || "";
  $("#role").value = champion.role || "";
  $("#primary_sector").value = champion.primary_sector || "";
  $("#mobile").value = champion.mobile || "";
  $("#linkedin").value = champion.linkedin || "";
  $("#contributions").value = champion.contributions || "";
  $("#cla").checked = champion.cla_accepted || false;
  $("#nda").checked = champion.nda_accepted || false;
  $("#nda_signature").value = champion.nda_signature || "";
  $("#terms").checked = champion.terms_accepted || false;

  // 4. Save handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    statusEl.textContent = "";
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    // Required fields validation
    const requiredFields = [
      "first_name",
      "last_name",
      "country",
      "organization",
      "role",
      "primary_sector",
      "mobile",
      "nda_signature"
    ];

    for (const id of requiredFields) {
      if (!$(id).value.trim()) {
        statusEl.textContent = "Please fill in all required fields.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Profile";
        return;
      }
    }

    if (!$("#cla").checked || !$("#nda").checked || !$("#terms").checked) {
      statusEl.textContent =
        "You must accept CLA, NDA, and Terms of Service.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Profile";
      return;
    }

    // 5. Update Supabase row
    const updatePayload = {
      first_name: $("#first_name").value.trim(),
      last_name: $("#last_name").value.trim(),
      country: $("#country").value.trim(),
      organization: $("#organization").value.trim(),
      role: $("#role").value.trim(),
      primary_sector: $("#primary_sector").value.trim(),
      mobile: $("#mobile").value.trim(),
      linkedin: $("#linkedin").value.trim(),
      contributions: $("#contributions").value.trim(),
      cla_accepted: $("#cla").checked,
      nda_accepted: $("#nda").checked,
      nda_signature: $("#nda_signature").value.trim(),
      terms_accepted: $("#terms").checked,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseClient
      .from("champions")
      .update(updatePayload)
      .eq("id", user.id);

    submitBtn.disabled = false;
    submitBtn.textContent = "Save Profile";

    if (updateError) {
      statusEl.textContent = "Error saving profile. Try again.";
      console.error(updateError);
      return;
    }

    statusEl.textContent = "Profile saved successfully!";
    statusEl.style.color = "green";

    setTimeout(() => {
      window.location.href = "champion-dashboard.html";
    }, 1200);
  });
});

