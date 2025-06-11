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
        window.SVARData.subscribe('DATA_UPDATED', (event) => {
            // Only synchronize controls if the section is currently visible
            if (sectionElement.style.display === 'none') {
                return;
            }
            const data = event.detail;

            // Sync Sample Size (T)
            if (sampleSizeSlider && data.T && sampleSizeSlider.value !== String(data.T)) {
                sampleSizeSlider.value = data.T;
                if (sampleSizeValue) {
                    sampleSizeValue.textContent = data.T;
                }
            }

            // Sync Model Type (Recursive/Non-recursive)
            if (phiSwitch && typeof data.isNonRecursive === 'boolean' && phiSwitch.checked !== data.isNonRecursive) {
                phiSwitch.checked = data.isNonRecursive;
                updateToggleVisual();
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
    }
};
