# Project Development Guide: SVAR Visualizer

## 1. Overall Goal

The primary objective of this project is to develop an interactive SVAR (Structural Vector Autoregression) Visualizer. To ensure long-term maintainability, scalability, and ease of development, we are starting with a well-organized project structure and clear guidelines for adding new features and content.

This master guide outlines how to use the provided documentation and templates to build the visualizer incrementally, starting with a placeholder structure and then populating it with specific SVAR functionalities.

## 2. Core Guidance Documents and Templates

Four key files provide the foundation for this project:

1.  **`guide_basic.md`**: 
    *   **Purpose**: This document explains the fundamental organization of the project. It covers:
        *   The recommended directory structure for HTML, CSS, JavaScript, and other assets.
        *   The standard HTML page layout, including the main `index.html` and how individual content sections are structured as HTML snippets.
        *   Core styling conventions (referencing `style_guide.md`) and the setup of the main sticky navigation menu.
        *   The role of `main.js` as the entry point for loading sections and initializing the application.
    *   **When to use**: Refer to this guide when you need to understand the overall project layout, how the main page is assembled, or basic styling and navigation principles.

2.  **`guide_section.md`**: 
    *   **Purpose**: This guide provides detailed, step-by-step instructions on how to create and integrate new interactive sections into the application. It covers:
        *   Defining unique identifiers for the new section.
        *   Creating the HTML snippet for the section, including control panels and plot areas.
        *   Developing the section-specific JavaScript module, including initialization, event handling (subscribing to global data, managing local controls), data processing, and plot rendering/updating (e.g., with Plotly).
        *   Integrating the new section into `main.js` and `index.html`.
        *   Best practices for data flow, event source tracking, and UI responsiveness.
    *   **When to use**: Use this guide whenever you are adding a new distinct part to the visualizer, such as a new type of analysis, a new set of controls, or a new visualization.

3.  **`lorem_ipsum_template.html`**: 
    *   **Purpose**: This is a fully functional, self-contained HTML file that serves as a practical, runnable example and starting point. It demonstrates:
        *   The basic HTML page structure outlined in `guide_basic.md`.
        *   A working sticky main navigation menu.
        *   Multiple placeholder ("lorem ipsum") content sections, each with its own placeholder control panel and plot area.
        *   Basic CSS styling consistent with the project's intended look and feel.
        *   Minimal JavaScript for navigation (active link highlighting, smooth scroll) and simple control interactions (slider value display, basic sticky menu for section controls).
    *   **When to use**: Use this template as the initial foundation for your `index.html`. You can copy its structure and then adapt and expand upon it.

4.  **`guide_windsurf.md`**:
    *   **Purpose**: This document explains how to set up and use Windsurf's Rules and Workflows features to streamline development, maintain code quality, and automate common tasks specifically for this SVAR Visualizer project.
    *   **When to use**: Refer to this guide to implement automated code formatting, linting, and to create custom project-specific command sequences for development, builds, or documentation.

## 3. Recommended Development Workflow

To build the SVAR Visualizer systematically, follow these steps:

### Step 1: Establish the Basic Project Framework (using Lorem Ipsum)

1.  **Understand the Basics**: Read `guide_basic.md` to grasp the overall project structure and HTML layout.
2.  **Create `index.html`**: Use `lorem_ipsum_template.html` as your starting point. You can either rename it to `index.html` or copy its content into a new `index.html`.
    *   At this stage, your `index.html` will have several pre-defined "lorem ipsum" sections (e.g., "Section One", "Section Two").
    *   Verify that the main navigation works, sections are displayed, and the basic styling is applied.
    *   Ensure the placeholder control panels and plot areas are visible within each section.
    *   You might want to simplify `lorem_ipsum_template.html` to initially include only one or two sections to keep it minimal.

### Step 2: Practice Adding a New Section (still Lorem Ipsum)

1.  **Follow the Guide**: Refer to `guide_section.md`.
2.  **Add a New Placeholder Section**: Add a *third* (or another) "lorem ipsum" section to your `index.html` (or the structure derived from `lorem_ipsum_template.html`).
    *   Create a new HTML snippet for this section (e.g., `public/sections/lorem_section_three.html`).
    *   Create a basic JavaScript file for it (e.g., `public/js/sections/lorem_section_three.js`), perhaps with just a console log in its init function to confirm it's loaded.
    *   Update `main.js` to load this new HTML snippet and call its JavaScript initialization function.
    *   Add a link to this new section in the main navigation menu in `index.html`.
3.  **Test**: Ensure the new section loads correctly, appears in the navigation, and doesn't break existing functionality. This step validates your understanding of how to add modular content.

### Step 3: Populate Sections with Actual SVAR Content

1.  **Identify SVAR Sections**: Define the actual interactive sections your SVAR Visualizer will need (e.g., "Data Setup & Generation", "Impulse Response Functions", "Forecast Error Variance Decomposition", etc.).
2.  **Replace/Develop Section by Section**: For each identified SVAR section:
    *   If it maps to one of your "lorem ipsum" sections, adapt that section's HTML and JavaScript.
    *   If it's a new section, use `guide_section.md` to create it from scratch.
    *   **HTML**: Design the specific controls (sliders, buttons, input fields) and layout for the section's explanation and plot(s).
    *   **JavaScript**: Implement the logic for:
        *   Handling user inputs from controls.
        *   Performing necessary SVAR calculations (potentially using functions from `svar_functions.js` or other shared modules).
        *   Preparing data for Plotly.
        *   Rendering and updating plots using `plot_utils.js` and Plotly.
        *   Managing data flow with `shared_data.js` and responding to global data updates.
    *   **Styling**: Ensure the section adheres to `style_guide.md`, `style_guide_plots.md`, and `style_guide_menu.md`.

## 4. Leveraging Windsurf for Efficiency

To further enhance your development process, `guide_windsurf.md` details how to set up and use Windsurf Rules and Workflows. Here are some specific applications beneficial for the SVAR Visualizer project:

*   **Automated Code Quality (Rules)**:
    *   **Auto-formatting**: Automatically format your `.js`, `.html`, and `.css` files on save using a tool like Prettier. This ensures consistent code style across the project with no manual effort.
    *   **JavaScript Linting**: Integrate a linter like ESLint to automatically check your JavaScript code for errors and style issues on save, helping to catch bugs early.
    *   **Markdown Linting**: Keep your guide files (`.md`) clean and consistently formatted.

*   **Streamlined Development Tasks (Workflows)**:
    *   **Live Development Server**: Set up a workflow command to start a live-reloading server (e.g., using `live-server`). This automatically refreshes your browser when you save HTML, CSS, or JS files, speeding up the visual feedback loop.
    *   **Documentation Generation**: If you use JSDoc comments in your JavaScript, create a workflow to generate API documentation automatically.
    *   **(Ambitious) Section Scaffolding**: A workflow could be designed to create the basic boilerplate HTML and JS files for a new section, prompting for a section name. This would pre-fill the files with the basic structure outlined in `guide_section.md`, saving repetitive setup time.

Refer to `guide_windsurf.md` for detailed setup instructions for these rules and workflows.

## 5. Iterate and Refine

*   Continuously test each section and the interactions between sections.
*   Refine the UI/UX based on usability.
*   Ensure all shared modules (`shared_data.js`, `shared_controls.js`, etc.) are used appropriately to avoid code duplication.

By following this workflow, you can build a complex application in a structured manner, ensuring that each component is well-defined and integrated before moving to the next. The initial "lorem ipsum" phase helps solidify the framework and your understanding of the modular structure before diving into the complexities of SVAR-specific logic.
