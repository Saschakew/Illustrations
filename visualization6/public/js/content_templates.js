/**
 * content_templates.js
 * 
 * Provides functions to generate standardized HTML structures for common content blocks.
 * This helps ensure consistency and simplifies content creation within sections.
 */

window.ContentTemplates = (() => {
    const createRow = (contentClass = '', innerHTML = '') => {
        const row = document.createElement('div');
        row.className = `row mb-3 ${contentClass}`.trim();
        row.innerHTML = innerHTML;
        return row;
    };

    return {
        /**
         * Creates a row for a sub-topic heading.
         * Example: <div class="row mb-3 sub-topic-heading-row"><div class="col-lg-12"><h3 class="sub-topic-heading">Text</h3></div></div>
         * @param {string} headingText - The text for the h3 heading.
         * @returns {HTMLElement} The generated row element.
         */
        createSubTopicHeadingRow: (headingText) => {
            return createRow('sub-topic-heading-row', `
                <div class="col-lg-12">
                    <h3 class="sub-topic-heading">${headingText}</h3>
                </div>
            `);
        },

        /**
         * Creates a full-width row for content like LaTeX equations, code blocks, or plots.
         * Assumes the content itself is wrapped in an appropriate inner div (e.g., div.latex-equation).
         * Example: <div class="row mb-3 latex-equation-row"><div class="col-lg-12">...content...</div></div>
         * @param {string} innerHTML - The HTML content to place inside the col-lg-12.
         * @param {string} contentTypeClass - A specific class for the row (e.g., 'latex-equation-row', 'code-block-row').
         * @returns {HTMLElement} The generated row element.
         */
        createFullWidthContentRow: (innerHTML, contentTypeClass) => {
            return createRow(contentTypeClass, `
                <div class="col-lg-12">
                    ${innerHTML}
                </div>
            `);
        },

        /**
         * Creates a row for introductory text, typically using col-lg-8 for main text and col-lg-4 for an optional side note.
         * Example: <div class="row mb-3 section-intro-row"><div class="col-lg-8"><p class="section-intro">...</p></div><div class="col-lg-4">...</div></div>
         * @param {string} introHTML - HTML for the main introductory paragraph(s) (e.g., <p class="section-intro">...). Should be placed in col-lg-8.
         * @param {string} [sideNoteHTML=''] - Optional HTML for a side note. Will be placed in col-lg-4.
         * @returns {HTMLElement} The generated row element.
         */
        createIntroRow: (introHTML, sideNoteHTML = '') => {
            let sideNoteCol = '';
            if (sideNoteHTML) {
                sideNoteCol = `<div class="col-lg-4">${sideNoteHTML}</div>`;
            }
            return createRow('section-intro-row', `
                <div class="col-lg-12">
                    ${introHTML}
                </div>
                ${sideNoteCol}
            `);
        },

        /**
         * Creates a generic content row, typically with col-lg-8 for main content and col-lg-4 for a callout/side content.
         * Example: <div class="row mb-3 general-content-row"><div class="col-lg-8">...main...</p></div><div class="col-lg-4"><div class="info-callout">...</div></div></div>
         * @param {string} mainContentHTML - HTML for the main content area (col-lg-8).
         * @param {string} [sideContentHTML=''] - Optional HTML for the side content area (col-lg-4). Often an info-callout.
         * @returns {HTMLElement} The generated row element.
         */
        createGeneralContentRow: (mainContentHTML, sideContentHTML = '') => {
            let sideCol = '';
            if (sideContentHTML) {
                sideCol = `<div class="col-lg-4">${sideContentHTML}</div>`;
            }
            return createRow('general-content-row', `
                <div class="col-lg-8">
                    ${mainContentHTML}
                </div>
                ${sideCol}
            `);
        },

        /**
         * Creates an info callout div. 
         * To be used inside a column, often col-lg-4 or col-lg-12 (if full width callout).
         * @param {string} calloutHTML - The inner HTML for the callout.
         * @param {boolean} [isSmall=false] - If true, adds 'info-callout--sm' class.
         * @param {boolean} [fillHeight=false] - If true, adds 'h-100' class for Bootstrap fill height.
         * @returns {string} HTML string for the callout div.
         */
        buildInfoCallout: (calloutHTML, isSmall = false, fillHeight = false) => {
            let classes = 'info-callout';
            if (isSmall) classes += ' info-callout--sm'; 
            return `<div class="${classes}">${calloutHTML}</div>`;
        },

        /**
         * Builds the inner HTML for a LaTeX equation block.
         * @param {string} latexString - The LaTeX string (e.g., "E = mc^2"). Must be properly escaped for JS strings.
         * @returns {string} HTML string for the LaTeX equation div.
         */
        buildLatexEquationBlock: (latexString) => {
            return `<div class="latex-equation">$$ ${latexString} $$</div>`;
        },

        /**
         * Builds the inner HTML for a code block.
         * @param {string} codeString - The code content. Remember to HTML escape special characters like <, > manually if needed before passing.
         * @param {string} [language=''] - Optional language for syntax highlighting (e.g., 'javascript', 'python').
         * @returns {string} HTML string for the code block div.
         */
        buildCodeBlock: (codeString, language = '') => {
            const langClass = language ? `language-${language}` : '';
            // Basic escaping for < and > to prevent them from being interpreted as HTML tags by innerHTML.
            // For more robust escaping, a dedicated library might be needed if complex code is common.
            const escapedCode = codeString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<div class="code-block"><pre><code class="${langClass}">${escapedCode}</code></pre></div>`;
        },

        /**
         * Wraps the provided plot description HTML (typically the two-paragraph left/right explanation)
         * in a standardized full-width row so it can be appended directly to the section content.
         * Example:
         *   const descHTML = `
         *     <p><strong>Left Plot:</strong> …</p>
         *     <p><strong>Right Plot:</strong> …</p>`;
         *   contentArea.appendChild(ContentTemplates.buildLeftRightPlotExplanation(descHTML));
         *
         * @param {string} innerHTML – HTML for the plot description.
         * @returns {HTMLElement} The generated row element.
         */
        buildLeftRightPlotExplanation: (innerHTML) => {
            
            return createRow('left-right-plot-row', `<div class=\"col-lg-12\">${innerHTML}</div>`);
        },

        /**
         * Creates a comparison card for displaying estimator vs true value matrices side by side
         * @param {string} estId - ID for the estimator matrix container
         * @param {string} trueId - ID for the true matrix container
         * @param {string} estLabel - Label for the estimator matrix
         * @param {string} trueLabel - Label for the true matrix
         * @returns {string} HTML string for the comparison card
         */
        createEstimatorComparisonRow: (estId, trueId, estLabel, trueLabel) => {
            return `
            <div class="comparison-card">
              <div class="comparison-col">
                <h6 class="comp-heading">${estLabel}</h6>
                <div id="${estId}" class="comp-matrix"></div>
              </div>
              <div class="comparison-col">
                <h6 class="comp-heading">${trueLabel}</h6>
                <div id="${trueId}" class="comp-matrix"></div>
              </div>
            </div>`;
        },

        /**
         * Creates a discussion block to accompany an estimator-vs-true comparison.
         * @param {string} innerHTML - HTML content (e.g., bullet list and explanatory paragraph).
         * @returns {HTMLElement} The generated row element.
         */
        createComparisonDiscussionRow: (innerHTML, heading = 'Observations') => {
            return createRow('comparison-discussion-row', `
                <div class="col-lg-12">
                    <div class="comparison-discussion">
                        <h6 class="comp-discussion-heading">${heading}</h6>
                        ${innerHTML}
                    </div>
                </div>
            `);
        }
    };
})();

/**
 * Example Usage (to be placed in a script tag within a section HTML file, or called from main.js):
 *
 * document.addEventListener('DOMContentLoaded', () => {
 *     const targetContainer = document.getElementById('section-content-area'); // Assuming your section has such a container
 *
 *     // Add a sub-topic heading
 *     const heading = ContentTemplates.createSubTopicHeadingRow('My Dynamic Heading');
 *     targetContainer.appendChild(heading);
 *
 *     // Add an intro paragraph
 *     const introPara = ContentTemplates.createIntroRow(
 *         '<p class="section-intro">This is the main intro text, dynamically generated.</p>',
 *         ContentTemplates.buildInfoCallout('<p>This is a side note for the intro.</p>')
 *     );
 *     targetContainer.appendChild(introPara);
 *
 *     // Add a LaTeX equation (full width)
 *     const latexContent = ContentTemplates.buildLatexEquationBlock('L(\phi) = \sum (e_{1t}^2 e_{2t})^2');
 *     const latexRow = ContentTemplates.createFullWidthContentRow(latexContent, 'latex-equation-row');
 *     targetContainer.appendChild(latexRow);
 *
 *     // Add a code block (full width)
 *     const codeContent = ContentTemplates.buildCodeBlock('const example = true;\nif (example) {\n  console.log("Hello World!");\n}', 'javascript');
 *     const codeRow = ContentTemplates.createFullWidthContentRow(codeContent, 'code-block-row');
 *     targetContainer.appendChild(codeRow);
 *
 *     // Add general content with a callout
 *     const generalRow = ContentTemplates.createGeneralContentRow(
 *         '<p>This is some general content text.</p>',
 *         ContentTemplates.buildInfoCallout('<p>And this is an important callout next to it.</p>', false, true)
 *     );
 *     targetContainer.appendChild(generalRow);
 * });
 */
