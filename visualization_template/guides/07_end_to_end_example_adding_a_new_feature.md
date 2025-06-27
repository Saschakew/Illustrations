# Guide 7: End-to-End Example - Adding a New Feature

This final guide ties everything together. We will walk through a complete, end-to-end example of adding a new feature to the SVAR Visualization Template. This will reinforce the concepts from all the previous guides.

## The Goal: Add a "Shock Variance Ratio" Feature

Our goal is to add a new feature that allows the user to control the ratio of the variances of the two structural shocks, ε₁ and ε₂. 

Specifically, we will:
1.  Add a new parameter, `varianceRatio`, to `sharedData`.
2.  Create a new slider to control this `varianceRatio`.
3.  Modify the shock generation logic to use this new parameter.
4.  Display the current `varianceRatio` value dynamically on the page.

This will touch every part of the architecture: state, UI, logic, and dynamic content.

---

### Step 1: State Management (`shared_data.js`)

First, we establish our new parameter in the single source of truth.

**Action**: Open `public/js/shared_data.js` and add `varianceRatio` to the `window.sharedData` object.

```javascript
// In public/js/shared_data.js
window.sharedData = {
    T: 500,
    phi: 0,
    varianceRatio: 1.0, // Our new parameter, default is 1:1 ratio
    // ... other properties
};
```

---

### Step 2: UI Factory (`ui_factory.js`)

Next, we teach the UI factory how to build our new slider.

**Action**: Open `public/js/ui_factory.js` and add a `createVarianceSlider` function.

```javascript
// In public/js/ui_factory.js
window.uiFactory = {
    // ... other factory functions
    createVarianceSlider: function(id, label = 'σ²₁/σ²₂ Ratio=') {
        const defaultValue = window.sharedData.varianceRatio;
        return `
            <div class="control-item">
                <label for="${id}">${label}</label>
                <output for="${id}" id="${id}_value">${defaultValue.toFixed(2)}</output>
                <input type="range" id="${id}" name="${id}" min="0.25" max="4.0" value="${defaultValue}" step="0.05" class="slider variance-slider">
            </div>
        `;
    },
};
```

---

### Step 3: Add Placeholder and Update `main.js`

Now we place the slider in the UI and tell `main.js` how to build it.

**Action 1**: Open `public/sections/section_one.html` and add the placeholder.

```html
<!-- In public/sections/section_one.html -->
<div class="controls-row">
    <div data-control-type="t-slider" data-control-id="slider_T_s1"></div>
    <div data-control-type="variance-slider" data-control-id="slider_variance_s1"></div>
</div>
```

**Action 2**: Open `public/js/main.js` and update the `initializeApp` function to recognize the new control type.

```javascript
// In public/js/main.js, inside initializeApp()
document.querySelectorAll('[data-control-type]').forEach(placeholder => {
    // ... existing if/else if blocks
    } else if (type === 'variance-slider') {
        controlHtml = window.uiFactory.createVarianceSlider(id);
    }
    // ...
});
```

---

### Step 4: Control Logic (`shared_controls.js`)

We now give the slider its functionality.

**Action 1**: Open `public/js/shared_controls.js` and create the `initializeVarianceSliders` function.

```javascript
// In public/js/shared_controls.js
function initializeVarianceSliders() {
    const sliders = document.querySelectorAll('.variance-slider');
    sliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);
        slider.value = window.sharedData.varianceRatio;
        output.textContent = parseFloat(slider.value).toFixed(2);

        slider.addEventListener('change', function() {
            const newRatio = parseFloat(this.value);
            window.sharedData.varianceRatio = newRatio;

            sliders.forEach(s => {
                document.getElementById(`${s.id}_value`).textContent = newRatio.toFixed(2);
                s.value = newRatio;
            });

            DebugManager.log('SHARED_CONTROLS', 'Variance Ratio updated to:', newRatio);
            regenerateSvarData(); // This change requires a full data regeneration
        });
    });
}
```

**Action 2**: Call this new initializer from `main.js` inside `initializeApp()`.

```javascript
// In public/js/main.js, inside initializeApp()
// ... after other initializers
if (typeof initializeVarianceSliders === 'function') initializeVarianceSliders();
```

---

### Step 5: SVAR Logic (`svar_functions.js`)

Now for the core logic. We'll modify the shock generation to respect the new ratio.

**Action**: Open `public/js/svar_functions.js` and modify `generateEpsilon`.

```javascript
// In public/js/svar_functions.js
SVARCoreFunctions.generateEpsilon = function(T) {
    // ... generate two independent N(0,1) series: series1 and series2 ...

    // Get the desired variance ratio from sharedData
    const ratio = window.sharedData.varianceRatio;

    // Adjust the series to match the desired variance ratio.
    // Var(aX) = a²Var(X). We want Var(ε₁) / Var(ε₂) = ratio.
    // So, we scale ε₁ by sqrt(ratio).
    const adjusted_series1 = series1.map(v => v * Math.sqrt(ratio));

    // Before returning, re-normalize both to have a combined sample variance of 1, preserving the ratio.
    // (This is a more advanced step, for now we can just return the adjusted series)
    
    return { epsilon_1t: adjusted_series1, epsilon_2t: series2 };
};
```
*Note: A robust implementation would also re-normalize the shocks after scaling to maintain certain properties, but this shows the core step of using the parameter.*

---

### Step 6: Dynamic Display

Finally, let's display the current ratio value somewhere.

**Action 1**: Add a placeholder in `public/sections/section_one.html`.

```html
<p>Current Variance Ratio (σ²₁/σ²₂): <strong id="variance-ratio-display">1.00</strong></p>
```

**Action 2**: Create a display function (e.g., in `section_one.js`) and call it.

```javascript
// In a suitable JS file, e.g., section_one.js
function updateVarianceRatioDisplay() {
    const el = document.getElementById('variance-ratio-display');
    if (el) {
        el.textContent = window.sharedData.varianceRatio.toFixed(2);
    }
}
```

**Action 3**: Call this function from the `regenerateSvarData` pipeline in `main.js`.

```javascript
// In public/js/main.js
async function regenerateSvarData() {
    // ... existing logic ...

    // Call display updaters
    await updateUPlot();
    updateVarianceRatioDisplay(); // Our new display function
}
```

## Conclusion

Congratulations! You have just added a complete, interactive feature to the template. You have:

-   Modified the central **state**.
-   Extended the **UI factory**.
-   Added a new **UI control**.
-   Updated the core **SVAR logic**.
-   Implemented a **dynamic display**.

This workflow—from state to display—is the fundamental pattern for all development in the SVAR Visualization Template. You are now fully equipped to customize and extend it to fit your own research and visualization needs.
