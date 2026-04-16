document.addEventListener("DOMContentLoaded", function () {
  const headerLinks = document.querySelectorAll('a[href^="#"]');

  headerLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId && targetId.startsWith("#") && targetId.length > 1) {
        const target = document.querySelector(targetId);

        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    });
  });

  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        const value = field.value.trim();

        if (!value) {
          isValid = false;
          field.style.borderColor = "#dc2626";
        } else {
          field.style.borderColor = "#cbd5e1";
        }

        if (field.type === "email" && value) {
          const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          if (!emailOk) {
            isValid = false;
            field.style.borderColor = "#dc2626";
          }
        }
      });

      if (!isValid) {
        e.preventDefault();
        alert("Merci de remplir correctement les champs obligatoires.");
      }
    });
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a, .nav-links a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.style.color = "#2563eb";
      link.style.fontWeight = "800";
    }
  });
});