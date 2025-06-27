# Developer Guide Plan: Customizing the SVAR Visualization Template

## 1. Project Goal

The primary goal of this project is to create a comprehensive, step-by-step developer's guide for the SVAR Visualization Template. This guide will empower developers to confidently and efficiently:

- **Modify** existing sections and functionality.
- **Add** new sections, UI controls, and SVAR-related computations.
- **Delete** components that are not needed for their specific use case.
- **Understand** the core architecture, data flow, and state management principles of the template.

The guide will be structured as a series of markdown files within the `/guides` directory, each targeting a specific aspect of the template's architecture. The process will be documented as a clear, repeatable workflow.

## 2. Proposed Guide Structure (File Breakdown)

Here is the proposed set of documents that will form the complete guide. Each file will build upon the last, providing a logical learning path.

### `01_architecture_overview.md`
- **Purpose**: To provide a high-level understanding of the project's structure and how the key files interact.
- **Contents**:
    - Diagram of the core components (e.g., `index.html`, `main.js`, `shared_data.js`, `ui_factory.js`, section HTML files).
    - Explanation of the application lifecycle (initialization, section loading, event handling).
    - Overview of the core data pipeline: from user input -> `shared_data.js` -> computations -> plot/UI updates.

### `02_state_management_with_shared_data.md`
- **Purpose**: A deep dive into the project's single source of truth, `shared_data.js`.
- **Contents**:
    - How to add a new variable to the `sharedData` object.
    - The role of `sharedData` in synchronizing state across different sections and modules.
    - Best practices for reading from and writing to `sharedData`.
    - Example: Adding a new model parameter and making it globally accessible.

### `03_ui_controls_and_the_factory_pattern.md`
- **Purpose**: To explain how to add, modify, or remove interactive UI controls like sliders and buttons.
- **Contents**:
    - Explanation of the UI Factory pattern centered around `public/js/ui_factory.js`.
    - **Workflow: Adding a New Slider (e.g., a 'beta' parameter slider)**:
        1.  Create a new function `createBetaSlider()` in `ui_factory.js`.
        2.  Add a placeholder `<div data-control-type="beta-slider"></div>` in the target section's HTML file.
        3.  Update the `initializeApp` function in `main.js` to process the new `beta-slider` type.
        4.  Implement `initializeBetaSliders()` in `public/js/shared_controls.js` to handle events, update `sharedData`, and synchronize sliders.

### `04_svar_logic_and_computations.md`
- **Purpose**: To detail where and how SVAR-related calculations are performed.
- **Contents**:
    - The roles of `svar_functions.js` (core SVAR logic) and `svar_math_util.js` (general matrix/math operations).
    - How the main data regeneration functions in `main.js` (e.g., `regenerateSvarData`) orchestrate the computations.
    - **Workflow: Adding a New SVAR Calculation**.

### `05_managing_sections_and_content.md`
- **Purpose**: To explain the modular section system.
- **Contents**:
    - How sections are defined in `public/sections/` and loaded by `main.js`."
    - **Workflow: Adding a New Section**:
        1.  Create a new `section_new.html` file.
        2.  Add the corresponding link to the navigation in `index.html`.
        3.  Update the `loadSections` logic in `main.js` if necessary.
    - How to manage static content (text, images) vs. dynamic content (plots, values).

### `06_dynamic_content_plots_and_latex.md`
- **Purpose**: To focus on updating the UI with results from computations.
- **Contents**:
    - Using `plot_utils.js` to create and update Plotly charts.
    - How MathJax is used to render LaTeX.
    - **Workflow: Displaying a Dynamic LaTeX Matrix**:
        1.  Define a placeholder `<span>` or `<div>` in the HTML.
        2.  Write a JavaScript function that takes data from `sharedData`.
        3.  Formats it into a LaTeX matrix string.
        4.  Updates the placeholder's content and queues a MathJax typeset update.

### `07_end_to_end_example_adding_a_new_feature.md`
- **Purpose**: A capstone tutorial that walks through the entire workflow by implementing a new, complete feature from scratch.
- **Example Feature**: Adding a 'Volatility Scale' parameter (`gamma`) that multiplies the `sigma_t` values.
- **Steps Covered**:
    1.  Add `gamma` to `shared_data.js`.
    2.  Add a `gamma` slider to the UI using the factory pattern.
    3.  Modify the SVAR functions to incorporate `gamma` in the shock generation.
    4.  Update a plot to reflect the change.
    5.  Display the current `gamma` value using dynamic LaTeX.

## 3. Recommended Development Workflow

Following the staged approach from earlier iterations of this template, we recommend the workflow below. Later guides explain each phase in depth, but having the big-picture up-front helps new contributors plan their work.

### Step 1  Establish the Basic Framework (placeholder content)
1. Read **01_architecture_overview.md** to understand the file/folder layout.
2. Open `index.html` in the browser and confirm that the placeholder sections (`Section One`, `Section Two`, …) render correctly.
3. Make sure the navigation menu, sticky behaviour, and loading overlay work as expected.

### Step 2  Practice Adding a New Section
1. Use **05_managing_sections_and_content.md** together with **03_ui_controls_and_the_factory_pattern.md**.
2. Duplicate one of the existing section snippets in `public/sections/`, give it a new identifier, and load it via a new `<div id="section-xyz-placeholder" data-section-src="…">` in `index.html`.
3. Create the corresponding initialization file in `public/js/sections/`.
4. Register the section’s menu link in the nav bar and verify that it loads without errors.

### Step 3  Replace Placeholder Content with Real SVAR Logic
1. For each planned SVAR analysis block, design the UI controls (sliders, buttons) with the factory pattern.
2. Implement the required computations in `svar_functions.js` / `svar_math_util.js`.
3. Feed the results to Plotly or MathJax elements as described in **06_dynamic_content_plots_and_latex.md**.

### Step 4  Iterate and Refine
Continue cycling through Steps 2–3, testing performance and UI/UX, until all target functionality is implemented.

## 4. Running the Template Locally

The project is entirely client-side; you can open `index.html` directly in a browser for quick checks.  
For full functionality (e.g., fetch() calls), serve the root directory with a simple local server:

```bash
python -m http.server
# then visit http://localhost:8000
```

## 5. Next Steps

With this plan in place, the next step is to begin writing the first document: `01_architecture_overview.md`.
