# Guide 5: Managing Sections and Content

This guide covers how to manage the high-level content structure of the application. The template is designed to be modular, making it easy to add, remove, or reorder entire sections of content with minimal effort.

## How Sections are Loaded

As explained in the Architecture Overview, the template uses a dynamic loading system. The main `index.html` file is mostly a skeleton. It contains placeholder `<div>` elements, and the actual content for each section is stored in separate HTML files located in the `public/sections/` directory.

When the application starts, the `loadSections()` function in `public/js/main.js` automatically finds all placeholders with a `data-section-src` attribute, fetches the specified HTML file, and injects its content into the placeholder.

This means you don't need to work with a single, massive `index.html` file. Instead, you can focus on one section at a time.

## Workflow: Adding a New Section

Let's say we want to add a new "Section Five" to the application.

### Step 1: Create the Section's HTML File

First, create a new HTML file in the `public/sections/` directory. Let's call it `section_five.html`.

This file should contain all the HTML for your new section, including text, layout `<div>`s, and placeholders for any interactive controls you plan to add.

```html
<!-- public/sections/section_five.html -->

<section id="section-five" class="main-section">
    <div class="container">
        <div class="section-header">
            <h2>Section Five: A New Frontier</h2>
        </div>
        <div class="section-content">
            <p class="section-intro">This is the introductory paragraph for our brand new section.</p>
            
            <!-- Placeholder for a new slider -->
            <div class="controls-container card">
                <h4>Section Five Controls</h4>
                <div data-control-type="t-slider" data-control-id="slider_T_s5"></div>
            </div>
        </div>
    </div>
</section>
```

### Step 2: Add a Placeholder to `index.html`

Next, open `index.html` and add a new placeholder `<div>` where you want the new section to appear. The `id` can be anything, but the `data-section-src` attribute must point to the new file you just created.

```html
<!-- in index.html -->

<!-- ... existing section four placeholder ... -->
<div id="section-four-placeholder" data-section-src="public/sections/section_four.html"></div>

<!-- Our new section placeholder -->
<div id="section-five-placeholder" data-section-src="public/sections/section_five.html"></div>

<!-- ... footer ... -->
```

That's it! The `loadSections()` function in `main.js` will automatically detect and load your new section the next time you refresh the page. All the control placeholders inside it will also be initialized automatically, provided they use a `data-control-type` that `main.js` already knows about.

## Workflow: Removing a Section

Removing a section is even easier. Simply delete its placeholder `<div>` from `index.html`.

For example, to remove Section Five:

1.  Open `index.html`.
2.  Find and delete this line:
    `<div id="section-five-placeholder" data-section-src="public/sections/section_five.html"></div>`

That's all. The section will no longer be loaded. You can also delete the corresponding `section_five.html` file from the `public/sections/` directory to keep your project clean.

## Adding Section-Specific JavaScript

If a section requires unique JavaScript (e.g., for a custom Plotly chart that isn't a simple scatter plot), you should encapsulate that logic in its own file.

### Verified Workflow

This workflow is confirmed against the current structure of `main.js`.

1.  **Create the JS File**: Create `public/js/section_five.js`.

2.  **Define an `initialize` Function**: Inside the new file, define an `async` initializer. This function will contain all setup logic for the section.

    ```javascript
    // public/js/section_five.js
    async function initializeSectionFive() {
        // The check for the section's existence is handled by main.js
        DebugManager.log('SECTION_FIVE', 'Initializing custom logic for Section Five...');
        // Your custom logic here (e.g., Plotly.newPlot(...))
    }
    ```

3.  **Load the Script in `index.html`**: Add a `<script>` tag for your new file. **Crucially, it must be loaded *before* `main.js`** so the `initializeSectionFive` function is defined when `main.js` tries to call it.

    ```html
    <!-- in index.html, inside the <body>, before the main.js script tag -->
    <script src="public/js/section_one.js" defer></script>
    <script src="public/js/section_two.js" defer></script>
    <script src="public/js/section_three.js" defer></script>
    <script src="public/js/section_four.js" defer></script>
    <script src="public/js/section_five.js" defer></script> <!-- Your new script -->

    <script src="public/js/main.js" defer></script>
    ```

4.  **Call the Initializer from `main.js`**: Open `public/js/main.js` and find the section initialization block (around line 498). Add a call to your new function, wrapped in a safety check.

    ```javascript
    // in public/js/main.js, inside initializeApp()

    DebugManager.log('MAIN_APP', 'Initializing section-specific JavaScript...');
    if (typeof initializeSectionOne === 'function' && document.getElementById('section-one')) {
        await initializeSectionOne();
    }
    // ... other sections ...
    if (typeof initializeSectionFour === 'function' && document.getElementById('section-four')) {
        await initializeSectionFour();
    }
    // Add your new section's initializer
    if (typeof initializeSectionFive === 'function' && document.getElementById('section-five')) {
        await initializeSectionFive();
    }
    ```

The pattern used in `main.js`—checking for both the function's existence (`typeof initializeSectionFive === 'function'`) and the section's presence in the DOM (`document.getElementById('section-five')`)—makes the system robust. It ensures that the app won't break if you remove the section's placeholder from `index.html` or forget to load the script.

---

Now you know how to manage the high-level structure of the application. The next guide, **`06_dynamic_content_plots_and_latex.md`**, will show you how to make the content within these sections update dynamically in response to user actions.
