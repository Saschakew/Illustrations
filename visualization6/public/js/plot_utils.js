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
    createOrUpdateScatterPlot(elementId, xData, yData, title, xLabel = '', yLabel = '') {
        const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 5, color: 'rgba(0, 123, 255, 0.6)' }
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
     * @param {number} [verticalLineX] - The x-coordinate of a vertical line to draw on the plot.
     * @param {number[]} [yAxisRange] - Optional. An array [min, max] to set a fixed y-axis range.
     */
    createOrUpdateLossPlot: function(elementId, xData, yData, title, xLabel, yLabel, verticalLineX, yAxisRange) {
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

        if (verticalLineX !== undefined && verticalLineX !== null && yData && yData.length > 0) {
            let yMinForLine = Math.min(...yData);
            let yMaxForLine = Math.max(...yData);

            if (layout.yaxis && layout.yaxis.range) { // If fixed y-axis range is set, use it for the line
                yMinForLine = layout.yaxis.range[0];
                yMaxForLine = layout.yaxis.range[1];
            }

            layout.shapes.push({
                type: 'line',
                x0: verticalLineX,
                x1: verticalLineX,
                y0: yMinForLine,
                y1: yMaxForLine,
                line: {
                    color: 'red',
                    width: 2,
                    dash: 'dash'
                }
            });
        }

        Plotly.react(elementId, plotData, layout, {responsive: true});
    }
};
