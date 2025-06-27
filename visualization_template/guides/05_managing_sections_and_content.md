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

Sometimes, a new section might have unique JavaScript requirements that don't belong in the shared control or logic files. For example, it might have a complex, one-of-a-kind plot that needs its own setup code.

Here is the recommended way to add section-specific JavaScript:

1.  **Create a new JS file**: In the `public/js/` directory, create a new file named `section_five.js`.

2.  **Create an Initializer Function**: Inside `section_five.js`, create an `async` function that will contain all the setup logic for this section. It's good practice to wrap it in a check to ensure the section's HTML has actually been loaded.

    ```javascript
    // public/js/section_five.js
    async function initializeSectionFive() {
        const sectionElement = document.getElementById('section-five');
        if (!sectionElement) {
            // The section isn't on the page, so do nothing.
            return;
        }

        console.log('Initializing custom logic for Section Five...');
        // Add your custom plot generation, event listeners, etc. here
    }
    ```

3.  **Load the Script**: In `index.html`, add a `<script>` tag to load your new file. Make sure you load it *before* `main.js`.

    ```html
    <!-- in index.html, before the closing </body> tag -->
    <script src="public/js/section_five.js" defer></script>
    <script src="public/js/main.js" defer></script>
    ```

4.  **Call the Initializer**: Finally, in `public/js/main.js`, call your new initializer function from within `initializeApp()`.

    ```javascript
    // in public/js/main.js
    async function initializeApp() {
        // ... existing initialization logic ...

        // Call section-specific initializers
        await initializeSectionOne();
        await initializeSectionTwo();
        // ... etc.
        await initializeSectionFive(); // Call our new initializer
    }
    ```

This pattern keeps your section-specific code neatly encapsulated while still allowing it to be integrated into the application's main loading sequence.

---

Now you know how to manage the high-level structure of the application. The next guide, **`06_dynamic_content_plots_and_latex.md`**, will show you how to make the content within these sections update dynamically in response to user actions.
