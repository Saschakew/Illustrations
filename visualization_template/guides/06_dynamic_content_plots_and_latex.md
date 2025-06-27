# Guide 6: Dynamic Content, Plots, and LaTeX

This guide explains how to make your application feel alive by updating content dynamically. When a user moves a slider, the plots, numbers, and equations on the page should react instantly. This is achieved by creating update functions that read from `sharedData` and re-render specific parts of the UI.

## The Core Principle: Separate Calculation from Display

The key to dynamic content is to separate the *calculation* of data from its *display*. As we've seen, the data pipeline functions in `main.js` (like `regenerateSvarData`) are responsible for calculating new data and storing it in `window.sharedData`. 

After the data is updated, these pipeline functions should then call specific **display functions** whose only job is to update the UI. For example, after `regenerateSvarData` runs, it might call `updateSectionOnePlot()` and `updateSectionTwoEstimates()`.

This guide covers how to write those display functions for three types of content: simple text, plots (using Plotly.js), and mathematical equations (using MathJax).

## Workflow: Updating Simple Text and Numbers

This is the most straightforward case. Imagine you have an estimate stored in `sharedData` and you want to display it.

**HTML:**
First, create a placeholder element in your section's HTML with a unique ID.
```html
<p>The estimated value of phi is: <span id="phi-estimate-display" class="estimate-value">0.00</span></p>
```

**JavaScript:**
Then, create a display function that reads the value from `sharedData` and updates the element's content.

```javascript
// This function might live in a section-specific JS file, e.g., section_two.js
function updatePhiEstimateDisplay() {
    const displayElement = document.getElementById('phi-estimate-display');
    if (!displayElement) return; // Exit if the element doesn't exist

    // 1. Read the latest value from the single source of truth
    const phi_est = window.sharedData.phi_est_rec;

    // 2. Update the element's text content
    displayElement.textContent = phi_est.toFixed(3);
}
```

Finally, you would call `updatePhiEstimateDisplay()` from the main data pipeline in `main.js` whenever `phi_est_rec` is recalculated.

## Workflow: Updating Plots with Plotly.js

The template uses [Plotly.js](https://plotly.com/javascript/) for charting. The pattern for dynamic plots involves creating the plot once and then efficiently updating its data.

**HTML:**
Add a `<div>` in your section's HTML to serve as the container for the plot.
```html
<div id="scatter-plot-u" class="plotly-chart"></div>
```

**JavaScript:**

1.  **Initialization**: In your section's initializer (e.g., `initializeSectionOne()`), create the plot for the first time using `Plotly.newPlot()`.

    ```javascript
    // In section_one.js
    async function initializeSectionOne() {
        // ...
        await updateUPlot(); // Call the update function to draw the initial plot
    }
    ```

2.  **Update Function**: Create an `updateUPlot` function. This function will be used for both the initial drawing and all subsequent updates.

    ```javascript
    // In section_one.js
    async function updateUPlot() {
        const plotDiv = document.getElementById('scatter-plot-u');
        if (!plotDiv) return;

        // 1. Get the latest data from sharedData
        const u1 = window.sharedData.u_1t;
        const u2 = window.sharedData.u_2t;

        const trace = {
            x: u1,
            y: u2,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 5 }
        };

        const layout = {
            title: 'Reduced-Form Shocks (u_t)',
            xaxis: { title: 'u_1t' },
            yaxis: { title: 'u_2t' }
        };

        // 2. Use Plotly.react() for efficient updates
        // It intelligently redraws only what has changed.
        Plotly.react(plotDiv, [trace], layout);
    }
    ```

3.  **Call from Pipeline**: Call `updateUPlot()` from the appropriate data pipeline in `main.js` whenever the `u_t` data changes.

## Workflow: Updating LaTeX with MathJax

To keep your LaTeX displays in sync with the application state, this template uses a centralized `DynamicLatexManager`. Instead of manually updating each equation, you *register* an element with the manager and tell it which piece of `sharedData` to watch. When the data changes, the manager automatically handles the update and re-rendering.

### Verified Workflow

This workflow is confirmed against `public/js/dynamic_latex_manager.js` and `public/js/latex_utils.js`.

**1. Create the LaTeX Helper in `latex_utils.js`**

First, all LaTeX string generation is handled by helper functions in `public/js/latex_utils.js`. This keeps the logic clean. Let's create a helper to display our `B(φ)` matrix.

```javascript
// in public/js/latex_utils.js
window.LatexUtils = {
    // ... other helpers

    displayBPhiMatrix: function(elementId, B_phi) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const b11 = B_phi[0][0].toFixed(2);
        const b12 = B_phi[0][1].toFixed(2);
        const b21 = B_phi[1][0].toFixed(2);
        const b22 = B_phi[1][1].toFixed(2);

        const latexString = `$$B(\phi) = \begin{pmatrix} ${b11} & ${b12} \\ ${b21} & ${b22} \end{pmatrix}$$`;
        el.innerHTML = latexString;
    }
};
```

**2. Add a Placeholder in HTML**

Next, add a `<span>` or `<div>` with a unique ID in your section's HTML. It can be empty or contain default LaTeX.

```html
<p>The estimated B(φ) matrix is: <span id="b-phi-matrix-display"></span></p>
```

**3. Register the Element for Updates**

In your section-specific JavaScript file (e.g., `section_three.js`), find the `initialize` function. Inside it, call `DynamicLatexManager.registerDynamicLatex`.

```javascript
// in public/js/section_three.js
async function initializeSectionThree() {
    if (!document.getElementById('section-three')) return;

    // ... other initialization for this section

    window.DynamicLatexManager.registerDynamicLatex(
        'b-phi-matrix-display', // The ID of our HTML element
        'B_phi',                // The key in sharedData to watch
        'displayBPhiMatrix'     // The function in LatexUtils to call
    );
}
```

**4. Let the Pipeline Do the Work**

That's it! You do not need to call the update function manually. The `regenerateBPhi` function in `main.js` already contains this line:

```javascript
// in main.js, at the end of regenerateBPhi()
if (window.DynamicLatexManager) {
    window.DynamicLatexManager.updateAllDynamicLatex();
}
```

Whenever `B_phi` changes in `sharedData`, `updateAllDynamicLatex()` will automatically find your registered element, see that its data source (`B_phi`) has changed, and call the specified utility function (`displayBPhiMatrix`) to re-render the LaTeX.

### Key Advantages

-   **Declarative**: You declare the link between data and display once, instead of calling update functions from all over the code.
-   **Efficient**: The manager includes a simple cache and won't re-render the LaTeX if the underlying data hasn't actually changed.
-   **Centralized**: All LaTeX generation logic lives in `latex_utils.js`, making it easy to maintain and reuse.

---

By creating focused display functions and calling them from the main data pipelines, you can build a highly interactive and responsive application. The final guide, **`07_end_to_end_example_adding_a_new_feature.md`**, will tie everything together by walking through a complete feature addition from start to finish.
