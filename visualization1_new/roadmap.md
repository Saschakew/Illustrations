# Migration Roadmap: visualization1_new

Purpose
- Create `visualization1_new/` using the modern structure, UX, and modular JS of `visualization4` while porting the content and features of `visualization1`.
- This document is a guide for developers to execute the migration safely and systematically. No code changes should be performed until vetted against this roadmap.

Source inventories (ground truth)
- visualization4 files:
  - HTML: `index.html`, `page2.html`, `page3.html`, `page4.html`
  - JS: `index.js`, `loader.js`, `charts.js`, `dataGeneration.js`, `eventListeners.js`, `htmlout.js`, `page2.js`, `page3.js`, `page4.js`, `svar.js`, `ui.js`, `variables.js`
  - CSS: `styles.css`
- visualization1 files:
  - HTML: `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`
  - JS: `main.js`
  - CSS: `styles.css`

High-level approach
1) Use `visualization4` as the base skeleton for `visualization1_new`.
2) Port `visualization1` page content and functionality into the `visualization4` structure and code patterns.
3) Maintain `visualization4` UX (loading overlay, sticky inputs, modular JS, accessibility, SEO) while achieving feature parity with `visualization1`.

Directory scaffold (target)
- visualization1_new/
  - index.html, page2.html, page3.html, page4.html, page5.html, page6.html
  - styles.css
  - index.js, loader.js, charts.js, dataGeneration.js, eventListeners.js, htmlout.js, page2.js, page3.js, page4.js, page5.js, page6.js, svar.js, ui.js, variables.js

Prerequisites
- Confirm Chart.js and MathJax versions currently used in `visualization4/index.html` remain compatible.
- Decide any branding/theme tokens for `styles.css` (colors, spacing) before content migration.

Step-by-step migration plan
1) Initialize new folder
- Create `visualization1_new/`.
- Copy the entire `visualization4/` contents as a starting point.
- Add placeholders for `page5.html`, `page6.html`, `page5.js`, `page6.js` following the `pageN` pattern in `visualization4`.

2) Update metadata and global layout
- In `visualization1_new/index.html`:
  - Set page `<title>`, meta description, and schema.org JSON-LD to match the Non-Gaussian SVAR focus of `visualization1`.
  - Keep MathJax config and script includes as in `visualization4`.
  - Retain the loading overlay structure (`loader.js`) and accessibility features (skip links, ARIA labels).
- Mirror navigation across `index.html` and `page2-6.html`, ensuring link destinations use the new pages.

3) Content porting (HTML)
- For each page in `visualization1` (`index/page2/page3/page4/page5/page6`):
  - Copy textual content, math expressions, and semantic structure into the corresponding `visualization1_new` page.
  - Map older containers to the newer structure: use `visualization4`’s input panels, chart containers, and info sections for a consistent UI.
  - Ensure MathJax expressions render within the new structure.
- If a `visualization1` page has no counterpart in `visualization4` (e.g., page5, page6), start from a copy of `visualization1_new/page4.html` and adapt sections and anchors.

4) Style strategy (CSS)
- Start with `visualization4/styles.css` as the base.
- Integrate any distinct `visualization1` visual cues as CSS variables and utility classes rather than inline or page-specific overrides.
- Maintain responsive layout, sticky controls, and accessible contrast.

5) JavaScript migration (from main.js to modules)
- Inventory features in `visualization1/main.js`:
  - Input control handling (sliders, toggles, buttons)
  - Data generation/transforms for SVAR
  - Chart creation/updates
  - Page-specific behavior
- Decompose and place into `visualization1_new` modules:
  - variables.js: default parameters, constants, state objects
  - dataGeneration.js: epsilon/u generation, random seeds, time-varying volatility, normalization
  - svar.js: math utilities, decompositions, rotations, covariance, matrix ops used across pages
  - charts.js: create/update Chart.js instances for each canvas; expose init/update APIs
  - eventListeners.js: wire all UI events to state updates and chart refreshes; central place for DOM events
  - ui.js: DOM helpers, dynamic UI widgets (menus, sticky inputs, accessibility hooks)
  - index.js: orchestrator; ordered script loading if needed, app initialization, MathJax typeset triggers
  - pageN.js: per-page initializers for page2–page6, delegating to shared modules
- Port logic incrementally:
  - Extract pure functions from `main.js` first (math/data), write unit-like ad-hoc tests in console where possible.
  - Then move UI wiring and chart code, aligning with `visualization4`’s initialization sequence (`index.js` bootstraps variables → data → charts → listeners → typeset).

6) Script loading, cache busting, and ordering
- Replicate `visualization4/index.html` script order and defers.
- Keep cache-busting query params used by `visualization4` (e.g., `?v=`) to prevent stale asset caching during iteration.

7) Navigation and page lifecycle
- Follow `visualization4` pattern for pageN-specific scripts (`page2.js`, `page3.js`, etc.).
- Each `pageN.js` should export an initializer called by `index.js` when that page is loaded.

8) MathJax and dynamic updates
- After charts and content are injected or updated, call MathJax typesetting as done in `visualization4/index.js` to avoid unrendered math.

9) Accessibility and SEO checklist
- Preserve skip links, headings structure, ARIA labels/roles.
- Revisit meta tags and JSON-LD for each page’s purpose.
- Ensure focus management when opening menus/dialogs.

10) Testing and validation
- Functional parity: compare each interactive control and chart output between `visualization1` and `visualization1_new`.
- Visual QA: layout consistency, responsive breakpoints, sticky input behavior.
- Performance: confirm loading overlay hides only when initialization complete; inspect layout thrashing and reflow hotspots.
- Cross-page: verify nav links, back/forward browser behavior, and per-page script initializers.

11) Rollout plan
- Branching: create a feature branch `feat/visualization1_new`.
- Commit in small, reviewable increments: scaffold → content pages → data pipeline → charts → interactions → page5/6.
- Add a short `README.md` in `visualization1_new/` describing structure and commands.

File-by-file mapping guide
- visualization1/index.html → visualization1_new/index.html (content moved into modern layout; keep new head/meta; use new containers and IDs)
- visualization1/page2.html → visualization1_new/page2.html (same mapping approach)
- visualization1/page3.html → visualization1_new/page3.html
- visualization1/page4.html → visualization1_new/page4.html
- visualization1/page5.html → visualization1_new/page5.html (new in base; follow page4 pattern)
- visualization1/page6.html → visualization1_new/page6.html (new in base; follow page4 pattern)
- visualization1/styles.css → visualization1_new/styles.css (use as reference only; selectively merge into variables and components)
- visualization1/main.js → split across visualization1_new modules as described in Step 5

Definition of Done (DoD)
- All six pages exist with correct navigation, content, and MathJax rendering.
- Feature parity with `visualization1`: controls, data pipeline, and charts behave identically or better.
- Modular JS matches `visualization4` patterns and passes basic linting.
- Loading overlay, accessibility elements, and SEO meta present and correct.
- Manual QA across Chrome/Firefox/Edge and narrow/wide viewports.

Known risks and mitigations
- Behavioral drift during refactor → Migrate logic with small diffs; add temporary console assertions and visual checks.
- Inconsistent IDs/selectors → Consolidate selectors in `ui.js` and `eventListeners.js`; document data-attributes.
- MathJax timing issues → Typeset after UI and charts initialization; queue re-typesets on content changes.

Work breakdown (suggested)
- Developer A: Scaffold, pages, and content port (HTML/CSS)
- Developer B: Data generation and math modules (`dataGeneration.js`, `svar.js`)
- Developer C: Charts and interactions (`charts.js`, `eventListeners.js`, `pageN.js`)
- Shared: Final polish, accessibility/SEO, performance passes

Next Developer Start Here
1) Quick start
 - Open `visualization1_new/index.html` with a static server (e.g., VS Code Live Server). No build step is required.
 - Confirm CDN libs load: Chart.js 3.7.1 and MathJax v3. Ensure the loader fades and MathJax typesets.

2) Verify scaffolding
 - Pages present: `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`.
 - Scripts present: `index.js`, `page2.js`, `page3.js`, `page4.js`, `page5.js`, `page6.js`, plus shared modules (`variables.js`, `ui.js`, `charts.js`, `dataGeneration.js`, `htmlout.js`, `svar.js`, `eventListeners.js`, `loader.js`).
 - Navigation: add links for `page5`/`page6` across all pages to mirror `index.html`/`page4.html` nav.

3) Content migration
 - Copy content from `visualization1/index.html … page6.html` into corresponding pages here.
 - Map legacy IDs/sections to modern containers: input panels (`.input-container`), `.text-container`, chart canvases.
 - Paste equations verbatim; verify MathJax rendering; avoid inline styles.

4) JavaScript modularization
 - Decompose `visualization1/main.js`:
   - `variables.js`: defaults/state
   - `dataGeneration.js`: epsilon/u generation, normalization
   - `svar.js`: rotations, matrices, covariance
   - `charts.js`: Chart.js config/update helpers
   - `eventListeners.js`: slider/button handlers
   - `pageN.js`: page-specific bootstraps and calls into shared modules
 - Keep script load order per `visualization1_new/index.js` and cache-busting.

5) Styling
 - Keep `styles.css` theme as-is. If needed, add brand tokens as CSS variables.
 - Prefer utility classes over large overrides.

6) Testing protocol
 - Functional: sliders update charts; buttons work; estimators return values; no console errors.
 - Visual: layout matches `visualization4` pattern; responsive; sticky inputs stable.
 - MathJax: fully typeset after updates; no raw TeX remains.
 - Accessibility/SEO: skip link works; ARIA labels; meta/JSON-LD present.
 - Cross-browser: Chrome/Firefox/Edge.

7) Git workflow
 - Branch: `feat/visualization1_new`
 - Commit in small increments: page-by-page and module-by-module.

8) Definition of done
 - Six pages complete, feature parity with `visualization1`, modular JS aligned with `visualization4`, QA passed.
