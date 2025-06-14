// public/js/sections/section_one.js
// Ensure the global namespace for section-specific functions exists
window.sectionOne = window.sectionOne || {};

async function updateSectionOnePlots() {
    try {
        if (!window.PlotUtils) {
            DebugManager.log('ERROR', 'PlotUtils is not available.');
            return;
        }

        DebugManager.log('PLOT_RENDERING', 'Updating Section One plots...');

        // Plot 1: Structural Shocks (epsilon_t)
        PlotUtils.createOrUpdateScatterPlot(
            'plot_s1_left',
            window.sharedData.epsilon_1t,
            window.sharedData.epsilon_2t,
            'Structural Shocks (ε₁ vs ε₂)',
            'ε₁',
            'ε₂',
            'secondary'
        );

        // Plot 2: Reduced-Form Shocks (u_t)
        PlotUtils.createOrUpdateScatterPlot(
            'plot_s1_right',
            window.sharedData.u_1t,
            window.sharedData.u_2t,
            'Reduced-Form Shocks (u₁ vs u₂)',
            'u₁',
            'u₂'
        );

        DebugManager.log('PLOT_RENDERING', 'Section One plots updated successfully.');
    } catch (error) {
        DebugManager.log('ERROR', 'Failed to update Section One plots:', error);
    }
}

// Expose the update function to the global scope so main.js can call it
window.sectionOne.updatePlots = updateSectionOnePlots;

async function initializeSectionOne() {
    const SECTION_ONE_ID = 'section-one';
    DebugManager.log('INIT', `Initializing JavaScript for section: ${SECTION_ONE_ID}`);

    // Initial plot rendering
    await updateSectionOnePlots();

    // Display initial B0 matrix
    if (window.LatexUtils && typeof window.LatexUtils.displayBEstMatrix === 'function' && window.sharedData) {
        window.LatexUtils.displayBEstMatrix('b0_matrix_s1_display', window.sharedData.B0, 'B_0');
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils.displayBEstMatrix or sharedData not available for initial B0 display in Section One.');
    }

    DebugManager.log('INIT', `Initialization for section: ${SECTION_ONE_ID} complete.`);
}
