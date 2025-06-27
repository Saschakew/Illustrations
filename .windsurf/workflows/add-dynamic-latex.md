---
description: Scaffold a LaTeX element bound to sharedData using `DynamicLatexManager`.
---

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