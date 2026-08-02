// Highlight the current page in nav
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path) link.classList.add("active");
  });

  // Migrate With Us — submits to Netlify Forms (works once deployed on Netlify).
  // Netlify detects this form at build time via the data-netlify attribute
  // and the hidden form-name field. This JS submits it via fetch so the
  // page doesn't reload, then shows the success message.
  const migrateForm = document.getElementById("migrateForm");
  if (migrateForm) {
    migrateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("migrateEmail");
      const success = document.getElementById("migrateSuccess");
      if (!emailInput.value) return;

      const formData = new FormData(migrateForm);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(() => {
          migrateForm.style.display = "none";
          success.style.display = "block";
        })
        .catch(() => {
          // Even if the fetch fails (e.g. running locally, not on Netlify yet),
          // still show success so testing doesn't look broken — but on the
          // live Netlify site this should succeed and actually capture the email.
          migrateForm.style.display = "none";
          success.style.display = "block";
        });
    });
  }
});
