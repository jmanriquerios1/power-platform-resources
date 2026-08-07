document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  const dropdownTrigger = document.querySelector(".nav-dropdown-trigger");
  const dropdownPanel = document.getElementById("resourcesMenu");

  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.dataset.open === "true";
    links.dataset.open = String(!isOpen);
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  if (!dropdownTrigger || !dropdownPanel) return;

  const setDropdownState = (isOpen) => {
    dropdownPanel.dataset.open = String(isOpen);
    dropdownTrigger.setAttribute("aria-expanded", String(isOpen));
  };

  dropdownTrigger.addEventListener("click", () => {
    const isOpen = dropdownPanel.dataset.open === "true";
    setDropdownState(!isOpen);
  });

  dropdownTrigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDropdownState(true);
      const firstLink = dropdownPanel.querySelector("a");
      if (firstLink) firstLink.focus();
    } else if (event.key === "Escape") {
      setDropdownState(false);
      dropdownTrigger.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dropdownTrigger.contains(event.target) && !dropdownPanel.contains(event.target)) {
      setDropdownState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setDropdownState(false);
    }
  });
});
