# Guide 4: SVAR Logic and Computations

This guide focuses on the computational core of the template: the JavaScript files that perform the SVAR-related calculations. You will learn where this logic lives, how it's structured, and the workflow for adding your own custom computations.

## The Computational Core Files

The SVAR logic is primarily split into two files, separating high-level economic functions from low-level mathematical utilities.

-   **`public/js/svar_functions.js`**: This file contains the `SVARCoreFunctions` namespace. It's responsible for the high-level SVAR operations that have direct economic meaning, such as generating structural shocks (`generateEpsilon`), calculating reduced-form shocks (`generateU`), or estimating a model.

-   **`public/js/svar_math_util.js`**: This file contains the `SVARMathUtil` namespace. It provides general-purpose mathematical functions that are used by `svar_functions.js`. Examples include matrix multiplication, calculating a covariance matrix, or performing a Cholesky decomposition.

This separation makes the code cleaner and more reusable. If you need a standard matrix operation, you add it to `svar_math_util.js`. If you are implementing a new SVAR estimation technique, the main logic goes in `svar_functions.js`.

## The Data Pipeline Orchestrators in `main.js`

While the core calculations happen in the files above, the process is orchestrated by a few key functions in `public/js/main.js`. These functions form the main data pipeline.

-   **`regenerateSvarData()`**: This is the main pipeline function. It's called whenever a parameter affecting the entire data generating process (DGP) changes (like sample size `T`). It runs the full sequence: generates new structural shocks (`epsilon_t`), calculates the corresponding reduced-form shocks (`u_t`), and then triggers all subsequent estimations and calculations.

-   **`regenerateReducedFormShocksFromExistingEpsilon()`**: A more targeted pipeline. It's called when only the `B0` matrix changes (e.g., switching from recursive to non-recursive). It skips regenerating `epsilon_t` and just recalculates `u_t` and all subsequent estimates. This is much faster.

-   **`regenerateBPhi()`**: The most specific pipeline. It's called when only the estimation rotation angle `phi` changes. It recalculates the `B(phi)` matrix and any estimates that depend on it, without touching the underlying `u_t` or `epsilon_t` data.

## Workflow: Adding a New SVAR Computation

Let's walk through adding a new computation. Imagine we want to calculate the trace (the sum of the diagonal elements) of the `B(phi)` matrix and display it.

### Step 1: Add a Home for the Result in `shared_data.js`

First, we need a place to store our result. Open `public/js/shared_data.js` and add a new property to the `sharedData` object.

```javascript
// public/js/shared_data.js
window.sharedData = {
    // ... existing properties
    B_phi: [[1,0],[0,1]],
    trace_B_phi: 2, // Our new property with a default value
    // ... other properties
};
```

### Step 2: Create the Computation Function

Since calculating the trace is a general matrix operation, it belongs in `svar_math_util.js`. Open that file and add the new function.

```javascript
// public/js/svar_math_util.js
window.SVARMathUtil = {
    // ... existing math functions

    calculateMatrixTrace: function(matrix) {
        let trace = 0;
        for (let i = 0; i < matrix.length; i++) {
            trace += matrix[i][i];
        }
        return trace;
    }
};
```

### Step 3: Integrate the Function into the Pipeline

We want to calculate the trace whenever `B(phi)` is updated. Therefore, the perfect place to call our new function is from the `regenerateBPhi()` pipeline in `main.js`.

Open `public/js/main.js` and modify `regenerateBPhi()`:

```javascript
// public/js/main.js
async function regenerateBPhi() {
    // ... existing logic to calculate B(phi) and store it in sharedData.B_phi
    const B_phi = SVARCoreFunctions.generateBPhi(sharedData.u_1t, sharedData.u_2t, sharedData.phi);
    window.sharedData.B_phi = B_phi;

    // ** Our new logic **
    // 1. Calculate the trace using our new utility function
    const trace = SVARMathUtil.calculateMatrixTrace(B_phi);
    // 2. Store the result in our shared data object
    window.sharedData.trace_B_phi = trace;

    DebugManager.log('MAIN_APP', 'New B(phi) trace calculated:', trace);

    // 3. (Important!) Trigger any UI updates that need to display the new value
    // For example: updateBPhiTraceDisplay();
}
```

### Step 4: Display the Result

With the result now in `sharedData.trace_B_phi`, you can create a simple JavaScript function to find a placeholder in your HTML and update its content with the new value. This display function would be called at the end of `regenerateBPhi()` (as shown in the comment above).

## Using the Debug Manager

When developing new computations, the `DebugManager` is your best friend. As shown in the example, you can add logs to trace the flow of data and inspect the results of your calculations in the browser's developer console.

```javascript
// Example of a useful log
DebugManager.log('SVAR_MATH', 'Input matrix for trace:', B_phi, 'Output:', trace);
```

This practice can save you hours of troubleshooting.

---

This guide has shown you how the computational logic is structured and how to add your own. The next guide, **`05_managing_sections_and_content.md`**, will cover how to add or remove entire sections from the application.
