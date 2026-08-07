# Jonathan Manrique Ríos Developer Portal

Open-source Power Platform portal for developers, consultants and architects.

**Connector de ideas.**

## Purpose

This repository hosts the GitHub Pages portal and the resource source folders used to generate the catalog automatically.

It is the central entry point for:

- documentation
- tutorials
- architecture references
- speaking resources

## Architecture

- **Static site**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: GitHub Pages
- **Scalable resources model**: data-driven rendering from `assets/data/resources.json`

## Design system

The portal uses custom brand tokens in `assets/css/tokens.css`:

- Ink scale (`--ink-900`, `--ink-800`, `--ink-700`)
- Gray scale (`--gray-50`, `--gray-200`, `--gray-400`, `--gray-500`)
- Brand blue (`--brand-blue-600`, `--brand-blue-700`, `--brand-blue-100`)
- Accent gold (`--accent-gold-600`, `--accent-gold-100`)
- Semantic (`--success-600`, `--danger-600`)

Typography:

- Space Grotesk (headings)
- Inter (body)
- Space Mono (eyebrows / metadata)

## Project structure

```text
/
  index.html
  404.html
  robots.txt
  sitemap.xml
  README.md
  LICENSE
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  scripts/
    generate-resources-json.mjs
  .github/
    workflows/
      generate-resources-catalog.yml

  resources/
  pcf/
  code-apps/
  power-pages-spa/
  plugins/
  components/
  tutorials/
  architecture/
  speaking/
  about/

  assets/
    css/
      tokens.css
      base.css
      components.css
      layout.css
      responsive.css
    js/
      catalog.js
      search.js
      navigation.js
      main.js
    data/
      resources.json
    images/
```

## Local development

1. Clone the repository.
2. Serve the site locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

1. Go to **Settings > Pages**.
2. Select deployment from branch.
3. Choose the main branch and root folder (`/`).
4. Save.

## Publishing workflow

No manual JavaScript or HTML edits are required to publish a new resource.

1. Copy your resource folder into one of these top-level folders:
   - `pcf/` → PCF Controls
   - `code-apps/` → Code Apps
   - `power-pages-spa/` → Power Pages SPA
   - `plugins/` → Dataverse Plugins
   - `components/` → Power Platform Components
2. Ensure the resource folder includes `README.md` (title/description are parsed from it when possible).
3. Optionally add a preview image file in the same folder (for example `preview.png`).
4. Commit and push to `main`.
5. GitHub Actions regenerates `assets/data/resources.json` automatically.

The workflow scans those local folders, detects direct subfolders as resources, regenerates `assets/data/resources.json`, and the portal pages render directly from that generated catalog.

## Catalog generation

Run the generator locally:

```bash
node scripts/generate-resources-json.mjs
```

The generated catalog is written to `assets/data/resources.json`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
