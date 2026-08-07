# Jonathan Manrique Ríos Developer Portal

Open-source Power Platform portal for developers, consultants and architects.

**Connector de ideas.**

## Purpose

This repository hosts the GitHub Pages portal that organizes public Power Platform resources across multiple repositories.

It is the central entry point for:

- repositories
- documentation
- releases
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

1. Create a GitHub repository under `jmanriquerios1`.
2. Add **exactly one** primary topic:
   - `pcf` → PCF Controls
   - `code-app` → Code Apps
   - `power-pages-spa` → Power Pages SPA
   - `dataverse-plugin` → Dataverse Plugins
   - `power-platform-component` → Power Platform Components
3. Add a repository description and any secondary technology topics you want to display.
4. Add a README.
5. Optionally publish a GitHub Release.
6. Wait for the scheduled workflow or run **Generate resource catalog** manually.

The workflow calls the GitHub API, filters repositories by those five primary topics, and regenerates `assets/data/resources.json`. The home page, resources index, and category pages render directly from that generated JSON catalog.

## Catalog generation

Run the generator locally with a GitHub token:

```bash
GITHUB_TOKEN=your_token_here node scripts/generate-resources-json.mjs
```

The generated catalog is written to `assets/data/resources.json`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
