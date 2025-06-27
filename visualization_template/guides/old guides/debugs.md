# Debugging System

This document outlines the debugging system implemented in this project, designed to provide categorized and controllable log outputs.

## Overview

The debugging system is managed by `public/js/debug_manager.js`. It allows developers to:
- Define specific categories for debug messages (e.g., `SVAR_SETUP`, `UI_FACTORY`).
- Enable or disable these categories globally at runtime.
- Log messages that will only appear in the browser console if their respective category is enabled.

This helps in focusing on logs from specific parts of the application during development and troubleshooting, reducing console clutter.

## Core Component: `DebugManager`

The `DebugManager` object is globally available on the `window` object after `debug_manager.js` is loaded.

### Predefined Categories

The system is initialized with a set of predefined categories. As of the current version, these include:
- `SVAR_SETUP`: For logs related to `svar_setup.js` and its functionalities.
- `UI_FACTORY`: For logs from `ui_factory.js`.
- `SHARED_CONTROLS`: For logs from `shared_controls.js`.
- `MAIN_APP`: For general application flow logs, typically from `main.js`.
- `DATA_HANDLING`: For logs related to data management, e.g., in `shared_data.js`.
- `EVENT_HANDLING`: For logs related to event listener attachments and triggers.
- `PLOT_RENDERING`: For logs related to plotting activities.

The default state (enabled/disabled) for these categories is set in `debug_manager.js`.

## How to Use

### 1. Logging Messages

To log a message under a specific category, use the `DebugManager.log()` method:

```javascript
// Example in svar_setup.js
DebugManager.log('SVAR_SETUP', 'Generating new sample with size:', sampleSize);

// Example in ui_factory.js
DebugManager.log('UI_FACTORY', 'Creating T-slider with ID:', controlId);
```

If the `SVAR_SETUP` category is enabled, the first message will appear in the console, prefixed with `[SVAR_SETUP]`. Otherwise, it will be suppressed.

### 2. Controlling Categories

You can control debug categories directly from the browser's developer console.

- **Check if a category is enabled:**
  ```javascript
  DebugManager.isCategoryEnabled('SVAR_SETUP'); // Returns true or false
  ```

- **Enable a category:**
  ```javascript
  DebugManager.setCategory('SVAR_SETUP', true);
  ```

- **Disable a category:**
  ```javascript
  DebugManager.setCategory('SVAR_SETUP', false);
  ```

- **Set multiple categories at once:**
  ```javascript
  DebugManager.setCategory({
      SVAR_SETUP: true,
      UI_FACTORY: false,
      MAIN_APP: true
  });
  ```

- **View current status of all categories:**
  ```javascript
  DebugManager.getCategories();
  ```

- **Enable all categories:**
  ```javascript
  DebugManager.enableAll();
  ```

- **Disable all categories:**
  ```javascript
  DebugManager.disableAll();
  ```

## Adding New Categories

To add a new debug category:
1. Open `public/js/debug_manager.js`.
2. Add your new category name as a key to the `_debugCategories` object, setting its initial state (e.g., `NEW_FEATURE: true`).
   ```javascript
   const _debugCategories = {
       // ... existing categories
       NEW_FEATURE: true, // Your new category
   };
   ```
3. You can then use `DebugManager.log('NEW_FEATURE', 'My log message')` in your code.

## Future Enhancements

- A dedicated UI panel within the application to toggle debug categories, rather than relying solely on console commands.
- Persisting category states (e.g., in `localStorage`) across sessions.
