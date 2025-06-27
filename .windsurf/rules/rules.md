---
trigger: always_on
---

## UI Controls Convention
When editing `public/js/ui_factory.js`, ensure each new `create*()` control has a matching `initialize*()` in `shared_controls.js`.


## Style Guide Enforcement
- All CSS colors must reference variables defined in `public/css/style.css` (no raw hex codes).
- Plotly traces: primary series → `var(--color-primary)`, secondary/accents → `var(--color-accent)`.
- New HTML sections must link the **Lato** font and respect base font size `16px`.
- Reject commits where `grep -R --ignore-case -nE "#[0-9A-F]{6}" public/css | wc -l` > 0.
- When a file inside `public/css/` changes, automatically run `/style-check`.