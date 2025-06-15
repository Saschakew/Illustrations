// public/js/debug_manager.js
const DebugManager = (() => {
    const _debugCategories = {
        SVAR_SETUP: false,      // Logs from svar_setup.js
        UI_FACTORY: false,      // Logs from ui_factory.js
        SHARED_CONTROLS: false, // Logs from shared_controls.js
        MAIN_APP: false,        // Logs from main.js (general app flow)
        DATA_HANDLING: false,   // Logs from shared_data.js or data operations
        EVENT_HANDLING: false,  // Logs for event listener setup and triggers
        PLOT_RENDERING: false,  // Logs related to Plotly or other plotting libraries
        SVAR_DATA_PIPELINE: true, // Logs for the SVAR data generation pipeline
        SVAR_MATH: false,          // Logs for SVARMathUtil functions (covariance, cholesky, etc.)
        PLOT_UPDATE: 'Plot Update',
        HERO: false,                 // Logs for hero particle events
        LATEX_UPDATE: false,       // Logs for high-level LaTeX update operations
        LATEX_UTIL: false,         // Logs for low-level LatexUtils functions
        // Add more categories as needed, e.g.:
        // API_CALLS: false,
        // PERFORMANCE: false,
    };

    function setCategory(categoryName, isEnabled) {
        if (typeof categoryName === 'string' && typeof _debugCategories[categoryName] !== 'undefined') {
            _debugCategories[categoryName] = !!isEnabled;
            console.log(`[DebugManager] Category '${categoryName}' is now ${isEnabled ? 'ENABLED' : 'DISABLED'}.`);
        } else if (typeof categoryName === 'object') {
            // Allow setting multiple categories at once
            for (const cat in categoryName) {
                if (typeof _debugCategories[cat] !== 'undefined' && typeof categoryName[cat] === 'boolean') {
                    _debugCategories[cat] = categoryName[cat];
                    console.log(`[DebugManager] Category '${cat}' is now ${categoryName[cat] ? 'ENABLED' : 'DISABLED'}.`);
                } else {
                    console.warn(`[DebugManager] Invalid category or value for '${cat}' during bulk update.`);
                }
            }
        }
        else {
            console.warn(`[DebugManager] Category '${categoryName}' not found or invalid type.`);
        }
    }

    function isCategoryEnabled(categoryName) {
        return !!_debugCategories[categoryName];
    }

    function log(categoryName, ...messages) {
        if (isCategoryEnabled(categoryName)) {
            console.log(`[${categoryName.toUpperCase()}]`, ...messages);
        }
    }

    function error(categoryName, ...messages) {
        if (isCategoryEnabled(categoryName)) {
            console.error(`[${categoryName.toUpperCase()}_ERROR]`, ...messages);
        }
    }

    function getCategories() {
        // Return a copy to prevent direct modification
        return { ..._debugCategories };
    }

    // Expose methods to the console for easy control during development
    const publicApi = {
        setCategory,
        isCategoryEnabled,
        log,
        error,
        getCategories,
        enableAll: () => Object.keys(_debugCategories).forEach(cat => setCategory(cat, true)),
        disableAll: () => Object.keys(_debugCategories).forEach(cat => setCategory(cat, false)),
    };

    window.DebugManager = publicApi;

    // Initial log of category states
    console.log("[DebugManager] Initialized. Current category states:", getCategories());
    Object.keys(_debugCategories).forEach(cat => {
        if (_debugCategories[cat]) {
            console.log(`[DebugManager] Logging ENABLED for category: ${cat}`);
        }
    });

    return publicApi;
})();
