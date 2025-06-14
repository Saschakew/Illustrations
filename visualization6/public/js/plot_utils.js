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
    createOrUpdateScatterPlot(elementId, xData, yData, title, xLabel = '', yLabel = '', colorKey = 'blue') {
        // Fetch particle colors from CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const particleColors = {
            'blue': rootStyles.getPropertyValue('--color-accent-primary').trim() || '#17A2B8',
            'pink': rootStyles.getPropertyValue('--color-accent-secondary-plot-loss').trim() || '#E83E8C',
            'green': '#28A745',
            'yellow': rootStyles.getPropertyValue('--color-accent-tertiary-particles').trim() || '#FFC107'
        };

        const markerColor = particleColors[colorKey] || particleColors['blue'];

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

        Plotly.react(elementId, [trace], layout, {responsive: true, staticPlot: true, displayModeBar: false});
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
        // Fetch theme colors
        const rootStyles = getComputedStyle(document.documentElement);
        const themeColors = {
            'blue': rootStyles.getPropertyValue('--color-accent-primary').trim() || '#17A2B8',
            'pink': rootStyles.getPropertyValue('--color-accent-secondary-plot-loss').trim() || '#E83E8C',
            'green': '#28A745',
            'yellow': rootStyles.getPropertyValue('--color-accent-tertiary-particles').trim() || '#FFC107'
        };

        const plotData = [{
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: themeColors.pink, width: 2 },
            marker: { size: 6, color: themeColors.pink },
            name: 'Loss Function'
        }];

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel, zeroline: false },
            margin: { l: 50, r: 30, b: 40, t: 40 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#333' },
            shapes: [],
            annotations: [],
            showlegend: false
        };

        // Apply fixed y-axis range if provided
        if (yAxisRange && Array.isArray(yAxisRange) && yAxisRange.length === 2 && typeof yAxisRange[0] === 'number' && typeof yAxisRange[1] === 'number') {
            if (!layout.yaxis) layout.yaxis = {};
            layout.yaxis.range = yAxisRange;
            layout.yaxis.autorange = false;
        }

        let yMinForLine, yMaxForLine;
        if (yData && yData.length > 0) {
            if (layout.yaxis && layout.yaxis.range) {
                yMinForLine = layout.yaxis.range[0];
                yMaxForLine = layout.yaxis.range[1];
            } else {
                yMinForLine = Math.min(...yData);
                yMaxForLine = Math.max(...yData);
            }
        } else {
            yMinForLine = 0;
            yMaxForLine = 1;
            if (layout.yaxis && layout.yaxis.range) {
                 yMinForLine = layout.yaxis.range[0];
                 yMaxForLine = layout.yaxis.range[1];
            }
        }

        const addAnnotation = (x, text, color, yOffset = -25) => {
            layout.annotations.push({
                x: x,
                y: yMaxForLine,
                xref: 'x',
                yref: 'y',
                text: text,
                showarrow: true,
                arrowhead: 2,
                ax: 0,
                ay: yOffset,
                font: { color: color, size: 14, family: 'Arial, sans-serif' },
                bordercolor: '#c7c7c7',
                borderwidth: 1,
                bgcolor: 'rgba(255,255,255,0.8)',
                opacity: 0.8
            });
        };

        // Line for phi slider value
        if (verticalLineX !== undefined && verticalLineX !== null && yData && yData.length > 0) {
            layout.shapes.push({
                type: 'line', x0: verticalLineX, x1: verticalLineX, y0: yMinForLine, y1: yMaxForLine,
                line: { color: themeColors.yellow, width: 2, dash: 'dash' }
            });
            addAnnotation(verticalLineX, 'φ', themeColors.yellow, -60);
        }

        // Line for true phi_0
        if (phi0LineValue !== undefined && phi0LineValue !== null && yData && yData.length > 0) {
            layout.shapes.push({
                type: 'line', x0: phi0LineValue, x1: phi0LineValue, y0: yMinForLine, y1: yMaxForLine,
                line: { color: themeColors.blue, width: 2, dash: 'dot' }
            });
            addAnnotation(phi0LineValue, 'φ₀', themeColors.blue, -25);
        }

        // Line for estimated phi
        if (estimatedPhiLineValue !== undefined && estimatedPhiLineValue !== null && yData && yData.length > 0) {
            layout.shapes.push({
                type: 'line', x0: estimatedPhiLineValue, x1: estimatedPhiLineValue, y0: yMinForLine, y1: yMaxForLine,
                line: { color: themeColors.green, width: 2, dash: 'longdash' }
            });
            addAnnotation(estimatedPhiLineValue, 'φ̂', themeColors.green, -95);
        }

        Plotly.react(elementId, plotData, layout, {responsive: true, staticPlot: true, displayModeBar: false});
    }
};
