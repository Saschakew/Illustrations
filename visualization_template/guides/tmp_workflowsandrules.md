# Cascade Workflows & Rules for the SVAR Visualization Template

This document captures concrete, ready-to-implement suggestions for automating common contributor tasks with Cascade Workflows and enforcing conventions with Rules.

---

## 1  Why automate?
Workflows in Cascade are markdown files that live in `.windsurf/workflows/` and can be invoked at any time with the slash command syntax `/workflow-name`.  According to the official Windsurf documentation, every Workflow **must** include at minimum:

1.  A first-level heading that becomes the slash-command name (`/add-slider`).
2.  An optional `--description--` block with a short paragraph.
3.  A `--steps--` block – a numbered list of prompts, shell commands, or other instructions.

Additional notes from the docs:
- Workflow files are limited to **12 000 characters** each.
- Steps run *sequentially*; each step may prompt the user, run shell commands, or even **call other workflows** (e.g. `Call /git-workflows`).
- Workflows can be created or edited in the **Customizations → Workflows** panel in Cascade, but storing them in-repo keeps them version-controlled.

The sections below propose concrete Workflows that conform to these requirements.
The template’s developer guides already outline repeatable check-lists (e.g. *“Add a new section”*). Converting those lists into Workflows lets any contributor type a slash-command (e.g. `/add-section`) inside Cascade and be guided through the process interactively.

Rules reinforce project-wide standards (e.g. *“Every new UI control requires an initializer function”*) and can chain Workflows automatically (e.g. *“When a guide file is completed, run the next one.”*).

---

## 2  Proposed Workflows
Create these markdown files in `.windsurf/workflows/`.  Each contains a **title**, **description**, and an ordered list of **steps** (plain text or prompts).  Characters <12 k so all files are safely within the limit.

### 2.1  `add-section.md`
```
# Add a New Section                                   
--description--
Guide the developer through duplicating an existing HTML section, wiring it into the nav bar, and adding skeleton JS.

--steps--
1. Prompt: "Which existing section should we duplicate? (e.g., section_one)".
2. Command: Duplicate `public/sections/{{answer}}.html` → `public/sections/{{new_name}}.html`.
3. Insert `<div id="{{new_name}}-placeholder" data-section-src="public/sections/{{new_name}}.html"></div>` into `index.html`.
4. Create `public/js/sections/{{new_name}}.js` with boilerplate export.
5. Append a nav-bar `<li><a href="#{{new_name}}">{{New Display Name}}</a></li>`.
6. Prompt: "Open the new section in browser? (y/n)" then run local server if yes.
```

### 2.2  `add-slider.md`
```
# Add a Slider UI Control
--description--
Add a new numerical slider bound to sharedData.

--steps--
1. Prompt: "Variable name in sharedData (e.g., gamma)?".
2. Update `shared_data.js` → add default value `{{var_name}}`.
3. Append factory method `create{{PascalCase var_name}}Slider()` in `public/js/ui_factory.js` (with TODO comment for label/min/max).
4. Insert `<div data-control-type="{{var_name}}-slider"></div>` into target section HTML.
5. Extend `initializeSliders()` in `public/js/shared_controls.js` to bind `{{var_name}}`.
6. Run `/regenerate-shared-controls` Workflow if desired.
```

### 2.3  `new-svar-calc.md`
```
# Scaffold a New SVAR Calculation
--description--
Create a placeholder computation in `svar_functions.js` and wire it into the pipeline.

--steps--
1. Prompt: "Name of the new calculation function (e.g., calc_shock_volatility)".
2. Add skeleton function to `public/js/svar_functions.js`.
3. Update `regenerateSvarData()` in `main.js` to call the new function and store results in sharedData.
4. (Optional) Insert a quick Plotly chart placeholder and LaTeX span in relevant section.
```
 



### 2.6  `style-check.md`
```
# Run Style & Design Checks
--description--
Lint CSS variables and Plotly layout defaults to ensure they match our style guide.

--steps--
1. Run `npm run stylelint` (CSS/SCSS rules ensure only approved variables are used).
2. Grep for hard-coded hex colors outside `public/css/` and fail if any are found.
3. Scan Plotly traces for disallowed colors (anything not `var(--color-primary)` / `var(--color-accent)`).
4. Summarize violations and suggest fixes; stop if none are found.
```

### 2.7  `add-style-snippet.md`
```
# Scaffold a CSS Component Snippet
--description--
Quickly create a CSS block that uses approved variables and add documentation placeholders in the style guide.

--steps--
1. Prompt: "Component name (e.g., card-highlight)".
2. Create `public/css/components/{{component_name}}.css` with a variable-based template.
3. Append a brief section to `guides/style_guide.md` under **Components**.
4. Prompt: "Open the new CSS file for editing? (y/n)".
```

### 2.8  `add-figure.md`
```
# Add a Plotly Figure
--description--
Insert a responsive Plotly chart placeholder and stub updater in a chosen section.

--steps--
1. Prompt: "Target section file (e.g., section_two)".
2. Prompt: "Figure id (e.g., shock_scatter)".
3. Insert `<div id="{{figure_id}}" class="plotly-chart"></div>` into `public/sections/{{section_file}}.html` (inside a convenient container).
4. Create or open `public/js/{{section_file}}.js` and add TODO stub `async function update{{PascalCase figure_id}}() { /* TODO */ }`.
5. Register the stub call in the relevant data pipeline in `main.js` (append TODO comment for developer).
6. Prompt: "Open browser preview? (y/n)" and start local server if yes.
```

### 2.9  `add-dynamic-latex.md`
```
# Add a Dynamic LaTeX Expression
--description--
Scaffold a LaTeX element bound to sharedData using `DynamicLatexManager`.

--steps--
1. Prompt: "SharedData key to display (e.g., B_phi)".
2. Prompt: "Utility function name in LatexUtils (e.g., displayBPhiMatrix)".
3. Insert `<span id="{{latex_id}}"></span>` into chosen section HTML.
4. Append helper skeleton to `public/js/latex_utils.js`:
   ```javascript
   window.LatexUtils.{{utility_name}} = function(elementId, value) {
       // TODO: build LaTeX string with value
       document.getElementById(elementId).innerHTML = `$$${value}$$`;
   };
   ```
5. In section JS initializer, register:
   ```javascript
   DynamicLatexManager.registerDynamicLatex('{{latex_id}}', '{{shared_key}}', '{{utility_name}}');
   ```
6. Prompt: "Run `/style-check` now? (y/n)" and invoke if yes.
```

---

## 3  Suggested Rules (.windsurfrules)
Put this file at repo root.
```markdown
## UI Controls Convention
When editing `public/js/ui_factory.js`, ensure each new `create*()` control has a matching `initialize*()` in `shared_controls.js`.

## Guide Progression
When a file matching `guides/0[0-9]_*.md` is saved and contains the marker `<!-- COMPLETE -->`, then invoke `/next-guide`.

## Style Guide Enforcement
- All CSS colors must reference variables defined in `public/css/style.css` (no raw hex codes).
- Plotly traces: primary series → `var(--color-primary)`, secondary/accents → `var(--color-accent)`.
- New HTML sections must link the **Lato** font and respect base font size `16px`.
- Reject commits where `grep -R --ignore-case -nE "#[0-9A-F]{6}" public/css | wc -l` > 0.
- When a file inside `public/css/` changes, automatically run `/style-check`.
```

Global rules (optional `global_rules.md`) can mandate commit-message format or Prettier linting across all projects.

---

## 4  Memory Usage Ideas
1. Persist mappings: control-type → factory function (e.g., `t-slider` → `createTSilder`).
2. Save frequently used Plotly layout snippets and LaTeX matrix templates.
3. Remember default branch name, doc style preferences, and the “auto-continue next guide” preference (already stored).

---

## 5  Next Steps Checklist
- [ ] Create `.windsurf/workflows/` directory and add the files above.
- [ ] Add `.windsurfrules` with the snippet.
- [ ] Test `/add-section` to ensure wording and actions work smoothly.
- [ ] Iterate based on contributor feedback.

---

*Last updated: 2025-06-27*
