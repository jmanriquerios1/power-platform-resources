# Ingesta de contenido para Home (Blog + Videos)

Esta carpeta almacena el contenido persistente que se renderiza en la página principal.

## Estructura

```text
resources/content/
├── blog/
│   └── YYYY-MM-DD-slug.md
├── videos/
│   └── YYYY-MM-DD-videoId.md
└── index.json
```

## Formato de cada archivo `.md`

Todos los archivos deben contener frontmatter con estas claves obligatorias:

```md
---
title: "Título visible"
url: "https://..."
date: "YYYY-MM-DD"
summary: "Resumen breve"
---
```

Reglas:
- `url` debe ser `http` o `https`.
- `date` debe ser una fecha válida en formato `YYYY-MM-DD`.
- `title`, `url`, `date`, `summary` son obligatorios.

## Flujo

1. **Blog (LinkedIn u otras fuentes):** agregar manualmente un `.md` por artículo en `resources/content/blog/`.
2. **Videos (YouTube):** ejecutar `node scripts/import-youtube-rss.js` para crear/actualizar entradas en `resources/content/videos/`.
3. **Índice:** ejecutar `node scripts/build-content-index.js` para regenerar `resources/content/index.json`.
4. **Home:** `index.html` consume `resources/content/index.json` y muestra resultados ordenados por fecha.

## Backfill completo y actualización incremental de YouTube

El importador de YouTube ahora usa una estrategia por niveles para cubrir el histórico completo y seguir actualizando automáticamente:

1. **YouTube Data API v3 (preferido):** si existe el secret `YOUTUBE_API_KEY`, consulta el canal y pagina toda la playlist de uploads (`channels.list` + `playlistItems.list`) para backfill completo.
2. **`yt-dlp` (fallback principal):** si no hay API key o la API falla, usa `yt-dlp` para enumerar videos públicos del canal en formato JSON automatizable.
3. **RSS de YouTube (fallback final):** si lo anterior falla, usa RSS para rescatar publicaciones recientes.

Reglas de persistencia:
- deduplicación por `videoId`;
- no se eliminan videos históricos por salir del RSS reciente;
- se actualizan metadatos (título, URL canónica, fecha, resumen) cuando aparece mejor información;
- un archivo Markdown por video en `resources/content/videos/`.

## Automatización CI (cada 12 horas)

El workflow `.github/workflows/build-content-index.yml`:
- sincroniza videos con la estrategia completa (API key opcional + fallbacks),
- reconstruye `index.json`,
- hace commit solo si hay cambios.

Frecuencia:
- ejecución programada cada 12 horas (`cron: 0 */12 * * *`);
- también puede ejecutarse manualmente (`workflow_dispatch`).

## Secret opcional `YOUTUBE_API_KEY`

- Si se configura el secret `YOUTUBE_API_KEY`, el workflow intenta primero el backfill completo por API.
- Si no está definido, el workflow sigue funcionando con `yt-dlp` y RSS.
- El secret se inyecta por `env` en GitHub Actions y no se escribe en archivos del repositorio.

## Ejecución manual local

```bash
node scripts/import-youtube-rss.js
node scripts/build-content-index.js
```

## Limitaciones conocidas

- LinkedIn no ofrece un feed público estable equivalente al RSS de YouTube para ingesta automática sin autenticación.
- En entornos sin conectividad externa, la sincronización puede no completar el backfill; en ese caso el workflow programado seguirá intentando y completará la carga cuando la conectividad esté disponible.
