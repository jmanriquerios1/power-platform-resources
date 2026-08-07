# Contributing

Thanks for contributing to this Power Platform community portal.

## Workflow

1. Fork the repository.
2. Create a focused branch.
3. Make small, isolated changes.
4. Keep brand tokens and accessibility rules intact.
5. Open a pull request with clear context.

## Content quality

- Use practical, technical language.
- Prefer implementation-ready examples.
- Keep descriptions short and specific.

## Resource additions

Do not add or edit hardcoded resource definitions in JavaScript or HTML.
Publish resources by adding a direct subfolder under one of these top-level directories: `pcf/`, `code-apps/`, `power-pages-spa/`, `plugins/`, or `components/`.
Include a `README.md` in the resource folder and optionally a preview image.
Then push your change and let the catalog workflow regenerate `assets/data/resources.json`.
