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

The template uses [MathJax](https://www.mathjax.org/) to render beautiful mathematics. Updating equations dynamically is a two-step process.

**HTML:**
Place your LaTeX code inside an element with a unique ID. Note the delimiters: `\(` and `\)` for inline math, and `$$` and `$$` for display math.

```html
<p>The estimated B(φ) matrix is: <span id="b-phi-matrix-display">$$B(\phi) = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$$</span></p>
```

**JavaScript:**

1.  **Create an Update Function**: This function will build the new LaTeX string and update the element's content.

    ```javascript
    function updateBPhiMatrixDisplay() {
        const displayElement = document.getElementById('b-phi-matrix-display');
        if (!displayElement) return;

        // 1. Get the latest matrix from sharedData
        const B_phi = window.sharedData.B_phi;
        const b11 = B_phi[0][0].toFixed(2);
        const b12 = B_phi[0][1].toFixed(2);
        const b21 = B_phi[1][0].toFixed(2);
        const b22 = B_phi[1][1].toFixed(2);

        // 2. Construct the new LaTeX string
        const latexString = `$$B(\phi) = \\begin{pmatrix} ${b11} & ${b12} \\\\ ${b21} & ${b22} \\end{pmatrix}$$`;

        // 3. Update the element's inner HTML
        displayElement.innerHTML = latexString;

        // 4. Tell MathJax to re-render the updated element
        MathJax.typesetPromise([displayElement]).catch(err => console.error('MathJax typeset failed:', err));
    }
    ```

2.  **Call from Pipeline**: Just like with plots, call `updateBPhiMatrixDisplay()` from the appropriate pipeline in `main.js` (in this case, `regenerateBPhi()`).

---

By creating focused display functions and calling them from the main data pipelines, you can build a highly interactive and responsive application. The final guide, **`07_end_to_end_example_adding_a_new_feature.md`**, will tie everything together by walking through a complete feature addition from start to finish.
