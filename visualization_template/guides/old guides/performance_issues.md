# SVAR Visualizer Performance Optimization Opportunities

## 1. Computational Bottlenecks
### Core Data Pipeline
- **Full pipeline recomputation**: `regenerateSvarData()` always:
  - Generates new ε-shocks (O(T) random draws)
  - Recomputes uₜ (matrix multiplication)
  - Re-runs all three estimators (recursive, non-Gaussian, ridge)
- **Redundant calculations**: All estimators run even when only one section is visible
- **Grid searches**: 
  - `calculateNonGaussianEstimates` scans φ on ~160 values
  - `calculateRidgeEstimates` repeats similar grid searches for every λ update

### Matrix Operations
- `regenerateInnovations()` performs 2×2 matrix inversions on UI thread
- No caching of Σᵤ, P̂ or loss-curve samples between calculations

## 2. Rendering & Visualization
### Plotting
- Full scatter plot redraws with thousands of points
- No downsampling or incremental updates
- Loss curves redrawn completely on each update

### Math Rendering
- Blanket `MathJax.typesetPromise()` on initial load
- No lazy loading for hidden sections

## 3. Event Handling
- No debouncing for "New Data" clicks or λ slider
- `updateLambdaSlidersRangeAndValue()` called unnecessarily after T changes
- Debug logging remains active in production

## 4. Architectural Considerations
### Threading
- All heavy math runs on main thread
- Web Workers could handle:
  - ε/u generation
  - Estimator grid searches
  - Matrix operations

### Memory Management
- Arrays reallocated without nulling old references
- Global namespace pollution (`window.*` references)

## 5. Network & Assets
- Sequential section loading (`loadSections()`)
- No bundling/minification of JS files
- Heavy libraries loaded upfront

## Optimization Priority Roadmap

### High Impact (Core Performance)
1. On-demand estimator computation
2. Web Worker offloading
3. Plot downsampling and incremental updates
4. MathJax lazy loading

### Medium Impact (UX Smoothness)
1. Input debouncing
2. Memory management improvements
3. Parallel asset loading
4. Production debug stripping

### Low Impact (Polish)
1. Animation optimization
2. CSS layout thrash reduction
3. Asset bundling
