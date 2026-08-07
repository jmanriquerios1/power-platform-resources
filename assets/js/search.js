function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesSearch(resource, term) {
  if (!term) return true;

  const haystack = [
    resource.title,
    resource.description,
    resource.category,
    resource.technologies.join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function matchesCategory(resource, category) {
  if (!category || category === "All") return true;

  if (category === "PCF") return resource.category.includes("PCF");
  if (category === "Plugins") return resource.category.includes("Plugins");
  if (category === "Power Pages") return resource.category.includes("Power Pages");

  return resource.category === category;
}

function initResourceSearch() {
  const searchInput = document.getElementById("resourceSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const totalResult = document.getElementById("resourceCount");

  if (!searchInput || !categoryFilter) return;

  const apply = () => {
    const term = normalize(searchInput.value.trim());
    const category = categoryFilter.value;

    const filtered = resources.filter(
      (resource) => matchesSearch(resource, term) && matchesCategory(resource, category)
    );

    renderResources("resourceResults", filtered);

    if (totalResult) {
      totalResult.textContent = `${filtered.length} resource(s)`;
    }
  };

  searchInput.addEventListener("input", apply);
  categoryFilter.addEventListener("change", apply);
  apply();
}

document.addEventListener("DOMContentLoaded", initResourceSearch);
