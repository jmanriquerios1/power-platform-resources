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

const categoryDefinitions = [
  { sourceDir: "pcf", key: "pcf", label: "PCF Controls", topic: "pcf", route: "pcf" },
  { sourceDir: "code-apps", key: "code-apps", label: "Code Apps", topic: "code-app", route: "code-apps" },
  { sourceDir: "power-pages-spa", key: "power-pages", label: "Power Pages SPA", topic: "power-pages-spa", route: "power-pages" },
  { sourceDir: "plugins", key: "plugins", label: "Dataverse Plugins", topic: "dataverse-plugin", route: "plugins" },
  { sourceDir: "components", key: "components", label: "Power Platform Components", topic: "power-platform-component", route: "components" }
];

const supportedReadmeNames = ["README.md", "Readme.md", "readme.md"];
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const previewNameHints = ["preview", "screenshot", "cover", "thumbnail", "thumb", "image", "demo", "sample", "logo"];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeSlug(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function stripFrontMatter(content) {
  const normalized = String(content || "");
  if (!normalized.startsWith("---\n")) {
    return normalized;
  }

  const closingFenceIndex = normalized.indexOf("\n---\n", 4);
  if (closingFenceIndex === -1) {
    return normalized;
  }

  return normalized.slice(closingFenceIndex + 5);
}

function normalizeMarkdownText(value) {
  return String(value || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(readmeContent, fallbackTitle) {
  const content = stripFrontMatter(readmeContent);
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    const candidate = normalizeMarkdownText(headingMatch[1]);
    if (candidate) return candidate;
  }

  return fallbackTitle;
}

function extractDescription(readmeContent) {
  const content = stripFrontMatter(readmeContent);
  const lines = content.split(/\r?\n/);
  const paragraph = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (paragraph.length) break;
      continue;
    }

    if (
      /^#{1,6}\s/.test(trimmed) ||
      /^```/.test(trimmed) ||
      /^>/.test(trimmed) ||
      /^\|/.test(trimmed) ||
      /^[-*+]\s/.test(trimmed) ||
      /^\d+\.\s/.test(trimmed) ||
      /^!\[/.test(trimmed) ||
      /^<[^>]+>/.test(trimmed)
    ) {
      if (paragraph.length) break;
      continue;
    }

    paragraph.push(trimmed);
  }

  return normalizeMarkdownText(paragraph.join(" "));
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readReadme(resourceDirectoryPath) {
  for (const fileName of supportedReadmeNames) {
    const candidatePath = path.join(resourceDirectoryPath, fileName);
    if (await pathExists(candidatePath)) {
      const content = await fs.readFile(candidatePath, "utf8");
      return { fileName, content };
    }
  }

  return null;
}

async function discoverPreviewImage(resourceDirectoryPath, resourceRelativeDirectory) {
  const entries = await fs.readdir(resourceDirectoryPath, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()));

  if (!files.length) {
    return "";
  }

  const rankFile = (fileName) => {
    const normalized = fileName.toLowerCase();
    const hintedIndex = previewNameHints.findIndex((hint) => normalized.includes(hint));
    return hintedIndex === -1 ? Number.MAX_SAFE_INTEGER : hintedIndex;
  };

  files.sort((left, right) => {
    const rankDiff = rankFile(left) - rankFile(right);
    if (rankDiff !== 0) return rankDiff;
    return left.localeCompare(right);
  });

  return toPosix(path.join(resourceRelativeDirectory, files[0]));
}

async function listResourceDirectories(category) {
  const categoryDirectoryPath = path.join(repositoryRoot, category.sourceDir);

  if (!(await pathExists(categoryDirectoryPath))) {
    console.warn(`Category directory not found: ${category.sourceDir}`);
    return [];
  }

  const entries = await fs.readdir(categoryDirectoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function normalizeResource(category, resourceDirectoryName) {
  const resourceRelativeDirectory = path.join(category.sourceDir, resourceDirectoryName);
  const resourceDirectoryPath = path.join(repositoryRoot, resourceRelativeDirectory);
  const readme = await readReadme(resourceDirectoryPath);
  const fallbackTitle = humanizeSlug(resourceDirectoryName);

  const title = extractTitle(readme?.content || "", fallbackTitle);
  const description = extractDescription(readme?.content || "") || `${category.label} resource.`;
  const previewImageUrl = await discoverPreviewImage(resourceDirectoryPath, resourceRelativeDirectory);
  const resourcePath = `${toPosix(resourceRelativeDirectory)}/`;
  const documentationPath = readme ? `${toPosix(path.join(resourceRelativeDirectory, readme.fileName))}` : "";
  const stats = await fs.stat(resourceDirectoryPath);

  return {
    id: slugify(`${category.key}-${resourceDirectoryName}`),
    slug: slugify(resourceDirectoryName),
    title,
    description,
    category: category.label,
    categoryKey: category.key,
    tags: [],
    repositoryUrl: documentationPath || resourcePath,
    documentationUrl: documentationPath,
    release: null,
    stars: 0,
    updatedAt: stats.mtime.toISOString(),
    language: "",
    previewImageUrl,
    sourcePath: resourcePath
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
    owner: "jmanriquerios1",
    totalResources: resources.length,
    categories: categoryDefinitions.map((category) => ({
      key: category.key,
      label: category.label,
      topic: category.topic,
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
      "previewImageUrl",
      "sourcePath"
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
  const resources = [];

  for (const category of categoryDefinitions) {
    const directories = await listResourceDirectories(category);

    for (const directoryName of directories) {
      resources.push(await normalizeResource(category, directoryName));
    }
  }

  const catalog = buildCatalog(sortResources(resources));
  validateCatalog(catalog);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`Generated ${outputPath} with ${catalog.totalResources} resource(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
