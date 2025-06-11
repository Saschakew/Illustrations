function initSvarSetup() {
    // We'll use the central SVARData store instead of a local object
    // But keep the legacy object for backward compatibility
    window.svarSetupData = {};
    console.log("Initializing SVAR setup visualization...");

    // Check if Plotly and the essential elements are loaded
    if (typeof Plotly === 'undefined' || 
        !document.getElementById('sampleSizeSlider') || 
        !document.getElementById('shocksScatterPlot') || 
        !document.getElementById('reducedShocksScatterPlot')
    ) {
        setTimeout(initSvarSetup, 100); // Retry after a short delay
        return;
    }

    // Local variables to hold data for plotting. These will be updated by the DATA_UPDATED event.
    let epsilon_1t, epsilon_2t;                 
    let u_1t, u_2t;                             
    let B_0;                                    
    let selectedPointIndex = null;              // For potential future use with plot interactions

    // --- Reactive Plotting Setup ---
    // Plots will now update automatically whenever the central data store changes.
    const section = document.getElementById('svar-setup');
    window.SVARData.subscribe('DATA_UPDATED', (event) => {
        // Defensively check if the section is visible before proceeding.
        if (section.style.display === 'none' || !document.body.contains(section)) {
            return; // Do nothing if the section is not visible or detached from the DOM.
        }
        const data = event.detail;
        console.log('[svar_setup.js] Received DATA_UPDATED event. Updating plots.');
        if (data && data.epsilon_1t && data.u_1t) {
            // Update local variables for convenience
            epsilon_1t = data.epsilon_1t;
            epsilon_2t = data.epsilon_2t;
            u_1t = data.u_1t;
            u_2t = data.u_2t;
            B_0 = data.B_0;

            // Update the plots with the new data
            window.SVARPlots.updateSvarSetupPlots(epsilon_1t, epsilon_2t, u_1t, u_2t);
        }
    });

    // Redraw plots on resize to maintain aspect ratio
    window.addEventListener('resize', () => {
        if (epsilon_1t && u_1t) { // Only redraw if data exists
            window.SVARPlots.updateSvarSetupPlots(epsilon_1t, epsilon_2t, u_1t, u_2t);
        }
    });

    // --- Initial Execution ---
    console.log("[svar_setup.js] Initializing section...");
    const sectionElement = document.getElementById('svar-setup');

    // Initialize all shared controls within this section. This will also set their initial state.
    window.SVARControls.initializeControls('svar-setup');
    
    // Trigger the first data generation using the initial state of the controls.
    // The DATA_UPDATED event from this call will trigger the first plot draw.
    const initialT = parseInt(sectionElement.querySelector('.form-range').value, 10);
    const initialIsNonRecursive = sectionElement.querySelector('.custom-switch input').checked;
    window.SVARFunctions.generateAndStoreSvarData(initialT, initialIsNonRecursive);

    initializeStickyMenu('svar-setup', 'simulation-controls', 'controls-placeholder');
    
    // Expose functions to global scope (both legacy and new system)
    // window.svarSetupData.generateAndPlot = generateAndPlot;

    // Loading screen is now handled at the global level in main.js
}

// initSvarSetup is now called by main.js after content has been loaded.
