document.addEventListener('DOMContentLoaded', () => {
    // Get references to global loading elements
    const globalLoadingOverlay = document.getElementById('global-loading-overlay');
    const globalPageWrapper = document.getElementById('global-page-wrapper');
    
    if (!globalLoadingOverlay || !globalPageWrapper) {
        console.error("Global loading elements not found!");
        // If loading elements aren't found, make sure content is visible anyway
        if (globalPageWrapper) globalPageWrapper.style.visibility = 'visible';
        return;
    }
    
    const sections = [
        'svar_setup',
        'estimation_restrictions',
        'estimation_nongaussianity',
        'ridge_estimation'
    ];
    
    // Track loading progress
    let loadedSections = 0;
    const totalSections = sections.length;
    
    // Function to hide the loading screen when everything is ready
    const hideGlobalLoader = () => {
        console.log("All sections loaded and initialized. Hiding global loading screen...");
        
        // Fade out the loading overlay
        if (globalLoadingOverlay) {
            globalLoadingOverlay.style.opacity = '0';
            globalLoadingOverlay.addEventListener('transitionend', () => {
                if (globalLoadingOverlay) globalLoadingOverlay.style.display = 'none';
            }, { once: true });
        }
        
        // Show the main content
        if (globalPageWrapper) {
            globalPageWrapper.style.visibility = 'visible';
            globalPageWrapper.style.opacity = '1';
        }
    };
    
    // Function to check if all sections are loaded and MathJax is ready
    const checkAllLoaded = () => {
        loadedSections++;
        console.log(`Section ${loadedSections}/${totalSections} loaded`);
        
        if (loadedSections >= totalSections) {
            console.log("All sections loaded. Checking MathJax status...");
            waitForMathJaxAndRender();
        }
    };
    
    // Function to wait for MathJax to be fully loaded and then render all LaTeX
    const waitForMathJaxAndRender = () => {
        // If MathJax is already fully loaded and ready
        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            console.log("MathJax.typesetPromise() found. Waiting for all typesetting to complete...");
            MathJax.typesetPromise()
                .then(() => {
                    console.log("MathJax initial typesetting complete.");
                    hideGlobalLoader();
                })
                .catch(err => {
                    console.error("MathJax typesetting failed:", err);
                    // Wait longer before showing content if MathJax fails
                    setTimeout(hideGlobalLoader, 1000);
                });
        } else {
            // MathJax is not yet fully loaded, wait for it
            console.log("Waiting for MathJax to fully initialize...");
            
            // Set up a MathJax configuration hook that will run when MathJax is ready
            window.MathJax = {
                ...window.MathJax,
                startup: {
                    ...window.MathJax?.startup,
                    ready: () => {
                        console.log("MathJax startup ready triggered.");
                        if (MathJax.startup.defaultReady) {
                            MathJax.startup.defaultReady();
                        }
                        
                        // Now MathJax is truly ready, process the page
                        console.log("MathJax is now fully initialized. Processing typesetting...");
                        MathJax.typesetPromise()
                            .then(() => {
                                console.log("MathJax typesetting complete after waiting for initialization.");
                                hideGlobalLoader();
                            })
                            .catch(err => {
                                console.error("MathJax typesetting failed after initialization:", err);
                                setTimeout(hideGlobalLoader, 1000);
                            });
                    }
                }
            };
            
            // Fallback in case MathJax fails to load completely
            setTimeout(() => {
                console.warn("MathJax may not have fully loaded after waiting. Using fallback.");
                if (typeof MathJax === 'undefined' || typeof MathJax.typesetPromise !== 'function') {
                    hideGlobalLoader();
                }
            }, 5000); // 5 second fallback timeout
        }
    };

    // Load each section
    sections.forEach(sectionId => {
        fetch(`sections/${sectionId}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Remove any section-specific loading screens from the HTML
                // This prevents duplicate loading screens
                let processedData = data;
                if (processedData.includes('id="loading-overlay"')) {
                    const loadingOverlayRegex = /<div[^>]*id=["']loading-overlay["'][^>]*>[\s\S]*?<\/div>/i;
                    processedData = processedData.replace(loadingOverlayRegex, '');
                }
                
                // Also remove any page-content-wrapper divs to avoid nesting issues
                if (processedData.includes('id="page-content-wrapper"')) {
                    const startTag = /<div[^>]*id=["']page-content-wrapper["'][^>]*>/i;
                    const endTag = /<\/div>\s*$/i; // Match the last closing div
                    processedData = processedData
                        .replace(startTag, '')
                        .replace(endTag, '');
                }
                
                const sectionElement = document.getElementById(sectionId.replace(/_/g, '-'));
                if (sectionElement) {
                    sectionElement.innerHTML = processedData;

                    // Re-render LaTeX in the new content
                    if (typeof MathJax !== 'undefined' && MathJax.typeset) {
                        console.log(`Typesetting MathJax for section: ${sectionId}`);
                        MathJax.typeset([sectionElement]);
                    }

                    // After loading content, call the specific init function for that section
                    if (sectionId === 'svar_setup' && typeof initSvarSetup === 'function') {
                        console.log('Calling initSvarSetup() for svar-setup section...');
                        initSvarSetup();
                    } 
                                        else if (sectionId === 'estimation_restrictions' && typeof initEstimationRestrictions === 'function') {
                        console.log('Calling initEstimationRestrictions() for estimation-restrictions section...');
                        initEstimationRestrictions();
                    } 
                    else if (sectionId === 'estimation_nongaussianity' && typeof initEstimationNonGaussianity === 'function') {
                        console.log('Calling initEstimationNonGaussianity() for estimation-nongaussianity section...');
                        initEstimationNonGaussianity();
                    }
                    
                    // Mark this section as loaded
                    checkAllLoaded();
                }
            })
            .catch(error => {
                console.error(`Error loading section ${sectionId}:`, error);
                checkAllLoaded(); // Still count this section to avoid being stuck
            });
    });
});
