#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT_DIR = process.cwd();
const VIDEOS_DIR = path.join(ROOT_DIR, 'resources', 'content', 'videos');

const YOUTUBE_HANDLE_URL = 'https://www.youtube.com/@JonathanManriqueRios';
const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const INITIAL_VIDEO_ID = '85mk7yqPMuU';
const INITIAL_VIDEO_URL = `${YOUTUBE_WATCH_URL}${INITIAL_VIDEO_ID}`;

const CHANNEL_ID_REGEX = /^UC[0-9A-Za-z_-]{22}$/;

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function escapeFrontmatterString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, ' ')
    .replace(/"/g, '\\"')
    .trim();
}

function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractTagValue(xml, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`);
  const match = xml.match(regex);
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

function extractLinkHref(xml) {
  const match = xml.match(/<link[^>]*href="([^"]+)"[^>]*\/?>(?:<\/link>)?/);
  return match ? decodeXmlEntities(match[1].trim()) : null;
}

async function fetchText(url) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'power-platform-resources-content-bot/1.0',
        Accept: 'application/xml,text/xml,text/html,application/xhtml+xml,*/*'
      }
    });
  } catch (error) {
    throw new Error(`Network request failed for ${url}: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return response.text();
}

function extractChannelIdFromText(rawText) {
  const rssMatch = rawText.match(/feeds\/videos\.xml\?channel_id=(UC[0-9A-Za-z_-]{22})/);
  if (rssMatch) {
    return rssMatch[1];
  }

  const channelPathMatch = rawText.match(/\/channel\/(UC[0-9A-Za-z_-]{22})/);
  if (channelPathMatch) {
    return channelPathMatch[1];
  }

  const channelIdMatch = rawText.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/);
  if (channelIdMatch) {
    return channelIdMatch[1];
  }

  return null;
}

async function resolveChannelId() {
  const fromEnv = process.env.YT_CHANNEL_ID?.trim();
  if (fromEnv) {
    if (!CHANNEL_ID_REGEX.test(fromEnv)) {
      throw new Error(`YT_CHANNEL_ID is invalid: ${fromEnv}`);
    }
    return fromEnv;
  }

  const handlePage = await fetchText(YOUTUBE_HANDLE_URL);
  const resolved = extractChannelIdFromText(handlePage);
  if (!resolved) {
    throw new Error(`Could not resolve channel ID from ${YOUTUBE_HANDLE_URL}. Set YT_CHANNEL_ID explicitly.`);
  }

  return resolved;
}

function parseRssEntries(rssXml) {
  const entries = [];
  const entryMatches = rssXml.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (const entryXml of entryMatches) {
    const videoId = extractTagValue(entryXml, 'yt:videoId');
    if (!videoId) {
      continue;
    }

    const title = extractTagValue(entryXml, 'title') || `Video ${videoId}`;
    const url = extractLinkHref(entryXml) || `${YOUTUBE_WATCH_URL}${videoId}`;
    const date = toIsoDate(extractTagValue(entryXml, 'published') || extractTagValue(entryXml, 'updated'));
    const summary =
      extractTagValue(entryXml, 'media:description') ||
      extractTagValue(entryXml, 'summary') ||
      'Sin resumen disponible en el feed RSS público de YouTube.';

    if (!date) {
      continue;
    }

    entries.push({
      videoId,
      title,
      url,
      date,
      summary
    });
  }

  return entries;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return null;
  }

  const result = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const idx = line.indexOf(':');
    if (idx < 0) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

async function readExistingVideoFiles() {
  const files = await fs.readdir(VIDEOS_DIR, { withFileTypes: true });
  const mdFiles = files.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name);

  const byVideoId = new Map();

  for (const fileName of mdFiles) {
    const filePath = path.join(VIDEOS_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    const videoIdFromName = fileName.match(/-([0-9A-Za-z_-]{11})\.md$/)?.[1];
    const videoId = frontmatter?.url?.match(/[?&]v=([0-9A-Za-z_-]{11})/)?.[1] || videoIdFromName;

    if (!videoId) {
      continue;
    }

    byVideoId.set(videoId, {
      fileName,
      filePath,
      frontmatter: frontmatter || {}
    });
  }

  return byVideoId;
}

async function fetchVideoPageMetadata(videoId) {
  const url = `${YOUTUBE_WATCH_URL}${videoId}`;

  try {
    const html = await fetchText(url);
    const uploadDate = html.match(/"uploadDate":"([0-9]{4}-[0-9]{2}-[0-9]{2})"/)?.[1] || null;
    const title = decodeXmlEntities(html.match(/<meta name="title" content="([^"]+)"/)?.[1] || '').trim();
    const description = decodeXmlEntities(html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '').trim();

    return {
      date: uploadDate,
      title: title || null,
      summary: description || null
    };
  } catch {
    return {
      date: null,
      title: null,
      summary: null
    };
  }
}

function buildMarkdown({ title, url, date, summary, videoId }) {
  return `---\ntitle: "${escapeFrontmatterString(title)}"\nurl: "${escapeFrontmatterString(url)}"\ndate: "${escapeFrontmatterString(date)}"\nsummary: "${escapeFrontmatterString(summary)}"\n---\n\nVideo ID: ${videoId}\n`;
}

async function upsertVideoFile(video, existingIndex) {
  const safeDate = video.date;
  if (!safeDate) {
    throw new Error(`Missing date for video ${video.videoId}`);
  }

  const expectedFileName = `${safeDate}-${video.videoId}.md`;
  const expectedPath = path.join(VIDEOS_DIR, expectedFileName);
  const existing = existingIndex.get(video.videoId);

  const markdown = buildMarkdown(video);

  await fs.writeFile(expectedPath, markdown, 'utf8');

  if (existing && existing.fileName !== expectedFileName) {
    await fs.unlink(existing.filePath).catch(() => {});
  }
}

async function ensureInitialVideo(videosById, existingIndex) {
  if (videosById.has(INITIAL_VIDEO_ID)) {
    return;
  }

  const existing = existingIndex.get(INITIAL_VIDEO_ID);
  const fallbackFromExisting = existing?.frontmatter || {};
  const fetchedMetadata = await fetchVideoPageMetadata(INITIAL_VIDEO_ID);

  const date = toIsoDate(fetchedMetadata.date) || toIsoDate(fallbackFromExisting.date) || '2026-08-09';
  const title =
    fetchedMetadata.title ||
    fallbackFromExisting.title ||
    `Video de YouTube (${INITIAL_VIDEO_ID})`;
  const summary =
    fetchedMetadata.summary ||
    fallbackFromExisting.summary ||
    'Resumen no disponible automáticamente. Revisar manualmente en el canal oficial.';

  videosById.set(INITIAL_VIDEO_ID, {
    videoId: INITIAL_VIDEO_ID,
    url: INITIAL_VIDEO_URL,
    date,
    title,
    summary
  });
}

async function main() {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });

  const channelId = await resolveChannelId();
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const rssXml = await fetchText(rssUrl);
  const parsedEntries = parseRssEntries(rssXml);

  const existingIndex = await readExistingVideoFiles();
  const videosById = new Map(parsedEntries.map((video) => [video.videoId, video]));

  await ensureInitialVideo(videosById, existingIndex);

  for (const [videoId, existing] of existingIndex.entries()) {
    if (!videosById.has(videoId) && existing.frontmatter.date && existing.frontmatter.url && existing.frontmatter.title) {
      videosById.set(videoId, {
        videoId,
        title: existing.frontmatter.title,
        url: existing.frontmatter.url,
        date: existing.frontmatter.date,
        summary: existing.frontmatter.summary || 'Resumen no disponible.'
      });
    }
  }

  const videos = Array.from(videosById.values()).sort((a, b) => b.date.localeCompare(a.date));

  for (const video of videos) {
    await upsertVideoFile(video, existingIndex);
  }

  console.log(`Imported ${videos.length} video entries from channel ${channelId}.`);
}

main().catch((error) => {
  console.error(`import-youtube-rss failed: ${error.message}`);
  process.exitCode = 1;
});
