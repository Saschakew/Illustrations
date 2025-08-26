# Scatter Plot Unification — Progress & Plan

## Overview
Goal: Carefully analyze and unify the implementation, style, and DOM wrapping of all scatter plots across all pages in `visualization1_new/`. The final state should expose a single scatter plot creation API with consistent defaults, styling, and a standard wrapper/“card” container, while preserving required per-page behaviors.

## Scope
- Pages: `index.html` (if any scatter), `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`
- Scripts: `charts.js`, `htmlout.js`, `svar.js`, and each page script (`page2.js` … `page6.js`)
- Libraries: Chart.js (and any other plotting utilities in use on certain pages)
- Animations: Audit whether and how data-change animations are configured (duration, easing, disabled) for updates and resizes.
 - Explicitly out of scope: Loss plots (line/area loss function visualizations). Only true scatter plots are audited.

## Acceptance Criteria
- Single exported function to create/update scatter plots (e.g., `createOrUpdateScatter(elementId, series, options)` in `charts.js`)
- Centralized default style (colors, point radius, grid/axis styles, legend, tooltips)
- Standardized DOM wrapper (“chart card”) with title, caption, and responsive behavior (implemented via a helper in `htmlout.js`)
- Uniform resize/responsiveness behavior
- Consistent, intentional animation behavior on data updates (either unified defaults or explicitly disabled across pages)
- All existing scatter plots migrated to the unified function with no loss of functionality

## Inventory (to be filled during audit)
For each scatter plot found:
- Page/Section:
- DOM container id/class:
- Data source (e.g., ε vs ε, u vs u, e vs e):
- Current creation function:
- Library used (Chart.js, etc.):
- Options/styling now:
- Wrapper structure (title/legend/caption classes):
- Resize approach:
- Animation settings (enabled/disabled, duration/easing):
- Notes/diffs:

## Differences Checklist (to reconcile)
- [ ] Marker size/opacity
- [ ] Colors/legend labels
- [ ] Axes titles, tick formatting, ranges
- [ ] Gridlines
- [ ] Tooltips
- [ ] Reference/guide lines (e.g., “Reference Line”)
- [ ] Annotations
- [ ] Responsiveness (on load/resize)
- [ ] Wrapper structure (card layout, captions)
- [ ] Data update mechanism (regeneration hooks)
- [ ] Animations on data change (duration/easing/disabled)
 - [ ] Exclusion respected: Loss plots not audited

## Unification Plan
1. Central defaults in `charts.js`
   - `scatterDefaults`: colors, point radius, hover styles, axes/grid presets, legend/tooltips, aspect ratio
   - `createOrUpdateScatter(element, datasets, userOptions)` merges defaults + per-plot overrides
2. Standard wrapper in `htmlout.js`
   - `buildChartCard({ id, title, caption })` returns consistent DOM with container `<canvas>` and caption slot
3. Migration
   - Replace per-page scatter creation calls with the unified function
   - Remove duplicated style/config code from page scripts
   - Ensure resize handling is centralized or consistently invoked
4. Validation
   - Visual parity check per page
   - Confirm event hooks still trigger updates (new data, T, φ, mode, λ)
   - Confirm animation behavior matches the unified default (or is intentionally disabled)

## Decision Log
- 2025-08-26: Task initiated. Agreed to create `scatterDefaults` and `buildChartCard` pattern. Pending audit to finalize default styles and wrapper markup.

## Work Log / Checklist
- [x] Create this progress.md
- [x] Add animation audit to scope/criteria/checklist
 - [x] Explicitly exclude loss plots from the audit
- [ ] Audit `charts.js` for existing scatter helpers and defaults
- [ ] Audit `htmlout.js` for chart wrappers/cards
- [ ] Audit page scripts for scatter instantiation and options:
  - [ ] `page2.js`
  - [ ] `page3.js`
  - [ ] `page4.js`
  - [ ] `page5.js`
  - [ ] `page6.js`
- [ ] Inventory differences in “Inventory” and “Differences Checklist”
- [ ] Draft unified API (`createOrUpdateScatter`) + defaults
- [ ] Draft standard wrapper (`buildChartCard`)
- [ ] Migrate one page (pilot) and validate
- [ ] Migrate remaining pages
- [ ] Final pass: consistency + responsiveness

## Risks / Considerations
- Some pages may rely on page-specific annotations/lines (e.g., reference lines); the API must support optional extras.
- Differences in dataset shapes (single-vs-multi series) and legends.
- Load order and resize behavior must be predictable across pages..