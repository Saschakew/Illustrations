window.SVARSections = window.SVARSections || {};

window.SVARSections.initEstimationRestrictions = function() {
    // Step 2: Configuration & Pre-flight Checks
    const sectionId = 'estimation-restrictions';
    const sectionElement = document.getElementById(sectionId);

    if (typeof Plotly === 'undefined' || !sectionElement || !document.getElementById('phi-slider')) { // Check for a key element
        console.warn(`[${sectionId}.js] Dependencies not ready. Retrying init...`);
        setTimeout(() => window.SVARSections.initEstimationRestrictions(), 100);
        return;
    }
    console.log(`[${sectionId}.js] Initializing section...`);
    // Ensure Plotly and required DOM elements are available. Retry if not ready.
    if (typeof Plotly === 'undefined' || !document.getElementById('estimation-restrictions')) {
        setTimeout(window.SVARSections.initEstimationRestrictions, 100);
        return;
    }

    // --- DOM Element References ---
        // Step 3: DOM Element References
    const elements = {
        phiSlider: sectionElement.querySelector('#phi-slider'), // Still needed for SVARControls init context
        phiValueDisplay: sectionElement.querySelector('.phi-value-display'), // Still needed for SVARControls init context
        sigmaUHatMatrix: sectionElement.querySelector('#sigma-u-hat-matrix-display'),
        pHatMatrix: sectionElement.querySelector('#p-hat-matrix-display'),
        bHatMatrix: sectionElement.querySelector('#b-hat-matrix-display'),
        phiTrueDisplay: sectionElement.querySelector('#phi-true-display'),
        innovationsPlot: sectionElement.querySelector('#innovations-scatter-plot-er'),
        correlationPlot: sectionElement.querySelector('#correlation-plot-er')
    };

    // --- Local State ---
        // Step 4: Local State Management (leaner - primarily holds data from global events)
    const state = {
        phi_estimation_global: 0,     // From PHI_ESTIMATION_UPDATED
        sigma_u_hat: null,            // From ESTIMATION_METRICS_UPDATED
        p_hat: null,                  // From ESTIMATION_METRICS_UPDATED
        phi_true_calculated: null,    // From ESTIMATION_METRICS_UPDATED
        correlationData: { phis: [], corrs: [] }, // From ESTIMATION_METRICS_UPDATED
        e1_data_estimated: [],        // From ESTIMATED_SHOCKS_UPDATED
        e2_data_estimated: [],        // From ESTIMATED_SHOCKS_UPDATED
        b_hat_matrix_val: null,       // From ESTIMATED_SHOCKS_UPDATED
        isCorrelationPlotInitialized: false
        // u_1t, u_2t, T, isNonRecursiveDGP, B_0_true are no longer stored locally if all calculations are global.
        // They are used by the central calculation logic which then publishes the derived metrics/shocks.
    };

        // Step 5: Core UI Update Function
    function updateUI() {
        // Update matrix displays
        if (elements.sigmaUHatMatrix) elements.sigmaUHatMatrix.innerHTML = state.sigma_u_hat ? window.SVARGeneral.matrixToHtml(state.sigma_u_hat) : 'N/A';
        if (elements.pHatMatrix) elements.pHatMatrix.innerHTML = state.p_hat ? window.SVARGeneral.matrixToHtml(state.p_hat) : 'N/A';
        if (elements.bHatMatrix) elements.bHatMatrix.innerHTML = state.b_hat_matrix_val ? window.SVARGeneral.matrixToHtml(state.b_hat_matrix_val) : 'N/A';

        // Update phiTrueDisplay (if it exists and is used)
        if (elements.phiTrueDisplay && typeof state.phi_true_calculated === 'number') {
            elements.phiTrueDisplay.textContent = state.phi_true_calculated.toFixed(3);
        }

        // Update plots
        window.SVARPlots.updateInnovationsScatterPlotER('innovations-scatter-plot-er', state.e1_data_estimated, state.e2_data_estimated);
        window.SVARPlots.updateCorrelationPlotER('correlation-plot-er', state.correlationData, state.phi_estimation_global, state.phi_true_calculated);

        // Attach the plot click listener only once, after the plot has been created.
        if (!state.isCorrelationPlotInitialized && elements.correlationPlot && elements.correlationPlot.on) {
            elements.correlationPlot.on('plotly_click', onCorrelationPlotClicked);
            state.isCorrelationPlotInitialized = true;
        }
    }

    // Step 6: Global Event Handlers
    function handlePhiEstimationUpdated(eventDetail) {
        console.log(`[${sectionId}.js] Received PHI_ESTIMATION_UPDATED event:`, eventDetail);
        if (eventDetail && typeof eventDetail.phi_estimation === 'number') {
            state.phi_estimation_global = eventDetail.phi_estimation;
            // No need to call updateUI() here if it's only for the correlation plot highlight
            // and SVARData will dispatch ESTIMATED_SHOCKS_UPDATED which triggers updateUI()
            // However, if the correlation plot needs an immediate highlight update:
            window.SVARPlots.updateCorrelationPlotER('correlation-plot-er', state.correlationData, state.phi_estimation_global, state.phi_true_calculated);
        } else {
            console.warn(`[${sectionId}.js] Invalid payload for PHI_ESTIMATION_UPDATED:`, eventDetail);
        }
    }

    function handleEstimationMetricsUpdated(event) {
        console.log(`[${sectionId}.js] Received ESTIMATION_METRICS_UPDATED event:`, event.detail);
        if (event.detail && event.detail.estimation_metrics) {
            const metrics = event.detail.estimation_metrics;
            state.sigma_u_hat = metrics.sigma_u_hat || null;
            state.p_hat = metrics.p_hat || null;
            state.phi_true_calculated = typeof metrics.phi_true_calculated === 'number' ? metrics.phi_true_calculated : null;
            state.correlationData = metrics.correlationData || { phis: [], corrs: [] };
            updateUI();
        } else {
            console.warn(`[${sectionId}.js] Invalid payload for ESTIMATION_METRICS_UPDATED:`, event);
        }
    }

    function handleEstimatedShocksUpdated(event) {
        console.log(`[${sectionId}.js] Received ESTIMATED_SHOCKS_UPDATED event:`, event.detail);
        if (event.detail && event.detail.estimated_shocks) {
            const shocks = event.detail.estimated_shocks;
            state.e1_data_estimated = shocks.e1_data_estimated || [];
            state.e2_data_estimated = shocks.e2_data_estimated || [];
            state.b_hat_matrix_val = shocks.b_hat_matrix_val || null;
            updateUI();
        } else {
            console.warn(`[${sectionId}.js] Invalid payload for ESTIMATED_SHOCKS_UPDATED:`, event);
        }
    }

    // DATA_UPDATED handler might be removed if u_t, B_0_true are no longer directly used by this module
    // and are only used by the central calculation logic.
    // They are used by the central calculation logic which then publishes the derived metrics/shocks.
    // If SVARControls for this section needs it (e.g. for 'New Sample' to clear things), it might still be needed.
    // For now, let's assume it's not directly populating the local state for plots.
    function handleGlobalDataUpdated(eventDetail) {
        console.log(`[${sectionId}.js] Received DATA_UPDATED event. Source: ${eventDetail ? eventDetail.source : 'N/A'}. This section might not directly use its payload anymore if calculations are fully centralized.`);
        // If this event implies that previous estimation metrics/shocks are stale, 
        // the central logic should publish new (or nullified) metrics/shocks, 
        // or this section might need to clear its state here.
        // For a truly lean section, it just waits for new ESTIMATION_METRICS_UPDATED and ESTIMATED_SHOCKS_UPDATED.
        // However, to ensure plots clear on 'New Sample' if new metrics don't arrive immediately:
        if (eventDetail && eventDetail.source !== sectionId) { // Avoid loops if this section itself triggers a DATA_UPDATED
            // state.sigma_u_hat = null; state.p_hat = null; state.phi_true_calculated = null; 
            // state.correlationData = { phis: [], corrs: [] }; state.e1_data_estimated = []; 
            // state.e2_data_estimated = []; state.b_hat_matrix_val = null;
            // updateUI(); // This would clear plots. Better if central logic publishes nullified data.
        }
    }

    // --- Section-Specific Action Handlers (Not global controls, but actions within this section) ---
    function onEstimateButtonClicked() {
        // Find the phi that minimizes the absolute value of the sample correlation of structural shocks
        let minCorr = Infinity;
        let bestPhi = 0;
        if (state.correlationData && state.correlationData.phis) {
            state.correlationData.phis.forEach((phi, i) => {
                const corr = Math.abs(state.correlationData.corrs[i]);
                if (corr < minCorr) {
                    minCorr = corr;
                    bestPhi = phi;
                }
            });
        }
        
        // This should now call SVARData.setPhiEstimation to update the global value.
        // SVARControls will then update the slider's visual position.
        window.SVARData.setPhi(bestPhi, 'estimateButtonER'); 
    }
    
    function onCorrelationPlotClicked(data) {
        if (data.points && data.points.length > 0) {
            const clickedPhi = data.points[0].x;
            // This should also call SVARData.setPhiEstimation.
            window.SVARData.setPhi(clickedPhi, 'correlationPlotClickER');
        }
    }

    // Step 7: Initialization Sequence
    // A. Subscribe to Global Events
    // A. Subscribe to Global Events
    if (window.SVARData && typeof window.SVARData.subscribe === 'function' && window.SVARData.events) {
        console.log(`[${sectionId}.js] Subscribing to global events:`, window.SVARData.events);
        window.SVARData.subscribe(window.SVARData.events.PHI_CHANGED, handlePhiEstimationUpdated);
        window.SVARData.subscribe(window.SVARData.events.ESTIMATION_METRICS_UPDATED, handleEstimationMetricsUpdated);
        window.SVARData.subscribe(window.SVARData.events.ESTIMATED_SHOCKS_UPDATED, handleEstimatedShocksUpdated);
        window.SVARData.subscribe(window.SVARData.events.DATA_UPDATED, handleGlobalDataUpdated);
    } else {
        console.error(`[${sectionId}.js] SVARData.subscribe or SVARData.events is not available.`);
    }

    // B. Initialize Shared Controls (SVARControls will handle phi-slider, b0ModeSwitch for this sectionId)
    if (window.SVARControls && typeof window.SVARControls.initializeControls === 'function') {
        window.SVARControls.initializeControls(sectionId, sectionElement);
    } else {
        console.error(`[${sectionId}.js] SVARControls.initializeControls is not available.`);
    }

    // Initialize Sticky Menu for this section
    if (typeof initializeStickyMenu === 'function') {
        console.log(`[${sectionId}.js] Initializing sticky menu for er-section-wrapper.`);
        initializeStickyMenu('er-section-wrapper', 'controls-container-er', 'controls-placeholder-er');
    } else {
        console.error(`[${sectionId}.js] initializeStickyMenu is not available. Ensure menu.js is loaded.`);
    }

    // C. Initialize Sticky Menu (if applicable for this section)
    // initializeStickyMenu(sectionId, 'simulation-controls', 'controls-placeholder'); // Assuming 'simulation-controls' is the ID of the controls div

    // D. Fetch Initial Global State
    // D. Fetch Initial Global State for phi
    if (window.SVARData && typeof window.SVARData.current_phi === 'number') {
        state.phi_estimation_global = window.SVARData.current_phi;
        console.log(`[${sectionId}.js] Initial global phi from SVARData.current_phi: ${state.phi_estimation_global}`);
    } else {
        state.phi_estimation_global = 0; // Fallback default
        console.warn(`[${sectionId}.js] SVARData.current_phi not available at init or not a number. Defaulting to 0.`);
    }
    // Fetch initial metrics and shocks if getters are available, or wait for events.
    // Example: if (window.SVARData.getCurrentEstimationMetrics) { /* update state ... */ }

    // E. Initial UI Draw
    console.log(`[${sectionId}.js] Performing initial UI draw.`);
    updateUI();

    // F. Window Resize Listener
    window.addEventListener('resize', () => {
        // Only redraw if necessary data exists to prevent errors (plots might clear if data is null)
        console.log(`[${sectionId}.js] Window resized. Re-rendering UI.`);
        updateUI();
    });

    // Step 8: Section-Specific Event Listeners (for actions, not global controls)
    // Listener for the original "Estimate" button (if it exists and is different)
    // const originalEstimateButton = sectionElement.querySelector('#someOtherEstimateButtonId'); 
    // if (originalEstimateButton) { 
    //    originalEstimateButton.addEventListener('click', onEstimateButtonClicked); 
    // }

    // D. Fetch Initial Global State (continued for metrics/shocks)
    // This part fetches data that might have been set by SVARData upon its own initialization or by other sections like svar_setup.
    if (window.SVARData) {
        console.log(`[${sectionId}.js] Attempting to fetch initial state from SVARData for initial draw.`);
        if (window.SVARData.estimation_metrics) {
            const metrics = window.SVARData.estimation_metrics;
            state.sigma_u_hat = metrics.sigma_u_hat || null;
            state.p_hat = metrics.p_hat || null;
            state.phi_true_calculated = typeof metrics.phi_true_calculated === 'number' ? metrics.phi_true_calculated : null;
            state.correlationData = metrics.correlationData || { phis: [], corrs: [] };
            console.log(`[${sectionId}.js] Initial metrics fetched for draw:`, state.sigma_u_hat, state.p_hat, state.phi_true_calculated, state.correlationData);
        } else {
            console.log(`[${sectionId}.js] SVARData.estimation_metrics not available at init for draw.`);
        }
        if (window.SVARData.estimated_shocks) {
            const shocks = window.SVARData.estimated_shocks;
            state.e1_data_estimated = shocks.e1_data_estimated || [];
            state.e2_data_estimated = shocks.e2_data_estimated || [];
            state.b_hat_matrix_val = shocks.b_hat_matrix_val || null;
            console.log(`[${sectionId}.js] Initial shocks fetched for draw:`, state.e1_data_estimated.length, state.e2_data_estimated.length, state.b_hat_matrix_val);
        } else {
            console.log(`[${sectionId}.js] SVARData.estimated_shocks not available at init for draw.`);
        }
    } else {
        console.warn(`[${sectionId}.js] SVARData not available to fetch initial state for draw.`);
    }

    // E. Initial UI Draw (performInitialDraw was a concept, direct updateUI is fine here after state prep)
    console.log(`[${sectionId}.js] Performing initial UI draw after state preparation.`);
    updateUI();

    // F. Window Resize Listener (ensure this is only added once and correctly)
    // Note: This listener was already present around line 200 in the original full file. 
    // We are ensuring it's correctly placed within the function scope if it was moved or duplicated.
    // If it's already correctly placed earlier, this might be a duplicate. 
    // For now, assuming this is the definitive placement for the resize listener for this function.
    // A better pattern might be to return updateUI and let a central manager handle resize, but this is common.
    // window.removeEventListener('resize', existingResizeHandler); // If there was a previous one to clean up
    const resizeHandler = () => {
        console.log(`[${sectionId}.js] Window resized. Re-rendering UI.`);
        updateUI();
    };
    window.addEventListener('resize', resizeHandler);
    // Consider cleanup: sectionElement.addEventListener('destroy', () => window.removeEventListener('resize', resizeHandler));

    console.log(`[${sectionId}.js] Section initialized successfully.`);
}; // End of window.SVARSections.initEstimationRestrictions = function()
