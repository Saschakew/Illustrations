# Guide 2: State Management with shared_data.js

This guide provides a deep dive into the most critical file for state management in the SVAR Visualization Template: `public/js/shared_data.js`. Understanding how to work with this file is essential for adding new parameters or accessing data across different parts of the application.

## The Role of `shared_data.js`

In this template, `shared_data.js` acts as the **single source of truth**. It defines a global object, `window.sharedData`, which holds all the data that needs to be accessed or modified by more than one script. This includes:

-   **User-configurable parameters**: Values from sliders and other controls (e.g., `T`, `phi`, `lambda`).
-   **Data-generating process (DGP) parameters**: The true underlying model parameters (e.g., `isRecursive`, `B0`).
-   **Generated data series**: The results of computations (e.g., `epsilon_1t`, `u_1t`).
-   **Estimation results**: Any estimated parameters or matrices (e.g., `phi_est_rec`, `B_est_nG`).

By centralizing the application's state in one place, we avoid the complexity and bugs that arise from passing data between numerous functions or storing state in the DOM. Any part of the application can read the current state from `sharedData`, and any part can update it (though updates should be done in a structured way).

## How to Use `sharedData`

Working with `sharedData` is straightforward. Since it's attached to the global `window` object, you can access it from any other script in the project that is loaded after `shared_data.js`.

**Reading from `sharedData`**:
To get the current sample size, `T`, you simply access the property:
```javascript
const currentT = window.sharedData.T;
console.log('The current sample size is:', currentT);
```

**Writing to `sharedData`**:
To update a value, you assign a new value to the property. This is typically done inside an event listener in `shared_controls.js`.
```javascript
// Inside a slider's event listener
const newSliderValue = 1500;
window.sharedData.T = newSliderValue;
console.log('sharedData.T has been updated to:', window.sharedData.T);
```

## Workflow: Adding a New Shared Variable

Let's walk through the complete process of adding a new parameter to the application. Imagine we want to add a 'volatility scale' parameter named `gamma` that will be controlled by a new slider.

### Step 1: Add the Variable to `shared_data.js`

The first and most important step is to declare the new variable in the `window.sharedData` object. This establishes its existence and sets a default value.

Open `public/js/shared_data.js` and add the `gamma` property:

```javascript
// public/js/shared_data.js

window.sharedData = {
    T: 500,
    phi: 0,
    lambda: 0.1,
    gamma: 1.0, // Our new volatility scale parameter with a default value
    isRecursive: true,
    // ... other properties
};
```

That's it! The `gamma` parameter is now part of the application's global state. Other scripts can now read `window.sharedData.gamma`.

### Step 2: Create a UI Control to Modify the Variable

To allow the user to change `gamma`, we would create a new slider. (This process is covered in detail in the next guide, `03_ui_controls_and_the_factory_pattern.md`).

### Step 3: Update the Variable from the Control

The event listener for our new slider (which would be defined in `public/js/shared_controls.js`) would be responsible for updating `sharedData.gamma` when the user moves the slider.

```javascript
// In public/js/shared_controls.js, inside a new initializer function

gammaSlider.addEventListener('change', function() {
    const newGammaValue = parseFloat(this.value);
    window.sharedData.gamma = newGammaValue; // Update the state

    // Optional: Log the change for debugging
    DebugManager.log('SHARED_CONTROLS', 'Gamma (sharedData.gamma) updated to:', window.sharedData.gamma);

    // Trigger a recalculation that uses gamma
    regenerateSvarData();
});
```

### Step 4: Use the Variable in Your Logic

Now, the SVAR computation functions can use this new parameter. For example, in `public/js/svar_functions.js`, the `generateEpsilon` function could be modified to read `window.sharedData.gamma` and apply it to the shocks.

```javascript
// In public/js/svar_functions.js

function generateEpsilon(T) {
    const gamma = window.sharedData.gamma; // Read the value from sharedData

    // ... existing logic for generating shocks ...

    // Apply the gamma scaling factor
    const scaled_shocks = shocks.map(shock => shock * gamma);

    // ... rest of the function ...
}
```

## Best Practices

-   **Initialize Everything**: Always provide a sensible default value for any new variable you add to `sharedData`.
-   **Centralize Updates**: While any script *can* modify `sharedData`, it's best practice to have UI control logic (in `shared_controls.js`) be the primary place where user-driven state changes occur.
-   **Read, Don't Write (in computations)**: Computation functions (like those in `svar_functions.js`) should generally only *read* from `sharedData`. They take parameters from it, perform calculations, and then the results are stored back into `sharedData` by the orchestrating functions in `main.js`.

## Loading Order and Script Dependencies

`shared_data.js` must be available before any other script that expects the global `window.sharedData` object.  A typical snippet in `index.html` looks like this (order matters):

```html
<!-- 1. Global state -->
<script src="public/js/shared_data.js" defer></script>
<!-- 2. Factories that may read defaults from sharedData -->
<script src="public/js/ui_factory.js" defer></script>
<!-- 3. Generic event-binding helpers that write to sharedData -->
<script src="public/js/shared_controls.js" defer></script>
<!-- 4. The main orchestration layer -->
<script src="public/js/main.js" defer></script>
```

## Reactive `B0` Mode Handling

The boolean flag `sharedData.isRecursive` determines whether the data-generating process follows a **recursive** (lower-triangular) or **non-recursive** structure.

* `updateB0Mode()` (in `shared_controls.js`) recalculates `sharedData.B0` whenever the flag changes.
* It then invokes `regeneratePhi0()` and `regenerateReducedFormShocksFromExistingEpsilon()` to keep all downstream state consistent.
* UI mode switches call this helper automatically, so _never_ mutate `sharedData.B0` directly—change `isRecursive` instead.

## Debugging with `DebugManager`

`shared_data.js` logs its initial values under the categories `DATA_HANDLING`, `SHARED_DATA`, and `SVAR_DATA_PIPELINE`.  When you add a new property, consider adding a similar log line:

```javascript
DebugManager.log('SHARED_DATA', 'Initial gamma:', window.sharedData.gamma);
```

This lightweight tracing makes it obvious when state is missing or mis-initialised.

---

This guide has covered the role and usage of `shared_data.js`. With this knowledge, you can confidently manage the application's state. The next guide, **`03_ui_controls_and_the_factory_pattern.md`**, will show you how to build the UI controls that modify these shared variables.
