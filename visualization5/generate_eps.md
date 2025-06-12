# Generating Structural Shocks (ε_t) from Sample Size (T) - Revised

This document outlines the precise step-by-step process of how the structural shocks, denoted as \\(\\epsilon_t = [\\epsilon_{1t}, \\epsilon_{2t}]'\\), are generated in the SVAR model, with a focus on the role of the sample size `T`. It includes the actual JavaScript functions involved.

The primary function orchestrating this is `window.SVARFunctions.generateEpsilon(T)`.

## Overall Process within `SVARFunctions.generateEpsilon(T)`:

1.  **Generate Raw Standard Normal Shocks (η<sub>raw,t</sub>)**: Two independent series of raw shocks are generated using `window.SVARGeneral.generateSingleNormalSeries(T)`.
2.  **Generate Time-Varying Volatility (σ<sub>t</sub>)**: A series of volatility values is created using `this.generateSigmaT(T)` (which is `SVARFunctions.generateSigmaT`).
3.  **Scale Raw Shocks (η'<sub>scaled,t</sub>)**: The raw shocks are scaled by the volatility series (`val * sigma_t_values[i]`).
4.  **Normalize Scaled Shocks (ε<sub>t</sub>)**: The scaled shocks are normalized to have a mean of 0 and a standard deviation of 1, producing the final structural shocks \\(\\epsilon_t\\), using `window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev()`.

---

## Detailed Steps and Code:

### Master Orchestration Function:

This function, found in `public/js/shared_svar_functions.js`, coordinates the generation of \\(\\epsilon_t\\).

```javascript
// From: public/js/shared_svar_functions.js
window.SVARFunctions = {
    // ... other functions ...

    generateEpsilon: function(T) {
        // Step 1: Generate raw standard normal shocks (η_t)
        const eta_raw_1t = window.SVARGeneral.generateSingleNormalSeries(T);
        const eta_raw_2t = window.SVARGeneral.generateSingleNormalSeries(T);

        // Step 2: Generate the sigma values for heteroskedasticity
        const sigma_t_values = this.generateSigmaT(T); // Calls SVARFunctions.generateSigmaT

        // Step 3: Create un-normalized structural shocks (ε_t_unnormalized = η_t * σ_t)
        const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
        const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);

        // Step 4: Normalize the shocks to have mean 0 and std dev 1, these are the final structural shocks (ε_t)
        const { normalizedSeries1, normalizedSeries2 } = window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(unnormalized_epsilon_1t, unnormalized_epsilon_2t);
        
        return { epsilon_1t: normalizedSeries1, epsilon_2t: normalizedSeries2 };
    },

    // ... other functions ...
};
```

---

### Step 1: Raw Shock Generation (η<sub>raw,t</sub>)

This step generates two series of `T` random numbers, each drawn from a standard normal distribution \\(N(0,1)\\).

**Function:** `window.SVARGeneral.generateSingleNormalSeries(size)`
*(Located in `public/js/shared_general_functions.js`)*

```javascript
// From: public/js/shared_general_functions.js
window.SVARGeneral = {
    // ... other functions ...

    normalRandom: function() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },

    generateSingleNormalSeries: function(size) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(this.normalRandom()); // Use this.normalRandom
        }
        return series;
    },

    // ... other functions ...
};
```
*   **`normalRandom()`**: Implements the Box-Muller transform to generate a single pseudo-random number from a standard normal distribution.
*   **`generateSingleNormalSeries(size)`**: Calls `normalRandom()` `size` times to create a series.

---

### Step 2: Generation of Time-Varying Volatility (σ<sub>t</sub>)

This step creates a series of volatility values (`sigma_t_values`) of length `T`. The volatility is 1.0 for the first half of the sample and 2.0 for the second half.

**Function:** `window.SVARFunctions.generateSigmaT(size)`
*(Located in `public/js/shared_svar_functions.js`)*

```javascript
// From: public/js/shared_svar_functions.js
window.SVARFunctions = {
    // ... other functions ...

    generateSigmaT: function(size) {
        const sigma_vals = new Array(size);
        const midpoint = Math.floor(size / 2);
        for (let i = 0; i < size; i++) {
            sigma_vals[i] = (i < midpoint) ? 1 : 2;
        }
        return sigma_vals;
    },

    // ... other functions ...
};
```

---

### Step 3: Scaling Raw Shocks (η'<sub>scaled,t</sub>)

The raw shocks (\\(\\eta_{\\text{raw},1t}\\), \\(\\eta_{\\text{raw},2t}\\)) are multiplied by the corresponding `sigma_t` value for each time point. This is done directly within `SVARFunctions.generateEpsilon` using the `.map()` method:

```javascript
// Snippet from SVARFunctions.generateEpsilon:
// const eta_raw_1t = ...
// const eta_raw_2t = ...
// const sigma_t_values = ...

const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);
```
The results, `unnormalized_epsilon_1t` and `unnormalized_epsilon_2t`, are the unnormalized scaled shocks (\\(\\eta'_{\\text{scaled},t}\\)).

---

### Step 4: Normalization to Final Structural Shocks (ε<sub>t</sub>)

The unnormalized scaled shocks (\\(\\eta'_{\\text{scaled},t}\\)) are standardized to have a mean of approximately 0 and a sample standard deviation of approximately 1. This yields the final structural shocks (\\(\\epsilon_{1t}\\), \\(\\epsilon_{2t}\\)).

**Function:** `window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(series1, series2)`
*(Located in `public/js/shared_general_functions.js`)*

```javascript
// From: public/js/shared_general_functions.js
window.SVARGeneral = {
    // ... other functions ...

    normalizeTwoSeriesForMeanAndStdDev: function(series1, series2) {
        if (!series1 || !series2 || series1.length === 0 || series2.length === 0 || series1.length !== series2.length) {
            console.error("Invalid input series for normalization.");
            // Return original or empty arrays to prevent further errors
            return { normalizedSeries1: series1 || [], normalizedSeries2: series2 || [] };
        }

        const length = series1.length;
        let xMean = 0, yMean = 0;
        let count = 0; // Count of valid (non-NaN) data points

        // Calculate sum for mean, considering only valid numbers
        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xMean += series1[i];
                yMean += series2[i];
                count++;
            }
        }

        if (count === 0) { // All values are NaN or empty arrays
            console.warn("Cannot normalize series with all NaN values or zero valid data points.");
            return { normalizedSeries1: series1, normalizedSeries2: series2 };
        }

        xMean /= count;
        yMean /= count;

        let xStd = 0, yStd = 0;
        // Calculate sum of squared differences for standard deviation
        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xStd += Math.pow(series1[i] - xMean, 2);
                yStd += Math.pow(series2[i] - yMean, 2);
            }
        }
        
        // Calculate sample standard deviation (denominator is count - 1)
        // Handle cases where count is 1 to avoid division by zero (std dev becomes 0)
        xStd = Math.sqrt(xStd / (count > 1 ? count - 1 : 1));
        yStd = Math.sqrt(yStd / (count > 1 ? count - 1 : 1));

        const normalizedSeries1 = new Array(length);
        const normalizedSeries2 = new Array(length);

        // Normalize each point
        for (let i = 0; i < length; i++) {
            if (isNaN(series1[i]) || isNaN(series2[i])) {
                normalizedSeries1[i] = NaN; // Preserve NaNs
                normalizedSeries2[i] = NaN;
            } else {
                // Handle cases where standard deviation is 0 (e.g., all values in series are the same)
                // In this case, the normalized value is 0 if it's equal to the mean, otherwise it remains the difference.
                // However, typically if std is 0, all values are the mean, so (value - mean) is 0.
                normalizedSeries1[i] = (xStd === 0) ? (series1[i] - xMean) : (series1[i] - xMean) / xStd;
                normalizedSeries2[i] = (yStd === 0) ? (series2[i] - yMean) : (series2[i] - yMean) / yStd;
            }
        }
        return { normalizedSeries1, normalizedSeries2 };
    },

    // ... other functions ...
};
```
This function carefully handles `NaN` values and calculates the sample standard deviation. If a standard deviation is zero (e.g., all input values in a series are identical), it correctly produces normalized values of 0 (as `value - mean` would be 0).

---

This revised guide provides a comprehensive and code-accurate description of how \\(\\epsilon_t\\) is generated.
