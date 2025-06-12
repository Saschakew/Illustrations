# Guide: Using Windsurf Rules and Workflows for the SVAR Visualizer

This guide explains how to leverage Windsurf's Rules and Workflows features to streamline development, maintain code quality, and automate common tasks for the SVAR Visualizer project.

## 1. Introduction to Windsurf Rules and Workflows

*   **Windsurf Rules**: These allow you to define automated actions that Cascade can perform, often triggered by events like saving a file. They are excellent for tasks like code formatting, linting, and asset optimization. The preferred way to define rules is via a `.windsurf/rules` file in your project root (replacing the older `.windsurfrules` file).
*   **Windsurf Workflows**: These enable you to define custom, multi-step commands or sequences tailored to your project. They are useful for orchestrating development tasks, build processes, documentation generation, and more. Workflows are defined in YAML files within a `.windsurf/workflows/` directory.

By using rules and workflows, you can:
*   Ensure consistent code style and quality across the project.
*   Automate repetitive tasks, saving time and reducing errors.
*   Create a project-specific toolkit accessible directly within your development environment (e.g., VS Code with the Windsurf extension).

## 2. Setting Up Windsurf Rules

1.  **Create the Directory and File**:
    *   In your project's root directory (`visualization5/`), create a new directory named `.windsurf`.
    *   Inside `.windsurf/`, create a file named `rules` (no extension).

    ```bash
    visualization5/
    └── .windsurf/
        └── rules
    ```

2.  **Define Rules in YAML Format**:
    Open the `.windsurf/rules` file and add your rules using YAML syntax. Each rule typically has:
    *   `name`: A descriptive name for the rule.
    *   `pattern`: A glob pattern to specify which files the rule applies to.
    *   `command`: The shell command to execute.
    *   `run_on_save`: (Optional, boolean) If `true`, the command runs automatically when a matching file is saved.

    **Example: Auto-format JavaScript and HTML on save using Prettier**
    (Assumes Prettier is installed: `npm install --save-dev prettier`)

    ```yaml
    # .windsurf/rules
    rules:
      - name: "Format JavaScript with Prettier"
        pattern: "public/js/**/*.js"
        command: "npx prettier --write"
        run_on_save: true

      - name: "Format HTML with Prettier"
        pattern: "**/*.html"
        command: "npx prettier --write --parser html"
        run_on_save: true

      - name: "Format CSS with Prettier"
        pattern: "public/css/**/*.css"
        command: "npx prettier --write"
        run_on_save: true
    ```

## 3. Setting Up Windsurf Workflows

1.  **Create the Directory and Workflow Files**:
    *   Inside the `.windsurf/` directory, create another directory named `workflows`.
    *   Inside `.windsurf/workflows/`, create YAML files for each workflow (e.g., `dev.yml`, `build.yml`).

    ```bash
    visualization5/
    └── .windsurf/
        ├── rules
        └── workflows/
            └── dev.yml
            └── docs.yml
    ```

2.  **Define Workflows in YAML Format**:
    Each workflow file defines a set of commands. Key properties:
    *   `name`: The display name of the workflow.
    *   `description`: A brief explanation of what the workflow does.
    *   `commands`: A list of individual commands within the workflow.
        *   `name`: Display name for the command.
        *   `command`: The shell command to execute.
        *   `description`: (Optional) More details about the command.
        *   `cwd`: (Optional) The current working directory for the command (defaults to project root).

    **Example: A simple development workflow (`.windsurf/workflows/dev.yml`)**

    ```yaml
    # .windsurf/workflows/dev.yml
    name: "SVAR Dev Workflow"
    description: "Tasks for local development of the SVAR Visualizer."

    commands:
      - name: "Start Local HTTP Server"
        command: "python -m http.server 8000"
        description: "Serves project files on http://localhost:8000. Run from project root."
        cwd: "."

      - name: "Open Project in Browser"
        command: "start http://localhost:8000/index.html"
        description: "Opens index.html in the default browser (Windows). Use 'open' for macOS/Linux."
    ```

## 4. Efficiently Using Rules & Workflows for SVAR Visualizer

Here are some ideas tailored to your project:

### 4.1. Suggested Rules (`.windsurf/rules`)

*   **Code Quality & Consistency**:
    *   **Formatting (as above)**: JavaScript, HTML, CSS using Prettier.
    *   **JavaScript Linting**: Use ESLint to catch errors and enforce coding standards.
        (Requires setup: `npm init -y`, `npm install --save-dev eslint`, `npx eslint --init`)
        ```yaml
        - name: "Lint JavaScript with ESLint"
          pattern: "public/js/**/*.js"
          command: "npx eslint --fix"
          run_on_save: true
        ```
    *   **Markdown Linting (Optional)**: For your guide files, using `markdownlint-cli`.
        (Requires: `npm install --save-dev markdownlint-cli`)
        ```yaml
        - name: "Lint Markdown Files"
          pattern: "**/*.md"
          command: "npx markdownlint --fix"
          run_on_save: true
        ```

### 4.2. Suggested Workflows (`.windsurf/workflows/`)

*   **Development Workflow (`dev.yml` - expanded from above)**:
    *   `Start Live Server`: Instead of `python -m http.server`, consider `npx live-server --port=8000 --open=index.html`. This provides live reloading on file changes.
        (Requires: `npm install --save-dev live-server`)
    *   `Check JS Dependencies`: A command to list outdated npm packages if you start using them (`npm outdated`).

*   **Documentation Workflow (`docs.yml`)**:
    *   `Generate JS Documentation`: If you adopt JSDoc comments in your JavaScript.
        (Requires: `npm install --save-dev jsdoc`, and a `jsdoc.json` config file)
        ```yaml
        # .windsurf/workflows/docs.yml
        name: "Documentation Tasks"
        description: "Generate and manage project documentation."
        commands:
          - name: "Generate JSDoc for JavaScript Files"
            command: "npx jsdoc -c jsdoc.json"
            description: "Creates API documentation from JS comments into './out/' (or as configured)."
        ```
    *   `Validate Guide Links`: A script to check for broken internal links in your `.md` guides (more complex, might require a custom script or specialized tool).

*   **New Section Scaffolding Workflow (`scaffold.yml`) - Ambitious but useful**:
    This could automate parts of adding a new section as per `guide_section.md`.
    *   `Create New Section Files`: A workflow command that prompts for a `section_name` and then:
        *   Creates `public/sections/<section_name>.html` with basic boilerplate.
        *   Creates `public/js/sections/<section_name>.js` with initial `window.SVARSections.init<SectionNameCamelCase>()` structure.
        *   *Note: Modifying `index.html` and `main.js` automatically is complex and error-prone for a simple workflow; this part is likely better done manually following `guide_section.md`. The workflow can still create the initial file shells.*

    ```yaml
    # .windsurf/workflows/scaffold.yml
    name: "Scaffolding Utilities"
    description: "Tools for generating boilerplate for new sections."
    commands:
      - name: "Scaffold New Section"
        # This would ideally be a script that takes input
        # For a simpler version, it could create generically named files you rename
        command: |
          echo "Enter section name (e.g., my_new_analysis):" && read SECTION_NAME && \
          mkdir -p public/sections public/js/sections && \
          echo "<!-- HTML for ${SECTION_NAME} -->\n<section id=\"${SECTION_NAME}-section\" class=\"content-section card\">\n  <h2>${SECTION_NAME}</h2>\n  <!-- Add controls, explanation, plot containers -->\n</section>" > "public/sections/${SECTION_NAME}.html" && \
          echo "// JS for ${SECTION_NAME}\nwindow.SVARSections = window.SVARSections || {};\nwindow.SVARSections.init${SECTION_NAME^} = function() {\n  console.log('Initializing ${SECTION_NAME}...');\n  // Add section logic here\n};" > "public/js/sections/${SECTION_NAME}.js" && \
          echo "Scaffolded files for ${SECTION_NAME}. Remember to update index.html and main.js!"
        description: "Creates basic HTML and JS files for a new section. (Linux/macOS bash example)"
    ```
    *(The scaffold command above is a bash example; a cross-platform version might use Node.js script)*

## 5. Using with VS Code

*   Ensure you have the **Windsurf extension** installed in VS Code.
*   Rules (especially `run_on_save: true`) will apply automatically when you save files.
*   Workflows can be accessed and run from the Windsurf panel in the VS Code sidebar or via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`, then type "Windsurf").

## 6. Best Practices

*   **Focused Rules**: Keep each rule specific to a single task for clarity.
*   **Document Workflows**: Use clear `name` and `description` fields so their purpose is obvious.
*   **Version Control**: Commit your entire `.windsurf` directory so the whole team benefits from these configurations.
*   **Cross-Platform Commands**: If sharing workflows, try to use commands that work across different operating systems, or provide alternatives (e.g., using `npx` for Node.js tools, or small Node.js scripts instead of shell-specific commands).

This guide should help you effectively integrate Windsurf rules and workflows into your SVAR Visualizer development process, leading to a more efficient and standardized workflow.
