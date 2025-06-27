# Guide 1: Architecture Overview

Welcome to the developer's guide for the SVAR Visualization Template. This first document provides a high-level overview of the project's architecture. Understanding this structure is the key to customizing, extending, or modifying the template effectively.

## Core Philosophy: Decoupling

The template is built on a decoupled architecture. This means that the different parts of the application—UI controls, application state (data), and the underlying logic—are kept separate. This separation makes the codebase easier to understand, maintain, and extend.

The three key pillars of this architecture are:

1.  **State Management**: A centralized object holds all shared data.
2.  **UI Factory**: A systematic way to create interactive controls.
3.  **Event-Driven Logic**: User actions trigger events that drive the application flow.

## Key Files and Their Roles

Here are the most important files and directories and what they do:

-   **`index.html`**: The main entry point and skeleton of the application. It loads all necessary CSS and JavaScript files and contains the placeholder `<div>` elements where the different content sections will be loaded.

-   **`public/sections/` (Directory)**: Contains the modular HTML files for each section of the visualization (e.g., `section_one.html`). These files contain the static text, layout structure, and placeholders for the interactive controls.

-   **`public/js/main.js`**: The primary orchestrator of the application. It is responsible for:
    -   Loading the HTML from `public/sections/` into the main page.
    -   Initializing the entire application after the page is loaded.
    -   Coordinating the data generation and computation pipeline.

-   **`public/js/shared_data.js`**: The single source of truth. It defines the global `window.sharedData` object, which holds all parameters (`T`, `phi`), data series (`u_1t`), and estimated results that need to be accessed by different parts of the application.

-   **`public/js/ui_factory.js`**: A factory for creating UI elements. It contains functions like `createTSlider()` or `createModeSwitch()` that generate the required HTML for a control. This ensures consistency and simplifies the process of adding new controls.

-   **`public/js/shared_controls.js`**: The logic hub for UI controls. It contains the initializer functions (e.g., `initializeSliders()`) that attach event listeners to the controls created by the factory. This is where the interactive behavior is defined.

-   **`public/js/svar_functions.js` & `svar_math_util.js`**: The computational core. These files contain the functions that perform the actual SVAR-related calculations, from generating shocks to estimating models.

## Extended Project Directory Structure and Supporting Utilities

Below is a condensed snapshot of the actual repository (verified against the current codebase). Paths in **bold** are the most relevant entry points discussed earlier.

```text
.
├── index.html
├── guides/
├── public/
│   ├── css/
│   │   ├── style.css
│   │   ├── paragraph_util.css
│   │   ├── mobile.css
│   │   └── resources.css
│   ├── js/
│   │   ├── **main.js**               # Orchestrator
│   │   ├── **sticky_menu.js**        # Keeps control panels visible
│   │   ├── **navigation.js**         # Smooth scroll + active-link logic
│   │   ├── **plot_utils.js**         # Plotly helpers / default layouts
│   │   ├── **dynamic_latex_manager.js**
│   │   ├── **latex_utils.js**        # Format & render TeX strings
│   │   ├── **ui_factory.js**         # Generates sliders, switches, buttons
│   │   ├── **shared_data.js**        # Global state
│   │   ├── **shared_controls.js**    # Attaches listeners to factory outputs
│   │   ├── **svar_functions.js**     # Core SVAR logic
│   │   ├── **svar_math_util.js**     # Matrix helpers
│   │   ├── debug_manager.js          # Category-based logging
│   │   └── sections/
│   │       ├── section_one.js
│   │       ├── section_two.js
│   │       ├── section_three.js
│   │       ├── section_four.js
│   │       └── section_resources.js
│   └── sections/                     # HTML snippets (section_one.html …)
└── assets/
```

Key supporting utilities not covered in the earlier bullet list:

- **plot_utils.js** – Provides default Plotly layout/config and helpers like `getSquareSize()` used by section scripts for consistent sizing.
- **dynamic_latex_manager.js** & **latex_utils.js** – Coordinate MathJax re-typesetting whenever data changes.
- **sticky_menu.js** – Re-positions each section’s control panel (`controls-container_*`) so it stays visible while scrolling.
- **navigation.js** – Handles smooth scrolling and active-link highlighting in the main navigation bar.
- **debug_manager.js** – Lightweight logging wrapper that can be toggled per category (e.g., `SVAR_DATA_PIPELINE`).

---

## The Application Lifecycle: From Load to Interaction

Understanding the sequence of events when the application loads is crucial. Here is the step-by-step flow:

1.  **Initial Load**: The browser loads `index.html`.

2.  **Section Loading**: `main.js` executes its `loadSections()` function. It finds all placeholders like `<div id="section-one-placeholder" data-section-src="public/sections/section_one.html"></div>`, fetches the HTML content from the `data-section-src` path, and injects it into the placeholder.

3.  **Application Initialization (`initializeApp`)**: Once all sections are loaded, `main.js` calls `initializeApp()`. This function orchestrates the setup:
    -   **UI Creation**: It scans the newly loaded HTML for control placeholders (e.g., `<div data-control-type="t-slider">`). For each one, it calls the corresponding function in `ui_factory.js` to get the control's HTML and replaces the placeholder with it.
    -   **Event Listener Binding**: It then calls the initializer functions from `shared_controls.js` (e.g., `initializeSliders()`, `initializeModeSwitches()`). These functions find the newly created controls and attach the appropriate event listeners (`change`, `click`, etc.).
    -   **Initial Data Generation**: It triggers the main data pipeline function, `regenerateSvarData()`, to generate the initial dataset based on the default parameters in `shared_data.js`.

### Data Flow on User Interaction

Here’s what happens when a user interacts with a control, for example, by moving the sample size (T) slider:

1.  **User Action**: The user drags the 'T' slider to a new value.
2.  **Event Fires**: The `change` event listener attached in `shared_controls.js` fires.
3.  **State Update**: The event handler function updates the central state: `window.sharedData.T = newSliderValue;`.
4.  **Trigger Recalculation**: The handler then calls the `regenerateSvarData()` function from `main.js`.
5.  **Computation**: `regenerateSvarData()` uses the new `T` value from `sharedData` to call the necessary functions in `svar_functions.js` to generate new structural and reduced-form shocks.
6.  **Store Results**: The newly generated data is stored back into the `sharedData` object (e.g., `sharedData.epsilon_1t = ...`).
7.  **UI Update**: Other parts of the application, like plots and LaTeX displays, have their own update functions that are called to re-render using the new data from `sharedData`.

This workflow is illustrated below:

```mermaid
graph TD
    subgraph User Interaction
        A[User moves T-Slider] --> B{Event Listener in shared_controls.js};
    end

    subgraph State & Logic
        B --> C[Update window.sharedData.T];
        C --> D{Call regenerateSvarData() in main.js};
        D --> E[Run computations in svar_functions.js];
        E --> F[Store new data in sharedData];
    end

    subgraph UI Update
        F --> G[Plots & LaTeX update from new sharedData];
    end

    A ~~~ G
```

---

With this foundational knowledge, you are now ready to dive deeper into specific aspects of the template. The next guide, **`02_state_management_with_shared_data.md`**, will focus exclusively on how to work with the central `sharedData` object.
