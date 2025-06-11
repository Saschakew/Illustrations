# Proposed Structure: `shared-plots.js`

This file will consolidate reusable functions for creating and updating plots with Plotly.js.

```javascript
window.SharedPlots = {
    // ===================================
    // Common Plotly Layouts
    // ===================================
    /**
     * Creates a standard layout object for a scatter plot.
     * @param {string} title - The plot title.
     * @param {string} xLabel - The x-axis label.
     * @param {string} yLabel - The y-axis label.
     * @param {number} width - The plot width.
     * @param {number} height - The plot height.
     * @param {object} [options={}] - Additional Plotly layout options to merge.
     * @returns {object} A Plotly layout object.
     */
    getScatterLayout: function(title, xLabel, yLabel, width, height, options = {}) { /* ... */ },

    /**
     * Creates a standard layout object for a line plot.
     * @param {string} title - The plot title.
     * @param {string} xLabel - The x-axis label.
     * @param {string} yLabel - The y-axis label.
     * @param {number} width - The plot width.
     * @param {number} height - The plot height.
     * @param {object} [options={}] - Additional Plotly layout options to merge.
     * @returns {object} A Plotly layout object.
     */
    getLinePlotLayout: function(title, xLabel, yLabel, width, height, options = {}) { /* ... */ },

    // ===================================
    // Plot Creation/Update Functions
    // ===================================
    /**
     * Renders or updates a plot in a given div. Uses Plotly.react for efficient updates.
     * @param {string | HTMLElement} div - The div ID or element to plot in.
     * @param {object[]} traces - An array of Plotly trace objects.
     * @param {object} layout - A Plotly layout object.
     * @param {object} [config={responsive: true}] - A Plotly config object.
     */
    renderPlot: function(div, traces, layout, config = {responsive: true}) {
        Plotly.react(div, traces, layout, config);
    },

    /**
     * Creates a standard scatter trace object.
     * @param {number[]} xData - The x-axis data.
     * @param {number[]} yData - The y-axis data.
     * @param {string} name - The name of the trace for the legend.
     * @param {object} [options={}] - Additional Plotly trace options (e.g., marker style).
     * @returns {object} A Plotly scatter trace object.
     */
    createScatterTrace: function(xData, yData, name, options = {}) { /* ... */ },

    /**
     * Creates a standard line trace object.
     * @param {number[]} xData - The x-axis data.
     * @param {number[]} yData - The y-axis data.
     * @param {string} name - The name of the trace for the legend.
     * @param {object} [options={}] - Additional Plotly trace options (e.g., line style).
     * @returns {object} A Plotly line trace object.
     */
    createLineTrace: function(xData, yData, name, options = {}) { /* ... */ },

    // ===================================
    // More Specific Reusable Plot Functions
    // ===================================
    /**
     * A specialized function to plot identified innovations.
     * @param {string | HTMLElement} div - The div to plot in.
     * @param {number[]} e1 - The first innovation series.
     * @param {number[]} e2 - The second innovation series.
     * @param {string} title - The plot title.
     * @param {number} width - The plot width.
     * @param {number} height - The plot height.
     */
    plotInnovations: function(div, e1, e2, title, width, height) { /* ... */ },

    /**
     * A specialized function to plot an objective/correlation curve.
     * @param {string | HTMLElement} div - The div to plot in.
     * @param {number[]} x_values - The values for the x-axis (e.g., phi angles).
     * @param {number[]} y_values - The values for the y-axis (e.g., objective function values).
     * @param {string} title - The plot title.
     * @param {number} width - The plot width.
     * @param {number} height - The plot height.
     * @param {object} [markers={}] - Optional markers for true or estimated values, e.g., { true_x: 0.5, estimated_x: 0.48 }.
     */
    plotObjectiveCurve: function(div, x_values, y_values, title, width, height, markers = {}) { /* ... */ }
};
```
