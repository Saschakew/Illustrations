# Content Layout and Structure Guide (Using Dynamic Templates)

This document outlines the standard layout and structure for content sections in this project. We leverage Bootstrap 5.3 and a custom JavaScript templating system (`public/js/content_templates.js`) to dynamically generate consistent, responsive, and maintainable content blocks.

## Core Principle: JavaScript-Driven HTML Structure

Instead of writing repetitive HTML structures directly in section files (e.g., `section_one.html`), we use functions from `window.ContentTemplates` to build these structures. These functions return DOM elements that can then be appended to a target container within your section.

The underlying layout still relies on the Bootstrap grid:
- A `container-fluid` (typically the root of a section's display area).
- `div.row` elements, often with `mb-3` for spacing.
- `div.col-lg-*` (or `col-md-*`) columns to structure content. Common patterns are `col-lg-8` for main text and `col-lg-4` for side notes/callouts, or `col-lg-12` for full-width elements.

## Using `ContentTemplates` API

The `ContentTemplates` object provides several functions to generate common HTML row structures. These functions typically return an `HTMLElement` (a `div.row`) which you can then append to your desired parent element in the DOM.

Here are the key template functions:

### 1. `ContentTemplates.createIntroRow(introHTML, sideNoteHTML = '')`
   - **Purpose**: Creates a row for introductory text.
   - **Structure**:
     ```html
     <div class="row mb-3 section-intro-row">
         <div class="col-lg-8">
             <!-- introHTML goes here -->
         </div>
         <div class="col-lg-4">
             <!-- sideNoteHTML goes here (if provided) -->
         </div>
     </div>
     ```
   - **Parameters**:
     - `introHTML` (string): HTML content for the main introduction (e.g., `<p class="section-intro">Your intro...</p>`).
     - `sideNoteHTML` (string, optional): HTML content for a side note.
   - **Example Usage**:
     ```javascript
     const introContent = '<p class="section-intro">Welcome to this section.</p>';
     const sideNote = ContentTemplates.buildInfoCallout('<p>A small tip!</p>');
     const introRow = ContentTemplates.createIntroRow(introContent, sideNote);
     document.getElementById('section-two-content-area').appendChild(introRow);
     ```

### 2. `ContentTemplates.createSubTopicHeadingRow(headingText)`
   - **Purpose**: Creates a full-width row for a sub-topic heading.
   - **Structure**:
     ```html
     <div class="row mb-3 sub-topic-heading-row">
         <div class="col-lg-12">
             <h3 class="sub-topic-heading">headingText</h3>
         </div>
     </div>
     ```
   - **Parameters**:
     - `headingText` (string): The text for the `<h3>` heading.
   - **Example Usage**:
     ```javascript
     const headingRow = ContentTemplates.createSubTopicHeadingRow("Understanding the Model");
     document.getElementById('section-two-content-area').appendChild(headingRow);
     ```

### 3. `ContentTemplates.createFullWidthContentRow(innerHTML, contentTypeClass)`
   - **Purpose**: Creates a full-width row (`col-lg-12`) for content like LaTeX equations, code blocks, or plots.
   - **Structure**:
     ```html
     <div class="row mb-3 specific-content-type-row"> <!-- contentTypeClass is added here -->
         <div class="col-lg-12">
             <!-- innerHTML goes here -->
         </div>
     </div>
     ```
   - **Parameters**:
     - `innerHTML` (string): The HTML content to place inside the `col-lg-12`. This is often the output of another builder function like `buildLatexEquationBlock` or `buildCodeBlock`.
     - `contentTypeClass` (string): A specific class for the row to identify its content type (e.g., 'latex-equation-row', 'code-block-row', 'plot-container-row').
   - **Example Usage (LaTeX Equation)**:
     ```javascript
     const latexMarkup = ContentTemplates.buildLatexEquationBlock("E = mc^2");
     const latexRow = ContentTemplates.createFullWidthContentRow(latexMarkup, 'latex-equation-row');
     document.getElementById('section-two-content-area').appendChild(latexRow);
     ```
   - **Example Usage (Plot Container)**:
     ```javascript
     const plotDiv = '<div id="myUniquePlotId" class="plot-area"></div><p class="plot-caption">Caption for plot.</p>';
     const plotRow = ContentTemplates.createFullWidthContentRow(plotDiv, 'plot-container-row');
     document.getElementById('section-two-content-area').appendChild(plotRow);
     // Plotly or another library would then target #myUniquePlotId
     ```

### 4. `ContentTemplates.createGeneralContentRow(mainContentHTML, sideContentHTML = '')`
   - **Purpose**: Creates a generic content row, typically with `col-lg-8` for main content and `col-lg-4` for side content (often an info callout).
   - **Structure**: Similar to `createIntroRow` but with a generic class like `general-content-row`.
     ```html
     <div class="row mb-3 general-content-row">
         <div class="col-lg-8">
             <!-- mainContentHTML goes here -->
         </div>
         <div class="col-lg-4">
             <!-- sideContentHTML goes here (if provided) -->
         </div>
     </div>
     ```
   - **Parameters**:
     - `mainContentHTML` (string): HTML for the main content area.
     - `sideContentHTML` (string, optional): HTML for the side content area.
   - **Example Usage**:
     ```javascript
     const mainText = '<p>This is the primary explanation of a concept.</p>';
     const supportingInfo = ContentTemplates.buildInfoCallout('<p>Additional details here.</p>', false, true); // fillHeight = true
     const generalRow = ContentTemplates.createGeneralContentRow(mainText, supportingInfo);
     document.getElementById('section-two-content-area').appendChild(generalRow);
     ```

### Helper Builder Functions

These functions return HTML strings, intended to be used as `innerHTML` for the row-creating functions above.

#### `ContentTemplates.buildInfoCallout(calloutHTML, isSmall = false, fillHeight = false)`
   - **Purpose**: Builds the HTML string for an `info-callout` div.
   - **Parameters**:
     - `calloutHTML` (string): The inner HTML for the callout.
     - `isSmall` (boolean, optional): If true, adds `info-callout--sm` class.
     - `fillHeight` (boolean, optional): If true, adds `h-100` class (Bootstrap fill height).
   - **Returns**: HTML string (e.g., `<div class="info-callout h-100">...</div>`).

#### `ContentTemplates.buildLatexEquationBlock(latexString)`
   - **Purpose**: Builds the HTML string for a `latex-equation` div containing a MathJax formatted equation.
   - **Parameters**:
     - `latexString` (string): The LaTeX code (e.g., "E = mc^2").
   - **Returns**: HTML string (e.g., `<div class="latex-equation">$$ E = mc^2 $$</div>`).

#### `ContentTemplates.buildCodeBlock(codeString, language = '')`
   - **Purpose**: Builds the HTML string for a `code-block` div.
   - **Parameters**:
     - `codeString` (string): The code content. Remember to HTML escape special characters like `<`, `>` if not already done.
     - `language` (string, optional): Language for syntax highlighting (e.g., 'javascript').
   - **Returns**: HTML string (e.g., `<div class="code-block"><pre><code class="language-javascript">...</code></pre></div>`).

## Workflow for Adding Content to Sections

1.  **Identify Target Container**: In your section's HTML snippet (e.g., `public/sections/section_two.html`), ensure there's a main container `div` where dynamic content will be appended (e.g., `<div id="section-two-dynamic-content"></div>`).
2.  **Use Templates in Section JS**: In the corresponding JavaScript file for that section (e.g., `public/js/sections/section_two.js`), within the initialization function (e.g., `initializeSectionTwo`):
    a.  Get a reference to the target container.
    b.  Call the `ContentTemplates` functions to create the desired HTML row elements.
    c.  Append these elements to the target container.
3.  **MathJax Typesetting**: If you add LaTeX content dynamically, remember to call `MathJax.typesetPromise()` on the container or specific elements to ensure they are rendered correctly.

## Benefits
- **Consistency**: Ensures all sections use the same HTML structures for similar content types.
- **Maintainability**: Changes to a content structure can be made in one place (the template function) and will reflect everywhere it's used.
- **Readability**: Section-specific JavaScript becomes more about *what* content to show, rather than *how* to structure its HTML.

This approach promotes a cleaner separation of concerns and makes managing complex page layouts more straightforward.
