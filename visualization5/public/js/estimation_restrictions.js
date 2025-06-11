window.SVARSections = window.SVARSections || {};
window.SVARSections.initEstimationRestrictions = function() {
    // Ensure Plotly and required DOM elements are available. Retry if not ready.
    if (typeof Plotly === 'undefined' || !document.getElementById('estimation-restrictions')) {
        setTimeout(window.SVARSections.initEstimationRestrictions, 100);
        return;
    }

    const sectionId = 'estimation-restrictions';
    const section = document.getElementById(sectionId);

    // --- DOM Element References ---
    const elements = {
        phiSlider: section.querySelector('#phi-slider'),
        phiValueDisplay: section.querySelector('.phi-value-display'),
        sigmaUHatMatrix: section.querySelector('#sigma-u-hat-matrix-display'),
        pHatMatrix: section.querySelector('#p-hat-matrix-display'),
        bHatMatrix: section.querySelector('#b-hat-matrix-display'),
        phiTrueDisplay: section.querySelector('#phi-true-display'),
        innovationsPlot: section.querySelector('#innovations-scatter-plot-er'),
        correlationPlot: section.querySelector('#correlation-plot-er'),
        estimateRecursiveBtn: section.querySelector('#estimate-recursive-btn-er')
    };

    // --- Local State ---
    const state = {
        u_1t: [],
        u_2t: [],
        T: 0,
        isNonRecursive: false,
        phi_current: 0,
        sigma_u_hat: null,
        p_hat: null,
        phi_true: 0,
        correlationData: { phis: [], corrs: [] },
        isCorrelationPlotInitialized: false
    };

    function processDataUpdate(data) {
        state.u_1t = data.u_1t;
        state.u_2t = data.u_2t;
        state.T = data.T;
        state.isNonRecursive = data.isNonRecursive;

        const metrics = window.SVARFunctions.calculateEstimationMetrics(state.u_1t, state.u_2t, state.isNonRecursive);

        if (metrics) {
            state.sigma_u_hat = metrics.sigma_u_hat;
            state.p_hat = metrics.p_hat;
            state.phi_true = metrics.phi_true;
            state.correlationData = metrics.correlationData;

            // Store the calculated true phi in the global data store
            const phiData = state.isNonRecursive ? { phi_true_non_rec: state.phi_true } : { phi_true_rec: state.phi_true };
            window.SVARData.updateData(phiData);
        }
    }

    // --- UI Update Functions ---

    function updateUI() {
        if (!state.p_hat) return; // Don't update if calculations failed

        state.phi_current = parseFloat(elements.phiSlider.value);

        // Update matrix displays
        elements.sigmaUHatMatrix.innerHTML = window.SVARGeneral.matrixToHtml(state.sigma_u_hat);
        elements.pHatMatrix.innerHTML = window.SVARGeneral.matrixToHtml(state.p_hat);
        
        const R_current = window.SVARFunctions.getB0Matrix(state.phi_current);
        const b_hat_current = window.SVARFunctions.matmul(state.p_hat, R_current);
        elements.bHatMatrix.innerHTML = window.SVARGeneral.matrixToHtml(b_hat_current);

        // Update global state store
        window.SVARData.updateData({
            current_phi: state.phi_current,
            current_B_phi: b_hat_current,
            source: sectionId // Prevent event loops
        });

        // Update text displays
        elements.phiTrueDisplay.textContent = state.phi_true.toFixed(3);
        if(elements.phiValueDisplay) elements.phiValueDisplay.textContent = state.phi_current.toFixed(2);

        // Update plots
        const b_hat_inv = window.SVARFunctions.matinv(b_hat_current);
        if (!b_hat_inv) return;
        const e1_data = state.u_1t.map((u1, i) => b_hat_inv[0][0] * u1 + b_hat_inv[0][1] * state.u_2t[i]);
        const e2_data = state.u_1t.map((u1, i) => b_hat_inv[1][0] * u1 + b_hat_inv[1][1] * state.u_2t[i]);

        window.SVARPlots.updateInnovationsScatterPlotER('innovations-scatter-plot-er', e1_data, e2_data);
        window.SVARPlots.updateCorrelationPlotER('correlation-plot-er', state.correlationData, state.phi_current, state.phi_true);

        // Attach the plot click listener only once, after the plot has been created.
        if (!state.isCorrelationPlotInitialized && elements.correlationPlot) {
            elements.correlationPlot.on('plotly_click', onCorrelationPlotClicked);
            state.isCorrelationPlotInitialized = true;
        }
    }

    // --- Event Handlers ---

    function onDataUpdated(event) {
        console.log('[estimation_restrictions.js] Received DATA_UPDATED event.');
        const data = event.detail;
        if (!data || !data.u_1t || data.u_1t.length === 0) {
            console.warn('[estimation_restrictions.js] No data in event, skipping update.');
            return;
        }
        processDataUpdate(data);
        updateUI();
    }

    function onPhiSliderChanged() {
        updateUI();
    }

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
        
        elements.phiSlider.value = bestPhi;
        elements.phiSlider.dispatchEvent(new Event('input')); 
    }
    
    function onCorrelationPlotClicked(data) {
        if (data.points && data.points.length > 0) {
            const clickedPhi = data.points[0].x;
            elements.phiSlider.value = clickedPhi;
            elements.phiSlider.dispatchEvent(new Event('input'));
        }
    }

    // --- Initialization ---

    window.SVARData.subscribe('DATA_UPDATED', onDataUpdated);
    elements.phiSlider.addEventListener('input', onPhiSliderChanged);
    if(elements.estimateRecursiveBtn) {
        elements.estimateRecursiveBtn.addEventListener('click', onEstimateButtonClicked);
    }
    

    window.SVARControls.initializeControls(sectionId);
    initializeStickyMenu(sectionId, 'simulation-controls', 'controls-placeholder');
    
    if (window.SVARData.u_1t && window.SVARData.u_1t.length > 0) {
        console.log('[estimation_restrictions.js] Initializing with existing data.');
        const initialData = { ...window.SVARData };
        processDataUpdate(initialData);
        updateUI();
    }

    console.log('[estimation_restrictions.js] Estimation and Restrictions section initialized.');
}
