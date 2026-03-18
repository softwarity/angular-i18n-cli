# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@softwarity/angular-i18n-cli` — A CLI tool to manage Angular 19+ i18n configuration in `angular.json`. Published to npm as the `angular-i18n` command.

## Build & Run

```bash
npm run build        # Compile TypeScript (tsc) → dist/
npm start            # Run CLI: node dist/index.js
```

No test framework is configured. No linter is configured.

## Architecture

The entire CLI lives in two source files:

- **`src/index.ts`** — Entry point with three Commander.js commands:
  - `init` — Sets up i18n config block, source locale, and extract-i18n in `angular.json`
  - `add` — Adds a locale (validates via `Intl.DisplayNames`), creates build config and translation file entry
  - `remove` — Removes a locale and its associated build config
- **`src/models.d.ts`** — TypeScript interfaces for `PackageJson` and `AngularConfig`

Each command supports both interactive (inquirer prompts) and non-interactive mode (CLI options: `--source-locale`, `--locale`, `--project`).

Each command reads/writes the host project's `angular.json` and `package.json` from `process.cwd()`.

- **`demo/index.html`** — Static demo/documentation page (same theme as other Softwarity projects). Uses `<softwarity-projects>` web component. Deployed to GitHub Pages.

## Key Dependencies

- `commander` — CLI framework (commands, options, parsing)
- `inquirer` — Interactive prompts (locale input, project selection)
- `chalk` — Colored terminal output

## CI/CD (GitHub Actions)

- **main.yml** — Builds on every push
- **release.yml** — Manual dispatch: `npm version patch` + push tag
- **tag.yml** — On tag push: build + `npm publish`
- **deploy-demo.yml** — Deploys `demo/` to GitHub Pages on push to main

## Conventions

- Target: ES2020, CommonJS module output
- TypeScript strict mode enabled
- Node >=18 required
- `.npmrc` has `ignore-scripts=true`
