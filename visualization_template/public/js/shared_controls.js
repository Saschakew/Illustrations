// Function to update B0 based on isRecursive and log changes
function updateB0Mode() {
    if (window.sharedData.isRecursive) {
        window.sharedData.B0 = [[1, 0], [0.5, 1]]; // Example Recursive B0
    } else {
        window.sharedData.B0 = [[1, 0.5], [0.5, 1]]; // Example Non-Recursive B0
    }
    DebugManager.log('SVAR_DATA_PIPELINE', `B0 mode updated. isRecursive: ${window.sharedData.isRecursive}, B0:`, JSON.stringify(window.sharedData.B0));
    
    // This was part of the original logic, keeping it here.
    if (typeof window.regeneratePhi0 === 'function') {
        window.regeneratePhi0(); // Update phi_0 whenever B0 changes
    } else {
        DebugManager.log('SVAR_DATA_PIPELINE', 'Warning: window.regeneratePhi0 function not found. Cannot update phi_0.');
    }

    // After updating B0, we must regenerate the reduced-form shocks
    if (typeof regenerateReducedFormShocksFromExistingEpsilon === 'function') {
        regenerateReducedFormShocksFromExistingEpsilon();
    } else {
        DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateReducedFormShocksFromExistingEpsilon function not found. Cannot regenerate u_t on B0 change.');
    }
}

function initializeSliders() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing sliders...');

    // --- Handle T sliders (synchronized) ---
    const tSliders = document.querySelectorAll('.t-slider');
    let tSlidersInitialized = false;

    if (tSliders.length > 0) {
        // Initialize sharedData.T from the first T-slider if not already set
        if (window.sharedData) {
            if (typeof window.sharedData.T === 'undefined') {
                window.sharedData.T = parseInt(tSliders[0].value, 10);
            }
        } else {
            DebugManager.log('SHARED_CONTROLS', 'WARNING: window.sharedData not found. T sliders will use HTML defaults and T will not be globally stored yet.');
            // Create a temporary sharedData object if it doesn't exist, to avoid errors, though this is not ideal.
            // The script loading order in index.html should prevent this.
            window.sharedData = { T: parseInt(tSliders[0].value, 10) }; 
        }

        tSliders.forEach(slider => {
            const output = document.getElementById(slider.id + '_value');
            if (output) {
                slider.value = window.sharedData.T; // Set from sharedData
                output.textContent = slider.value;

                slider.addEventListener('change', function() {
                    const newTValue = parseInt(this.value, 10);
                    window.sharedData.T = newTValue; // Update sharedData

                    // Synchronize all T-sliders and their outputs
                    tSliders.forEach(s => {
                        const o = s.parentElement.querySelector(`output[for="${s.id}"]`);
                        s.value = newTValue;
                        if (o) o.textContent = newTValue;
                    });

                    DebugManager.log('SHARED_CONTROLS', 'Sample Size T (sharedData.T) updated to:', window.sharedData.T);

                    // Regenerate epsilon_t series with the new T value
                    if (typeof regenerateSvarData === 'function') {
                        regenerateSvarData().then(() => {
                            // Update lambda slider range after T changes and data regenerates
                            if (typeof updateLambdaSlidersRangeAndValue === 'function') {
                                updateLambdaSlidersRangeAndValue();
                            }
                        }).catch(error => {  
                            DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateSvarData function not found. Cannot regenerate epsilon_t series on T change.');
                        });
                    } else {
                        DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateSvarData function not found. Cannot regenerate epsilon_t series on T change.');
                    }
                });
            }
        });
        
        DebugManager.log('SHARED_CONTROLS', `Initial Sample Size T (sharedData.T) set to: ${window.sharedData.T}. All ${tSliders.length} T-slider(s) initialized and synchronized.`);
        tSlidersInitialized = true;
    }

    if (!tSlidersInitialized) {
        // No T-sliders (.t-slider) found in the currently processed DOM.
    }

    // --- Handle other sliders, including any remaining Alpha sliders ---
    const alphaSliders = document.querySelectorAll('.alpha-slider');

    alphaSliders.forEach(slider => {
        const output = document.getElementById(slider.id + '_value');
        if (output) {
            output.textContent = slider.value; // Initialize display
            slider.addEventListener('input', function() {
                output.textContent = this.value; // Update own display

                // Synchronize other alpha sliders
                const currentValue = this.value;
                alphaSliders.forEach(otherSlider => {
                    if (otherSlider !== this) {
                        otherSlider.value = currentValue;
                        const otherOutput = document.getElementById(otherSlider.id + '_value');
                        if (otherOutput) otherOutput.textContent = currentValue;
                    }
                });
            });
        }
    });

    if (alphaSliders.length > 1) {
        const initialAlphaValue = alphaSliders[0].value;
        for (let i = 1; i < alphaSliders.length; i++) {
            alphaSliders[i].value = initialAlphaValue;
            const output = document.getElementById(alphaSliders[i].id + '_value');
            if (output) output.textContent = initialAlphaValue;
        }
    }
    
    // Generic initialization for any other sliders not covered (e.g. sliders without alpha-slider class and not slider_T)
    const otherGeneralSliders = document.querySelectorAll('input[type="range"]:not(#slider_T):not(.alpha-slider)');
    otherGeneralSliders.forEach(slider => {
        const output = document.getElementById(slider.id + '_value');
        if (output) {
            output.textContent = slider.value;
            slider.addEventListener('input', function() {
                output.textContent = this.value;
            });
        }
    });

    DebugManager.log('SHARED_CONTROLS', 'All relevant sliders initialized or re-initialized.');
}

// Initialize B0 based on the default mode upon script load
updateB0Mode();

// Helper function to calculate max lambda based on T
function calculateLambdaMax(currentT) {
    const T_min = 100;
    const T_max = 2000;
    const lambda_at_T_min = 1.0;
    const lambda_at_T_max = 0.1;

    // Clamp currentT to be within [T_min, T_max] for the calculation
    const T_clamped = Math.max(T_min, Math.min(currentT, T_max));

    if (T_clamped <= T_min) return lambda_at_T_min;
    if (T_clamped >= T_max) return lambda_at_T_max;

    // Linear interpolation
    const lambdaMax = lambda_at_T_min + ((T_clamped - T_min) / (T_max - T_min)) * (lambda_at_T_max - lambda_at_T_min);
    return parseFloat(lambdaMax.toFixed(4)); // Return with precision, step is 0.01
}

// Function to update all lambda sliders' range and current value
function updateLambdaSlidersRangeAndValue() {
    DebugManager.log('SHARED_CONTROLS', 'Updating Lambda slider range and value based on T...');
    if (!window.sharedData || typeof window.sharedData.T === 'undefined' || typeof window.sharedData.lambda === 'undefined') {
        DebugManager.log('SHARED_CONTROLS', 'ERROR: sharedData, sharedData.T or sharedData.lambda not available in updateLambdaSlidersRangeAndValue.');
        return;
    }
    const currentT = window.sharedData.T;
    const newLambdaMax = calculateLambdaMax(currentT);
    DebugManager.log('SHARED_CONTROLS', `Calculated newLambdaMax: ${newLambdaMax.toFixed(4)} for T: ${currentT}`);

    const lambdaSliders = document.querySelectorAll('.lambda-slider');
    let currentLambda = window.sharedData.lambda;

    if (currentLambda > newLambdaMax) {
        DebugManager.log('SHARED_CONTROLS', `Current lambda ${currentLambda.toFixed(4)} exceeds new max ${newLambdaMax.toFixed(4)}. Clamping.`);
        currentLambda = newLambdaMax;
        window.sharedData.lambda = currentLambda; // Update sharedData
    }

    lambdaSliders.forEach(slider => {
        slider.max = newLambdaMax;
        slider.value = currentLambda;
        const output = document.getElementById(`${slider.id}_value`);
        if (output) {
            output.textContent = currentLambda.toFixed(2);
        }
    });
    DebugManager.log('SHARED_CONTROLS', `Lambda sliders updated. Max: ${newLambdaMax.toFixed(4)}, Value: ${currentLambda.toFixed(2)}`);
}

function initializePhiSliders() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing Phi (φ) sliders...');
    const phiSliders = document.querySelectorAll('.phi-slider');
    if (!window.sharedData || typeof window.sharedData.phi === 'undefined') {
        DebugManager.log('SHARED_CONTROLS', 'ERROR: sharedData or sharedData.phi not available for Phi slider initialization.');
        return;
    }
    const sharedPhi = window.sharedData.phi;

    phiSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);
        // Set initial slider position based on sharedData.phi (scaled by 100 for slider range 0-max_phi_scaled)
        // Assuming phi is in radians, e.g., -0.785 to 0.785. Slider range needs to be adjusted if this is not the case.
        // Current phi slider in ui_factory is min="-78" max="78" for -0.78 to 0.78 rad, step 1.
        slider.value = Math.round(sharedPhi * 100); 
        if (output) {
            output.textContent = sharedPhi.toFixed(2); // Display initial value in radians
        }

        slider.addEventListener('change', function() {
            const sliderValue = parseInt(this.value);
            const newPhi = sliderValue / 100.0; // Convert back to radians
            window.sharedData.phi = newPhi;
            
            if (output) {
                output.textContent = newPhi.toFixed(2);
                DebugManager.log('SHARED_CONTROLS', `Phi slider ${slider.id} changed to: ${window.sharedData.phi.toFixed(2)}`);

                // After phi is updated, regenerate B(phi)
                if (typeof regenerateBPhi === 'function') {
                    regenerateBPhi();
                    window.SVARCoreFunctions.calculateRidgePenalty();
                } else {
                    DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateBPhi function not found. Cannot regenerate B(phi) on phi change.');
                }
            }

            // Synchronize other phi sliders
            phiSliders.forEach(otherSlider => {
                if (otherSlider !== this) {
                    otherSlider.value = sliderValue;
                    const otherOutput = document.getElementById(`${otherSlider.id}_value`);
                    if (otherOutput) {
                        otherOutput.textContent = newPhi.toFixed(2);
                    }
                }
            });
        });
    });

    if (phiSliders.length > 0) {
        DebugManager.log('SHARED_CONTROLS', 'Phi sliders initialized. Current sharedData.phi:', window.sharedData.phi.toFixed(2));
    }
}

function initializeLambdaSliders() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing Lambda (λ) sliders...');
    const lambdaSliders = document.querySelectorAll('.lambda-slider');
    if (!window.sharedData || typeof window.sharedData.lambda === 'undefined') {
        DebugManager.log('SHARED_CONTROLS', 'ERROR: sharedData or sharedData.lambda not available for Lambda slider initialization.');
        return;
    }
    // const sharedLambda = window.sharedData.lambda; // Value will be set by updateLambdaSlidersRangeAndValue

    lambdaSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);
        // Initial value and max will be set by updateLambdaSlidersRangeAndValue called below

        slider.addEventListener('input', function() {
            const newLambda = parseFloat(this.value);
            // Ensure lambda doesn't exceed the current dynamic max, though slider should enforce this.
            const currentMax = parseFloat(slider.max);
            const validatedLambda = Math.min(newLambda, currentMax);

            window.sharedData.lambda = validatedLambda;
            
            if (output) {
                output.textContent = validatedLambda.toFixed(2);
            }
            DebugManager.log('SHARED_CONTROLS', `Lambda slider ${this.id} changed. New sharedData.lambda:`, validatedLambda.toFixed(2));

            // When lambda changes, recalculate Ridge estimates and update relevant displays/plots
            if (window.SVARCoreFunctions && typeof window.SVARCoreFunctions.calculateRidgeEstimates === 'function') {
                window.SVARCoreFunctions.calculateRidgeEstimates();
                window.SVARCoreFunctions.calculateRidgePenalty();
                DebugManager.log('SHARED_CONTROLS', 'Recalculated Ridge estimates due to lambda change.');

                // Update dynamic LaTeX displays
                if (window.DynamicLatexManager && typeof window.DynamicLatexManager.updateAllDynamicLatex === 'function') {
                    window.DynamicLatexManager.updateAllDynamicLatex();
                    DebugManager.log('SHARED_CONTROLS', 'Updated dynamic LaTeX outputs.');
                } else {
                    DebugManager.log('SHARED_CONTROLS', 'ERROR: DynamicLatexManager.updateAllDynamicLatex function not found.');
                }

                if (window.sectionFour && typeof window.sectionFour.updatePlots === 'function') {
                    window.sectionFour.updatePlots();
                    DebugManager.log('SHARED_CONTROLS', 'Updated Section Four plots.');
                }
            } else {
                DebugManager.log('SHARED_CONTROLS', 'SVARCoreFunctions or calculateRidgeEstimates not available for lambda change.');
            }

            // Synchronize other lambda sliders
            lambdaSliders.forEach(otherSlider => {
                if (otherSlider !== this) {
                    otherSlider.value = validatedLambda; 
                    const otherOutput = document.getElementById(`${otherSlider.id}_value`);
                    if (otherOutput) {
                        otherOutput.textContent = validatedLambda.toFixed(2);
                    }
                }
            });
        });
    });

    // Set initial range, max, and value after attaching event listeners
    updateLambdaSlidersRangeAndValue(); 

    if (lambdaSliders.length > 0) {
        DebugManager.log('SHARED_CONTROLS', 'Lambda sliders initialized. Current sharedData.lambda:', window.sharedData.lambda.toFixed(2));
    }
}

function initializeNewDataButtons() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing New Data buttons...');
    const newDataButtons = document.querySelectorAll('.new-data-button');

    newDataButtons.forEach(button => {
        DebugManager.log('SHARED_CONTROLS', `Found New Data button: ${button.id}`);
        // Placeholder for future click event listener
        button.addEventListener('click', function() {
            DebugManager.log('SVAR_DATA_PIPELINE', `New Data button '${this.id}' clicked. Triggering regeneration of epsilon_t series.`);
            if (typeof regenerateSvarData === 'function') {
                regenerateSvarData();
            } else {
                DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateSvarData function not found. Cannot regenerate epsilon_t series on New Data button click.');
            }
        });
    });

    if (newDataButtons.length > 0) {
        DebugManager.log('SHARED_CONTROLS', `${newDataButtons.length} New Data button(s) initialized.`);
    }
}

function initializeModeSwitches() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing mode switches...');
    const modeSwitches = document.querySelectorAll('.mode-switch'); // These are the <input type="checkbox">
    let switchesInitialized = false;

    if (modeSwitches.length > 0) {
        // 1. Determine initial model state (sharedData.isRecursive)
        // If sharedData.isRecursive is undefined, default to RECURSIVE model state.
        // Recursive model state means sharedData.isRecursive = false.
        if (window.sharedData && typeof window.sharedData.isRecursive === 'undefined') {
            window.sharedData.isRecursive = false; // Default to Recursive model state
            DebugManager.log('SHARED_CONTROLS', `sharedData.isRecursive was undefined. Defaulted to false (Recursive model).`);
        }
        // At this point, window.sharedData.isRecursive is definitely defined.

        // 2. Set initial visual state of all switches based on the (now defined) model state.
        // If model is recursive (sharedData.isRecursive === false), switch should be CHECKED (visually "Recursive").
        // If model is non-recursive (sharedData.isRecursive === true), switch should be UNCHECKED (visually "Non-Recursive").
        // So, visual state switchEl.checked = !window.sharedData.isRecursive;
        const currentModelIsRecursiveState = window.sharedData.isRecursive; 
        const visualShouldBeChecked = !currentModelIsRecursiveState; // true if switch should show "Recursive"

        modeSwitches.forEach(switchEl => {
            switchEl.checked = visualShouldBeChecked;
        });
        DebugManager.log('SHARED_CONTROLS', `Initial model state sharedData.isRecursive: ${currentModelIsRecursiveState}. All ${modeSwitches.length} switches visually set to: ${visualShouldBeChecked ? 'Recursive (checked)' : 'Non-Recursive (unchecked)'}.`);

        // 3. Add event listeners
        modeSwitches.forEach(switchEl => {
            switchEl.addEventListener('change', function() {
                // `this.checked` is the new visual state of the switch that was just changed.
                // If `this.checked` is true (visually "Recursive"), model should be recursive (sharedData.isRecursive = false).
                // If `this.checked` is false (visually "Non-Recursive"), model should be non-recursive (sharedData.isRecursive = true).
                window.sharedData.isRecursive = !this.checked;
                
                const newVisualIsChecked = this.checked;
                DebugManager.log('SHARED_CONTROLS', `Mode changed. Visual: ${newVisualIsChecked ? 'Recursive (checked)' : 'Non-Recursive (unchecked)'}. Model sharedData.isRecursive is now: ${window.sharedData.isRecursive}`);

                updateB0Mode();

                // Synchronize all other mode switches to the new VISUAL state
                modeSwitches.forEach(s => {
                    if (s !== this) {
                        s.checked = newVisualIsChecked;
                    }
                });
            });
        });
        switchesInitialized = true;
    }

    if (!switchesInitialized) {
        DebugManager.log('SHARED_CONTROLS', 'No mode switches (.mode-switch) found in the currently processed DOM.');
    }
    DebugManager.log('SHARED_CONTROLS', 'Mode switch initialization complete.');
}

