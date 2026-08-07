document.addEventListener("DOMContentLoaded", () => {
  // ── Mobile menu toggle ─────────────────────────────────────────────
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.dataset.open === "true";
      links.dataset.open = String(!isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // ── Header shadow on scroll ────────────────────────────────────────
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    window.addEventListener("scroll", () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  // ── Accessible dropdowns ───────────────────────────────────────────
  document.querySelectorAll(".nav-item--dropdown").forEach((item) => {
    const trigger = item.querySelector(".nav-dropdown-trigger");
    const panel = item.querySelector(".nav-dropdown-panel");

    if (!trigger || !panel) return;

    // Ensure required ARIA attributes are present
    if (!trigger.hasAttribute("aria-haspopup")) {
      trigger.setAttribute("aria-haspopup", "true");
    }
    if (!trigger.hasAttribute("aria-expanded")) {
      trigger.setAttribute("aria-expanded", "false");
    }

    const isOpen = () => item.classList.contains("open");

    const openDropdown = () => {
      item.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      // Move focus to first focusable item
      const firstLink = panel.querySelector("a");
      if (firstLink) firstLink.focus();
    };

    const closeDropdown = (returnFocus = false) => {
      item.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    };

    // Click / keyboard open-close
    trigger.addEventListener("click", () => {
      isOpen() ? closeDropdown() : openDropdown();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        isOpen() ? closeDropdown(true) : openDropdown();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        openDropdown();
      } else if (event.key === "Escape") {
        closeDropdown(true);
      }
    });

    // Arrow-key navigation inside panel
    panel.addEventListener("keydown", (event) => {
      const focusable = Array.from(panel.querySelectorAll("a"));
      if (!focusable.length) return;
      const current = document.activeElement;
      const idx = focusable.indexOf(current);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = focusable[(idx + 1) % focusable.length];
        next.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
        prev.focus();
      } else if (event.key === "Escape") {
        closeDropdown(true);
      } else if (event.key === "Tab") {
        // Close on Tab-out
        closeDropdown();
      }
    });

    // Close on outside click
    document.addEventListener("click", (event) => {
      if (!item.contains(event.target)) {
        closeDropdown();
      }
    });

    // Close on mouse leave
    item.addEventListener("mouseleave", () => {
      // Only auto-close on mouse leave if not keyboard-navigating inside
      if (!panel.contains(document.activeElement)) {
        closeDropdown();
      }
    });
  });
});
