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

## Automatización CI

El workflow `.github/workflows/build-content-index.yml`:
- importa videos desde RSS,
- reconstruye `index.json`,
- hace commit solo si hay cambios.

## Limitaciones conocidas

- LinkedIn no ofrece un feed público estable equivalente al RSS de YouTube para ingesta automática sin autenticación.
- En entornos sin conectividad externa, la verificación automática de metadatos públicos puede no estar disponible; en ese caso se conservan metadatos neutrales y se recomienda validación manual posterior.
