# Content Layout and Structure Guide

This document outlines the standard layout and structure for content sections in this project. We use the Bootstrap 5.3 grid system to ensure consistency, responsiveness, and maintainability.

## Core Layout: Bootstrap Grid

All content should be placed within a Bootstrap grid. The basic structure is a `container-fluid` that holds one or more `row`s. Each `row` is divided into `col`umns.

### Main Structure

The standard layout is a two-column design:

- **Main Content Column (`col-md-8`)**: This is for the primary text, paragraphs, and main narrative.
- **Side Note/Callout Column (`col-md-4`)**: This is for side notes, callouts, supplementary information, or asides that relate to the main content.

### Example

```html
<div class="container-fluid">
    <!-- A content row -->
    <div class="row">
        <!-- Main content area -->
        <div class="col-md-8">
            <p>This is the main content. It takes up 8 of the 12 available columns on medium-sized screens and up.</p>
        </div>
        <!-- Sidebar/callout area -->
        <div class="col-md-4">
            <div class="callout">
                <p>This is a callout or side note. It takes up the remaining 4 columns.</p>
            </div>
        </div>
    </div>
</div>
```

## Full-Width Content

For elements that should span the entire width of the content area, such as plots, code blocks, or standalone equations, use a single `col-md-12` within a `row`.

### Plot Example

```html
<div class="row">
    <div class="col-md-12">
        <div id="my-plot-div"></div>
        <div class="plot-caption">
            <p>This is a caption for the plot.</p>
        </div>
    </div>
</div>
```

## New Content Containers

### Code Blocks

For displaying blocks of code, use the `.code-block` container. This provides styling for `<pre>` and `<code>` tags.

```html
<div class="row">
    <div class="col-md-12">
        <div class="code-block">
            <pre><code>
// Your code goes here
const x = 10;
            </code></pre>
        </div>
    </div>
</div>
```

### Standalone LaTeX Equations

For displaying single, centered LaTeX equations, use the `.latex-equation` container.

```html
<div class="row">
    <div class="col-md-12">
        <div class="latex-equation">
            $$ E = mc^2 $$
        </div>
    </div>
</div>
```
