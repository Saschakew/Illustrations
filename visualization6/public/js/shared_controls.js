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

                slider.addEventListener('input', function() {
                    const newTValue = parseInt(this.value, 10);
                    window.sharedData.T = newTValue; // Update sharedData

                    // Synchronize all T-sliders and their outputs
                    tSliders.forEach(s => {
                        const o = document.getElementById(s.id + '_value');
                        s.value = newTValue;
                        if (o) o.textContent = newTValue;
                    });

                    DebugManager.log('SHARED_CONTROLS', 'Sample Size T (sharedData.T) updated to:', window.sharedData.T);

                    // Regenerate epsilon_t series with the new T value
                    if (typeof regenerateSvarData === 'function') {
                        regenerateSvarData();
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

// Ensure initializeSliders() is called at the right time.
// Based on MEMORY[3474db7f-8dfa-4611-94d1-3a0cbbaee850], 
// it should be part of the initializeApp function in main.js, 
// Make sure to call these initializers in main.js after sections are loaded and controls injected

function initializePhiSliders() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing Phi (φ) sliders...');
    const phiSliders = document.querySelectorAll('.phi-slider');
    const sharedPhi = window.sharedData.phi;

    phiSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);
        // Set initial slider position based on sharedData.phi (scaled)
        slider.value = Math.round(sharedPhi * 100);
        if (output) {
            output.textContent = sharedPhi.toFixed(2); // Display initial value in radians
        }

        slider.addEventListener('input', function() {
            const sliderValue = parseInt(this.value);
            const newPhi = sliderValue / 100.0; // Convert back to radians
            window.sharedData.phi = newPhi;
            
            if (output) {
                output.textContent = newPhi.toFixed(2);
                DebugManager.log('SHARED_CONTROLS', `Phi slider ${slider.id} changed to: ${window.sharedData.phi}`);

                // After phi is updated, regenerate B(phi)
                if (typeof regenerateBPhi === 'function') {
                    regenerateBPhi();
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
    // Log initial state after setup
    if (phiSliders.length > 0) {
        DebugManager.log('SHARED_CONTROLS', 'Phi sliders initialized. Current sharedData.phi:', window.sharedData.phi.toFixed(2));
    }
}

function initializeLambdaSliders() {
    DebugManager.log('SHARED_CONTROLS', 'Initializing Lambda (λ) sliders...');
    const lambdaSliders = document.querySelectorAll('.lambda-slider');
    const sharedLambda = window.sharedData.lambda;

    lambdaSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);
        slider.value = sharedLambda;
        if (output) {
            output.textContent = parseFloat(sharedLambda).toFixed(2);
        }

        slider.addEventListener('input', function() {
            const newLambda = parseFloat(this.value);
            window.sharedData.lambda = newLambda;
            updateAllPlots(); // Update plots when lambda changes
            
            if (output) {
                output.textContent = newLambda.toFixed(2);
            }
            DebugManager.log('SHARED_CONTROLS', `Lambda slider ${this.id} changed. New sharedData.lambda:`, newLambda.toFixed(2));

            // Synchronize other lambda sliders (if any exist in the future)
            lambdaSliders.forEach(otherSlider => {
                if (otherSlider !== this) {
                    otherSlider.value = newLambda; // Slider value itself can be a float
                    const otherOutput = document.getElementById(`${otherSlider.id}_value`);
                    if (otherOutput) {
                        otherOutput.textContent = newLambda.toFixed(2);
                    }
                }
            });
        });
    });
    if (lambdaSliders.length > 0) {
        DebugManager.log('SHARED_CONTROLS', 'Lambda sliders initialized. Current sharedData.lambda:', window.sharedData.lambda);
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
    const modeSwitches = document.querySelectorAll('.mode-switch');
    let switchesInitialized = false;

    if (modeSwitches.length > 0) {
        // Set initial state of all switches from sharedData
        if (window.sharedData && typeof window.sharedData.isRecursive !== 'undefined') {
            const currentMode = window.sharedData.isRecursive ? 'recursive' : 'non-recursive';
            modeSwitches.forEach(switchEl => {
                switchEl.value = currentMode;
            });
            DebugManager.log('SHARED_CONTROLS', `Initial Mode (sharedData.isRecursive: ${window.sharedData.isRecursive}) set to: ${currentMode}. All ${modeSwitches.length} mode switch(es) updated.`);
        } else {
            DebugManager.log('SHARED_CONTROLS', 'WARNING: window.sharedData.isRecursive not found. Mode switches will use HTML defaults and mode will not be globally stored/managed yet.');
            // Fallback: use the first switch's value to set sharedData if undefined
            if (window.sharedData && modeSwitches[0]) {
                window.sharedData.isRecursive = modeSwitches[0].value === 'recursive';
                if (typeof window.sharedData.updateB0Mode === 'function') {
                    window.sharedData.updateB0Mode(); // This will also log
                } else {
                    DebugManager.log('SHARED_CONTROLS', 'ERROR: window.sharedData.updateB0Mode() function not found!');
                }
            }
        }

        modeSwitches.forEach(switchEl => {
            switchEl.addEventListener('change', function() {
                const newIsRecursive = this.value === 'recursive';
                window.sharedData.isRecursive = newIsRecursive;
                
                DebugManager.log('SHARED_CONTROLS', `Mode changed to: ${this.value} (sharedData.isRecursive: ${window.sharedData.isRecursive})`);

                // Update B0 and log it
                if (typeof window.sharedData.updateB0Mode === 'function') {
                    window.sharedData.updateB0Mode();
                    // After B0 is updated, regenerate u_t using existing epsilon_t
                    if (typeof regenerateReducedFormShocksFromExistingEpsilon === 'function') {
                        regenerateReducedFormShocksFromExistingEpsilon();
                    } else {
                        DebugManager.log('SHARED_CONTROLS', 'ERROR: regenerateReducedFormShocksFromExistingEpsilon function not found. Cannot regenerate u_t on mode change.');
                    }
                } else {
                    DebugManager.log('SHARED_CONTROLS', 'ERROR: window.sharedData.updateB0Mode() function not found!');
                }

                // Synchronize all other mode switches
                const newModeValue = this.value;
                modeSwitches.forEach(s => {
                    if (s !== this) {
                        s.value = newModeValue;
                    }
                });
            });
        });
        switchesInitialized = true;
    }

    if (!switchesInitialized) {
        // No mode switches (.mode-switch) found in the currently processed DOM.
    }
    DebugManager.log('SHARED_CONTROLS', 'Mode switch initialization complete.');
}

