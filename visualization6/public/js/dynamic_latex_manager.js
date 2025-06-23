// public/js/dynamic_latex_manager.js

/**
 * @file dynamic_latex_manager.js
 * @description Manages dynamic LaTeX updates centrally for specified elements.
 * Relies on `latex_utils.js` for rendering and `shared_data.js` for data.
 */

(function(window) {
    'use strict';

    if (!window.DebugManager) {
        console.error('DebugManager not found. DynamicLatexManager requires DebugManager.');
        // Fallback to console.log if DebugManager is not available
        window.DebugManager = { log: console.log, error: console.error }; 
    }

    const logCategory = 'DYNAMIC_LATEX_MANAGER';

    // Array to store information about elements that need dynamic updates
    const registeredElements = [];

    /**
     * Registers an HTML element for dynamic LaTeX updates.
     * Performs an initial render upon registration.
     * @param {string} elementId - The ID of the HTML element (e.g., a <span>) to update.
     * @param {string} dataType - The key in `window.sharedData` for the primary data (e.g., 'B0', 'phi_est_nG').
     * @param {string} utilKey - The key of the function in `window.LatexUtils` to call (e.g., 'displayBEstMatrix', 'displayPhiEst').
     * @param {Array<any>} [fixedArgs=[]] - An array of additional fixed arguments to pass to the LatexUtils function after the elementId and data.
     */
    function registerDynamicLatex(elementId, dataType, utilKey, fixedArgs = []) {
        if (!elementId || !dataType || !utilKey) {
            DebugManager.error(logCategory, 'Element ID, dataType, and utilKey are required for registration.');
            return;
        }

        const element = document.getElementById(elementId);
        if (!element) {
            DebugManager.error(logCategory, `Element with ID '${elementId}' not found for dynamic LaTeX registration.`);
            return;
        }

        if (registeredElements.some(reg => reg.id === elementId)) {
            DebugManager.log(logCategory, `Element with ID '${elementId}' is already registered.`);
            // Optionally, allow re-registration or update of registration details here
            return;
        }

        DebugManager.log(logCategory, `Attempting to register ID: '${elementId}', dataType: '${dataType}', utilKey: '${utilKey}'`);
        const registration = { 
            id: elementId, 
            dataType, 
            utilKey, 
            args: fixedArgs, 
            lastDataString: null // Initialize cache for data comparison
        };
        registeredElements.push(registration);
        DebugManager.log(logCategory, `Registered element '${elementId}' for dynamic LaTeX (dataType: ${dataType}, util: ${utilKey}).`);
        
        // Perform initial render (will also populate lastDataString)
        updateSingleDynamicElement(registration);
    }

    /**
     * Updates a single registered dynamic LaTeX element based on its registration details.
     * @param {object} registrationDetails - The registration object for the element.
     */
    function updateSingleDynamicElement(registrationDetails) {
        const { id, dataType, utilKey, args } = registrationDetails;
        DebugManager.log(logCategory, `updateSingleDynamicElement: Processing element ID '${id}', dataType '${dataType}', utilKey '${utilKey}'`);


        if (!window.LatexUtils || typeof window.LatexUtils[utilKey] !== 'function') {
            DebugManager.error(logCategory, `LatexUtils.${utilKey} not available. Cannot update element '${id}'.`);
            return;
        }

        if (!window.sharedData || typeof window.sharedData[dataType] === 'undefined') { // Check for undefined to allow null/0 values
            DebugManager.log(logCategory, `sharedData.${dataType} not available. Cannot update element '${id}'.`);
            const el = document.getElementById(id);
            if (el) el.textContent = `${dataType.replace(/_/g, ' ')} N/A`; // Basic placeholder
            return;
        }

        const dataValue = window.sharedData[dataType];
        let currentDataString;
        try {
            currentDataString = JSON.stringify(dataValue);
        } catch (e) {
            DebugManager.error(logCategory, `Could not stringify data for ${id} (dataType: ${dataType}). Proceeding with update. Error: ${e.message}`);
            // Fallback: if stringify fails, force update, or handle error as appropriate
            currentDataString = `__error_stringify_${Date.now()}__`; 
        }

        if (registrationDetails.lastDataString === currentDataString) {
            DebugManager.log(logCategory, `Data for element '${id}' (dataType: ${dataType}) has not changed. Skipping update.`);
            return;
        }

        DebugManager.log(logCategory, `Updating dynamic LaTeX for element: ${id} using ${utilKey} with data ${dataType}`);
        
        try {
            window.LatexUtils[utilKey](id, dataValue, ...args);
            registrationDetails.lastDataString = currentDataString; // Cache the data string after successful render
        } catch (error) {
            DebugManager.error(logCategory, `Error updating element '${id}' with ${utilKey}: ${error.message}`);
            const el = document.getElementById(id);
            if (el) el.textContent = `Error`;
            // Do not update lastDataString on error, so it tries again next time
        }
    }

    /**
     * Updates all registered dynamic LaTeX elements.
     * This function should be called when relevant sharedData changes.
     */
    function updateAllDynamicLatex() {
        DebugManager.log(logCategory, 'Updating all registered dynamic LaTeX elements.');
        registeredElements.forEach(registration => {
            updateSingleDynamicElement(registration);
        });
    }

    // Expose the public API
    window.DynamicLatexManager = {
        registerDynamicLatex: registerDynamicLatex,
        updateAllDynamicLatex: updateAllDynamicLatex
        // Consider adding unregisterDynamicLatex(elementId) if needed later
    };

    DebugManager.log(logCategory, 'DynamicLatexManager initialized.');

})(window);
