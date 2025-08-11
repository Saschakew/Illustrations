# Create a New Research Guide (SVAR-style)

This repository hosts an interactive guide visualizing a research paper on SVAR models. Use this as a template to build new guides with similar structure, visuals, and UX.

## Quick Start
- Clone the repo and open the existing guide pages:
  - `index.html`, `page2.html`, `page3.html`, `page4.html`
  - `index.js`, `page2.js`, `page3.js`, `page4.js`
  - Shared charts/configs (e.g., `charts.js`)
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
   - In HTML: append a version query to local CSS/JS links, e.g. `?v=20250810-235816`.
   - In page scripts: update the `ASSET_VERSION` constant (present in `index.js`, `page2.js`, `page3.js`, `page4.js`) so dynamically loaded local scripts also carry the same version.
   - Keep the no-cache meta tags in each page (`index.html`, `page2.html`, `page3.html`, `page4.html`) for consistent behavior; replicate in new pages.

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
- Bump `ASSET_VERSION` in page scripts and the `?v=` query in HTML includes.
- Include the no-cache meta tags in every new HTML page.
