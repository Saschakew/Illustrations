# SVAR Intuition Visualizer

This project is a single-page website designed to provide interactive visualizations for core concepts in Structural Vector Autoregression (SVAR) analysis, based on a research paper.

## Project Structure

The project is organized to keep content, styling, and logic separate for better maintainability.

- `server.js`: A simple Node.js/Express server to serve the static files.
- `package.json`: Defines project metadata and dependencies.
- `public/`: The root directory for all front-end assets.
  - `index.html`: The main HTML shell for the single-page application.
  - `css/`: Contains stylesheets.
    - `style.css`: The main stylesheet for the application.
  - `js/`: Contains JavaScript files.
    - `main.js`: The main script that loads section content and handles global logic.
    - `svar_setup.js`: Logic for the 'SVAR Setup' section.
    - `estimation_restrictions.js`: Logic for the 'Estimation with Restrictions' section.
    - `estimation_nongaussianity.js`: Logic for the 'Estimation with Non-Gaussianity' section.
    - `ridge_estimation.js`: Logic for the 'Ridge Estimation' section.
  - `sections/`: Contains HTML partials for each section of the page.
    - `svar_setup.html`
    - `estimation_restrictions.html`
    - `estimation_nongaussianity.html`
    - `ridge_estimation.html`
- `README.md`: This file.

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm start
    ```
3.  Open your browser and navigate to `http://localhost:3000`.

## Contribution Guidelines

To maintain a clean and organized codebase, please adhere to the following structure:

- **Content**: All HTML content for a specific section should go into its corresponding file in the `public/sections/` directory.
- **Styling**: General styles go into `public/css/style.css`. If a section requires very specific, complex styles, consider creating a separate CSS file and linking it within that section's HTML partial.
- **Logic**: All JavaScript logic for a specific section must be in its corresponding file in the `public/js/` directory. This script should be included at the end of the section's HTML partial. Global logic that affects the entire page should be in `public/js/main.js`.
- **Dependencies**: Any new front-end libraries should be added to a `lib` folder or managed via a package manager and linked appropriately. Any new Node.js dependencies should be added to `package.json`.
