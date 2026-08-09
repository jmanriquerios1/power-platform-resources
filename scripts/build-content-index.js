#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, 'resources', 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');
const VIDEOS_DIR = path.join(CONTENT_DIR, 'videos');
const OUTPUT_FILE = path.join(CONTENT_DIR, 'index.json');

const REQUIRED_FIELDS = ['title', 'url', 'date', 'summary'];

function parseFrontmatter(markdown, filePath) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`Frontmatter missing or malformed in ${filePath}`);
  }

  const raw = match[1];
  const parsed = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex <= 0) {
      throw new Error(`Invalid frontmatter line "${line}" in ${filePath}`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!parsed[field]) {
      throw new Error(`Missing required frontmatter field "${field}" in ${filePath}`);
    }
  }

  return parsed;
}

function validateUrl(urlValue, filePath) {
  let parsed;
  try {
    parsed = new URL(urlValue);
  } catch {
    throw new Error(`Invalid URL "${urlValue}" in ${filePath}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported URL protocol in ${filePath}: ${urlValue}`);
  }
}

function validateDate(dateValue, filePath) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw new Error(`Invalid date format "${dateValue}" in ${filePath}. Expected YYYY-MM-DD.`);
  }

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateValue) {
    throw new Error(`Invalid calendar date "${dateValue}" in ${filePath}`);
  }
}

async function readCollection(collectionDir, collectionName) {
  const dirEntries = await fs.readdir(collectionDir, { withFileTypes: true });
  const markdownFiles = dirEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const items = [];
  for (const fileName of markdownFiles) {
    const absolutePath = path.join(collectionDir, fileName);
    const raw = await fs.readFile(absolutePath, 'utf8');
    const metadata = parseFrontmatter(raw, absolutePath);

    validateUrl(metadata.url, absolutePath);
    validateDate(metadata.date, absolutePath);

    items.push({
      title: metadata.title,
      url: metadata.url,
      date: metadata.date,
      summary: metadata.summary,
      slug: path.basename(fileName, '.md'),
      source: `${collectionName}/${fileName}`
    });
  }

  items.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
  });

  return items;
}

async function main() {
  const [blog, videos] = await Promise.all([
    readCollection(BLOG_DIR, 'blog'),
    readCollection(VIDEOS_DIR, 'videos')
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    blog,
    videos
  };

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Generated ${OUTPUT_FILE} (blog: ${blog.length}, videos: ${videos.length})`);
}

main().catch((error) => {
  console.error(`build-content-index failed: ${error.message}`);
  process.exitCode = 1;
});
