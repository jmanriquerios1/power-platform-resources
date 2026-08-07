function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesSearch(resource, term) {
  if (!term) return true;

  const haystack = [
    resource.title,
    resource.description,
    resource.category,
    resource.language,
    ...(Array.isArray(resource.tags) ? resource.tags : [])
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function matchesCategory(resource, categoryKey) {
  if (!categoryKey || categoryKey === "all") return true;
  return resource.categoryKey === categoryKey;
}

function initResourceSearch(catalog) {
  const searchInput = document.getElementById("resourceSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const totalResult = document.getElementById("resourceCount");

  if (!searchInput || !categoryFilter) return;

  const initialCategory = document.body.dataset.categoryKey || "all";
  if ([...categoryFilter.options].some((option) => option.value === initialCategory)) {
    categoryFilter.value = initialCategory;
  }

  const apply = () => {
    const term = normalize(searchInput.value.trim());
    const category = categoryFilter.value;

    const filtered = catalog.resources.filter(
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

document.addEventListener("DOMContentLoaded", () => {
  (window.resourceCatalogPromise || Promise.resolve({ resources: [] }))
    .then(initResourceSearch);
});
