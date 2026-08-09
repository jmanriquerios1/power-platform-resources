#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT_DIR = process.cwd();
const VIDEOS_DIR = path.join(ROOT_DIR, 'resources', 'content', 'videos');

const DEFAULT_YOUTUBE_HANDLE = '@JonathanManriqueRios';
const YOUTUBE_WATCH_URL = 'https://www.youtube.com/watch?v=';
const CHANNEL_ID_REGEX = /^UC[0-9A-Za-z_-]{22}$/;

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }

  const date = new Date(raw);
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

function extractVideoIdFromUrl(urlValue) {
  if (!urlValue) {
    return null;
  }

  try {
    const parsed = new URL(urlValue);
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

function normalizeSummary(value) {
  const summary = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  return summary || 'Sin resumen disponible.';
}

function normalizeTitle(value, videoId) {
  const title = String(value || '').replace(/\s+/g, ' ').trim();
  return title || `Video ${videoId}`;
}

function toCanonicalVideoUrl(videoId, fallbackUrl) {
  if (videoId) {
    return `${YOUTUBE_WATCH_URL}${videoId}`;
  }

  return fallbackUrl || null;
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
    const videoId = extractVideoIdFromUrl(frontmatter?.url) || videoIdFromName;

    if (!videoId) {
      continue;
    }

    byVideoId.set(videoId, {
      videoId,
      title: frontmatter?.title || null,
      url: frontmatter?.url || null,
      date: toIsoDate(frontmatter?.date),
      summary: frontmatter?.summary || null,
      fileName,
      filePath
    });
  }

  return byVideoId;
}

async function fetchText(url) {
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'power-platform-resources-content-bot/1.0',
        Accept: 'application/json,application/xml,text/xml,text/html,application/xhtml+xml,*/*'
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

async function fetchJson(url) {
  const text = await fetchText(url);

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON response for ${url}: ${error.message}`);
  }
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

async function resolveChannelIdByHandle(handle) {
  const handleUrl = `https://www.youtube.com/${handle}`;
  const handlePage = await fetchText(handleUrl);
  const resolved = extractChannelIdFromText(handlePage);
  if (!resolved) {
    throw new Error(`Could not resolve channel ID from ${handleUrl}. Set YT_CHANNEL_ID explicitly.`);
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

    const date = toIsoDate(extractTagValue(entryXml, 'published') || extractTagValue(entryXml, 'updated'));
    if (!date) {
      continue;
    }

    entries.push({
      videoId,
      title: normalizeTitle(extractTagValue(entryXml, 'title'), videoId),
      url: toCanonicalVideoUrl(videoId, extractLinkHref(entryXml)),
      date,
      summary: normalizeSummary(
        extractTagValue(entryXml, 'media:description') ||
          extractTagValue(entryXml, 'summary') ||
          'Sin resumen disponible en el feed RSS público de YouTube.'
      )
    });
  }

  return entries;
}

function parseYtDlpOutput(stdout) {
  const videos = [];
  const lines = stdout.split(/\r?\n/).filter(Boolean);

  for (const line of lines) {
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    const videoId = parsed.id;
    if (!videoId || !/^[0-9A-Za-z_-]{11}$/.test(videoId)) {
      continue;
    }

    const title = String(parsed.title || '').trim();
    if (title === 'Private video' || title === 'Deleted video') {
      continue;
    }

    const date = toIsoDate(parsed.upload_date || parsed.release_date || parsed.timestamp || parsed.release_timestamp);
    if (!date) {
      continue;
    }

    videos.push({
      videoId,
      title: normalizeTitle(parsed.title, videoId),
      url: toCanonicalVideoUrl(videoId, parsed.webpage_url || parsed.url),
      date,
      summary: normalizeSummary(parsed.description)
    });
  }

  return videos;
}

async function fetchVideosFromYtDlp(channelVideosUrl) {
  return new Promise((resolve, reject) => {
    const args = [
      '--skip-download',
      '--ignore-errors',
      '--no-warnings',
      '--dump-json',
      channelVideosUrl
    ];

    const child = spawn('yt-dlp', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`Unable to execute yt-dlp: ${error.message}`));
    });

    child.on('close', (code) => {
      const videos = parseYtDlpOutput(stdout);

      if (videos.length > 0) {
        resolve(videos);
        return;
      }

      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}. ${stderr.trim()}`));
        return;
      }

      reject(new Error('yt-dlp returned no videos.'));
    });
  });
}

async function fetchVideosFromYoutubeApi({ apiKey, channelHandle, explicitChannelId }) {
  const cleanHandle = String(channelHandle || DEFAULT_YOUTUBE_HANDLE).replace(/^@/, '');

  let channelData = null;

  if (explicitChannelId && CHANNEL_ID_REGEX.test(explicitChannelId)) {
    const byIdUrl = `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&id=${encodeURIComponent(
      explicitChannelId
    )}&key=${encodeURIComponent(apiKey)}`;
    const byIdResponse = await fetchJson(byIdUrl);
    channelData = byIdResponse.items?.[0] || null;
  }

  if (!channelData) {
    const byHandleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id,contentDetails&forHandle=${encodeURIComponent(
      cleanHandle
    )}&key=${encodeURIComponent(apiKey)}`;
    const byHandleResponse = await fetchJson(byHandleUrl);
    channelData = byHandleResponse.items?.[0] || null;
  }

  if (!channelData?.contentDetails?.relatedPlaylists?.uploads) {
    throw new Error('YouTube API did not return an uploads playlist for the channel.');
  }

  const uploadsPlaylistId = channelData.contentDetails.relatedPlaylists.uploads;
  const channelId = channelData.id;
  const videos = [];
  let pageToken = null;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,status',
      playlistId: uploadsPlaylistId,
      maxResults: '50',
      key: apiKey
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`;
    const response = await fetchJson(url);

    for (const item of response.items || []) {
      const videoId = item?.contentDetails?.videoId;
      if (!videoId) {
        continue;
      }

      const title = String(item?.snippet?.title || '').trim();
      if (item?.status?.privacyStatus && item.status.privacyStatus !== 'public') {
        continue;
      }
      if (title === 'Private video' || title === 'Deleted video') {
        continue;
      }

      const date = toIsoDate(item?.snippet?.publishedAt || item?.contentDetails?.videoPublishedAt);
      if (!date) {
        continue;
      }

      videos.push({
        videoId,
        title: normalizeTitle(title, videoId),
        url: toCanonicalVideoUrl(videoId, item?.snippet?.resourceId?.videoId),
        date,
        summary: normalizeSummary(item?.snippet?.description)
      });
    }

    pageToken = response.nextPageToken || null;
  } while (pageToken);

  if (videos.length === 0) {
    throw new Error('YouTube API returned zero public videos for the uploads playlist.');
  }

  return { videos, channelId };
}

async function fetchVideosFromRss({ channelHandle, explicitChannelId }) {
  let channelId = explicitChannelId?.trim() || null;

  if (channelId && !CHANNEL_ID_REGEX.test(channelId)) {
    throw new Error(`YT_CHANNEL_ID is invalid: ${channelId}`);
  }

  if (!channelId) {
    channelId = await resolveChannelIdByHandle(channelHandle);
  }

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const rssXml = await fetchText(rssUrl);
  const videos = parseRssEntries(rssXml);

  if (videos.length === 0) {
    throw new Error('RSS feed returned zero videos.');
  }

  return { videos, channelId };
}

function mergeVideoEntries(existingMap, candidates) {
  const merged = new Map();

  for (const [videoId, existing] of existingMap.entries()) {
    merged.set(videoId, {
      videoId,
      title: normalizeTitle(existing.title, videoId),
      url: toCanonicalVideoUrl(videoId, existing.url),
      date: toIsoDate(existing.date),
      summary: normalizeSummary(existing.summary)
    });
  }

  for (const candidate of candidates) {
    if (!candidate?.videoId) {
      continue;
    }

    const previous = merged.get(candidate.videoId) || { videoId: candidate.videoId };
    merged.set(candidate.videoId, {
      videoId: candidate.videoId,
      title: normalizeTitle(candidate.title || previous.title, candidate.videoId),
      url: toCanonicalVideoUrl(candidate.videoId, candidate.url || previous.url),
      date: toIsoDate(candidate.date) || toIsoDate(previous.date),
      summary: normalizeSummary(candidate.summary || previous.summary)
    });
  }

  return merged;
}

function buildMarkdown({ title, url, date, summary, videoId }) {
  return `---\ntitle: "${escapeFrontmatterString(title)}"\nurl: "${escapeFrontmatterString(url)}"\ndate: "${escapeFrontmatterString(
    date
  )}"\nsummary: "${escapeFrontmatterString(summary)}"\n---\n\nVideo ID: ${videoId}\n`;
}

async function upsertVideoFile(video, existingIndex) {
  const expectedFileName = `${video.date}-${video.videoId}.md`;
  const expectedPath = path.join(VIDEOS_DIR, expectedFileName);
  const existing = existingIndex.get(video.videoId);

  const markdown = buildMarkdown(video);
  await fs.writeFile(expectedPath, markdown, 'utf8');

  if (existing?.fileName && existing.fileName !== expectedFileName) {
    await fs.unlink(existing.filePath).catch(() => {});
  }
}

async function importVideos() {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });

  const apiKey = process.env.YOUTUBE_API_KEY?.trim() || '';
  const channelHandle = process.env.YT_CHANNEL_HANDLE?.trim() || DEFAULT_YOUTUBE_HANDLE;
  const explicitChannelId = process.env.YT_CHANNEL_ID?.trim() || '';
  const channelVideosUrl = `https://www.youtube.com/${channelHandle}/videos`;

  const existingIndex = await readExistingVideoFiles();

  let channelId = explicitChannelId || null;
  let source = null;
  let fetchedVideos = [];
  const errors = [];

  if (apiKey) {
    try {
      const apiResult = await fetchVideosFromYoutubeApi({ apiKey, channelHandle, explicitChannelId });
      fetchedVideos = apiResult.videos;
      channelId = apiResult.channelId;
      source = 'youtube-api';
    } catch (error) {
      errors.push(`YouTube API failed: ${error.message}`);
    }
  }

  if (!fetchedVideos.length) {
    try {
      fetchedVideos = await fetchVideosFromYtDlp(channelVideosUrl);
      source = 'yt-dlp';
    } catch (error) {
      errors.push(`yt-dlp failed: ${error.message}`);
    }
  }

  if (!fetchedVideos.length) {
    try {
      const rssResult = await fetchVideosFromRss({ channelHandle, explicitChannelId });
      fetchedVideos = rssResult.videos;
      channelId = rssResult.channelId;
      source = 'rss';
    } catch (error) {
      errors.push(`RSS failed: ${error.message}`);
    }
  }

  if (!fetchedVideos.length) {
    throw new Error(`Unable to fetch videos from any source. ${errors.join(' | ')}`);
  }

  const mergedById = mergeVideoEntries(existingIndex, fetchedVideos);
  const videos = Array.from(mergedById.values())
    .filter((video) => video.date && video.url)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.videoId.localeCompare(b.videoId);
    });

  for (const video of videos) {
    await upsertVideoFile(video, existingIndex);
  }

  return {
    source,
    channelId,
    importedCount: fetchedVideos.length,
    totalStored: videos.length,
    fallbackErrors: errors
  };
}

async function main() {
  const result = await importVideos();
  const channelInfo = result.channelId ? `channel ${result.channelId}` : 'configured handle';
  console.log(
    `Imported ${result.importedCount} videos via ${result.source} (${channelInfo}). Total stored videos: ${result.totalStored}.`
  );

  if (result.fallbackErrors.length) {
    console.log(`Fallback diagnostics: ${result.fallbackErrors.join(' | ')}`);
  }
}

module.exports = {
  toIsoDate,
  parseRssEntries,
  parseYtDlpOutput,
  mergeVideoEntries,
  extractVideoIdFromUrl,
  importVideos
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`import-youtube-rss failed: ${error.message}`);
    process.exitCode = 1;
  });
}
