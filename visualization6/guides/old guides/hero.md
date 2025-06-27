# Hero Section: Particles + Layout Guide

## 1. Purpose
A calm, atmospheric hero that introduces the SVAR visualiser without stealing focus.  It uses a light gradient background and a subtle **tsParticles** animation that reacts gently to the pointer.

## 2. File Map
| File | Role |
|------|------|
| `index.html`            | Contains the hero markup (`section.hero-section`, `#hero-particles` canvas, headline + subtitle) |
| `public/css/style.css`  | Layout + visual styles: gradient background, text layers, bottom-fade overlay (`.hero-section::after`) |
| `public/js/hero_particles.js` | All particle logic, DebugManager logs, and reduced-motion bypass |
| `guides/hero.md`        | (this doc) – maintenance notes |

## 3. How the Animation Works
```mermaid
 sequenceDiagram
  Browser→>DOM: DOMContentLoaded (already "interactive")
  hero_particles.js->>initParticles(): called immediately
  initParticles()->>#hero-particles: query canvas element
  initParticles()->>tsParticles.load: pass configuration JSON
  tsParticles-->>Browser: renders particles via canvas
```
Key config (`hero_particles.js`):
- `number.value`: **55** particles
- `color.value`: `[primaryColor, secondaryColor]` → picks up `--color-accent-primary` + `--color-accent-secondary-plot-loss` so branding changes automatically propagate.
- `opacity.value`: **0.35** keeps them pastel.
- `move.speed`: **0.18** (slow drift).
- `links.enable`: **false** (no connecting lines).
- `interactivity`:
  * `parallax` hover gives slight depth (force 8).
  * `repulse` hover **distance 25**, **duration 0.6** – a gentle push.
  * `onClick.enable`: **false** (no particle creation).
- `backgroundMask.enable`: **false**; leaving this on previously hid the dots.

## 4. Layering Stack
| z-index | Element |
|---------|---------|
| 2 | `.hero-content` (headline/subtitle) |
| 1 | `.hero-section::after` (bottom fade) |
| 0 | `#hero-particles` canvas |
| ‑ | gradient background (CSS) |

## 5. Common Pitfalls & Fixes
| Issue | Cause | Fix |
|-------|-------|-----|
| **Invisible particles** | 1) Hard-coded very light pastel colors <br>2) `backgroundMask` overlay | Use brand accent colours (`--color-accent-primary`, `--color-accent-secondary-plot-loss`) and disable mask |
| Particles render in full screen | `fullScreen.enable` default true | Set `fullScreen.enable: false` so they stay inside hero |
| No particles on reduced-motion systems | Prefers-reduced-motion check returned early | Bypassed check to always render (can restore later if needed) |
| Extra particles on click | Default `push` mode active | Set `onClick.enable: false` |

## 6. Tweaking Cheat-Sheet
| Desired change | Property |
|----------------|----------|
| More/less dots | `particles.number.value` |
| Faster/slower drift | `particles.move.speed` |
| Softer push | Decrease `interactivity.modes.repulse.distance` or increase `duration` |
| Enable/disable parallax | Toggle `parallax` in `interactivity.events.onHover.mode` |

---
_Last updated: 2025-06-14_
