---
description: Add a new numerical slider bound to sharedData.
---

1. Prompt: "Variable name in sharedData (e.g., gamma)?".
2. Update `shared_data.js` → add default value `{{var_name}}`.
3. Append factory method `create{{PascalCase var_name}}Slider()` in `public/js/ui_factory.js` (with TODO comment for label/min/max).
4. Insert `<div data-control-type="{{var_name}}-slider"></div>` into target section HTML.
5. Extend `initializeSliders()` in `public/js/shared_controls.js` to bind `{{var_name}}`.
6. Run `/regenerate-shared-controls` Workflow if desired.