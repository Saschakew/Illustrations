// public/js/sections/section_zero.js
window.sectionZero = window.sectionZero || {};

async function initializeSectionZero() {
    const SECTION_ID = 'section-zero';
    DebugManager.log('INIT', `Initializing JavaScript for section: ${SECTION_ID}`);

    const contentArea = document.getElementById('section-zero-dynamic-content');
    if (!contentArea) {
        DebugManager.log('ERROR', `${SECTION_ID} dynamic content area not found.`);
        return;
    }
    contentArea.innerHTML = ''; // Clear existing content

    // 1. Heading
    const headingHTML = `<h2>Welcome to the SVAR&nbsp;Visualizer</h2>`;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(headingHTML, 'section-heading-row'));

    // 2. Intro Paragraph
    const introHTML = `
        <p class="section-intro">This interactive demo invites you to explore how different identification strategies reveal the hidden structure in a two-variable Structural Vector Autoregression (SVAR).</p>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(introHTML, 'intro-paragraph-row'));

    // 3. Main Content Paragraph (leading to list)
    const mainContentHTML1 = `
        <p>With only a handful of sliders and switches you can:</p>
        <ul>
            <li>Generate fresh data under alternative data-generating processes.</li>
            <li>Recover parameters by imposing classic recursive (short-run) restrictions.</li>
            <li>Relax Gaussianity to learn from higher-moment information.</li>
            <li>Balance fit and parsimony via ridge-penalised estimation.</li>
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(mainContentHTML1, 'list-content-row'));

    // 4. Concluding Paragraph
    const mainContentHTML2 = `
        <p>Tweak a control and watch plots, matrices, and LaTeX formulas update in real time.</p>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(mainContentHTML2, 'conclusion-paragraph-row'));

    // Typeset MathJax for the whole section (for future-proofing, though not strictly needed now)
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        try {
            await window.MathJax.typesetPromise([contentArea]);
            DebugManager.log('MATHJAX', `MathJax typesetting complete for ${SECTION_ID}.`);
        } catch (error) {
            DebugManager.log('ERROR', `MathJax typesetting failed for ${SECTION_ID}:`, error);
        }
    }

    DebugManager.log('INIT', `Initialization for section: ${SECTION_ID} complete.`);
}

// Expose the initialize function to the global scope
window.sectionZero.initialize = initializeSectionZero;
