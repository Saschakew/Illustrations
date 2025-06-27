---
description: Insert a responsive Plotly chart placeholder and stub updater in a chosen section.
---

1. Prompt: "Target section file (e.g., section_two)".
2. Prompt: "Figure id (e.g., shock_scatter)".
3. Insert `<div id="{{figure_id}}" class="plotly-chart"></div>` into `public/sections/{{section_file}}.html` (inside a convenient container).
4. Create or open `public/js/{{section_file}}.js` and add TODO stub `async function update{{PascalCase figure_id}}() { /* TODO */ }`.
5. Register the stub call in the relevant data pipeline in `main.js` (append TODO comment for developer). 