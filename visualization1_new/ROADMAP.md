# Roadmap: Refactored Non-Gaussian SVAR Illustration (visualization1_new)

This roadmap guides developers to verify that the refactored Non-Gaussian SVAR illustration in `visualization1_new/` aligns with the original `visualization1/`, matches the target design/implementation patterns of `visualization4/`, and to identify redundant/inefficient code in `visualization1_new/`.

It provides step-by-step checklists, suggested evidence to capture, and a lightweight findings log template. Do not execute changes while following this roadmap; only identify, document, and propose fixes.

---

## Scope and Objectives

- Verify content parity (menus, text, math, controls, charts) between:
  - `visualization1_new/` (target) and `visualization1/` (original reference)
- Verify design and implementation consistency with:
  - `visualization4/` (target architecture and UX patterns)
- Identify redundancy and inefficiency in `visualization1_new/` codebase.

Deliverables: Completed checklists, a Findings Log, and proposed follow-up tasks (PRs) with clear acceptance criteria.

---

## Directory Overview (key files)

Use this as a quick map when navigating or cross-referencing.

- visualization1_new/
  - HTML: `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`
  - CSS: `styles.css`
  - JS (core): `index.js`, `ui.js`, `variables.js`, `charts.js`, `svar.js`
  - JS (support): `bootstrap.js`, `loader.js`, `dataGeneration.js`, `eventListeners.js`, `htmlout.js`, `main.js`
  - JS (per-page): `page2.js`, `page3.js`, `page4.js`, `page5.js`, `page6.js`

- visualization1/
  - HTML: `index.html`, `page2.html`, `page3.html`, `page4.html`, `page5.html`, `page6.html`
  - CSS: `styles.css`
  - JS: `main.js`

- visualization4/
  - HTML: `index.html`, `page2.html`, `page3.html`, `page4.html`
  - CSS: `styles.css`
  - JS (core): `index.js`, `ui.js`, `variables.js`, `charts.js`, `svar.js`
  - JS (support): `loader.js`, `dataGeneration.js`, `eventListeners.js`, `htmlout.js`
  - JS (per-page): `page2.js`, `page3.js`, `page4.js`

Note: the file lists above were identified by surveying the directories; treat them as a guide and adjust if the repo changes.

---

## Phase 1 — Content Parity with visualization1

Goal: The refactored `visualization1_new/` should present the same content (narrative, menus, notation, controls), with equivalent behavior and default states as the original `visualization1/`.

Checklist (complete per page: `index.html`, `page2.html` … `page6.html`):

- [ ] Navigation parity
  - [ ] Same menu items, order, and destinations (anchors/links) as `visualization1/`
  - [ ] Menu toggling works on narrow viewports; all links reachable
  - [ ] Highlight/active state matches expectation

- [ ] Headings and text
  - [ ] Section titles match (spelling, capitalization)
  - [ ] Paragraph content equivalent; wording differences are acceptable only if meaning preserved
  - [ ] Math/equation blocks equivalent; notation consistent (e.g., rotation angles `φ₀`, `φ` if used)

- [ ] Controls and defaults
  - [ ] All inputs present (e.g., sliders for rotation angles if present in original)
  - [ ] Default values identical; input ranges and steps match
  - [ ] Info icons or help popups exist where they existed in `visualization1/`

- [ ] Charts and visuals
  - [ ] Same charts present (types, presence across sections)
  - [ ] Axis labels, titles, legends, gridlines comparable
  - [ ] Initial chart state (on load) matches positions/series
  - [ ] Interaction parity (e.g., hover, tooltips)

- [ ] Content integrity
  - [ ] No missing sections or “TODO” stubs compared to `visualization1/`
  - [ ] No stray references to unrelated topics (e.g., proxy-specific language) that did not exist in original

Evidence to capture:
- Screenshots (menu, each section, each chart)
- Snippets showing text/math differences
- Notes on control ranges/defaults

How to compare efficiently (suggested, optional):
- Open both versions side-by-side in the browser; step through each page and capture differences
- Use a visual diff for HTML text blocks if helpful

---

## Phase 2 — Design & Implementation Consistency with visualization4

Goal: `visualization1_new/` adheres to the architecture, patterns, and UX conventions that `visualization4/` exemplifies (modular JS, consistent UI patterns, consistent styling).

Architecture and file structure:
- [ ] Modular decomposition mirrors `visualization4/` where applicable:
  - [ ] Core separation: `ui.js`, `charts.js`, `variables.js`, `svar.js`, `index.js`
  - [ ] Support modules: `loader.js`, `eventListeners.js`, `dataGeneration.js`, `htmlout.js`
  - [ ] Per-page scripts exist only if needed and remain thin (page wiring, not core logic)

Initialization and event flow:
- [ ] Single, predictable bootstrap path (e.g., `index.js` → load variables → init UI → render charts)
- [ ] Event listener registration centralized and not duplicated across modules
- [ ] UI update functions clearly separate concerns (UI state vs. data computation vs. rendering)

UI/UX and styling:
- [ ] Typography and base sizing consistent (e.g., Lato font, base 16px sizing)
- [ ] Colors reference CSS variables defined in `styles.css` (no raw hex literals)
- [ ] Chart color usage consistent with palette: primary series uses the primary color, secondary/accent uses accent color
- [ ] Popups/tooltips and menu toggle behaviors mirror patterns used in `visualization4/`

Charting (Chart.js):
- [ ] Chart instances are created once and updated (not re-instantiated on every change)
- [ ] Datasets and options reuse a shared theme/config where appropriate (consistent fonts, colors)
- [ ] Expensive recomputations are avoided in update paths

Code style and naming:
- [ ] Function and variable names parallel `visualization4/` conventions where equivalent functionality exists
- [ ] No proxy-specific naming or code paths in `visualization1_new/` (avoid accidental carry-over)

Evidence to capture:
- Short notes + code references (file + function) demonstrating each parity or gap
- Screenshots of UI elements showing consistent styles and behaviors

---

## Phase 3 — Redundancy and Efficiency Review (visualization1_new)

Goal: Identify code duplication, dead code, wasteful computations, or poor separation of concerns.

Duplication and dead code:
- [ ] Search for identical/near-identical functions across `ui.js`, `charts.js`, `variables.js`, `svar.js`, `eventListeners.js`, per-page files (`page*.js`)
- [ ] Remove or consolidate unused exports, unused variables, and commented-out blocks
- [ ] Ensure per-page files do not duplicate core logic (wire to shared functions instead)

Event handling and DOM access:
- [ ] Avoid attaching the same event listeners in multiple places
- [ ] Cache DOM lookups where repeatedly used
- [ ] Debounce or throttle high-frequency events (e.g., slider `input`) when chart updates are expensive

Charts and data flow:
- [ ] Reuse Chart.js instances; call `.update()` instead of recreating
- [ ] Separate data generation from rendering; precompute where possible
- [ ] Validate that `dataGeneration.js` functions are pure and reusable; no hidden coupling to DOM

Modularity boundaries:
- [ ] Keep computation in `svar.js` or a dedicated compute module; keep `ui.js` strictly for UI orchestration
- [ ] Ensure `variables.js` is the single source of truth for tunable parameters/defaults

Style and assets:
- [ ] CSS uses variables in `styles.css` (no literal hex colors in components or inline styles)
- [ ] Pages link the Lato font and follow consistent spacing/typography

Evidence to capture:
- Code pointers (file, function) + short description of the issue and proposed remediation (e.g., “extract to shared function in X.js”)

---

## Findings Log (Template)

Use this table to record each finding. Create one log per phase or combine as needed.

| ID | Category | Severity (L/M/H) | Location (file:line or page) | Description | Proposed Action |
|----|----------|-------------------|-------------------------------|-------------|-----------------|
| 1  | Content  | M                 | `index.html` (menu)           | Menu order differs from original | Match order with `visualization1/index.html` |
| 2  | Design   | H                 | `charts.js`                   | Chart re-instantiated on slider input | Persist instance and call `chart.update()` |

Add screenshots or code snippets below the table when helpful.

---

## Acceptance Criteria

The verification is complete when:
- [ ] All Phase 1 parity checks pass or documented deviations are approved
- [ ] All Phase 2 design/implementation consistency checks pass or approved
- [ ] Phase 3 issues are triaged with proposed fixes and follow-up tasks
- [ ] Findings Log is complete with clear next steps (linked to issues/PRs)

---

## Suggested Review Order and Timeboxes

1) Index page (content parity) — 30–45 min
2) Controls and default states — 20–30 min
3) Charts (theme + update paths) — 30–45 min
4) Architecture parity with `visualization4/` — 30–45 min
5) Redundancy/efficiency scan — 45–60 min

---

## Notes and Caveats

- This roadmap does not instruct to modify code; only to document and propose concrete changes.
- If discrepancies are intentional (e.g., updated language), capture rationale in the Findings Log and mark as “approved deviation”.
- When proposing fixes, prefer minimal, well-scoped PRs (e.g., one PR per module or concern).
