# Jonathan Manrique Resources

Open-source Power Platform resources for developers, consultants and architects.

**Connector de ideas.**

## Purpose

This repository contains the source code for the **Jonathan Manrique Resources Portal**.

The portal centralizes reusable Microsoft Power Platform resources and serves as the main entry point for the community.

It provides access to:

- PCF Controls
- Code Apps
- Power Pages SPA
- Dataverse Plugins
- Power Platform Components
- Documentation
- Tutorials
- Architecture references
- Community resources

## Live Website

The portal is available at:

https://resources.bizzappshub.com

## Resource Categories

### PCF Controls

Reusable Power Apps Component Framework controls ready for production environments.

### Code Apps

Complete Code Apps samples, templates and reusable solutions.

### Power Pages SPA

Single Page Application implementations for Microsoft Power Pages.

### Dataverse Plugins

C# plugins, extension patterns and Dataverse business logic.

### Power Platform Components

Reusable components, libraries and utilities shared across Power Platform projects.

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages
- GitHub Actions

## Repository Structure

```
/
│
├── assets/
├── resources/
├── tutorials/
├── architecture/
├── speaking/
├── about/
├── scripts/
├── .github/
└── README.md
```

## Publishing a New Resource

Publishing a new resource is straightforward.

1. Create a new GitHub repository.
2. Add one primary topic:

- `pcf`
- `code-app`
- `power-pages-spa`
- `dataverse-plugin`
- `power-platform-component`

3. Add a repository description.
4. Create a README.
5. Optionally publish a GitHub Release.
6. Run the **Generate Resource Catalog** workflow.

The portal will automatically discover and publish the new resource.

## Workflow Configuration

The `generate-resources-catalog` workflow scans `resources/` inside this
repository, generates `assets/data/resources.json`, and commits it back to
`main`. All resource URLs point to `jmanriquerios1/power-platform-resources`
with the `resources/` prefix preserved.

The `deploy` workflow generates the catalog locally and deploys the site to
GitHub Pages without downloading files from any external repository.

## Local Development

Clone the repository:

```bash
git clone https://github.com/jmanriquerios1/power-platform-resources.git
```

Run a local web server:

```bash
python -m http.server 8000
```

Open:

```
http://localhost:8000
```

## GitHub Pages

Deployment is handled automatically through GitHub Pages.

The live portal is published from the **main** branch.

## Contributing

Contributions are welcome.

Please read **CONTRIBUTING.md** before opening a Pull Request.

## License

This project is licensed under the MIT License.

See **LICENSE** for more information.
