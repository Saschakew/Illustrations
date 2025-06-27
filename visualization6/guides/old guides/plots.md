# Plotting Guide

This document outlines the strategy for creating, managing, and updating plots within the SVAR visualizer application.

## Core Principles

1.  **Centralized Utilities**: All generic plotting logic is stored in `public/js/plot_utils.js`. This file contains reusable functions to create and update specific types of plots (e.g., scatter plots, loss function plots).

2.  **Standardized Plot Containers**: Each section's HTML file (`public/sections/section_X.html`) will define standardized containers for its plots. A typical setup includes a main container and two sub-containers for a side-by-side layout on larger screens.

    ```html
    <div class="plot-container card">
        <div id="plot_sX_left" class="plot-area"></div>
        <div id="plot_sX_right" class="plot-area"></div>
    </div>
    ```

3.  **Reactive Updates**: Plots must be reactive to changes in the underlying data stored in `window.sharedData`. When data is regenerated (e.g., by changing sample size `T`, the `phi` slider, or clicking 'New Data'), the plots must automatically redraw to reflect the new state.

4.  **Section-Specific Logic**: The initialization and update logic for each section's plots resides in its corresponding JavaScript file (e.g., `public/js/sections/section_one.js`). This file is responsible for:
    *   Calling the utility functions from `plot_utils.js`.
    *   Passing the correct data from `sharedData`.
    *   Defining plot-specific titles, labels, and configurations.

## Implementation Flow

### 1. Creating a New Plot

1.  **HTML**: Add the plot container structure (as shown above) to the relevant section's HTML file, ensuring the `id` attributes are unique (e.g., `plot_s1_left`).

2.  **Section JS**: In the section's `initializeSectionX` function (e.g., `initializeSectionOne` in `section_one.js`), make an initial call to the appropriate plotting function from `plot_utils.js`.

    ```javascript
    // In section_one.js
    async function initializeSectionOne() {
        // ... other initializations
        await updateSectionOnePlots();
    }

    async function updateSectionOnePlots() {
        PlotUtils.createOrUpdateScatterPlot('plot_s1_left', sharedData.epsilon_1t, sharedData.epsilon_2t, 'Structural Shocks (ε₁ vs ε₂)');
        PlotUtils.createOrUpdateScatterPlot('plot_s1_right', sharedData.u_1t, sharedData.u_2t, 'Reduced-Form Shocks (u₁ vs u₂)');
    }
    ```

### 2. Updating Plots Reactively

To make plots update when data changes, the `updateSectionXPlots` function must be called from the main data regeneration functions in `main.js`.

1.  **Create Update Function**: Encapsulate all plot-drawing calls for a section in a single `updateSectionXPlots` function, as shown above.

2.  **Trigger from `main.js`**: Call this update function from `regenerateSvarData` and `regenerateReducedFormShocksFromExistingEpsilon` and any other function that changes plotted data.

    ```javascript
    // In main.js
    async function regenerateSvarData() {
        // ... data generation logic ...

        // After data is updated in sharedData, update plots
        await window.sectionOne.updatePlots(); // Assuming section_one.js exposes this function
        await window.sectionTwo.updatePlots();
        // ... etc.
    }
    ```

This ensures a clean, decoupled, and maintainable system for managing visualizations throughout the application.
