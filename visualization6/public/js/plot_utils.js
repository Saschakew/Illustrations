// plot_utils.js - Plotting utilities, helpers (e.g., window.SVARPlotUtils)

window.PlotUtils = {
    /**
     * Creates or updates a scatter plot.
     * @param {string} elementId - The ID of the div element to host the plot.
     * @param {number[]} xData - The data for the x-axis.
     * @param {number[]} yData - The data for the y-axis.
     * @param {string} title - The title of the plot.
     * @param {string} [xLabel=''] - The label for the x-axis.
     * @param {string} [yLabel=''] - The label for the y-axis.
     */
    createOrUpdateScatterPlot(elementId, xData, yData, title, xLabel = '', yLabel = '', selectedColorKey = 'primary') {
        // Fetch particle colors from CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const particleColors = {
            'primary': rootStyles.getPropertyValue('--color-accent-primary').trim() || '#17A2B8',
            'secondary': rootStyles.getPropertyValue('--color-accent-secondary-plot-loss').trim() || '#E83E8C',
            'tertiary': rootStyles.getPropertyValue('--color-accent-tertiary-particles').trim() || '#FFC107'
        };

        const markerColor = particleColors[selectedColorKey] || particleColors['primary'];

        const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 4, // Adjusted for particle-like appearance (hero particles are 1.5-3, guide is 6)
                color: markerColor, 
                opacity: 0.7 // From style_guide_plots.md, hero particles are 0.35
                // No line/border to better match hero particle appearance
            }
        };

        const layout = {
            title: title,
            xaxis: { title: xLabel, zeroline: true, zerolinewidth: 2, zerolinecolor: '#999' },
            yaxis: { 
                title: yLabel, 
                zeroline: true, 
                zerolinewidth: 2, 
                zerolinecolor: '#999',
                scaleanchor: 'x',
                scaleratio: 1
            },
            margin: { t: 40, b: 40, l: 40, r: 20 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#333'
            }
        };

        Plotly.react(elementId, [trace], layout, {responsive: true});
    },

    /**
     * Creates or updates a line plot, suitable for loss functions.
     * @param {string} elementId - The ID of the div element to host the plot.
     * @param {number[]} xData - The data for the x-axis (e.g., phi values).
     * @param {number[]} yData - The data for the y-axis (e.g., loss values).
     * @param {string} title - The title of the plot.
     * @param {string} [xLabel=''] - The label for the x-axis.
     * @param {string} [yLabel=''] - The label for the y-axis.
     * @param {number} [verticalLineX] - The x-coordinate of a vertical line to draw on the plot (e.g., current phi slider value).
     * @param {number[]} [yAxisRange] - Optional. An array [min, max] to set a fixed y-axis range.
     * @param {number} [phi0LineValue] - Optional. The x-coordinate for a second vertical line (e.g., true phi_0).
     */
    createOrUpdateLossPlot: function(elementId, xData, yData, title, xLabel, yLabel, verticalLineX, yAxisRange, phi0LineValue, estimatedPhiLineValue) {
        const plotData = [{
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: 'rgba(220, 53, 69, 0.8)', width: 2 },
            marker: { size: 6, color: 'rgba(220, 53, 69, 1)' },
            name: 'Loss Function'
        }];

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel, zeroline: false },
            margin: { l: 50, r: 30, b: 40, t: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#333'
            },
            yaxis: { title: yLabel, zeroline: false }, // Existing yaxis setup
            shapes: []
        };

        // Apply fixed y-axis range if provided
        if (yAxisRange && Array.isArray(yAxisRange) && yAxisRange.length === 2 && typeof yAxisRange[0] === 'number' && typeof yAxisRange[1] === 'number') {
            if (!layout.yaxis) layout.yaxis = {}; // Ensure yaxis object exists
            layout.yaxis.range = yAxisRange;
            layout.yaxis.autorange = false;
        }

        // Determine y-span for vertical lines, respecting fixed yAxisRange if set
        let yMinForLine, yMaxForLine;
        if (yData && yData.length > 0) {
            if (layout.yaxis && layout.yaxis.range) { // If fixed y-axis range is set
                yMinForLine = layout.yaxis.range[0];
                yMaxForLine = layout.yaxis.range[1];
            } else {
                yMinForLine = Math.min(...yData);
                yMaxForLine = Math.max(...yData);
            }
        } else {
            // Fallback if yData is empty or not provided, though lines might not be meaningful
            yMinForLine = 0;
            yMaxForLine = 1; // Default or consider layout.yaxis.range if available
            if (layout.yaxis && layout.yaxis.range) {
                 yMinForLine = layout.yaxis.range[0];
                 yMaxForLine = layout.yaxis.range[1];
            }
        }

        // Add a vertical line for the primary phi value (e.g., slider)
        if (verticalLineX !== undefined && verticalLineX !== null && yData && yData.length > 0) {
            layout.shapes.push({
                type: 'line',
                x0: verticalLineX,
                x1: verticalLineX,
                y0: yMinForLine,
                y1: yMaxForLine,
                line: {
                    color: 'red', // For the primary phi value (e.g., slider)
                    width: 2,
                    dash: 'dash'
                }
            });
        }

        // Add a second vertical line for phi_0 if provided
        if (phi0LineValue !== undefined && phi0LineValue !== null && yData && yData.length > 0) {
            // yMinForLine and yMaxForLine are already calculated considering yAxisRange
            layout.shapes.push({
                type: 'line',
                x0: phi0LineValue,
                x1: phi0LineValue,
                y0: yMinForLine, // Uses the same y-span as the first line
                y1: yMaxForLine,
                line: {
                    color: 'blue', // Different color for phi_0
                    width: 2,
                    dash: 'dot' // Different dash style for phi_0
                }
            });
        }

        // Add a third vertical line for the estimated phi value if provided
        if (estimatedPhiLineValue !== undefined && estimatedPhiLineValue !== null && yData && yData.length > 0) {
            layout.shapes.push({
                type: 'line',
                x0: estimatedPhiLineValue,
                x1: estimatedPhiLineValue,
                y0: yMinForLine, // Uses the same y-span
                y1: yMaxForLine,
                line: {
                    color: 'green', // Distinct color for estimated phi
                    width: 2,
                    dash: 'longdash' // Distinct dash style
                }
            });
        }

        Plotly.react(elementId, plotData, layout, {responsive: true});
    }
};
