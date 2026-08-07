function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resourceCardTemplate(resource) {
  const tagLabels = new Set();
  const tags = [];

  const addTag = (value) => {
    if (!value) return;

    const label = window.portalCatalog.humanizeTag(value);
    const key = label.toLowerCase();

    if (tagLabels.has(key)) return;

    tagLabels.add(key);
    tags.push(label);
  };

  addTag(resource.language);

  for (const tag of resource.tags) {
    addTag(tag);
  }

  const renderedTags = tags
    .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
    .join("");

  const releaseLink = resource.release?.url
    ? `<a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.release.url))}" target="_blank" rel="noopener noreferrer">Release</a>`
    : "";

  const documentationLink = resource.documentationUrl
    ? `<a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.documentationUrl))}" target="_blank" rel="noopener noreferrer">Documentation</a>`
    : "";

  return `
    <article class="card">
      <p class="eyebrow">// ${escapeHtml(resource.category.toLowerCase())}</p>
      <h3>${escapeHtml(resource.title)}</h3>
      <p>${escapeHtml(resource.description || "No description available.")}</p>
      <div class="tag-row">${renderedTags}</div>
      <div class="meta-row">
        <span class="meta">★ ${escapeHtml(resource.stars)}</span>
        <span class="meta">updated ${escapeHtml(window.portalCatalog.formatDate(resource.updatedAt))}</span>
        <span class="meta">${escapeHtml(resource.language || "Unknown")}</span>
      </div>
      <div class="card-links">
        <a href="${escapeHtml(window.portalCatalog.resolveUrl(resource.repositoryUrl))}" target="_blank" rel="noopener noreferrer">Source Code</a>
        ${documentationLink}
        ${releaseLink}
      </div>
    </article>
  `;
}

function renderResources(targetId, list) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!list.length) {
    target.innerHTML = '<div class="empty-state">No resources published yet for this view.</div>';
    return;
  }

  target.innerHTML = list.map(resourceCardTemplate).join("");
}

function renderCategoryCards(targetId, categories) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = categories
    .map((category) => {
      const count = category.resourceCount ?? 0;

      return `
        <li>
          <a class="category-card-link" href="${escapeHtml(window.portalCatalog.routeForCategory(category.key))}">
            <div class="category-card">
              <strong>${escapeHtml(category.label)}</strong>
              <span class="meta">${count} resource(s)</span>
            </div>
          </a>
        </li>
      `;
    })
    .join("");
}

function renderFilterOptions(selectId, categories) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map(
      (category) => `<option value="${escapeHtml(category.key)}">${escapeHtml(category.label)}</option>`
    )
  ].join("");
}

function sortByStars(list) {
  return [...list].sort((left, right) => {
    const byStars = (right.stars || 0) - (left.stars || 0);
    if (byStars !== 0) return byStars;

    const byUpdated = String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
    if (byUpdated !== 0) return byUpdated;

    return String(left.title || "").localeCompare(String(right.title || ""));
  });
}

function initHomePage(catalog) {
  renderResources("featuredResources", sortByStars(catalog.resources).slice(0, 3));
  renderResources("latestResources", catalog.resources.slice(0, 6));
  renderCategoryCards("categoryCards", catalog.categories);
}

function initResourcesPage(catalog) {
  renderFilterOptions("categoryFilter", catalog.categories);
  renderCategoryCards("resourceCategoryCards", catalog.categories);
}

function initPage(catalog) {
  const page = document.body.dataset.page;

  if (page === "home") {
    initHomePage(catalog);
  }

  if (page === "resources") {
    initResourcesPage(catalog);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  (window.resourceCatalogPromise || Promise.resolve({ resources: [], categories: [] }))
    .then(initPage);
});
