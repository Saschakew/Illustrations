window.SVARSections = window.SVARSections || {};
window.SVARSections.initEstimationRestrictions = function() {
    const sectionId = 'estimation-restrictions';
    const section = document.getElementById(sectionId);

    // Enhanced check: Wait for Plotly, the section container, and a key element within the section.
    if (typeof Plotly === 'undefined' || !section || !section.querySelector('#phiSlider_er')) {
        setTimeout(window.SVARSections.initEstimationRestrictions, 100);
        return;
    }

    const elements = {
        phiSlider: section.querySelector('#phiSlider_er'),
        phiValue: section.querySelector('#phiValue_er'),
        estimateRecursiveBtn: section.querySelector('#estimateRecursiveBtn_er'),
        phiValueDisplay: section.querySelector('#phiValueDisplay_er'),
        bMatrixDisplay: section.querySelector('#bMatrixDisplay_er'),
        phiTrueRecDisplay: section.querySelector('#phi_true_rec_display'),
        phiTrueNonRecDisplay: section.querySelector('#phi_true_non_rec_display'),
        estimationResultsContainer: section.querySelector('#estimationResults_er'),
        estimatedPhiValue: section.querySelector('#estimatedPhiValue_er'),
        estimatedB: section.querySelector('#estimatedB_er'),
        trueB0: section.querySelector('#trueB0_er'),
        innovationsPlot: section.querySelector('#innovationsScatterPlot_er'),
        correlationPlot: section.querySelector('#correlationPlot_er')
    };

    const state = {
        u_1t: [], u_2t: [], T: 0, isNonRecursive: false, phi_current: 0,
        sigma_u_hat: null, p_hat: null, correlationData: { phis: [], corrs: [] },
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
            state.correlationData = metrics.correlationData;

            const phiData = state.isNonRecursive ? { phi_true_non_rec: metrics.phi_true } : { phi_true_rec: metrics.phi_true };
            window.SVARData.updateData({ ...phiData, source: sectionId });
        }
    }

    function updateUI() {
        if (!state.p_hat || !elements.phiSlider) return;

        state.phi_current = parseFloat(elements.phiSlider.value);
        if(elements.phiValue) elements.phiValue.textContent = state.phi_current.toFixed(2);
        if (elements.phiValueDisplay) elements.phiValueDisplay.textContent = state.phi_current.toFixed(2);

        const R_current = window.SVARFunctions.getB0Matrix(state.phi_current);
        const b_hat_current = window.SVARFunctions.matmul(state.p_hat, R_current);
        if (elements.bMatrixDisplay) elements.bMatrixDisplay.innerHTML = window.SVARGeneral.matrixToHtml(b_hat_current);

        if (elements.phiTrueRecDisplay) elements.phiTrueRecDisplay.textContent = (window.SVARData.phi_true_rec || 0).toFixed(3);
        if (elements.phiTrueNonRecDisplay) elements.phiTrueNonRecDisplay.textContent = (window.SVARData.phi_true_non_rec || 0).toFixed(3);

        const { e1_data, e2_data } = window.SVARFunctions.calculateEstimatedShocks(state.phi_current, state.p_hat, state.u_1t, state.u_2t);
        const active_phi_true = state.isNonRecursive ? (window.SVARData.phi_true_non_rec || 0) : (window.SVARData.phi_true_rec || 0);

        window.SVARPlots.updateEstimationRestrictionPlots({
            innovationsPlotId: 'innovationsScatterPlot_er',
            e1Data: e1_data, e2Data: e2_data,
            correlationPlotId: 'correlationPlot_er',
            correlationData: state.correlationData,
            currentPhi: state.phi_current,
            phiTrue: active_phi_true
        });

        if (!state.isCorrelationPlotInitialized && elements.correlationPlot) {
            elements.correlationPlot.on('plotly_click', onCorrelationPlotClicked);
            state.isCorrelationPlotInitialized = true;
        }
    }

    function onDataUpdated(event) {
        if (!section || section.style.display === 'none' || !document.body.contains(section)) return;
        const data = event.detail;
        if (data.source === sectionId) return;
        if (!data || !data.u_1t || data.u_1t.length === 0) return;

        processDataUpdate(data);
        updateUI();
    }

    function onEstimateButtonClicked() {
        const bestPhi = window.SVARFunctions.findBestPhi(state.correlationData);
        if (elements.phiSlider) {
            elements.phiSlider.value = bestPhi;
            elements.phiSlider.dispatchEvent(new Event('input'));
        }
    }

    function onCorrelationPlotClicked(data) {
        if (data.points && data.points.length > 0) {
            const clickedPhi = data.points[0].x;
            if (elements.phiSlider) {
                elements.phiSlider.value = clickedPhi;
                elements.phiSlider.dispatchEvent(new Event('input'));
            }
        }
    }

    window.SVARData.subscribe('DATA_UPDATED', onDataUpdated);

    if (elements.phiSlider) {
        elements.phiSlider.addEventListener('input', updateUI);
    } else {
        console.error('[estimation_restrictions.js] phiSlider element not found.');
    }

    if (elements.estimateRecursiveBtn) {
        elements.estimateRecursiveBtn.addEventListener('click', onEstimateButtonClicked);
    }

    window.SVARControls.initializeControls(sectionId);
    initializeStickyMenu(sectionId, 'estimation-controls', 'controls-placeholder-er');

    function triggerInitialLoad() {
        if (window.SVARData.u_1t && window.SVARData.u_1t.length > 0) {
            const initialData = { ...window.SVARData };
            processDataUpdate(initialData);
            updateUI();
        } else {
            // The 'DATA_UPDATED' event will trigger the update.
            window.SVARFunctions.generateAndStoreSvarData(500, false);
        }
    }

    triggerInitialLoad();
}
