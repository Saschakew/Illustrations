// General-purpose sticky menu initializer
function initializeStickyMenu(sectionId, controlsContainerId, controlsPlaceholderId) {
    const section = document.getElementById(sectionId);
    const controlsContainer = document.getElementById(controlsContainerId);
    const controlsPlaceholder = document.getElementById(controlsPlaceholderId);

    if (!section || !controlsContainer || !controlsPlaceholder) {
        // Required elements not found
        return;
    }

    let controlsNaturalWidth = null;
    let controlsHeight = null;
    let controlsOriginalDocumentOffsetTop = 0;
    let resizeTimer = null;
    const DEBUG = true; // Set to false in production if desired

    function setupInitial() {
        // Ensure controls are in normal flow before measuring
        controlsContainer.classList.remove('sticky');
        controlsContainer.style.position = '';
        controlsContainer.style.top = '';
        controlsContainer.style.left = '';
        controlsContainer.style.width = '';
        controlsContainer.style.transform = '';
        controlsPlaceholder.style.height = '0';

        const measureAndSet = () => {
            const rect = controlsContainer.getBoundingClientRect();
            controlsNaturalWidth = rect.width;
            controlsHeight = rect.height;
            // Calculate offset from document top when in normal flow
            controlsOriginalDocumentOffsetTop = controlsContainer.getBoundingClientRect().top + window.scrollY;
            
            if (DEBUG) {

            }
            onScroll(); // Apply correct sticky state based on new measurements
        };

        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise()
                .then(() => {
                    measureAndSet();
                    // Add a delayed re-measurement to account for other async rendering (e.g., Plotly)
                    setTimeout(measureAndSet, 700); // Increased delay to 700ms
                })
                .catch(err => {
                    // MathJax typesetPromise error
                    measureAndSet(); // Fallback
                    // Also add delayed re-measurement on fallback
                    setTimeout(measureAndSet, 700); // Increased delay to 700ms
                });
        } else {
            measureAndSet();
            // Add a delayed re-measurement if MathJax is not present
            setTimeout(measureAndSet, 700); // If MathJax not present, with increased delay
        }
    }

    function onScroll() {
        if (!controlsContainer || !section) return;

        const currentScrollY = window.scrollY;
        const sectionRect = section.getBoundingClientRect();
        const effectiveControlsHeight = typeof controlsHeight === 'number' ? controlsHeight : 0;
        const effectiveOffsetTop = typeof controlsOriginalDocumentOffsetTop === 'number' ? controlsOriginalDocumentOffsetTop : 0;

        const isBefore = currentScrollY < effectiveOffsetTop;
        const isAtEnd = sectionRect.bottom <= effectiveControlsHeight;

        if (isAtEnd) {
            // State 3: Pinned to the bottom of the section
            if (!controlsContainer.classList.contains('pinned')) {
                controlsContainer.classList.remove('sticky');
                controlsContainer.classList.add('pinned');
                controlsContainer.style.position = 'absolute';
                controlsContainer.style.top = 'auto'; // Unset top
                controlsContainer.style.bottom = '0'; // Pin to bottom of section
                controlsContainer.style.left = '50%';
                controlsContainer.style.transform = 'translateX(-50%)';
                controlsContainer.style.width = controlsNaturalWidth ? `${controlsNaturalWidth}px` : '';
                controlsPlaceholder.style.height = effectiveControlsHeight ? `${effectiveControlsHeight}px` : '0';

            }
        } else if (isBefore) {
            // State 1: Normal flow (before scrolling past it)
            if (controlsContainer.classList.contains('sticky') || controlsContainer.classList.contains('pinned')) {
                controlsContainer.classList.remove('sticky', 'pinned');
                controlsContainer.style.position = '';
                controlsContainer.style.top = '';
                controlsContainer.style.bottom = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.style.height = '0';

            }
        } else {
            // State 2: Sticky (fixed to top of viewport)
            if (!controlsContainer.classList.contains('sticky') || controlsContainer.classList.contains('pinned')) {
                controlsContainer.classList.remove('pinned');
                controlsContainer.classList.add('sticky');
                controlsContainer.style.position = 'fixed';
                controlsContainer.style.top = '0';
                controlsContainer.style.bottom = 'auto'; // Unset bottom
                controlsContainer.style.left = '50%';
                controlsContainer.style.transform = 'translateX(-50%)';
                controlsContainer.style.width = controlsNaturalWidth ? `${controlsNaturalWidth}px` : '';
                controlsPlaceholder.style.height = effectiveControlsHeight ? `${effectiveControlsHeight}px` : '0';

            }
        }
    }

    function forceRefreshStickyMeasurements() {

        const oldOffset = controlsOriginalDocumentOffsetTop;
        const oldHeight = controlsHeight;
        const oldWidth = controlsNaturalWidth;

        // Store current sticky/pinned state to see if we need to restore styles (though onScroll should handle it)
        const isCurrentlySticky = controlsContainer.classList.contains('sticky');
        const isCurrentlyPinned = controlsContainer.classList.contains('pinned');

        // Reset styles to measure natural dimensions in normal flow
        controlsContainer.classList.remove('sticky', 'pinned');
        controlsContainer.style.position = '';
        controlsContainer.style.top = '';
        controlsContainer.style.left = '';
        controlsContainer.style.transform = '';
        controlsContainer.style.width = ''; // Allow natural width
        // Placeholder height will be reset by onScroll if needed

        // Re-measure all critical dimensions
        const rect = controlsContainer.getBoundingClientRect();
        controlsNaturalWidth = rect.width;
        controlsHeight = rect.height;
        controlsOriginalDocumentOffsetTop = rect.top + window.scrollY;

        if (DEBUG) {

        }

        // Call onScroll() to re-evaluate and apply the correct state based on new measurements.
        // This will also handle re-applying sticky/pinned styles if necessary and manage the placeholder.
        onScroll();
    }

    if (controlsContainer) {
        controlsContainer.forceRefreshStickyMeasurements = forceRefreshStickyMeasurements;
    }

    // Debounced resize and throttled scroll
    // Adding a small delay to setupInitial to ensure other scripts/elements might be ready
    // Adding a longer delay to setupInitial to ensure other scripts/elements (especially Plotly charts)
    // have more time to render and stabilize the layout before any measurements are taken.
    setTimeout(() => {
        setupInitial(); 
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {

                setupInitial(); // Re-initialize on resize
            }, 250); // Debounce resize event
        });


    }, 1000); // Increased outer delay to 1000ms
}

// If you plan to use this in a module system, you might export it:
// export { initializeStickyMenu };
