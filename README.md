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
- **Scalable resources model**: data-driven rendering from `assets/js/resources.js`

## Design system

The portal uses custom brand tokens in `assets/css/tokens.css`:

- Slate `#1c2333`
- Signal Blue `#2563eb`
- Spark Amber `#f59e0b` (controlled accent)
- Ivory `#f8f7f4`
- Blue 10 `#dbeafe`
- Muted `#6b7280`

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
      resources.js
      search.js
      navigation.js
      main.js
    images/
```

## Local development

1. Clone the repository.
2. Open `index.html` directly, or serve locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

1. Go to **Settings > Pages**.
2. Select deployment from branch.
3. Choose the main branch and root folder (`/`).
4. Save.

## How to add a new resource

Edit `assets/js/resources.js` and add a new object:

```js
{
  title: "",
  description: "",
  category: "",
  technologies: [],
  repository: "",
  documentation: "",
  release: "",
  stars: "--",
  updated: "--",
  featured: false
}
```

The card renders automatically in resources and home sections.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
