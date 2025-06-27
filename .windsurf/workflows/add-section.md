---
description: Guide the developer through duplicating an existing HTML section, wiring it into the nav bar, and adding skeleton JS.
---

--steps--
1. Prompt: "Which existing section should we duplicate? (e.g., section_one)".
2. Command: Duplicate `public/sections/{{answer}}.html` → `public/sections/{{new_name}}.html`.
3. Insert `<div id="{{new_name}}-placeholder" data-section-src="public/sections/{{new_name}}.html"></div>` into `index.html`.
4. Create `public/js/sections/{{new_name}}.js` with boilerplate export.
5. Append a nav-bar `<li><a href="#{{new_name}}">{{New Display Name}}</a></li>`.
6. Prompt: "Open the new section in browser? (y/n)" then run local server if yes.