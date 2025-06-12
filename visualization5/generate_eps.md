# Generating Structural Shocks (ε_t) from Sample Size (T) - Detailed Guide

This document outlines the precise step-by-step process of how the structural shocks, denoted as \(\epsilon_t = [\epsilon_{1t}, \epsilon_{2t}]'\), are generated in the SVAR model, with a focus on the sample size `T`. It includes the actual JavaScript functions involved and clarifies the generation of potentially non-Gaussian shocks.

The primary function orchestrating this is `window.SVARFunctions.generateEpsilon(T)`.

## Overview of Structural Shock Generation

The generation of structural shocks \(\epsilon_t\) involves several key steps:
1.  **Raw Shock Generation (η<sub>raw,t</sub>)**: Generating initial series of random numbers.
    *   For \(\eta_{raw,1t}\):   from a standard normal distribution.
    *   For \(\eta_{raw,2t}\):  from a  mixture of distributions normal distributions to induce features like skewness.
2.  **Time-Varying Volatility (σ<sub>t</sub>)**: Applying a volatility profile that can change over the sample.
3.  **Scaling Raw Shocks (η'<sub>scaled,t</sub>)**: Multiplying the raw shocks by the volatility.
4.  **Normalization (ε<sub>t</sub>)**: Standardizing the scaled shocks to have a mean of 0 and a standard deviation of 1.

---

## Detailed Steps and Code

### Master Orchestration Function: `window.SVARFunctions.generateEpsilon(T)`

This function, located in `public/js/shared_svar_functions.js`, currently coordinates the generation of \(\epsilon_t\) as follows:

```javascript
// From: public/js/shared_svar_functions.js
// CURRENT IMPLEMENTATION
window.SVARFunctions = {
    // ... other functions ...

    generateEpsilon: function(T) {
        // Step 1a: Generate raw standard normal shock for η_raw,1t
        const eta_raw_1t = window.SVARGeneral.generateSingleNormalSeries(T);
        // Step 1b: Generate raw standard normal shock for η_raw,2t (CURRENTLY)
        const eta_raw_2t = window.SVARGeneral.generateSingleNormalSeries(T);

        // Step 2: Generate the sigma values for heteroskedasticity
        const sigma_t_values = this.generateSigmaT(T);

        // Step 3: Create un-normalized structural shocks (ε_unnormalized,t = η_raw,t * σ_t)
        const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
        const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);

        // Step 4: Normalize the shocks to have mean 0 and std dev 1
        const { normalizedSeries1, normalizedSeries2 } = window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(unnormalized_epsilon_1t, unnormalized_epsilon_2t);
        
        return { epsilon_1t: normalizedSeries1, epsilon_2t: normalizedSeries2 };
    },

    // ... other functions ...
};
```

**Important Note on Current Implementation:** As shown above, the current shared `generateEpsilon` function generates *both* raw shocks (\(\eta_{raw,1t}\) and \(\eta_{raw,2t}\)) using `window.SVARGeneral.generateSingleNormalSeries(T)`, meaning both are drawn from a standard normal distribution.

---

### Step 1: Raw Shock Generation (η<sub>raw,t</sub>)

#### Step 1a: Generating η<sub>raw,1t</sub> (Standard Normal)

The first raw shock series, \(\eta_{raw,1t}\), is generated from a standard normal distribution \(N(0,1)\).

**Function:** `window.SVARGeneral.generateSingleNormalSeries(size)`
*(Located in `public/js/shared_general_functions.js`)*

```javascript
// From: public/js/shared_general_functions.js
window.SVARGeneral = {
    // ...
    normalRandom: function() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },

    generateSingleNormalSeries: function(size) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(this.normalRandom());
        }
        return series;
    },
    // ...
};
```
*   `normalRandom()`: Implements the Box-Muller transform.
*   `generateSingleNormalSeries(size)`: Creates a series of `size` standard normal values.

#### Step 1b: Generating η<sub>raw,2t</sub> (Intended: Mixture of Normals for Skewness)

As per the description in `public/sections/svar_setup.html`, the second raw shock, \(\eta_{raw,2t}\), is *intended* to be generated from a mixture of two normal distributions to introduce non-Gaussian features, specifically skewness.

The function for this is `window.SVARGeneral.generateMixedNormalData(length, s)`.

**Function:** `window.SVARGeneral.generateMixedNormalData(length, s)`
*(Located in `public/js/shared_general_functions.js`)*

```javascript
// From: public/js/shared_general_functions.js
window.SVARGeneral = {
    // ... (includes normalRandom and generateSingleNormalSeries from above) ...

    generateMixedNormalData: function(length, s) {
        return Array.from({length}, () => {
            if (Math.random() < 0.9) { // 90% probability
                return this.normalRandom() - 0.1 * s;
            } else { // 10% probability
                return this.normalRandom() + s - 0.1 * s;
            }
        });
    },
    // ...
};
```
**Explanation of `generateMixedNormalData`:**
*   It takes `length` (sample size T) and a parameter `s` which controls the separation and variance of the mixture components.
*   With 90% probability, it draws from a normal distribution centered effectively at `(-0.1 * s)` with variance 1.
*   With 10% probability, it draws from a normal distribution centered effectively at `(0.9 * s)` with variance 1.
*   This creates a skewed distribution. A common value for `s` might be 2 or 3 to create noticeable skewness.

**Required Modification to `SVARFunctions.generateEpsilon` for Intended Behavior:**

To implement the skewed second shock as described, `SVARFunctions.generateEpsilon` would need to be modified:

```javascript
// PROPOSED MODIFICATION to SVARFunctions.generateEpsilon
// (in public/js/shared_svar_functions.js)

// generateEpsilon: function(T, s_param_for_mixture = 3) { // s_param could be configurable
//     const eta_raw_1t = window.SVARGeneral.generateSingleNormalSeries(T);
//     // Use generateMixedNormalData for the second shock
//     const eta_raw_2t = window.SVARGeneral.generateMixedNormalData(T, s_param_for_mixture); 
//
//     // ... rest of the function (sigma_t, scaling, normalization) remains the same ...
//     const sigma_t_values = this.generateSigmaT(T);
//     const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
//     const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);
//     const { normalizedSeries1, normalizedSeries2 } = window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(unnormalized_epsilon_1t, unnormalized_epsilon_2t);
//     return { epsilon_1t: normalizedSeries1, epsilon_2t: normalizedSeries2 };
// },
```
**Note:** The `s_param_for_mixture` would need to be defined, possibly passed as an argument or set as a default. The code snippet above is illustrative.

---

### Step 2: Generation of Time-Varying Volatility (σ<sub>t</sub>)

This step is identical regardless of how \(\eta_{raw,1t}\) and \(\eta_{raw,2t}\) are generated. It creates a series of volatility values (`sigma_t_values`) of length `T`. The volatility is 1.0 for the first half of the sample and 2.0 for the second half.

**Function:** `window.SVARFunctions.generateSigmaT(size)`
*(Located in `public/js/shared_svar_functions.js`)*

```javascript
// From: public/js/shared_svar_functions.js
window.SVARFunctions = {
    // ...
    generateSigmaT: function(size) {
        const sigma_vals = new Array(size);
        const midpoint = Math.floor(size / 2);
        for (let i = 0; i < size; i++) {
            sigma_vals[i] = (i < midpoint) ? 1 : 2;
        }
        return sigma_vals;
    },
    // ...
};
```

---

### Step 3: Scaling Raw Shocks (η'<sub>scaled,t</sub>)

The raw shocks (\(\eta_{raw,1t}\), \(\eta_{raw,2t}\)) – whether standard normal or mixture – are multiplied by the corresponding `sigma_t` value. This occurs within `SVARFunctions.generateEpsilon`:

```javascript
// Snippet from SVARFunctions.generateEpsilon:
// const eta_raw_1t = ... (generated via normal or mixture)
// const eta_raw_2t = ... (generated via normal or mixture)
// const sigma_t_values = ...

const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);
```
The results, `unnormalized_epsilon_1t` and `unnormalized_epsilon_2t`, are the unnormalized scaled shocks (\(\eta'_{\text{scaled},t}\)).

---

### Step 4: Normalization to Final Structural Shocks (ε<sub>t</sub>)

The unnormalized scaled shocks (\(\eta'_{\text{scaled},t}\)) are standardized to have a mean of approximately 0 and a sample standard deviation of approximately 1. This yields the final structural shocks (\(\epsilon_{1t}\), \(\epsilon_{2t}\)).

**Function:** `window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(series1, series2)`
*(Located in `public/js/shared_general_functions.js`)*

```javascript
// From: public/js/shared_general_functions.js
window.SVARGeneral = {
    // ...
    normalizeTwoSeriesForMeanAndStdDev: function(series1, series2) {
        // ... (implementation as previously shown, handles NaNs, calculates mean and sample std dev) ...
        // (Full function code as in the previous version of this guide)
        if (!series1 || !series2 || series1.length === 0 || series2.length === 0 || series1.length !== series2.length) {
            console.error("Invalid input series for normalization.");
            return { normalizedSeries1: series1 || [], normalizedSeries2: series2 || [] };
        }
        const length = series1.length;
        let xMean = 0, yMean = 0;
        let count = 0;
        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xMean += series1[i];
                yMean += series2[i];
                count++;
            }
        }
        if (count === 0) {
            return { normalizedSeries1: series1, normalizedSeries2: series2 };
        }
        xMean /= count;
        yMean /= count;
        let xStd = 0, yStd = 0;
        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xStd += Math.pow(series1[i] - xMean, 2);
                yStd += Math.pow(series2[i] - yMean, 2);
            }
        }
        xStd = Math.sqrt(xStd / (count > 1 ? count - 1 : 1));
        yStd = Math.sqrt(yStd / (count > 1 ? count - 1 : 1));
        const normalizedSeries1 = new Array(length);
        const normalizedSeries2 = new Array(length);
        for (let i = 0; i < length; i++) {
            if (isNaN(series1[i]) || isNaN(series2[i])) {
                normalizedSeries1[i] = NaN;
                normalizedSeries2[i] = NaN;
            } else {
                normalizedSeries1[i] = (xStd === 0) ? (series1[i] - xMean) : (series1[i] - xMean) / xStd;
                normalizedSeries2[i] = (yStd === 0) ? (series2[i] - yMean) : (series2[i] - yMean) / yStd;
            }
        }
        return { normalizedSeries1, normalizedSeries2 };
    },
    // ...
};
```
This function ensures the final \(\epsilon_{1t}\) and \(\epsilon_{2t}\) series have the desired statistical properties (mean 0, std dev 1) post-scaling, irrespective of the initial raw shock distributions.

---

This guide now clarifies both the current implementation and the intended, more complex generation mechanism for the second structural shock, providing a complete picture.
