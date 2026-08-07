const PORTAL_CATEGORY_CONFIG = Object.freeze([
  { key: "pcf", label: "PCF Controls", route: "pcf" },
  { key: "code-apps", label: "Code Apps", route: "code-apps" },
  { key: "power-pages", label: "Power Pages SPA", route: "power-pages" },
  { key: "plugins", label: "Dataverse Plugins", route: "plugins" },
  { key: "components", label: "Power Platform Components", route: "components" }
]);

const PORTAL_CATEGORY_LOOKUP = Object.fromEntries(
  PORTAL_CATEGORY_CONFIG.map((category) => [category.key, category])
);
const TAG_LABELS = Object.freeze({
  "power-platform": "Power Platform",
  dataverse: "Dataverse",
  typescript: "TypeScript",
  javascript: "JavaScript",
  react: "React",
  csharp: "C#",
  "fluent-ui": "Fluent UI",
  "copilot-studio": "Copilot Studio",
  "open-source": "Open Source"
});

let resourceCatalogPromise;

function getSiteRoot() {
  return document.body.dataset.siteRoot || "";
}

function getCatalogPath() {
  return document.body.dataset.catalogPath || `${getSiteRoot()}assets/data/resources.json`;
}

function routeForCategory(categoryKey) {
  const category = PORTAL_CATEGORY_LOOKUP[categoryKey];
  return category ? `${getSiteRoot()}resources/${category.route}/index.html` : `${getSiteRoot()}resources/index.html`;
}

function resolveUrl(value) {
  if (!value) return "";
  if (/^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("#") || value.startsWith("mailto:")) {
    return value;
  }

  return `${getSiteRoot()}${String(value).replace(/^\/+/, "")}`;
}

function formatDate(value) {
  if (!value) return "--";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(parsed);
}

function humanizeTag(tag) {
  const normalizedTag = String(tag || "").trim().toLowerCase();
  if (TAG_LABELS[normalizedTag]) {
    return TAG_LABELS[normalizedTag];
  }

  return String(tag || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function loadResourceCatalog() {
  if (!resourceCatalogPromise) {
    resourceCatalogPromise = fetch(getCatalogPath())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load resource catalog: ${response.status}`);
        }

        return response.json();
      })
      .then((payload) => {
        const resources = Array.isArray(payload?.resources) ? payload.resources : [];
        const categories = Array.isArray(payload?.categories) && payload.categories.length
          ? payload.categories
          : PORTAL_CATEGORY_CONFIG;

        return {
          generatedAt: payload?.generatedAt || null,
          owner: payload?.owner || null,
          resources,
          categories
        };
      })
      .catch((error) => {
        console.error(error);

        return {
          generatedAt: null,
          owner: null,
          resources: [],
          categories: PORTAL_CATEGORY_CONFIG,
          error: error.message
        };
      });
  }

  return resourceCatalogPromise;
}

window.portalCatalog = {
  categories: PORTAL_CATEGORY_CONFIG,
  getCategory(categoryKey) {
    return PORTAL_CATEGORY_LOOKUP[categoryKey] || null;
  },
  getCatalogPath,
  getSiteRoot,
  routeForCategory,
  resolveUrl,
  formatDate,
  humanizeTag,
  loadResourceCatalog
};

window.resourceCatalogPromise = loadResourceCatalog();
