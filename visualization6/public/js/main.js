// main.js

/**
 * Updates all plots across all sections.
 * This function is called whenever underlying data changes.
 */
async function updateAllPlots() {
    DebugManager.log('PLOT_RENDERING', 'Attempting to update all plots...');
    
    // Update Section One plots if its update function exists
    if (window.sectionOne && typeof window.sectionOne.updatePlots === 'function') {
        await window.sectionOne.updatePlots();
    }

    // Update Section Two plots if its update function exists
    if (window.sectionTwo && typeof window.sectionTwo.updatePlots === 'function') {
        await window.sectionTwo.updatePlots();
    }

    // Update Section Three plots if its update function exists
    if (window.sectionThree && typeof window.sectionThree.updatePlots === 'function') {
        await window.sectionThree.updatePlots();
    }

    // Update Section Four plots if its update function exists
    if (window.sectionFour && typeof window.sectionFour.updatePlots === 'function') {
        await window.sectionFour.updatePlots();
    }

    // ...add other sections here as they get plots

    DebugManager.log('PLOT_RENDERING', 'Finished updating all plots.');
}

/**
 * Regenerates the full SVAR data pipeline, starting from epsilon_t.
 * This is the primary function called when T changes or 'New Data' is clicked.
 */
async function regenerateSvarData() {
    DebugManager.log('SVAR_DATA_PIPELINE', 'Attempting to regenerate epsilon_t series...');

    if (!window.SVARCoreFunctions || typeof window.SVARCoreFunctions.generateEpsilon !== 'function') {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions or generateEpsilon function not found. Cannot generate epsilon_t.');
        return;
    }

    if (!window.sharedData) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: sharedData not found. Cannot access T or store epsilon_t.');
        return;
    }

    const T = window.sharedData.T;
    if (typeof T !== 'number' || T <= 0 || isNaN(T)) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Invalid sample size T in sharedData:', T, '- Epsilon generation skipped.');
        // Optionally clear or set to empty arrays on error to prevent using stale data
        window.sharedData.epsilon_1t = [];
        window.sharedData.epsilon_2t = [];
        window.sharedData.u_1t = [];
        window.sharedData.u_2t = [];
        return;
    }

    try {
        const { epsilon_1t, epsilon_2t } = window.SVARCoreFunctions.generateEpsilon(T);
        
        window.sharedData.epsilon_1t = epsilon_1t;
        window.sharedData.epsilon_2t = epsilon_2t;
        DebugManager.log('SVAR_DATA_PIPELINE', 'Successfully generated and stored epsilon_1t (length:', epsilon_1t.length, ') and epsilon_2t (length:', epsilon_2t.length, ') in sharedData.');

        // Now, generate reduced-form shocks u_t
        if (typeof window.SVARCoreFunctions.generateU === 'function' && window.sharedData.B0) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'Proceeding to generate u_t using B0:', JSON.stringify(window.sharedData.B0));
            const { u_1t, u_2t } = window.SVARCoreFunctions.generateU(window.sharedData.B0, epsilon_1t, epsilon_2t);
            window.sharedData.u_1t = u_1t;
            window.sharedData.u_2t = u_2t;
            DebugManager.log('SVAR_DATA_PIPELINE', 'Successfully generated and stored u_1t (length:', u_1t.length, ') and u_2t (length:', u_2t.length, ') in sharedData.');

            // Calculate recursive estimates now that u_t is updated
            if (typeof window.SVARCoreFunctions.calculateRecursiveEstimates === 'function') {
                window.SVARCoreFunctions.calculateRecursiveEstimates();
            } else {
                DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateRecursiveEstimates function not found.');
            }

            // Calculate non-Gaussian estimates now that u_t is updated
            if (typeof window.SVARCoreFunctions.calculateNonGaussianEstimates === 'function') {
                window.SVARCoreFunctions.calculateNonGaussianEstimates();
                // After non-Gaussian estimates, calculate and store the v weight for Ridge
                if (typeof window.SVARCoreFunctions.calculateAndStoreVWeight === 'function') {
                    window.SVARCoreFunctions.calculateAndStoreVWeight();
                } else {
                    DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateAndStoreVWeight function not found. Ridge estimates might be incorrect.');
                }
            } else {
                DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateNonGaussianEstimates function not found.');
            }

            // Calculate Ridge estimates now that u_t is updated
            if (typeof window.SVARCoreFunctions.calculateRidgeEstimates === 'function') {
                window.SVARCoreFunctions.calculateRidgeEstimates();
            } else {
                DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateRidgeEstimates function not found.');
            }

            // Now that u_t is updated, regenerate B(phi)
            await regenerateBPhi();
        } else {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.generateU not found or sharedData.B0 is not available. Cannot generate u_t.');
            window.sharedData.u_1t = [];
            window.sharedData.u_2t = [];
        }
    } catch (error) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to generate epsilon_t:', error);
        window.sharedData.epsilon_1t = [];
        window.sharedData.epsilon_2t = [];
        window.sharedData.u_1t = [];
        window.sharedData.u_2t = [];
    }
}

/**
 * Regenerates only the reduced-form shocks (u_t) using existing structural shocks (epsilon_t)
 * and the current B0 matrix from sharedData. This is typically called when B0 changes (e.g., mode switch).
 */
async function regenerateReducedFormShocksFromExistingEpsilon() {
    DebugManager.log('SVAR_DATA_PIPELINE', 'Attempting to regenerate u_t from existing epsilon_t and current B0...');

    if (!window.SVARCoreFunctions || typeof window.SVARCoreFunctions.generateU !== 'function') {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.generateU function not found. Cannot regenerate u_t.');
        return;
    }

    if (!window.sharedData || !window.sharedData.B0 || !window.sharedData.epsilon_1t || !window.sharedData.epsilon_2t) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: sharedData, B0, or epsilon_t series not found. Cannot regenerate u_t.');
        return;
    }

    if (window.sharedData.epsilon_1t.length === 0 || window.sharedData.epsilon_2t.length === 0) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'WARNING: Epsilon_t series are empty. Cannot regenerate u_t. This might be normal if T is invalid or initial generation failed.');
        // Ensure u_t is also empty if epsilon_t is empty
        window.sharedData.u_1t = [];
        window.sharedData.u_2t = [];
        return;
    }

    try {
        DebugManager.log('SVAR_DATA_PIPELINE', 'Proceeding to regenerate u_t using B0:', JSON.stringify(window.sharedData.B0), 'and existing epsilon_t (length:', window.sharedData.epsilon_1t.length, ')');
        const { u_1t, u_2t } = window.SVARCoreFunctions.generateU(window.sharedData.B0, window.sharedData.epsilon_1t, window.sharedData.epsilon_2t);
        
        window.sharedData.u_1t = u_1t;
        window.sharedData.u_2t = u_2t;

        DebugManager.log('SVAR_DATA_PIPELINE', 'Successfully regenerated and stored u_1t (length:', u_1t.length, ') and u_2t (length:', u_2t.length, ') in sharedData from existing epsilon_t.');

        // Calculate recursive estimates now that u_t is updated
        if (typeof window.SVARCoreFunctions.calculateRecursiveEstimates === 'function') {
            window.SVARCoreFunctions.calculateRecursiveEstimates();
        } else {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateRecursiveEstimates function not found.');
        }

        // Calculate non-Gaussian estimates now that u_t is updated
        if (typeof window.SVARCoreFunctions.calculateNonGaussianEstimates === 'function') {
            window.SVARCoreFunctions.calculateNonGaussianEstimates();
            // After non-Gaussian estimates, calculate and store the v weight for Ridge
            if (typeof window.SVARCoreFunctions.calculateAndStoreVWeight === 'function') {
                window.SVARCoreFunctions.calculateAndStoreVWeight();
            } else {
                DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateAndStoreVWeight function not found. Ridge estimates might be incorrect.');
            }
        } else {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateNonGaussianEstimates function not found.');
        }

        // Calculate Ridge estimates now that u_t is updated
        if (typeof window.SVARCoreFunctions.calculateRidgeEstimates === 'function') {
            window.SVARCoreFunctions.calculateRidgeEstimates();
        } else {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.calculateRidgeEstimates function not found.');
        }

        // Now that u_t is updated, regenerate B(phi)
        await regenerateBPhi();
    } catch (error) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to regenerate u_t from existing epsilon_t:', error);
        window.sharedData.u_1t = [];
        window.sharedData.u_2t = [];
    }
}

/**
 * Regenerates the B(phi) matrix using current u_t series and phi from sharedData,
 * then stores it back into sharedData.
 */
/**
 * Asynchronously updates all registered dynamic LaTeX displays on the page.
 */
async function updateDynamicLatexOutputs() {
    DebugManager.log('LATEX_UPDATE', 'Attempting to update dynamic LaTeX outputs.');

    // Define a list of element IDs that need B(phi) updates
    const bPhiElementIds = [
        'b_phi_matrix_s2_display',
        'b_phi_matrix_s3_display',
        'b_phi_matrix_s4_display'
        // Add other B(phi) display element IDs here if they exist in other sections
    ];

    // Update B0 matrix display in Section One
    if (window.LatexUtils && typeof window.LatexUtils.displayBEstMatrix === 'function' && window.sharedData) {
        if (document.getElementById('b0_matrix_s1_display')) {
            window.LatexUtils.displayBEstMatrix('b0_matrix_s1_display', window.sharedData.B0, 'B_0');
        }
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils.displayBEstMatrix or sharedData not available for B0 display in Section One.');
    }

    // Update B(phi) matrix displays
    if (window.LatexUtils && typeof window.LatexUtils.displayBPhiMatrix === 'function') {
        bPhiElementIds.forEach(id => {
            if (document.getElementById(id)) { // Check if the element exists in the current DOM
                window.LatexUtils.displayBPhiMatrix(id);
            }
        });
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils.displayBPhiMatrix not available. Cannot update B(phi) displays.');
    }

    // Update estimated phi and B matrices
    if (window.LatexUtils && typeof window.LatexUtils.displayPhiEst === 'function' && typeof window.LatexUtils.displayBEstMatrix === 'function' && window.sharedData) {
        // Section Two: Recursive
        if (document.getElementById('phi_est_rec_s2_display')) {
            window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', window.sharedData.phi_est_rec, '\\hat{\\phi}_{rec}');
        }
        if (document.getElementById('b_est_rec_s2_display')) {
            window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', window.sharedData.B_est_rec, '\\hat{B}_{rec}');
        }

        // Section Three: Non-Gaussian
        if (document.getElementById('phi_est_nG_s3_display')) {
            window.LatexUtils.displayPhiEst('phi_est_nG_s3_display', window.sharedData.phi_est_nG, '\\hat{\\phi}_{nG}');
        }
        if (document.getElementById('b_est_nG_s3_display')) {
            window.LatexUtils.displayBEstMatrix('b_est_nG_s3_display', window.sharedData.B_est_nG, '\\hat{B}_{nG}');
        }

        // Section Four: Ridge
        if (document.getElementById('phi_est_ridge_s4_display')) {
            window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', window.sharedData.phi_est_ridge, '\\hat{\\phi}_{ridge}');
        }
        if (document.getElementById('b_est_ridge_s4_display')) {
            window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', window.sharedData.B_est_ridge, '\\hat{B}_{ridge}');
        }
        // Update v weight display in Section Four
        if (document.getElementById('v_weight_s4_display')) {
            window.LatexUtils.displayVWeight('v_weight_s4_display', window.sharedData.v, 'v');
        }
        // Update lambda display in Section Four
        if (document.getElementById('lambda_s4_value_display')) { // Assuming this ID exists for lambda in S4
            window.LatexUtils.displayVWeight('lambda_s4_value_display', window.sharedData.lambda, '\\lambda', 2); // Using 2 decimal places for lambda
        }
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils display functions for estimated parameters or sharedData not available.');
    }

    DebugManager.log('LATEX_UPDATE', 'Finished attempting to update dynamic LaTeX outputs.');
}


async function regenerateBPhi() {
    DebugManager.log('SVAR_DATA_PIPELINE', 'Attempting to regenerate B(phi) and store in sharedData...');

    if (!window.SVARCoreFunctions || typeof window.SVARCoreFunctions.generateBPhi !== 'function') {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions.generateBPhi function not found. Cannot regenerate B(phi).');
        window.sharedData.B_phi = [[1, 0], [0, 1]]; // Reset to default
        return;
    }

    if (!window.sharedData || !window.sharedData.u_1t || !window.sharedData.u_2t || window.sharedData.phi === undefined) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: sharedData, u_t series, or phi not available. Cannot regenerate B(phi).');
        window.sharedData.B_phi = [[1, 0], [0, 1]]; // Reset to default
        return;
    }

    if (window.sharedData.u_1t.length === 0 || window.sharedData.u_2t.length === 0) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'WARNING: u_t series are empty. Cannot regenerate B(phi). Setting B_phi to default.');
        window.sharedData.B_phi = [[1, 0], [0, 1]]; // Reset to default
        // Potentially log current u_t for debugging if needed
        // DebugManager.log('SVAR_DATA_PIPELINE', 'Current u_1t:', JSON.stringify(window.sharedData.u_1t));
        // DebugManager.log('SVAR_DATA_PIPELINE', 'Current u_2t:', JSON.stringify(window.sharedData.u_2t));
        return;
    }

    try {
        const B_phi_matrix = window.SVARCoreFunctions.generateBPhi(
            window.sharedData.u_1t,
            window.sharedData.u_2t,
            window.sharedData.phi
        );

        if (B_phi_matrix) {
            window.sharedData.B_phi = B_phi_matrix;
            DebugManager.log('SVAR_DATA_PIPELINE', 'B(phi) regeneration complete. B_phi stored in sharedData:', JSON.stringify(window.sharedData.B_phi));

            // After B_phi is updated, regenerate innovations e_t
            await regenerateInnovations();
            
            await updateDynamicLatexOutputs(); // Update LaTeX displays for B(phi)
            await updateAllPlots(); // Update plots as B(phi) might affect them indirectly or directly
        } else {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: B(phi) generation returned null. Resetting B_phi to default.');
            window.sharedData.B_phi = [[1,0],[0,1]]; // Reset B_phi on error
            window.sharedData.e_1t = []; // Also reset innovations if B_phi generation fails
            window.sharedData.e_2t = [];
        }
    } catch (error) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Exception during B(phi) regeneration:', error);
        window.sharedData.B_phi = [[1, 0], [0, 1]]; // Reset to default on exception
    }
}


/* --- START OF INNOVATIONS e_t GENERATION --- */
/**
 * Regenerates the structural innovations e_t = B(phi)^-1 * u_t and stores them in sharedData.
 * This function is called when B(phi) or u_t change.
 */
async function regeneratePhi0() {
    const category = 'SVAR_DATA_PIPELINE';
    DebugManager.log(category, 'Attempting to regenerate phi_0...');

    if (!window.sharedData || !window.SVARMathUtil) {
        DebugManager.log(category, 'Error: sharedData or SVARMathUtil not available for regeneratePhi0.');
        return;
    }

    try {
        const B0 = window.sharedData.B0;
        if (!B0) {
            DebugManager.log(category, 'Error: B0 matrix not available in sharedData for phi_0 calculation.');
            window.sharedData.phi_0 = null; // Ensure phi_0 is null if B0 is missing
            return;
        }

        const phi_0_rad = SVARMathUtil.calculatePhi0(B0);

        if (phi_0_rad !== null) {
            window.sharedData.phi_0 = phi_0_rad;
            DebugManager.log(category, `Successfully regenerated phi_0: ${phi_0_rad} radians.`);
        } else {
            window.sharedData.phi_0 = null; // Set to null if calculation failed
            DebugManager.log(category, 'Failed to regenerate phi_0. Value set to null.');
        }
    } catch (error) {
        DebugManager.log(category, 'Exception during regeneratePhi0:', error);
        window.sharedData.phi_0 = null; // Ensure phi_0 is null on exception
    }
}

async function regenerateInnovations() {
    const category = 'SVAR_DATA_PIPELINE';
    DebugManager.log(category, 'Attempting to regenerate structural innovations e_t...');

    try {
        if (!window.SVARCoreFunctions || typeof window.SVARCoreFunctions.generateInnovations !== 'function') {
            throw new Error('SVARCoreFunctions.generateInnovations not found.');
        }

        if (!window.sharedData || !window.sharedData.B_phi || !window.sharedData.u_1t || !window.sharedData.u_2t) {
            throw new Error('sharedData or required series (B_phi, u_t) not found.');
        }

        const { B_phi, u_1t, u_2t } = window.sharedData;

        if (u_1t.length === 0 || u_2t.length === 0) {
            DebugManager.log(category, 'u_t series are empty. Clearing innovation data.');
            window.sharedData.e_1t = [];
            window.sharedData.e_2t = [];
        } else {
            const innovations = window.SVARCoreFunctions.generateInnovations(B_phi, u_1t, u_2t);
            if (innovations) {
                window.sharedData.e_1t = innovations.e_1t;
                window.sharedData.e_2t = innovations.e_2t;
                DebugManager.log(category, 'Successfully regenerated and stored e_t in sharedData.');
            } else {
                DebugManager.log(category, 'ERROR: generateInnovations returned null. Clearing innovation data.');
                window.sharedData.e_1t = [];
                window.sharedData.e_2t = [];
            }
        }
    } catch (error) {
        DebugManager.log(category, 'ERROR: Failed to generate innovations e_t:', error);
        window.sharedData.e_1t = [];
        window.sharedData.e_2t = [];
    } finally {
        // This is the end of the data generation chain, so always update all plots.
        await updateAllPlots();
    }
}
/* --- END OF INNOVATIONS e_t GENERATION --- */

function initializeMainMenuToggle() {
    DebugManager.log('MAIN_APP', 'Initializing main menu toggle...');
    const mainNav = document.getElementById('main-nav');
    const navUl = mainNav ? mainNav.querySelector('ul') : null;

    if (!mainNav || !navUl) {
        DebugManager.log('MAIN_APP', 'ERROR: Main navigation or its UL not found. Cannot create hamburger menu.');
        return;
    }

    // Check if toggle button already exists to prevent duplicates during hot reloads/re-initializations
    if (mainNav.querySelector('.main-nav-toggle')) {
        DebugManager.log('MAIN_APP', 'Main menu toggle button already exists.');
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.className = 'main-nav-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle navigation');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', 'main-nav-ul'); // Assuming ul will get this id

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'main-nav-toggle-icon';
    toggleButton.appendChild(toggleIcon);

    // Prepend the button to the main-nav container
    mainNav.prepend(toggleButton);
    navUl.id = 'main-nav-ul'; // Ensure the ul has an id for aria-controls

    toggleButton.addEventListener('click', () => {
        const isExpanded = mainNav.classList.toggle('nav-open');
        toggleButton.classList.toggle('active');
        toggleButton.setAttribute('aria-expanded', isExpanded.toString());
        DebugManager.log('MAIN_APP', `Main navigation toggled. Is open: ${isExpanded}`);
    });

    DebugManager.log('MAIN_APP', 'Main menu toggle initialized.');
}

document.addEventListener('DOMContentLoaded', async () => {
    DebugManager.log('MAIN_APP', 'DOMContentLoaded event fired.');

    // Section Zero's HTML will be loaded by loadSections. 
    // The loading overlay is already visible below section zero due to HTML structure and CSS.

    DebugManager.log('MAIN_APP', 'Loading sections...');
    await loadSections(); // This loads HTML into all placeholders, including section-zero
    DebugManager.log('MAIN_APP', 'Sections loaded.');

    DebugManager.log('MAIN_APP', 'Initializing app...');
    await initializeApp(); // This initializes JS for all sections (0 to 4)
    DebugManager.log('MAIN_APP', 'App initialized.');

    // Hide the loading overlay
    const loadingOverlayElement = document.getElementById('loading-overlay');
    if (loadingOverlayElement) {
        DebugManager.log('MAIN_APP', 'Hiding loading overlay.');
        loadingOverlayElement.classList.add('hidden');
        // The CSS for .hidden should handle display:none and transitions.
    }

    // Add .loaded to #main-content to trigger fade-in of sections 1-4
    const mainContentElement = document.getElementById('main-content');
    if (mainContentElement) {
        DebugManager.log('MAIN_APP', 'Adding .loaded class to main-content.');
        mainContentElement.classList.add('loaded');
    }

    // Add .loaded to nav and footer for their fade-in
    const mainNavElement = document.getElementById('main-nav');
    if (mainNavElement) {
        mainNavElement.classList.add('loaded');
    }
    const footerElement = document.querySelector('footer.footer');
    if (footerElement) {
        footerElement.classList.add('loaded');
    }

    DebugManager.log('MAIN_APP', 'Page fully loaded and initialized.');
});

async function loadSections() {
    DebugManager.log('MAIN_APP', 'Attempting to load HTML sections...');
    const placeholders = document.querySelectorAll('div[data-section-src]');
    const fetchPromises = [];

    placeholders.forEach(placeholder => {
        const src = placeholder.dataset.sectionSrc;
        if (src) {
            const promise = fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} for ${src}`);
                    }
                    return response.text();
                })
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html.trim();
                    
                    // Replace placeholder with the first child of tempDiv (the actual section element)
                    if (tempDiv.firstChild && placeholder.parentNode) {
                        placeholder.parentNode.replaceChild(tempDiv.firstChild, placeholder);
                    } else {
                        DebugManager.log('MAIN_APP', 'ERROR: Empty or invalid section content loaded from:', src, tempDiv.innerHTML);
                        placeholder.innerHTML = '<p>Error: Could not load section content properly. Ensure the fetched HTML has a single root element (e.g., a <section> tag).</p>';
                    }
                })
                .catch(error => {
                    DebugManager.log('MAIN_APP', 'ERROR: Error loading section:', src, error);
                    placeholder.innerHTML = `<p>Error loading content from ${src}. Check console for details.</p>`;
                });
            fetchPromises.push(promise);
        }
    });

    try {
        await Promise.all(fetchPromises);
        DebugManager.log('MAIN_APP', 'All sections loaded successfully.');
    } catch (error) {
        DebugManager.log('MAIN_APP', 'ERROR: One or more sections failed to load:', error);
    }
}

async function initializeApp() {
    DebugManager.log('MAIN_APP', 'Initializing app features...');

    // --- Dynamically create controls from placeholders ---
    DebugManager.log('MAIN_APP', 'Processing UI control placeholders...');
    document.querySelectorAll('[data-control-type]').forEach(placeholder => {
        const type = placeholder.dataset.controlType;
        const id = placeholder.dataset.controlId; // Essential for unique elements
        let controlHtml = '';

        if (type === 't-slider' && window.uiFactory && typeof window.uiFactory.createTSlider === 'function') {
            // Pass the label from data-attribute if present, otherwise factory uses default
            const label = placeholder.dataset.controlLabel; 
            controlHtml = window.uiFactory.createTSlider(id, label); 
        } else if (type === 'mode-switch' && window.uiFactory && typeof window.uiFactory.createModeSwitch === 'function') {
            const label = placeholder.dataset.controlLabel; // Allow custom label via data-attribute
            controlHtml = window.uiFactory.createModeSwitch(id, label);
        } else if (type === 'phi-slider' && window.uiFactory && typeof window.uiFactory.createPhiSlider === 'function') {
            controlHtml = window.uiFactory.createPhiSlider(id);
        } else if (type === 'lambda-slider' && window.uiFactory && typeof window.uiFactory.createLambdaSlider === 'function') {
            controlHtml = window.uiFactory.createLambdaSlider(id);
        } else if (type === 'new-data-button' && window.uiFactory && typeof window.uiFactory.createNewDataButton === 'function') {
            controlHtml = window.uiFactory.createNewDataButton(id);
        }
        // else if (type === 'button' && window.uiFactory && typeof window.uiFactory.createButton === 'function') {
        //     const text = placeholder.dataset.buttonText || 'Button';
        //     const classes = placeholder.dataset.buttonClasses || '';
        //     controlHtml = window.uiFactory.createButton(id, text, classes);
        // }
        // ... other control types can be added here
        
        if (controlHtml) {
            // Replace the placeholder div itself with the new control's HTML
            placeholder.outerHTML = controlHtml; 
            DebugManager.log('MAIN_APP', `Created ${type} with id '${id}'.`);
        } else {
            DebugManager.log('MAIN_APP', `WARNING: Could not create control of type: '${type}' with id: '${id}'. Check ui_factory.js and placeholder attributes.`);
        }
    });
    DebugManager.log('MAIN_APP', 'Finished processing UI control placeholders.');
    // --- End of dynamic control creation ---

    const navLinks = document.querySelectorAll('.main-navigation a');
    const mainNavElement = document.getElementById('main-nav');
    
    DebugManager.log('MAIN_APP', 'Smooth scrolling initialized for nav links.');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId); 
            const currentMainNavHeight = mainNavElement ? mainNavElement.offsetHeight : 70;

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - currentMainNavHeight - 20;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active link highlighting
    const sections = document.querySelectorAll('.content-section');
    const updateActiveLink = () => {
        let currentSectionId = '';
        const currentMainNavHeight = mainNavElement ? mainNavElement.offsetHeight : 70;

        sections.forEach(section => {
            if (section.id) {
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
                const activationPoint = sectionTop - currentMainNavHeight - 50; 
                if (window.pageYOffset >= activationPoint) {
                    currentSectionId = section.id;
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-link');
            const href = link.getAttribute('href');
            if (href && href.substring(1) === currentSectionId) {
                link.classList.add('active-link');
            }
        });
    };

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveLink);
        window.addEventListener('resize', updateActiveLink);
        updateActiveLink(); // Initial check
    }

    // Initialize sliders
    if (typeof initializeSliders === 'function') {
        initializeSliders();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize sticky menus
    if (typeof initializeStickyMenus === 'function') {
        initializeStickyMenus(); // Initialize sticky menu behavior
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeStickyMenus function not found. Make sure sticky_menu.js is loaded.');
    }
    
    // Initialize controls toggle buttons
    if (typeof initializeControlsToggle === 'function') {
        initializeControlsToggle(); // Initialize collapsible controls
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeControlsToggle function not found. Make sure controls_toggle.js is loaded.');
    }

    // Initialize mode switches
    if (typeof initializeModeSwitches === 'function') {
        initializeModeSwitches(); // Initialize all mode switches
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeModeSwitches function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize phi sliders
    if (typeof initializePhiSliders === 'function') {
        initializePhiSliders(); // Initialize all phi sliders
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializePhiSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize lambda sliders
    if (typeof initializeLambdaSliders === 'function') {
        initializeLambdaSliders();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeLambdaSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize New Data buttons

    // Regenerate SVAR base data (epsilon_t) after all controls are initialized
    // and their initial values might have updated sharedData (e.g., sharedData.T).
    // This ensures epsilon_t is ready before section-specific JS that might use it.
    DebugManager.log('MAIN_APP', 'Calling initial SVAR data regeneration...');
    await regenerateSvarData(); // Regenerate all SVAR data on initial load
    await regeneratePhi0(); // Calculate initial phi_0 based on initial B0
    await regenerateBPhi(); // Also generate B(phi) based on initial phi and u

    if (typeof initializeNewDataButtons === 'function') {
        initializeNewDataButtons();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeNewDataButtons function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize section-specific JavaScript
    DebugManager.log('MAIN_APP', 'Initializing section-specific JavaScript...');
    if (typeof initializeSectionOne === 'function' && document.getElementById('section-one')) {
        await initializeSectionOne();
    } else if (typeof initializeSectionOne !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionOne function not found. Make sure section_one.js is loaded.');
    }

    if (typeof initializeSectionTwo === 'function' && document.getElementById('section-two')) {
        await initializeSectionTwo();
    } else if (typeof initializeSectionTwo !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionTwo function not found. Make sure section_two.js is loaded.');
    }

    if (typeof initializeSectionThree === 'function' && document.getElementById('section-three')) {
        await initializeSectionThree();
    } else if (typeof initializeSectionThree !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionThree function not found. Make sure section_three.js is loaded.');
    }

    if (typeof initializeSectionFour === 'function' && document.getElementById('section-four')) {
        await initializeSectionFour();
    } else if (typeof initializeSectionFour !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionFour function not found. Make sure section_four.js is loaded.');
    }
    // Initialize main menu toggle (hamburger)
    initializeMainMenuToggle();

    DebugManager.log('MAIN_APP', 'All initializations complete.');

    // After all initializations and section-specific JS, typeset the whole document for static LaTeX.
    if (window.MathJax && window.MathJax.typesetPromise) {
        DebugManager.log('LATEX_UPDATE', 'Attempting global MathJax typesetting for static content.');
        window.MathJax.typesetPromise().catch((err) => {
            console.error('Global MathJax typesetting error:', err);
            DebugManager.log('LATEX_UPDATE', 'Global MathJax typesetting error:', err);
        });
    } else {
        DebugManager.log('LATEX_UPDATE', 'MathJax.typesetPromise not available for global typesetting.');
    }
}
