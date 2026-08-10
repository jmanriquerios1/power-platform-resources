import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");
const resourcesRoot = process.env.RESOURCES_ROOT
  ? path.resolve(process.env.RESOURCES_ROOT)
  : path.join(repositoryRoot, "resources");
const outputPath = path.resolve(
  repositoryRoot,
  process.env.RESOURCES_OUTPUT_PATH || "assets/data/resources.json"
);
const repositoryName = (
  process.env.RESOURCES_REPOSITORY ||
  process.env.GITHUB_REPOSITORY ||
  "jmanriquerios1/power-platform-resources"
);
const sourceRepositoryName = repositoryName.toLowerCase();
const repositoryOwner = repositoryName.split("/")[0] || "jmanriquerios1";
const defaultBranch = process.env.RESOURCES_REPOSITORY_BRANCH || "main";
const githubRepositoryUrl = `https://github.com/${repositoryName}`;

const primaryCategories = [
  { key: "pcf", label: "PCF Controls", directory: "pcf", route: "pcf" },
  { key: "code-apps", label: "Code Apps", directory: "code-apps", route: "code-apps" },
  { key: "power-pages", label: "Power Pages SPA", directory: "power-pages", route: "power-pages" },
  { key: "plugins", label: "Dataverse Plugins", directory: "plugins", route: "plugins" },
  { key: "components", label: "Power Platform Components", directory: "components", route: "components" }
];

const releaseFileExtensions = new Set([
  ".zip",
  ".msapp",
  ".cab",
  ".jar",
  ".dll",
  ".vsix",
  ".nupkg",
  ".tgz",
  ".gz",
  ".7z",
  ".rar"
]);

const languageTags = new Map([
  ["typescript", "TypeScript"],
  ["javascript", "JavaScript"],
  ["c#", "C#"],
  ["csharp", "C#"],
  ["power fx", "Power Fx"],
  ["html", "HTML"],
  ["css", "CSS"]
]);

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function toRepositoryRelativePath(relativePath) {
  return toPosixPath(relativePath);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(readmeContent, fallbackTitle) {
  const headingMatch = String(readmeContent || "").match(/^#\s+(.+)$/m);
  return stripMarkdown(headingMatch?.[1] || "") || fallbackTitle;
}

function extractDescription(readmeContent) {
  if (!readmeContent) return "";

  const paragraphs = String(readmeContent)
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    if (/^#\s+/.test(paragraph)) continue;
    if (/^(?:[-*+]\s+|\d+\.\s+)/m.test(paragraph)) continue;

    const cleaned = stripMarkdown(paragraph);
    if (cleaned) {
      return cleaned;
    }
  }

  return "";
}

function extractTags(readmeContent) {
  if (!readmeContent) return [];

  const tags = [];
  let inTechnologySection = false;

  for (const rawLine of String(readmeContent).replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const headingMatch = line.match(/^#{2,6}\s+(.+)$/);
    if (headingMatch) {
      inTechnologySection = /tecnolog(?:i|í)as|technolog(?:y|ies)/i.test(headingMatch[1]);
      continue;
    }

    if (!inTechnologySection) continue;

    const bulletMatch = line.match(/^[-*+]\s+(.+)$/);
    if (!bulletMatch) continue;

    const tag = stripMarkdown(bulletMatch[1]);
    if (tag && !tags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      tags.push(tag);
    }
  }

  return tags;
}

function extractLanguage(tags) {
  for (const tag of tags) {
    const language = languageTags.get(String(tag).trim().toLowerCase());
    if (language) {
      return language;
    }
  }

  return "";
}

async function getReleaseFile(resourceDirectory) {
  const directoriesToScan = [resourceDirectory];

  while (directoriesToScan.length) {
    const currentDirectory = directoriesToScan.shift();
    const entries = await fs.readdir(currentDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        directoriesToScan.push(entryPath);
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!releaseFileExtensions.has(extension)) {
        continue;
      }

      return entryPath;
    }
  }

  return null;
}

async function normalizeResource(category, resourceEntry) {
  const resourceDirectory = path.join(resourcesRoot, category.directory, resourceEntry.name);
  const relativeResourcePath = toPosixPath(path.relative(repositoryRoot, resourceDirectory));
  const repositoryRelativeResourcePath = toRepositoryRelativePath(relativeResourcePath);
  const readmePath = path.join(resourceDirectory, "README.md");
  const imagePath = path.join(resourceDirectory, "image.png");

  const [readmeContent, hasImage, releaseFile] = await Promise.all([
    pathExists(readmePath)
      ? fs.readFile(readmePath, "utf8")
      : Promise.resolve(""),
    pathExists(imagePath),
    getReleaseFile(resourceDirectory)
  ]);

  const title = extractTitle(readmeContent, resourceEntry.name);
  const tags = extractTags(readmeContent);
  const language = extractLanguage(tags);
  const description = extractDescription(readmeContent);
  const relativeReadmePath = toPosixPath(path.relative(repositoryRoot, readmePath));

  return {
    id: slugify(`${category.key}-${resourceEntry.name}`),
    slug: slugify(resourceEntry.name),
    title,
    description,
    category: category.label,
    categoryKey: category.key,
    tags,
    repositoryUrl: `${githubRepositoryUrl}/tree/${defaultBranch}/${repositoryRelativeResourcePath}`,
    documentationUrl: readmeContent ? relativeReadmePath : "",
    imageUrl: hasImage ? toPosixPath(path.relative(repositoryRoot, imagePath)) : "",
    release: releaseFile
      ? {
          name: path.basename(releaseFile),
          url: toPosixPath(path.relative(repositoryRoot, releaseFile))
        }
      : null,
    stars: 0,
    updatedAt: null,
    language
  };
}

function sortResources(resources) {
  const categoryOrder = new Map(primaryCategories.map((category, index) => [category.key, index]));

  return [...resources].sort((left, right) => {
    const byCategory = (categoryOrder.get(left.categoryKey) ?? Number.MAX_SAFE_INTEGER)
      - (categoryOrder.get(right.categoryKey) ?? Number.MAX_SAFE_INTEGER);
    if (byCategory !== 0) return byCategory;

    const byTitle = String(left.title || "").localeCompare(String(right.title || ""));
    if (byTitle !== 0) return byTitle;

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
    owner: repositoryOwner,
    totalResources: resources.length,
    categories: primaryCategories.map((category) => ({
      key: category.key,
      label: category.label,
      route: category.route,
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
      "documentationUrl",
      "imageUrl",
      "language"
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

    if (resource.updatedAt !== null && typeof resource.updatedAt !== "string") {
      throw new Error(`Invalid updatedAt value for ${resource.id}.`);
    }

    if (
      resource.release !== null
      && (typeof resource.release !== "object"
      || typeof resource.release.url !== "string"
      || typeof resource.release.name !== "string")
    ) {
      throw new Error(`Invalid release value for ${resource.id}.`);
    }
  }
}

async function scanCategory(category) {
  const categoryDirectory = path.join(resourcesRoot, category.directory);
  const entries = await fs.readdir(categoryDirectory, { withFileTypes: true });
  const resourceEntries = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  return Promise.all(resourceEntries.map((entry) => normalizeResource(category, entry)));
}

async function main() {
  const categoryResources = await Promise.all(primaryCategories.map(scanCategory));
  const resources = sortResources(categoryResources.flat());
  const catalog = buildCatalog(resources);

  validateCatalog(catalog);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`Generated ${outputPath} with ${catalog.totalResources} resource(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
