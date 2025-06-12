// shared_controls.js

// This module will manage the initialization and synchronization of common UI controls
// across different sections of the visualization.

window.SVARControls = {
    initializeControls: function(sectionId) {
        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) {
            console.error(`[SVARControls] Section element with ID '${sectionId}' not found.`);
            return;
        }

        // Find controls within the specific section
        // Find controls within the specific section using robust, reusable classes
        const sampleSizeSlider = sectionElement.querySelector('.form-range[min="250"]');
        const sampleSizeValue = sectionElement.querySelector('.sample-size-value');
        const newSampleBtn = sectionElement.querySelector('.new-sample-btn');
        const phiSwitch = sectionElement.querySelector('.custom-switch input[type="checkbox"]');
        const phiLabel0 = sectionElement.querySelector('.phi-label-left');
        const phiLabelPi = sectionElement.querySelector('.phi-label-right');

        // The new approach is more flexible, so we check for each control individually.
        // This allows sections to have only a subset of the global controls.

        // --- Helper function to update toggle switch visuals ---
        const updateToggleVisual = () => {
            // This function now safely handles cases where the toggle switch is not present.
            if (phiSwitch && phiLabel0 && phiLabelPi) {
                if (phiSwitch.checked) {
                    phiLabel0.classList.remove('selected');
                    phiLabelPi.classList.add('selected');
                } else {
                    phiLabel0.classList.add('selected');
                    phiLabelPi.classList.remove('selected');
                }
            }
        };

        // --- Function to trigger data regeneration ---
        const regenerateData = () => {
            // Get T from slider if it exists, otherwise from global state, otherwise default.
            const T = sampleSizeSlider ? parseInt(sampleSizeSlider.value, 10) : (window.SVARData.T || 500);
            // Get model type from switch if it exists, otherwise from global state, otherwise default.
            const isNonRecursive = phiSwitch ? phiSwitch.checked : (window.SVARData.isNonRecursive || false);
            window.SVARFunctions.generateAndStoreSvarData(T, isNonRecursive);
        };

        // --- Attach UI Event Listeners (only if controls exist) ---
        if (sampleSizeSlider && sampleSizeValue) {
            sampleSizeSlider.addEventListener('input', () => {
                sampleSizeValue.textContent = sampleSizeSlider.value;
            });
            sampleSizeSlider.addEventListener('change', regenerateData);
        }

        if (newSampleBtn) {
            newSampleBtn.addEventListener('click', regenerateData);
        }

        if (phiSwitch) {
            phiSwitch.addEventListener('change', () => {
                updateToggleVisual();
                regenerateData();
            });

            if (phiLabel0 && phiLabelPi) {
                // Add click listeners to labels for better UX
                phiLabel0.addEventListener('click', () => { if (phiSwitch.checked) { phiSwitch.checked = false; phiSwitch.dispatchEvent(new Event('change')); } });
                phiLabelPi.addEventListener('click', () => { if (!phiSwitch.checked) { phiSwitch.checked = true; phiSwitch.dispatchEvent(new Event('change')); } });
            }
        }

        // --- Data Subscription Listener for Synchronization ---
        window.SVARData.subscribe(window.SVARData.events.DATA_UPDATED, (event) => {
            const data = event.detail;
            // If the event was triggered by this section's controls, ignore it to prevent loops
            if (data && data.source === sectionId) {
                // console.log(`[shared_controls.js/${sectionId}] Ignoring self-triggered DATA_UPDATED event from source: ${data.source}`);
                return;
            }

            // Sync Sample Size (T)
            if (sampleSizeSlider && sampleSizeValue && data.T && sampleSizeSlider.value !== String(data.T)) {
                sampleSizeSlider.value = data.T;
                sampleSizeValue.textContent = data.T;
            }

            // Sync Model Type (Recursive/Non-recursive)
            if (phiSwitch && typeof data.isNonRecursive === 'boolean' && phiSwitch.checked !== data.isNonRecursive) {
                phiSwitch.checked = data.isNonRecursive;
                updateToggleVisual(); // updateToggleVisual also has internal null checks for phiSwitch and labels
            }
        });

        // --- Initial State Setup ---
        const initialData = window.SVARData.data || {};
        if (sampleSizeSlider && sampleSizeValue) {
            sampleSizeSlider.value = initialData.T || 500;
            sampleSizeValue.textContent = sampleSizeSlider.value;
        }
        if (phiSwitch) {
            phiSwitch.checked = initialData.isNonRecursive || false;
            updateToggleVisual();
        }

        console.log(`[SVARControls] Initialized and synchronized controls for section '${sectionId}'.`);

        // Specific handling for estimation-restrictions section controls
        if (sectionId === 'estimation-restrictions') {
            const erPhiSlider = sectionElement.querySelector('#phi-slider');
            const erPhiValueDisplay = sectionElement.querySelector('.phi-value-display');
            const erB0ModeSwitch = sectionElement.querySelector('#b0EstimationModeSwitch');

            if (erPhiSlider && erPhiValueDisplay) {
                erPhiSlider.addEventListener('input', function(event) {
                    const newPhi = parseFloat(event.target.value);
                    erPhiValueDisplay.textContent = newPhi.toFixed(2);
                    if (window.SVARData && typeof window.SVARData.setPhiEstimation === 'function') {
                        console.log(`[SVARControls/ER] phiSlider input: ${newPhi}. Calling SVARData.setPhiEstimation.`);
                        window.SVARData.setPhiEstimation(newPhi, `phiSlider-${sectionId}`);
                    } else {
                        console.error(`[SVARControls/ER] SVARData.setPhiEstimation is NOT AVAILABLE.`);
                    }
                });

                // Initial sync for ER phi slider
                if (window.SVARData && typeof window.SVARData.phi_estimation !== 'undefined') {
                    erPhiSlider.value = window.SVARData.phi_estimation;
                    erPhiValueDisplay.textContent = window.SVARData.phi_estimation.toFixed(2);
                } else {
                    // Default if not set
                    const defaultPhiEstimation = 0.0;
                    erPhiSlider.value = defaultPhiEstimation;
                    erPhiValueDisplay.textContent = defaultPhiEstimation.toFixed(2);
                    if (window.SVARData && typeof window.SVARData.setPhiEstimation === 'function') {
                         window.SVARData.setPhiEstimation(defaultPhiEstimation, `phiSlider-${sectionId}-init`);
                    }
                }
            }

            if (erB0ModeSwitch) {
                const erLabelRecursive = sectionElement.querySelector('.phi-label-left-er');
                const erLabelNonRecursive = sectionElement.querySelector('.phi-label-right-er');

                const updateEstimationToggleVisual = () => {
                    if (erLabelRecursive && erLabelNonRecursive) {
                        if (erB0ModeSwitch.checked) { // Non-recursive
                            erLabelRecursive.classList.remove('selected');
                            erLabelNonRecursive.classList.add('selected');
                        } else { // Recursive
                            erLabelRecursive.classList.add('selected');
                            erLabelNonRecursive.classList.remove('selected');
                        }
                    }
                };

                erB0ModeSwitch.addEventListener('change', function(event) {
                    updateEstimationToggleVisual();
                    if (window.SVARData) { // Simplified check, assuming SVARData exists
                        if (!event.target.checked) { // Recursive mode selected
                            console.log('[SVARControls/ER] b0ModeSwitch changed to Recursive. Phi slider remains active and its value is unchanged by this switch.');
                        } else { // Non-recursive mode selected
                            console.log('[SVARControls/ER] b0ModeSwitch changed to Non-Recursive. Phi slider remains active and its value is unchanged by this switch.');
                        }
                        // This switch NO LONGER AFFECTS the phi-slider's enabled state or value.
                    }
                });

                // Initial state for ER B0 mode switch
                erB0ModeSwitch.checked = false; // Default to Recursive
                updateEstimationToggleVisual(); // Update labels to match initial state

                // Slider should be enabled by default
                if(erPhiSlider) erPhiSlider.disabled = false;
            }
        }
    }
    // Centralized subscription to PHI_CHANGED to update relevant controls
    // This needs to be outside initializeControls if SVARControls is an object literal like this,
    // or we need a separate init function for SVARControls itself that sets up global listeners once.
    // For now, let's assume this subscription setup is called once, perhaps by main.js after SVARData is ready.
    // A better pattern would be for SVARControls to have its own init method.

    // Let's try to attach it directly here. It might run multiple times if initializeControls is called for multiple sections,
    // but addEventListener is idempotent for the same function reference.
    // However, the function is anonymous, so it WILL add multiple listeners. This is not ideal.

    // A cleaner way: SVARControls needs an init method called once.
    // For now, this will be added to the initializeControls and rely on sectionId filtering for updates.
}; 

// It's better to have a separate function to set up global listeners once.
// Or, ensure SVARData.subscribe is robust against multiple identical subscriptions if the callback is identical.
// Let's assume main.js will call a specific setup function for global listeners if needed.
// For now, the PHI_CHANGED subscription will be handled within initializeControls for the 'estimation-restrictions' section if needed,
// or a more global subscription if SVARControls is refactored to have a single init point.

// Let's add a dedicated method to SVARControls for global event setup, and call it from main.js
window.SVARControls.setupGlobalEventListeners = function() {
    if (this._globalListenersInitialized) return;
    console.log('[SVARControls] Setting up global event listeners (PHI_CHANGED).');

    if (window.SVARData && typeof window.SVARData.subscribe === 'function' && window.SVARData.events) {
        window.SVARData.subscribe(window.SVARData.events.PHI_CHANGED, (event) => {
            if (!event.detail) return;
            const newPhi = event.detail.phi;
            console.log(`[SVARControls Global Listener] Received PHI_CHANGED event. New phi: ${newPhi}`);

            // Update Estimation Restrictions controls if they exist and are relevant
            const erSectionElement = document.getElementById('estimation-restrictions');
            // The PHI_CHANGED event is for phi_DGP.
            // Controls in the 'estimation-restrictions' section (erPhiSlider, erB0ModeSwitch)
            // should NOT be updated based on phi_DGP changes.
            // Their state is managed independently within their own section's logic (initializeControls for 'estimation-restrictions').
            // Therefore, the code that previously updated these controls here has been removed.
            if (erSectionElement) {
                // Example: If there were a display for phi_DGP *within* the estimation section (unlikely), it could be updated here.
                // For now, no action is taken on estimation-section controls based on global PHI_CHANGED (phi_DGP).
                console.log(`[SVARControls Global Listener] PHI_CHANGED (phi_DGP = ${newPhi}) received. No direct update to estimation-restriction controls from this global listener.`);
            }
            // Add updates for other sections' phi controls here if any
        });
        this._globalListenersInitialized = true;
    } else {
        console.error('[SVARControls] Cannot setup global listeners: SVARData.subscribe not available.');
    }
};

