// SVARControls.js - Manages shared UI controls and their interactions with global state

window.SVARControls = (function() {
    'use strict';

    // --- Private State ---
    // Store references to controls if they need to be updated globally
    // e.g., all phi-sliders if they are meant to be synced beyond the active section
    const controlRefs = {
        // 'estimation-restrictions': { phiSlider: null, phiValueDisplay: null, b0ModeSwitch: null }
    };

    // --- Private Methods ---
    function _updateEstimationRestrictionControls(sectionElement, newPhi) {
        const phiSlider = sectionElement.querySelector('#phi-slider');
        const phiValueDisplay = sectionElement.querySelector('.phi-value-display');
        const b0ModeSwitch = sectionElement.querySelector('#b0EstimationModeSwitch');

        if (phiSlider) {
            phiSlider.value = newPhi;
        }
        if (phiValueDisplay) {
            phiValueDisplay.textContent = parseFloat(newPhi).toFixed(2);
        }
        // Update slider enabled state based on b0ModeSwitch state (which should reflect phi=0 for recursive)
        if (b0ModeSwitch && phiSlider) {
            if (b0ModeSwitch.checked) { // Non-Recursive
                phiSlider.disabled = false;
            } else { // Recursive
                phiSlider.disabled = true;
                if (newPhi !== 0 && b0ModeSwitch.checked === false) {
                    // This case implies phi was set to 0 by the switch, slider should reflect that.
                    // Or, if phi was set externally to non-zero while switch is recursive, this is a conflict.
                    // For now, assume switch is master for enabling/disabling.
                }
            }
        }
    }

    // --- Public API ---
    const publicApi = {
        initializeControls: function(sectionId, sectionElement) {
            if (!sectionElement) {
                console.error(`[SVARControls] No sectionElement provided for sectionId: ${sectionId}`);
                return;
            }
            console.log(`[SVARControls] Initializing controls for section: ${sectionId}`);

            controlRefs[sectionId] = {}; // Initialize refs for this section

            switch (sectionId) {
                case 'estimation-restrictions':
                    const phiSlider = sectionElement.querySelector('#phi-slider');
                    const phiValueDisplay = sectionElement.querySelector('.phi-value-display');
                    const b0ModeSwitch = sectionElement.querySelector('#b0EstimationModeSwitch');

                    if (phiSlider && phiValueDisplay) {
                        controlRefs[sectionId].phiSlider = phiSlider;
                        controlRefs[sectionId].phiValueDisplay = phiValueDisplay;

                        phiSlider.addEventListener('input', function(event) {
                            const newPhi = parseFloat(event.target.value);
                            phiValueDisplay.textContent = newPhi.toFixed(2);
                            if (window.SVARData && typeof window.SVARData.setPhiEstimation === 'function') {
                                console.log(`[SVARControls] phiSlider input: ${newPhi} for ${sectionId}. Calling SVARData.setPhiEstimation.`);
                                window.SVARData.setPhiEstimation(newPhi, `phiSlider-${sectionId}`);
                            } else {
                                console.error(`[SVARControls] phiSlider input: SVARData.setPhiEstimation is NOT AVAILABLE. Cannot update global phi for ${sectionId}. Value was ${newPhi}.`);
                            }
                        });
                        // Initial sync with global state if available
                        if (window.SVARData && typeof window.SVARData.getPhiEstimation === 'function'){
                            const currentGlobalPhi = window.SVARData.getPhiEstimation();
                            phiSlider.value = currentGlobalPhi;
                            phiValueDisplay.textContent = currentGlobalPhi.toFixed(2);
                        }

                    } else {
                        console.warn(`[SVARControls] Phi slider or display not found in section: ${sectionId}`);
                    }

                    if (b0ModeSwitch) {
                        controlRefs[sectionId].b0ModeSwitch = b0ModeSwitch;
                        b0ModeSwitch.addEventListener('change', function(event) {
                            if (window.SVARData && typeof window.SVARData.setPhiEstimation === 'function') {
                                if (!event.target.checked) { // Recursive mode
                                    window.SVARData.setPhiEstimation(0, `b0ModeSwitch-${sectionId}-Recursive`);
                                    if(phiSlider) phiSlider.disabled = true;
                                } else { // Non-recursive mode
                                    if(phiSlider) phiSlider.disabled = false;
                                    // Optional: Set phi to a default non-zero or last known non-zero value
                                    // For now, just enable slider, user can set phi.
                                    // Or, if phi is already non-zero, that's fine.
                                    // If phi is zero, it will remain zero until slider is moved.
                                }
                            }
                        });
                        // Initial sync for switch and slider disable state
                        if (window.SVARData && typeof window.SVARData.getPhiEstimation === 'function'){
                            const currentGlobalPhi = window.SVARData.getPhiEstimation();
                            if (currentGlobalPhi === 0) {
                                b0ModeSwitch.checked = false; // Recursive
                                if(phiSlider) phiSlider.disabled = true;
                            } else {
                                b0ModeSwitch.checked = true; // Non-Recursive
                                if(phiSlider) phiSlider.disabled = false;
                            }
                        }
                    } else {
                        console.warn(`[SVARControls] B0 Estimation Mode Switch not found in section: ${sectionId}`);
                    }
                    break;

                // Add cases for other sections here
                // case 'another-section':
                //     // ... setup controls for another-section
                //     break;

                default:
                    console.log(`[SVARControls] No specific controls to initialize for section: ${sectionId}`);
            }
        }
    };

    // --- Global Event Subscriptions ---
    if (window.SVARData && typeof window.SVARData.subscribe === 'function') {
        window.SVARData.subscribe('PHI_ESTIMATION_UPDATED', function(eventDetail) {
            console.log('[SVARControls] Received PHI_ESTIMATION_UPDATED:', eventDetail);
            // Update controls in all relevant initialized sections
            // For now, assume 'estimation-restrictions' is the primary one with these controls
            const erSectionElement = document.getElementById('estimation-restrictions'); // This might be too broad, better to use stored sectionElements if possible
            if (erSectionElement && controlRefs['estimation-restrictions']) { // Check if section was initialized
                 _updateEstimationRestrictionControls(erSectionElement, eventDetail.phi_estimation);
            }
            // If other sections have phi sliders, update them too:
            // for (const sectionId in controlRefs) {
            //    if (controlRefs[sectionId].phiSlider) { ... update it ... }
            // }
        });

        // Potentially subscribe to DATA_UPDATED if some controls need to react to it directly
        // window.SVARData.subscribe('DATA_UPDATED', function(eventDetail) {
        //     console.log('[SVARControls] Received DATA_UPDATED:', eventDetail);
        // });

    } else {
        console.error('[SVARControls] SVARData.subscribe is not available. Cannot subscribe to global events.');
    }

    return publicApi;
})();
