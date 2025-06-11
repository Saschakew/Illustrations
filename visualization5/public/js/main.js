document.addEventListener('DOMContentLoaded', () => {
    // Get references to global loading elements
    const globalLoadingOverlay = document.getElementById('global-loading-overlay');
    const globalPageWrapper = document.getElementById('global-page-wrapper');
    
    if (!globalLoadingOverlay || !globalPageWrapper) {
        console.error("Global loading elements not found!");
        if (globalPageWrapper) globalPageWrapper.style.visibility = 'visible';
        return;
    }

    // Initialize or extend the shared data object
    window.SVARData = window.SVARData || {};
    Object.assign(window.SVARData, {
        data: window.SVARData.data || {},
        subscribers: window.SVARData.subscribers || {},
        
        updateData: function(newData) {
            Object.assign(this.data, newData);
            this.notifyUpdate('DATA_UPDATED', this.data);
        },
        
        subscribe: function(event, callback) {
            if (!this.subscribers[event]) {
                this.subscribers[event] = [];
            }
            this.subscribers[event].push(callback);
        },
        
        notifyUpdate: function(event, detail) {
            if (this.subscribers[event]) {
                this.subscribers[event].forEach(callback => {
                    try {
                        callback(new CustomEvent(event, { detail }));
                    } catch (e) {
                        console.error(`Error in subscriber for event ${event}:`, e);
                    }
                });
            }
        }
    });
    // Dispatch a custom event to signal that the SVARData object is ready
    document.dispatchEvent(new CustomEvent('SVARDataReady'));
    
    // --- Section Loading Logic ---
    const dataSourceSection = 'svar_setup';
    const dependentSections = ['estimation_restrictions'/*, 'ridge_estimation'*/];

    // Function to hide the loading screen when everything is ready
    const hideGlobalLoader = () => {
        console.log("Hiding global loading screen...");
        if (globalLoadingOverlay) {
            globalLoadingOverlay.style.opacity = '0';
            globalLoadingOverlay.addEventListener('transitionend', () => {
                if (globalLoadingOverlay) globalLoadingOverlay.style.display = 'none';
            }, { once: true });
        }
        if (globalPageWrapper) {
            globalPageWrapper.style.visibility = 'visible';
            globalPageWrapper.style.opacity = '1';
        }
    };

    // Function to wait for MathJax to be fully loaded and then render all LaTeX
    const finalizePage = () => {
        console.log("All sections loaded. Typesetting MathJax...");
        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise()
                .then(() => {
                    console.log("Final MathJax typesetting complete.");
                    hideGlobalLoader();
                })
                .catch(err => {
                    console.error("Final MathJax typesetting failed:", err);
                    hideGlobalLoader();
                });
        } else {
            console.warn("MathJax not available for final typesetting.");
            hideGlobalLoader();
        }
    };

    const loadSection = (sectionId) => {
        return new Promise((resolve, reject) => {
            const filePath = `/sections/${sectionId}.html`;
            console.log(`Fetching section: ${filePath}`);

            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok for ${sectionId}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(data => {
                    const sectionElement = document.getElementById(sectionId.replace(/_/g, '-'));
                    if (sectionElement) {
                        sectionElement.innerHTML = data;

                        // Call the appropriate initialization function
                        if (sectionId === 'svar_setup' && typeof initSvarSetup === 'function') {
                            initSvarSetup();
                        } else if (sectionId === 'estimation_restrictions' && window.SVARSections && typeof window.SVARSections.initEstimationRestrictions === 'function') {
                            window.SVARSections.initEstimationRestrictions();
                        } // Add other sections like ridge_estimation if they have init functions

                        console.log(`Section '${sectionId}' loaded and initialized.`);
                        resolve();
                    } else {
                        throw new Error(`Container element not found for section '${sectionId}'`);
                    }
                })
                .catch(error => {
                    console.error(`Error loading section '${sectionId}':`, error);
                    reject(error);
                });
        });
    };

    // --- Main Execution Flow ---
    console.log("Starting sequential section loading...");
    loadSection(dataSourceSection)
        .then(() => {
            console.log(`Data source section '${dataSourceSection}' loaded. Loading dependent sections...`);
            const dependentPromises = dependentSections.map(loadSection);
            return Promise.all(dependentPromises);
        })
        .then(() => {
            console.log('All sections have been successfully loaded.');
            finalizePage();
        })
        .catch(error => {
            console.error('A critical error occurred during section loading. The application may not function correctly.', error);
            hideGlobalLoader();
        });
});
