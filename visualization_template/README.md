# SVAR Visualization Project Template

This project is a template for creating interactive web applications to demonstrate and visualize concepts behind Structural Vector Autoregression (SVAR) modeling. It provides a solid foundation for building educational tools that allow users to explore how different parameters and estimation techniques affect the identification of structural shocks.

## Key Features

- **Interactive Data Generation:** Generate sample data (structural and reduced-form shocks) on the fly.
- **Dynamic Parameter Control:** Adjust parameters like sample size (T), rotation angle (φ), and regularization strength (λ) using interactive sliders.
- **Multiple Estimation Methods:**
    - Identification through recursive assumptions.
    - Identification using non-Gaussian properties of the data.
    - Identification using Ridge regularization for heteroskedasticity.
- **Real-time Visualization:** Scatter plots and loss function plots update instantly as parameters are changed.
- **Dynamic LaTeX Rendering:** Mathematical formulas and matrices are rendered dynamically to reflect the current state of the model.
- **Modular UI:** The user interface is built with a factory pattern for easily adding new controls and sections.
- **In-depth Explanations:** Each section is accompanied by detailed explanations of the underlying theory and mathematics.

## Project Structure

The project is organized as a client-side web application with no server-side dependencies.

```
.
├── guides/                 # Detailed markdown guides on specific features.
├── public/
│   ├── assets/             # Static assets like images.
│   ├── css/
│   │   ├── style.css       # Main stylesheet.
│   │   └── mobile.css      # Mobile-specific styles.
│   ├── js/
│   │   ├── sections/       # Section-specific JavaScript logic.
│   │   ├── debug_manager.js     # Manages console logging for different modules.
│   │   ├── dynamic_latex_manager.js # Centralizes updates for LaTeX elements.
│   │   ├── latex_utils.js       # Utilities for formatting and rendering LaTeX.
│   │   ├── main.js              # Main application entry point, orchestrates section loading and initialization.
│   │   ├── plot_utils.js        # Utilities for creating and updating Plotly charts.
│   │   ├── shared_controls.js   # Initializes and manages shared UI controls (sliders, buttons).
│   │   ├── shared_data.js       # Global state management for shared data across modules.
│   │   ├── svar_functions.js    # Core SVAR estimation and calculation functions.
│   │   ├── svar_general_functions.js # General functions for SVAR data generation (e.g., shocks).
│   │   ├── svar_math_util.js    # Core mathematical operations (matrix math, stats).
│   │   └── ui_factory.js        # Factory for creating standardized UI components.
│   └── sections/             # HTML snippets for each major section of the application.
├── .gitignore
├── index.html              # Main HTML file (the application shell).
├── LICENSE
└── README.md
```

## Core JavaScript Modules

- **`main.js`**: The central orchestrator. It handles loading the HTML for each section and then calls the initialization functions for all the interactive components.
- **`shared_data.js`**: A global object (`window.sharedData`) that holds the application's state, including the generated data (`epsilon_t`, `u_t`), user-set parameters (`T`, `phi`, `lambda`), and estimation results.
- **`shared_controls.js`**: Contains the logic to initialize all the shared UI controls (like the sliders for T, phi, and lambda) and attach the necessary event listeners. It ensures controls are synchronized and that changes trigger the correct data regeneration and plot updates.
- **`ui_factory.js`**: Implements a factory pattern to programmatically create UI controls. This ensures consistency and simplifies adding new sliders or buttons.
- **`svar_functions.js` & `svar_math_util.js`**: The mathematical core of the application. These files contain the functions for generating shocks, performing Cholesky decomposition, calculating loss functions, and estimating the structural parameters.
- **`plot_utils.js`**: A utility module for creating, updating, and managing all the Plotly.js charts used in the visualizer.
- **`latex_utils.js` & `dynamic_latex_manager.js`**: Manages the dynamic display of mathematical notation, ensuring that matrices and equations shown on the page accurately reflect the current data and parameters.

## Setup and Running

No build process or dependencies are required.

1.  Clone this repository to your local machine.
2.  Open the `index.html` file in a modern web browser (like Chrome, Firefox, or Edge).

Due to browser security policies regarding local file access (CORS), you may need to run a simple local web server to ensure all features work correctly. A common way to do this is with Python:

```bash
# From the project root directory:
python -m http.server
```

Then navigate to `http://localhost:8000` in your browser.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

