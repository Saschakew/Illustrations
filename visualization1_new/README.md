# Create a New Research Guide (SVAR-style)

This repository hosts an interactive guide visualizing a research paper on SVAR models. Use this as a template to build new guides with similar structure, visuals, and UX.

## Quick Start
- Clone the repo and open the existing guide pages:
  - `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`
  - `index.js`, `page2.js`, `page3.js`, `page4.js`, `page5.js`, `page6.js`
  - Core scripts live at the project root (flat structure): `bootstrap.js`, `main.js`, `charts.js`, `variables.js`, `loader.js`, `ui.js`, `dataGeneration.js`, `eventListeners.js`, `htmlout.js`, `svar.js`
  - Preview locally using any static server (e.g., VS Code “Live Server” or `npx serve`).
  - Deploy via GitHub Pages or your static host.

## How to Create a New Guide
1. Duplicate an existing page pair
   - Copy `page4.html` → `page5.html`
   - Copy `page4.js` → `page5.js`
   - Update page title, headings, and content in `page5.html`.
   - Update any page-specific logic and data references in `page5.js`.

2. Wire up navigation
   - Add a new link to your nav section(s) in `index.html` (and any other page where nav appears).
   - Verify the grid uses the unified layout class (see Styling below).

3. Connect charts and data
   - If using shared components, import or dynamically load `charts.js` as needed.
   - Keep chart sizing consistent; for readability, the loss plot uses `aspectRatio: 1.8` in `charts.js`. Match that pattern for similarly dense plots.

4. Cache-busting (required for reliable updates)
   - In HTML: append a version query to local CSS/JS links, e.g. `?v=20250811-082303`.
   - Centralized: bump `ASSET_VERSION` once in `bootstrap.js`. Ensure each page includes `bootstrap.js?v=ASSET_VERSION` and its own page script `pageN.js?v=ASSET_VERSION`.
   - Keep the no-cache meta tags in each page (`index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`) for consistent behavior.

5. Content and pedagogy
   - Follow the “explain, then show” pattern:
     - Brief motivation and key formulas.
     - Visual intuition via charts/animations.
     - Interpretation and caveats.
   - Keep sections concise and scannable.

## Styling and UX Conventions
- Layout: use the normalized grid (e.g., `.container two`) for chart groups; avoid inline width styles.
- Modernized CSS:
  - Use the provided CSS variables (e.g., `--brand-grad-end`, `--radius`, `--brand-weak`, `--card-blur-bg`) for consistent theming.
  - Navigation uses a blurred background and clear hover/focus states; maintain `:focus-visible` accessibility.
  - Cards for text/formulas share consistent spacing, radius, and subtle shadows/blur.

## Local Preview
- Any static server works. Examples:
  - VS Code “Live Server” extension.
  - Node: `npx serve` (from repo root).
- After edits, bump the version query and `ASSET_VERSION` to see changes immediately.

## Deployment
- GitHub Pages: commit and push to your Pages branch as configured.
- Other hosts (Netlify, etc.): deploy the static files as-is.
- Post-deploy, hard-refresh if needed; versioning should prevent stale assets.

## Maintenance Checklist (per change)
- Update content and code in the new `pageX.html`/`pageX.js`.
- Add nav entry and verify links.
- Keep charts consistent with `charts.js` conventions (e.g., aspectRatio).
- Bump `ASSET_VERSION` in `bootstrap.js` and update the `?v=` query in HTML includes.
- Include the no-cache meta tags in every new HTML page.

## Project-specific notes: visualization1_new (Non-Gaussian SVAR)

- Pages present: `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`.
  - Navigation is mirrored across all pages; MathJax v3 verified per page.
- Modules map (flat files at project root):
  - `bootstrap.js` (ASSET_VERSION, loader helpers: `loadScriptsSequential`, `onMathJaxThenDOM`, `awaitFontsAndTypesetAndStabilize`, `finalizeWithLoaderFadeOut`)
  - `main.js` (core app logic and orchestration)
  - `charts.js` (Chart.js configuration and plotting helpers)
  - `dataGeneration.js` (data generation utilities)
  - `eventListeners.js` (event wiring and handlers)
  - `htmlout.js` (DOM/HTML output helpers)
  - `svar.js` (SVAR-specific utilities)
  - `ui.js` (menu/input UI interactions)
  - `variables.js` (globals/config/constants)
  - `index.js` + `page2–page6.js` (per-page initialization)
- Cache-busting: local CSS/JS links use `?v=`; bump per edit. `ASSET_VERSION` is centralized in `bootstrap.js`.
- Libraries: Chart.js 3.7.1 and MathJax v3 (tex-mml-chtml). Keep script order consistent with `index.html`.
- Index page scope: `index.html` stops after the assumptions section; no controls/plots. `index.js` is UI-only; head includes MathJax only (no Chart.js/mathjs).
- Loading overlay: section initializers must be `async` and await long tasks so the loader hides only after full init.
- UI rules: when adjusting inputs or menus, update `ui.js` and `eventListeners.js`; keep DOM IDs stable across pages.
- Style guide: use the CSS variables defined in `styles.css` (no raw hex codes).
- Quick testing checklist:
  - Controls update charts without console errors.
  - Layout responsive; sticky inputs stable.
  - MathJax typeset complete; no raw TeX.
  - Accessibility basics: skip link, ARIA labels present.
