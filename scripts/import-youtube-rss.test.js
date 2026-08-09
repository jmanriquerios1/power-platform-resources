const test = require('node:test');
const assert = require('node:assert/strict');

const {
  toIsoDate,
  parseRssEntries,
  parseYtDlpOutput,
  mergeVideoEntries,
  extractVideoIdFromUrl
} = require('./import-youtube-rss.js');

test('toIsoDate supports multiple input formats', () => {
  assert.equal(toIsoDate('20260809'), '2026-08-09');
  assert.equal(toIsoDate('2026-08-09T12:00:00Z'), '2026-08-09');
  assert.equal(toIsoDate('invalid-date'), null);
});

test('extractVideoIdFromUrl gets canonical v parameter', () => {
  assert.equal(extractVideoIdFromUrl('https://www.youtube.com/watch?v=85mk7yqPMuU'), '85mk7yqPMuU');
  assert.equal(extractVideoIdFromUrl('https://www.youtube.com/shorts/85mk7yqPMuU'), null);
});

test('parseRssEntries parses and normalizes entries', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <feed>
    <entry>
      <yt:videoId>abc123DEF45</yt:videoId>
      <title>Título de prueba</title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=abc123DEF45"/>
      <published>2026-08-01T10:00:00+00:00</published>
      <media:description>Descripción de prueba</media:description>
    </entry>
  </feed>`;

  const entries = parseRssEntries(xml);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0], {
    videoId: 'abc123DEF45',
    title: 'Título de prueba',
    url: 'https://www.youtube.com/watch?v=abc123DEF45',
    date: '2026-08-01',
    summary: 'Descripción de prueba'
  });
});

test('parseYtDlpOutput parses NDJSON and skips private entries', () => {
  const stdout = [
    JSON.stringify({
      id: 'abc123DEF45',
      title: 'Video público',
      webpage_url: 'https://www.youtube.com/watch?v=abc123DEF45',
      upload_date: '20260805',
      description: '  Resumen\ncon saltos  '
    }),
    JSON.stringify({
      id: 'zzz111yyy22',
      title: 'Private video',
      upload_date: '20260801'
    })
  ].join('\n');

  const entries = parseYtDlpOutput(stdout);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0], {
    videoId: 'abc123DEF45',
    title: 'Video público',
    url: 'https://www.youtube.com/watch?v=abc123DEF45',
    date: '2026-08-05',
    summary: 'Resumen con saltos'
  });
});

test('mergeVideoEntries preserves historical IDs and deduplicates by videoId', () => {
  const existing = new Map([
    [
      'abc123DEF45',
      {
        videoId: 'abc123DEF45',
        title: 'Viejo título',
        url: 'https://www.youtube.com/watch?v=abc123DEF45',
        date: '2026-07-01',
        summary: 'Viejo resumen'
      }
    ],
    [
      'old000OLD00',
      {
        videoId: 'old000OLD00',
        title: 'Histórico',
        url: 'https://www.youtube.com/watch?v=old000OLD00',
        date: '2026-06-01',
        summary: 'No debe borrarse'
      }
    ]
  ]);

  const merged = mergeVideoEntries(existing, [
    {
      videoId: 'abc123DEF45',
      title: 'Título nuevo',
      url: 'https://www.youtube.com/watch?v=abc123DEF45',
      date: '2026-08-01',
      summary: 'Resumen nuevo'
    },
    {
      videoId: 'new111NEW11',
      title: 'Video nuevo',
      url: 'https://www.youtube.com/watch?v=new111NEW11',
      date: '2026-08-02',
      summary: 'Resumen nuevo 2'
    }
  ]);

  assert.equal(merged.size, 3);
  assert.equal(merged.get('abc123DEF45').title, 'Título nuevo');
  assert.equal(merged.get('abc123DEF45').date, '2026-08-01');
  assert.equal(merged.get('old000OLD00').summary, 'No debe borrarse');
  assert.equal(merged.get('new111NEW11').title, 'Video nuevo');
});
