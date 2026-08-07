function resourceCardTemplate(resource) {
  const tags = resource.technologies
    .map((item) => `<span class="tag">${item}</span>`)
    .join("");

  const featuredClass = resource.featured ? " featured-card" : "";

  return `
    <article class="card${featuredClass}">
      <p class="eyebrow">// ${resource.category.toLowerCase()}</p>
      <h3>${resource.title}</h3>
      <p>${resource.description}</p>
      <div class="tag-row">${tags}</div>
      <div class="meta-row">
        <span class="meta">★ ${resource.stars}</span>
        <span class="meta">updated ${resource.updated}</span>
      </div>
      <div class="card-links">
        <a href="${resource.repository}" target="_blank" rel="noopener noreferrer">Repository</a>
        <a href="${resource.documentation}" target="_blank" rel="noopener noreferrer">Documentation</a>
        <a href="${resource.release}" target="_blank" rel="noopener noreferrer">Release</a>
      </div>
    </article>
  `;
}

function renderResources(targetId, list) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!list.length) {
    target.innerHTML = '<div class="empty-state">No resources found for this filter.</div>';
    return;
  }

  target.innerHTML = list.map(resourceCardTemplate).join("");
}

function renderCategoryCards(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = portalCategories
    .map((category) => `<li class="category-card">${category}</li>`)
    .join("");
}

function renderFilterOptions(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = filterCategories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function initHomePage() {
  renderResources(
    "featuredResources",
    resources.filter((resource) => resource.featured).slice(0, 3)
  );

  renderResources("latestResources", resources.slice(0, 6));
  renderCategoryCards("categoryCards");
}

function initPage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    initHomePage();
  }

  if (page === "resources") {
    renderFilterOptions("categoryFilter");
    renderResources("resourceResults", resources);
  }
}

document.addEventListener("DOMContentLoaded", initPage);
