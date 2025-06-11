# Guide: Adding a New Interactive Section

This guide details the process for creating a new interactive section within the SVAR Visualizer, ensuring it integrates with the existing architecture for data management, UI controls, and plotting. It builds upon `code_structure.md` and `guide_new_section.md`.

## 1. Core Principles Recap

*   **Central Data Store (`window.SVARData`):** Single source of truth for shared application state.
*   **Event-Driven Updates:** Sections subscribe to `DATA_UPDATED` (and other relevant) events from `window.SVARData`.
*   **Source Tracking:** Events include a `source` property to prevent self-triggered update loops.
*   **Shared Modules:** Utilize `window.SVARControls`, `window.SVARFunctions`, `window.SVARPlotUtils`, etc., for common tasks.
*   **Section-Specific Logic:** Encapsulated in its own JS file (e.g., `public/js/sections/new_section_name.js`).

## 2. Steps to Create a New Section

Let's assume we are creating a new section called "My New Analysis" with the identifier `my_analysis`.

### Step 2.1: Define Source IDs

In your new section's JavaScript file (`public/js/sections/my_analysis.js`), define unique source identifiers:

```javascript
// public/js/sections/my_analysis.js
const MY_ANALYSIS_SECTION_ID = 'my-analysis-section'; // Matches the main <section> ID in HTML
const MY_ANALYSIS_LOGIC_SOURCE_ID = 'my_analysis_logic';
const MY_ANALYSIS_CONTROLS_SOURCE_ID = 'my_analysis_controls';
```

### Step 2.2: Create HTML Snippet (`public/sections/my_analysis.html`)

Create the HTML structure for your section.

```html
<!-- public/sections/my_analysis.html -->
<section id="my-analysis-section" class="content-section card">
    <h2 id="title-my-analysis-section">My New Analysis</h2>

    <!-- Controls (if any) - Follow style_guide_menu.md -->
    <div id="controls-placeholder_my_analysis" class="controls-placeholder"></div>
    <div id="controls-container_my_analysis" class="controls-container card">
        <div class="card-body p-3">
            <div class="controls-row">
                <!-- Example Control: A custom button for this section -->
                <div class="control-item">
                    <button id="runAnalysisBtn_my_analysis" class="btn btn-sm btn-primary">Run Analysis</button>
                </div>
                <!-- Add other shared controls here if needed, e.g., sample size -->
                <!-- Ensure their IDs are unique (e.g., sampleSizeSlider_my_analysis) -->
            </div>
        </div>
    </div>

    <!-- Explanation Area -->
    <div class="explanation-container card">
        <div class="card-body">
            <p>This section performs a new analysis based on the generated SVAR data.</p>
            <p>Results will be displayed in the plot below.</p>
            <!-- MathJax example: \( y = \alpha + \beta x + \epsilon \) -->
        </div>
    </div>

    <!-- Plot Area -->
    <div class="plot-container card">
        <div class="card-body">
            <div id="myAnalysisPlot_my_analysis" class="plotly-chart-container">
                <!-- Plotly chart will be rendered here -->
            </div>
        </div>
    </div>
</section>
```

### Step 2.3: Create Section JavaScript (`public/js/sections/my_analysis.js`)

This file will contain the logic for your new section.

```javascript
// public/js/sections/my_analysis.js
window.SVARSections = window.SVARSections || {};

window.SVARSections.initMyAnalysis = function() {
    const SECTION_HTML_ID = 'my-analysis-section'; // Matches the <section> id
    const LOGIC_SOURCE_ID = 'my_analysis_logic';    // For events originating from this section's core logic
    const CONTROLS_SOURCE_ID = 'my_analysis_controls'; // For events from shared controls in this section

    const sectionElement = document.getElementById(SECTION_HTML_ID);

    // Pre-flight checks
    if (!sectionElement || typeof Plotly === 'undefined' || !window.SVARData || !window.SVARControls || !window.SVARPlotUtils) {
        console.warn(`[${SECTION_HTML_ID}.js] Dependencies not ready. Retrying init...`);
        setTimeout(() => window.SVARSections.initMyAnalysis(), 100);
        return;
    }
    console.log(`[${SECTION_HTML_ID}.js] Initializing section...`);

    // Cache DOM Elements specific to this section
    const elements = {
        runAnalysisBtn: sectionElement.querySelector('#runAnalysisBtn_my_analysis'),
        plotDiv: sectionElement.querySelector('#myAnalysisPlot_my_analysis'),
        // Add other elements like input fields, display areas, etc.
    };

    // Local state for this section (if needed)
    let localState = {
        analysisResults: null,
        // other section-specific data
    };

    // --- Core Logic Functions ---
    function performAnalysis(svarData) {
        // Example: Access data from svarData (which comes from window.SVARData)
        // const { u_1t, u_2t, T } = svarData;
        // if (!u_1t || !u_2t) {
        //     console.warn(`[${LOGIC_SOURCE_ID}] Missing data for analysis.`);
        //     return null;
        // }
        // Perform some calculations...
        // localState.analysisResults = { ... };
        // console.log(`[${LOGIC_SOURCE_ID}] Analysis complete.`);
        // return localState.analysisResults;

        // For now, just a placeholder
        localState.analysisResults = {
            x: [1, 2, 3, 4, 5],
            y: [2, 1, 4, 3, 5]
        };
        return localState.analysisResults;
    }

    // --- UI Update Functions ---
    function updatePlot() {
        if (!elements.plotDiv || !localState.analysisResults) {
            // console.log(`[${LOGIC_SOURCE_ID}] No data or plot div to update plot.`);
            return;
        }

        const trace = {
            x: localState.analysisResults.x,
            y: localState.analysisResults.y,
            mode: 'lines+markers',
            type: 'scatter',
            marker: { color: 'var(--color-accent)' } // Use CSS variable
        };

        const layout = window.SVARPlotUtils.getDefaultPlotLayout({
            title: 'My Analysis Results',
            xaxisTitle: 'X Value',
            yaxisTitle: 'Y Value',
            plotDivElement: elements.plotDiv // For dynamic sizing
        });
        // Override any specific layout properties if needed
        // layout.yaxis.scaleanchor = null; // If not a square plot

        Plotly.react(elements.plotDiv, [trace], layout, window.SVARPlotUtils.getDefaultPlotConfig());
        console.log(`[${LOGIC_SOURCE_ID}] Plot updated.`);
    }

    function updateUI() {
        // Update any other display elements in this section based on localState
        performAnalysis(window.SVARData.getDataBundle()); // Get current data
        updatePlot();
    }

    // --- Event Handlers ---
    function handleRunAnalysisClick() {
        console.log(`[${CONTROLS_SOURCE_ID}] 'Run Analysis' button clicked.`);
        // This might trigger a new data generation or use existing global data
        // For this example, it just uses current SVARData and updates its own plot
        updateUI();
    }

    function handleGlobalDataUpdated(event) {
        // IMPORTANT: Prevent self-triggered loops or redundant updates
        if (event.detail.source === LOGIC_SOURCE_ID || event.detail.source === CONTROLS_SOURCE_ID) {
            // console.log(`[${LOGIC_SOURCE_ID}] Ignoring self-sourced DATA_UPDATED event from: ${event.detail.source}`);
            return;
        }
        console.log(`[${LOGIC_SOURCE_ID}] Received DATA_UPDATED from: ${event.detail.source}. Updating UI.`);
        // New global data is available, re-run analysis and update plots
        localState.svarData = event.detail; // Store or directly use event.detail
        updateUI();
    }

    // --- Initialization Sequence ---

    // 1. Subscribe to Global Events
    window.SVARData.subscribe('DATA_UPDATED', handleGlobalDataUpdated);

    // 2. Initialize Shared Controls (if any are used from shared_controls.js)
    // Example: If this section used a global sample size slider managed by shared_controls.js
    // window.SVARControls.initializeControls(SECTION_HTML_ID, CONTROLS_SOURCE_ID);
    // This would make shared controls within this section (identified by classes)
    // trigger events with CONTROLS_SOURCE_ID.

    // 3. Initialize Sticky Menu for this section's controls (if applicable)
    if (typeof initializeStickyMenu === 'function') {
        initializeStickyMenu(
            SECTION_HTML_ID, // ID of the main <section> wrapper
            `controls-container_my_analysis`, // ID of the controls menu div
            `controls-placeholder_my_analysis` // ID of the placeholder div
        );
    } else {
        console.warn(`[${LOGIC_SOURCE_ID}] initializeStickyMenu function not found.`);
    }


    // 4. Setup Section-Specific Event Listeners
    if (elements.runAnalysisBtn) {
        elements.runAnalysisBtn.addEventListener('click', handleRunAnalysisClick);
    }

    // 5. Initial UI Draw (fetch initial global state if needed)
    // It's good practice to populate the section based on current SVARData state
    const initialData = window.SVARData.getDataBundle();
    if (initialData && Object.keys(initialData).length > 0) {
        localState.svarData = initialData;
        console.log(`[${LOGIC_SOURCE_ID}] Performing initial UI draw with existing SVARData.`);
    } else {
        console.log(`[${LOGIC_SOURCE_ID}] No initial SVARData found. UI will update on first DATA_UPDATED event or manual trigger.`);
        // Optionally, trigger a default data generation if this section should always show something
        // window.SVARFunctions.generateAndStoreSvarData(
        //     window.SVARData.getDefaultSampleSize(), // Or a specific default for this section
        //     window.SVARData.getDefaultPhi(),
        //     LOGIC_SOURCE_ID // Source is this section's logic
        // );
    }
    updateUI(); // Perform an initial update based on current data or defaults

    // 6. Window Resize Listener (for responsive plots)
    window.addEventListener('resize', () => {
        if (elements.plotDiv && localState.analysisResults) { // Only if plot exists and has data
            updatePlot();
        }
    });

    console.log(`[${SECTION_HTML_ID}.js] Section initialized successfully.`);
};
```

### Step 2.4: Update `main.js`

In `public/js/main.js`, load the new section's HTML and call its initializer.

```javascript
// public/js/main.js (Simplified example)
document.addEventListener('DOMContentLoaded', async () => {
    // ... other initializations ...

    // Placeholder for the new section in index.html
    const myAnalysisPlaceholder = document.getElementById('my-analysis-placeholder');

    if (myAnalysisPlaceholder) {
        try {
            const response = await fetch('public/sections/my_analysis.html');
            if (!response.ok) throw new Error(`Failed to load my_analysis.html: ${response.statusText}`);
            myAnalysisPlaceholder.innerHTML = await response.text();

            // Typeset MathJax if present in the loaded content
            if (window.MathJax && window.MathJax.typesetPromise) {
                await window.MathJax.typesetPromise([myAnalysisPlaceholder]);
            }

            // Initialize the section's JavaScript
            if (window.SVARSections && window.SVARSections.initMyAnalysis) {
                window.SVARSections.initMyAnalysis();
            } else {
                console.error('initMyAnalysis function not found.');
            }
        } catch (error) {
            console.error('Error loading My Analysis section:', error);
            myAnalysisPlaceholder.innerHTML = '<p class="error-message">Error loading section.</p>';
        }
    }

    // ... initialize other sections ...
});
```

### Step 2.5: Update `index.html`

Add a placeholder for the new section and a link in the main navigation.

```html
<!-- index.html -->
<body>
    <!-- ... -->
    <nav id="main-nav" class="main-navigation">
        <ul>
            <!-- ... other links ... -->
            <li><a href="#my-analysis-section">My Analysis</a></li>
        </ul>
    </nav>

    <main id="main-content" class="container">
        <!-- ... other section placeholders ... -->
        <div id="my-analysis-placeholder" class="section-placeholder">
            <!-- Content for "My New Analysis" will be loaded here -->
        </div>
    </main>
    <!-- ... -->
</body>
```

### Step 2.6: Styling

*   Any unique styling for "My New Analysis" can be added to `public/css/style.css`.
*   Ensure new controls or elements follow the general `style_guide.md`.

## 3. Data Flow and Interaction

*   **Global Data Changes:** When `window.SVARData` is updated (e.g., by the "SVAR Setup" section changing sample size), it dispatches `DATA_UPDATED`.
    *   `my_analysis.js`'s `handleGlobalDataUpdated` receives this event.
    *   It checks the `event.detail.source` to avoid reacting to its own events.
    *   It then calls `updateUI()`, which might re-run `performAnalysis()` with the new global data and then `updatePlot()`.
*   **Section-Specific Controls:**
    *   If "My New Analysis" has its own controls (like the "Run Analysis" button), their event listeners (`handleRunAnalysisClick`) will:
        *   Perform section-specific actions.
        *   If these actions need to modify global state or trigger calculations that affect other sections, they should call appropriate methods on `window.SVARData` or `window.SVARFunctions`, **passing their `LOGIC_SOURCE_ID` or `CONTROLS_SOURCE_ID`**.
        *   If they only update the local section's display based on existing global data, they can directly call `updateUI()`.
*   **Shared Controls:** If "My New Analysis" uses shared controls (e.g., a sample size slider that's part of its HTML but managed by `shared_controls.js`), `window.SVARControls.initializeControls(SECTION_HTML_ID, CONTROLS_SOURCE_ID)` will wire them up. Interactions with these shared controls will trigger `window.SVARFunctions.generateAndStoreSvarData` (or similar) with `CONTROLS_SOURCE_ID` as the source.

## 4. Important Considerations

*   **Null Checks:** Always check for the existence of DOM elements and data properties before using them.
*   **Source IDs:** Be meticulous with `source` IDs to prevent infinite loops.
*   **Modularity:** Keep section-specific logic within its own JS file. If functionality is broadly applicable, consider adding it to a shared module.
*   **Performance:** For complex calculations or frequent updates, consider debouncing or throttling event handlers if performance issues arise.
*   **MathJax:** If loading HTML dynamically that contains MathJax, remember to call `window.MathJax.typesetPromise()` on the newly added content.

This guide provides a comprehensive template for adding new, well-integrated sections to your application.
