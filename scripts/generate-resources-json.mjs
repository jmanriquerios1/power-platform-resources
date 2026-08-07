import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");
const outputPath = path.resolve(
  repositoryRoot,
  process.env.RESOURCES_OUTPUT_PATH || "assets/data/resources.json"
);
const owner = process.env.GITHUB_OWNER || "jmanriquerios1";
const apiBaseUrl = (process.env.GITHUB_API_BASE_URL || "https://api.github.com").replace(/\/$/, "");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const primaryCategories = [
  { key: "pcf", label: "PCF Controls", topic: "pcf", route: "pcf" },
  { key: "code-apps", label: "Code Apps", topic: "code-app", route: "code-apps" },
  { key: "power-pages", label: "Power Pages SPA", topic: "power-pages-spa", route: "power-pages" },
  { key: "plugins", label: "Dataverse Plugins", topic: "dataverse-plugin", route: "plugins" },
  { key: "components", label: "Power Platform Components", topic: "power-platform-component", route: "components" }
];

const primaryTopicLookup = new Map(primaryCategories.map((category) => [category.topic, category]));

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function githubRequest(endpoint, { allow404 = false } = {}) {
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "power-platform-resources-catalog-generator",
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {})
    }
  });

  if (allow404 && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed for ${endpoint}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function listRepositories() {
  const repositories = [];
  let page = 1;

  while (true) {
    const batch = await githubRequest(`/users/${owner}/repos?per_page=100&page=${page}&sort=updated`);
    if (!Array.isArray(batch) || !batch.length) break;

    repositories.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return repositories;
}

async function getTopics(repository) {
  const payload = await githubRequest(`/repos/${owner}/${repository.name}/topics`);
  return Array.isArray(payload?.names) ? payload.names : [];
}

async function getLatestRelease(repository) {
  const payload = await githubRequest(`/repos/${owner}/${repository.name}/releases/latest`, { allow404: true });
  if (!payload) return null;

  return {
    name: payload.name || payload.tag_name,
    tagName: payload.tag_name || null,
    url: payload.html_url,
    publishedAt: payload.published_at || payload.created_at || null
  };
}

async function getReadmeUrl(repository) {
  const payload = await githubRequest(`/repos/${owner}/${repository.name}/readme`, { allow404: true });
  if (payload?.html_url) {
    return payload.html_url;
  }

  return `${repository.html_url}/blob/${repository.default_branch}/README.md`;
}

function normalizeResource(repository, topics, documentationUrl, release) {
  const matchedCategories = topics
    .map((topic) => primaryTopicLookup.get(topic))
    .filter(Boolean);

  if (matchedCategories.length !== 1) {
    if (matchedCategories.length > 1) {
      console.warn(`Skipping ${repository.full_name}: multiple primary topics detected (${matchedCategories.map((item) => item.topic).join(", ")}).`);
    }

    return null;
  }

  const category = matchedCategories[0];
  const tags = topics.filter((topic) => topic !== category.topic);

  return {
    id: slugify(repository.full_name),
    slug: slugify(repository.name),
    title: repository.name,
    description: repository.description || "",
    category: category.label,
    categoryKey: category.key,
    tags,
    repositoryUrl: repository.html_url,
    documentationUrl,
    release,
    stars: repository.stargazers_count ?? 0,
    updatedAt: repository.updated_at || repository.pushed_at || null,
    language: repository.language || ""
  };
}

function sortResources(resources) {
  return [...resources].sort((left, right) => {
    const updatedComparison = String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
    if (updatedComparison !== 0) return updatedComparison;

    return String(left.id || "").localeCompare(String(right.id || ""));
  });
}

function buildCatalog(resources) {
  const categoryCounts = resources.reduce((counts, resource) => {
    counts.set(resource.categoryKey, (counts.get(resource.categoryKey) || 0) + 1);
    return counts;
  }, new Map());

  return {
    generatedAt: new Date().toISOString(),
    owner,
    totalResources: resources.length,
    categories: primaryCategories.map((category) => ({
      ...category,
      resourceCount: categoryCounts.get(category.key) || 0
    })),
    resources
  };
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog.resources)) {
    throw new Error("Catalog resources must be an array.");
  }

  for (const resource of catalog.resources) {
    const requiredStringFields = [
      "id",
      "slug",
      "title",
      "description",
      "category",
      "categoryKey",
      "repositoryUrl",
      "documentationUrl"
    ];

    for (const field of requiredStringFields) {
      if (typeof resource[field] !== "string") {
        throw new Error(`Invalid resource field '${field}' for ${resource.id}.`);
      }
    }

    if (!Array.isArray(resource.tags)) {
      throw new Error(`Invalid resource tags for ${resource.id}.`);
    }

    if (typeof resource.stars !== "number") {
      throw new Error(`Invalid stars value for ${resource.id}.`);
    }

    if (resource.release !== null && typeof resource.release !== "object") {
      throw new Error(`Invalid release value for ${resource.id}.`);
    }
  }
}

async function main() {
  if (!token && apiBaseUrl === "https://api.github.com") {
    console.warn("GITHUB_TOKEN is not set; GitHub API rate limits may prevent catalog generation.");
  }

  const repositories = await listRepositories();
  const normalizedResources = [];

  for (const repository of repositories) {
    const topics = await getTopics(repository);
    const matchedCategories = topics.filter((topic) => primaryTopicLookup.has(topic));

    if (!matchedCategories.length) {
      continue;
    }

    const [documentationUrl, release] = await Promise.all([
      getReadmeUrl(repository),
      getLatestRelease(repository)
    ]);

    const normalized = normalizeResource(repository, topics, documentationUrl, release);
    if (normalized) {
      normalizedResources.push(normalized);
    }
  }

  const catalog = buildCatalog(sortResources(normalizedResources));
  validateCatalog(catalog);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`Generated ${outputPath} with ${catalog.totalResources} resource(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
