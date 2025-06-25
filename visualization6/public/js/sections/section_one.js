// public/js/sections/section_one.js
// Ensure the global namespace for section-specific functions exists
window.sectionOne =  {
    updatePlots: updateSectionOnePlots,
    initialize: initializeSectionOne
};



async function initializeSectionOne() {
    const SECTION_ONE_ID = 'section-one';
    DebugManager.log('INIT', `Initializing JavaScript for section: ${SECTION_ONE_ID}`);

    const contentArea = document.getElementById('section-one-dynamic-content');
    if (!contentArea) {
        DebugManager.log('ERROR', 'Section one dynamic content area not found.');
        return;
    }
    contentArea.innerHTML = ''; // Clear existing content

    // 1. Intro Paragraph
    const introHTML = `
       <p class="section-intro"> This section illustrates the data-generating process (DGP) for a structural vector autoregression (SVAR). We begin with the relationship between the observed reduced-form shocks \\(u_t\\) and the unobserved structural shocks \\(\\epsilon_t\\), governed by the equation \\(u_t = B_0 \\epsilon_t\\), where \\(B_0\\) is the true structural matrix.</p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    const explainControlsHTML = `
    <div class="controls-explanation-card">
        <h4>Interactive Controls</h4>
        <p><strong>T Slider:</strong> Adjusts the sample size of the generated data.</p>
        <p><strong>Mode Switch:</strong> Toggles the true data-generating process between a recursive and non-recursive SVAR model.</p>
        <p><strong>New Data Button:</strong> Generates a new set of random shocks for the given sample size.</p>
    </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(explainControlsHTML));
   


    // 2. Sub-topic Heading: Model Variants
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Data-Generation'));

    // 3. B0 Matrix Options Card and Tip Callout
    const DGPHTML = `
    <p>We consider a simple bivariate example. We  generate two raw shock series. The first, \\(\\eta_{1t}\\), follows a Normal distribution. The
        second, \\(\\eta_{2t}\\), is drawn from a non-Gaussian distribution. The raw shocks
        \\(\\eta_{t}\\) are scaled by a time-varying volatility process \\(\\sigma_t\\) and we obtain the structural shocks \\(\\epsilon_t = \\sigma_t
        \\eta_{t}\\). We normalize the shocks to zero mean and unit variance. </p> 

        <p>The reduced-form shocks \\(u_t\\) are equal to  \\(u_t = B_0 \\epsilon_t\\). We consider two variants of the true \\(B_0\\) matrix. The first is the recursive model with \\(B_0^{\\mathrm{rec}} = \\begin{bmatrix} 1 & 0 \\\\ 0.5 & 1 \\end{bmatrix}\\) 
        and the second is the non-recursive model with \\(B_0^{\\mathrm{non-rec}} = \\begin{bmatrix} 1 & 0.5 \\\\ 0.5 & 1 \\end{bmatrix}\\).</p>
        <p>The currently active model is: <span id="b0_display_s1"></span>.</p>
    `;
    const DGPNoteHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Note:</strong> The raw shocks \\(\\eta_t\\) are generated to be mutually independent. However, because they are scaled by a common time-varying volatility process \\(\\sigma_t\\), the resulting structural shocks \\(\\epsilon_t\\) are no longer fully independent. They are, however, designed to be mean independent (i.e., \\(E[\\epsilon_{it} | \\epsilon_{jt}] = 0\\)).</p>',
        false, 
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(DGPHTML, DGPNoteHTML));


 

    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));

    // 3. B0 Matrix Options Card and Tip Callout
    const animationsDescHTML = `
    <p><strong>Left Plot (Structural Shocks):</strong> Displays a scatter plot of \\(\\epsilon_{1t}\\) against \\(\\epsilon_{2t}\\). </p>
    <p><strong>Right Plot (Reduced-Form Shocks):</strong> Displays a scatter plot of \\(u_{1t}\\) against \\(u_{2t}\\). These are the shocks as they would be observed in a reduced-form VAR model. Notice how their distribution changes when you toggle \\(B_0\\), illustrating how different mixtures of the structural shocks \\(\\epsilon_t\\) can produce different patterns in the observed reduced-form residuals.</p>

    `;
    contentArea.appendChild(ContentTemplates.buildLeftRightPlotExplanation(animationsDescHTML));

    const animationsObsHTML = `
    <p><strong> </strong> 1. Observe the skewness of \\(\\epsilon_{2t}\\). There are outliers where \\(\\epsilon_{2t}\\) is very large, however, there are no comparable outliers where \\(\\epsilon_{2t}\\) is very small.</p>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(animationsObsHTML));

    // Register dynamic LaTeX elements after they have been added to the DOM
    if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
        window.DynamicLatexManager.registerDynamicLatex('b0_display_s1', 'B0', 'displayBEstMatrix', ['B_0']);
    } else {
        DebugManager.error('SEC_ONE_INIT', 'DynamicLatexManager.registerDynamicLatex not available.');
    }

    // Typeset MathJax for the whole section
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        await window.MathJax.typesetPromise([contentArea]);
    }


    // Initial plot rendering
    await updateSectionOnePlots();


 

    DebugManager.log('INIT', `Initialization for section: ${SECTION_ONE_ID} complete.`);
}

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
            'green'
        );

        // Plot 2: Reduced-Form Shocks (u_t)
        PlotUtils.createOrUpdateScatterPlot(
            'plot_s1_right',
            window.sharedData.u_1t,
            window.sharedData.u_2t,
            'Reduced-Form Shocks (u₁ vs u₂)',
            'u₁',
            'u₂',
            'pink'
        );

        DebugManager.log('PLOT_RENDERING', 'Section One plots updated successfully.');
    } catch (error) {
        DebugManager.log('ERROR', 'Failed to update Section One plots:', error);
    }
}
 
