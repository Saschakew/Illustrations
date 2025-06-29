// public/js/ui_factory.js
window.uiFactory = {
    createTSlider: function(id, label = 'T=') {
        const sliderId = id;
        const outputId = `${id}_value`;
        // Default T value can come from sharedData or a config
        const defaultValue = (window.sharedData && typeof window.sharedData.T !== 'undefined') ? window.sharedData.T : 500;
        
        return `
            <div class="control-item">
                <label for="${sliderId}">${label}</label>
                <output for="${sliderId}" id="${outputId}">${defaultValue}</output>
                <input type="range" id="${sliderId}" name="${sliderId}" min="100" max="2000" value="${defaultValue}" step="10" class="slider t-slider">
            </div>
        `;
    },

    createModeSwitch: function(id, labelText = 'Mode:') { 
        const switchId = id;
        // Determine initial state from sharedData, default to false (Non-Recursive)
        const isRecursiveSelected = (window.sharedData && typeof window.sharedData.isRecursive !== 'undefined') ? !window.sharedData.isRecursive : true;

        return `
        <div class="control-item mode-switch-control">
            <span class="mode-prefix-label">B₀=</span> 
            <label class="mode-switch-toggle">
                <input type="checkbox" id="${switchId}" name="${switchId}" class="mode-switch" ${isRecursiveSelected ? 'checked' : ''}>
                <span class="mode-switch-slider">
                    <span class="mode-label recursive-label">Recursive</span>
                    <span class="mode-label non-recursive-label">Non-Recursive</span>
                </span>
            </label>
        </div>
    `;

    },

    createPhiSlider: function(id, label = 'φ=') {
        const sliderId = id;
        const outputId = `${id}_value`;
        // Default phi is 0. Slider value will be 0.
        // Slider range will be -79 to 79, representing scaled radians * 100.
        // Actual value in sharedData.phi will be radians.
        const defaultValueForSlider = (window.sharedData && typeof window.sharedData.phi !== 'undefined') ? Math.round(window.sharedData.phi * 100) : 0;
        const minSliderVal = -79; // Approx -PI/4 * 100
        const maxSliderVal = 79;  // Approx  PI/4 * 100

        return `
            <div class="control-item">
                <label for="${sliderId}">${label}</label>
                <output for="${sliderId}" id="${outputId}">${(defaultValueForSlider / 100).toFixed(2)}</output> 
                <input type="range" id="${sliderId}" name="${sliderId}" min="${minSliderVal}" max="${maxSliderVal}" value="${defaultValueForSlider}" step="1" class="slider phi-slider"><!-- Display initial value in radians -->
            </div>
        `;
    },

    createLambdaSlider: function(id, label = 'λ=') {
        const sliderId = id;
        const outputId = `${id}_value`;
        // Default value will be 0.5, fetched from sharedData after it's updated.
        // Fallback to 0.5 here ensures robustness if sharedData isn't ready, though it should be.
        const defaultValue = (window.sharedData && typeof window.sharedData.lambda !== 'undefined') ? window.sharedData.lambda : 0.5;
        const minVal = 0;
        const maxVal = 1;
        const stepVal = 0.01;

        return `
            <div class="control-item">
                <label for="${sliderId}">${label}</label>
                <output for="${sliderId}" id="${outputId}">${parseFloat(defaultValue).toFixed(2)}</output>
                <input type="range" id="${sliderId}" name="${sliderId}" min="${minVal}" max="${maxVal}" value="${defaultValue}" step="${stepVal}" class="slider lambda-slider">
            </div>
        `;
    },
    // Future factory functions for other controls (buttons, dropdowns, etc.) can be added here.

    createNewDataButton: function(id, text = 'New Data') {
        return `<button id="${id}" class="btn new-data-button">${text}</button>`;
    }
    /*
    createButton: function(id, text, classes = 'btn-primary') {
        return `<button id="${id}" class="btn ${classes}">${text}</button>`;
    }
    */
};
