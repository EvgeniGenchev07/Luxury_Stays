# Luxury Stays — How to run

This project is a static website built with Gulp. It renders Nunjucks templates (for EN and BG), minifies HTML/CSS/JS, and hashes assets for cache busting.

## Prerequisites
- Node.js 18+ and npm
- PowerShell or any terminal

## Install dependencies

```powershell
npm install
```

If you prefer reproducible installs:
```powershell
npm ci
```

## Build the site
This compiles templates, minifies assets, hashes CSS/JS and updates references.

```powershell
npm run build
```

The production-ready files will be in `dist/`:
- `dist/en` — English pages
- `dist/bg` — Bulgarian pages
- `dist/js`, `dist/css`, `dist/images` — assets

## Preview locally
Serve the built site from `dist/` on http://localhost:8080

```powershell
npm run serve
```

Then open, for example:
- http://localhost:8080/en/index.html
- http://localhost:8080/bg/index.html

Tip: If you want root-level language prefixes (without file names), configure your local server’s rewrite rules accordingly. The repo includes Firebase Hosting config for deployment.

## Useful Gulp/NPM scripts
- `npm run build` — Full production build (default).
- `npm run base` — Quick build: render, HTML and CSS tasks (no JS hashing pipeline).
- `npm run images` — Copy images to `dist/images`.
- `npm run hash` — Re-run only the asset hashing + HTML reference update.

You can also call `gulp` tasks directly:
```powershell
npx gulp build
npx gulp base
npx gulp images
npx gulp hash
```

## Notes
- Templates live in `source/templates` (layouts, partials, pages, data per language).
- Rendered HTML is emitted to `source/en` and `source/bg` before minification. Do not edit generated files manually; edit the Nunjucks templates and language JSON instead.
- PurgeCSS runs against both EN and BG HTML plus JS to keep CSS small.

## Optional: Deploy to Firebase Hosting
If you use Firebase, install the CLI and deploy `dist/` using the existing `firebase.json`:
```powershell
npm -g i firebase-tools
firebase login
firebase init # if not already configured
firebase deploy --only hosting
```

If you prefer to avoid global installs:
```powershell
npx firebase deploy --only hosting
```
