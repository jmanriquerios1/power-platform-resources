#!/usr/bin/env node
/**
 * rewrite-catalog-urls.mjs
 *
 * Rewrites relative `documentationUrl` and `imageUrl` fields in the generated
 * resources catalog (assets/data/resources.json) so they point to absolute URLs
 * on the public resources repository, rather than to local relative paths that
 * only work when both the web site and the resource source live in the same repo.
 *
 * Designed for FASE 2 / FASE 3 of the repository separation plan.
 *
 * Environment variables
 * ---------------------
 * CATALOG_PATH           Path to resources.json (default: assets/data/resources.json)
 * PUBLIC_REPO_BASE_URL   Absolute base URL for raw resource files in the public repo.
 *                        Examples:
 *                          https://raw.githubusercontent.com/jmanriquerios1/power-platform-public-resources/main
 *                          https://jmanriquerios1.github.io/power-platform-public-resources
 *                        Default: https://raw.githubusercontent.com/jmanriquerios1/power-platform-public-resources/main
 * SOURCE_REPOSITORY       Full owner/repo name for the transitional monorepo layout.
 *                        Default: jmanriquerios1/power-platform-resources
 *
 * The script reads CATALOG_PATH, updates matching fields in-place, and writes
 * the result back to the same file.  It is idempotent: absolute URLs are left
 * unchanged.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");

const catalogPath = path.resolve(
  repositoryRoot,
  process.env.CATALOG_PATH || "assets/data/resources.json"
);

const publicRepoBaseUrl = (
  process.env.PUBLIC_REPO_BASE_URL ||
  "https://raw.githubusercontent.com/jmanriquerios1/power-platform-public-resources/main"
).replace(/\/+$/, "");
const sourceRepository = (
  process.env.SOURCE_REPOSITORY ||
  "jmanriquerios1/power-platform-resources"
).toLowerCase();

/**
 * Returns the owner/repo pair when the base URL points to raw.githubusercontent.com.
 */
function getRawGithubRepository(baseUrl) {
  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname !== "raw.githubusercontent.com") {
      return "";
    }

    const [owner = "", repo = ""] = parsed.pathname.split("/").filter(Boolean);
    return owner && repo ? `${owner}/${repo}`.toLowerCase() : "";
  } catch {
    return "";
  }
}


function isAbsolute(value) {
  if (!value) return true;
  return /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i.test(value) ||
    value.startsWith("#") ||
    value.startsWith("mailto:");
}

/**
 * Converts a relative path that used to live under the monorepo root into an
 * absolute URL pointing at the public resources repository.
 *
 * Example:
 *   "resources/pcf/pcf-choice-color-tiles/README.md"
 *   → "https://raw.githubusercontent.com/…/main/resources/pcf/pcf-choice-color-tiles/README.md"
 *
 * In the public repo the /resources/ prefix is removed (files live at the
 * root), so the mapping strips that leading segment automatically.
 *
 * During the transition period the original monorepo may still be used as the
 * base URL. In that case the full path is preserved so the link resolves
 * correctly before the physical separation happens.
 */
function toAbsoluteUrl(relativePath) {
  if (!relativePath || isAbsolute(relativePath)) return relativePath;

  const normalized = relativePath.replace(/^\.\//, "");

  // In the public repo layout (post-separation) the "resources/" prefix is
  // gone: pcf/… lives at the repo root.  Only strip the prefix when the base
  // URL points to the separated public repo (detected by absence of the
  // monorepo repository name in the base URL).
  const strippedPath = normalized.startsWith("resources/")
    ? normalized.slice("resources/".length)
    : normalized;

  // When the base still points at the transitional monorepo, keep the full
  // path so files continue to resolve correctly until the split is complete.
  const effectivePath = getRawGithubRepository(publicRepoBaseUrl) === sourceRepository
    ? normalized
    : strippedPath;

  return `${publicRepoBaseUrl}/${effectivePath}`;
}

async function main() {
  let raw;
  try {
    raw = await fs.readFile(catalogPath, "utf8");
  } catch (err) {
    console.error(`Cannot read catalog at ${catalogPath}: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let catalog;
  try {
    catalog = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON in ${catalogPath}: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(catalog.resources)) {
    console.error("Catalog does not contain a 'resources' array.");
    process.exitCode = 1;
    return;
  }

  let rewrittenCount = 0;

  catalog.resources = catalog.resources.map((resource) => {
    const updated = { ...resource };

    if (resource.documentationUrl && !isAbsolute(resource.documentationUrl)) {
      updated.documentationUrl = toAbsoluteUrl(resource.documentationUrl);
      rewrittenCount++;
    }

    if (resource.imageUrl && !isAbsolute(resource.imageUrl)) {
      updated.imageUrl = toAbsoluteUrl(resource.imageUrl);
      rewrittenCount++;
    }

    return updated;
  });

  await fs.writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(
    `Rewrote ${rewrittenCount} URL(s) in ${catalogPath} → base: ${publicRepoBaseUrl}`
  );
}

main().catch((err) => {
  console.error(`rewrite-catalog-urls failed: ${err.message}`);
  process.exitCode = 1;
});
