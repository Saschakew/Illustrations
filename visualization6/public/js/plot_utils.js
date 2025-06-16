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

        // Determine an informative legend label based on the plot title
        let legendLabel = 'Data';
        if (typeof title === 'string') {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('structural shocks')) {
                legendLabel = 'Structural Shocks εₜ';
            } else if (lowerTitle.includes('reduced-form shocks')) {
                legendLabel = 'Reduced-Form Shocks uₜ';
            } else if (lowerTitle.includes('innovation')) { // matches 'innovation' or 'innovations'
                legendLabel = 'Innovations eₜ';
            }
        }

        const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            name: legendLabel,
            marker: { 
                size: 4, // Adjusted for particle-like appearance (hero particles are 1.5-3, guide is 6)
                color: markerColor, 
                opacity: 0.7 // From style_guide_plots.md, hero particles are 0.35
                // No line/border to better match hero particle appearance
            }
        };

        const layout = {
            title: title,
            xaxis: { title: xLabel, zeroline: true, zerolinewidth: 2, zerolinecolor: '#999', automargin: true },
            yaxis: { 
                title: yLabel, 
                zeroline: true, 
                zerolinewidth: 2, 
                zerolinecolor: '#999',
                scaleanchor: 'x',
                scaleratio: 1
            },
            margin: { t: 60, b: 120, l: 40, r: 20 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#333'
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'top',
                y: -0.30,
                xanchor: 'center',
                x: 0.5,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#c7c7c7',
                borderwidth: 1,
                font: { size: 12 }
            }
        };

        Plotly.react(elementId, [trace], layout, {responsive: true, staticPlot: true, displayModeBar: false});

        // Trigger MathJax typesetting for LaTeX in titles or labels
        if (window.MathJax && window.MathJax.typesetPromise) {
            const plotElement = document.getElementById(elementId);
            if (plotElement) {
                window.MathJax.typesetPromise([plotElement]).catch(err => {
                    if (window.DebugManager && typeof window.DebugManager.log === 'function') {
                        window.DebugManager.log('LATEX_UPDATE', 'MathJax typeset error (scatter):', elementId, err);
                    } else {
                        console.error('MathJax typeset error (scatter):', elementId, err);
                    }
                });
            }
        }
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
            xaxis: { title: xLabel, automargin: true },
            yaxis: { title: yLabel, zeroline: false },
            margin: { l: 50, r: 30, b: 120, t: 60 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#333' },
            shapes: [],
            annotations: [],
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'top',
                y: -0.30,
                xanchor: 'center',
                x: 0.5,
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: '#c7c7c7',
                borderwidth: 1,
                font: { size: 12 }
            }
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

        const addVerticalLineTrace = (x, color, dashStyle, name) => {
            plotData.push({
                x: [x, x],
                y: [yMinForLine, yMaxForLine],
                mode: 'lines',
                line: { color: color, width: 2, dash: dashStyle },
                hoverinfo: 'skip',
                showlegend: true,
                name: name
            });
        };

        // Vertical line for current phi (slider)
        if (verticalLineX !== undefined && verticalLineX !== null && yData && yData.length > 0) {
            addVerticalLineTrace(verticalLineX, themeColors.yellow, 'dash', 'Current φ');
        }

        // Vertical line for true φ₀
        if (phi0LineValue !== undefined && phi0LineValue !== null && yData && yData.length > 0) {
            addVerticalLineTrace(phi0LineValue, themeColors.blue, 'dot', 'True φ₀');
        }

        // Vertical line for estimated φ̂
        if (estimatedPhiLineValue !== undefined && estimatedPhiLineValue !== null && yData && yData.length > 0) {
            addVerticalLineTrace(estimatedPhiLineValue, themeColors.green, 'longdash', 'Estimated φ̂');
        }

        Plotly.react(elementId, plotData, layout, {responsive: true, staticPlot: true, displayModeBar: false});

        // Trigger MathJax typesetting for LaTeX in titles or labels
        if (window.MathJax && window.MathJax.typesetPromise) {
            const plotElement = document.getElementById(elementId);
            if (plotElement) {
                window.MathJax.typesetPromise([plotElement]).catch(err => {
                    if (window.DebugManager && typeof window.DebugManager.log === 'function') {
                        window.DebugManager.log('LATEX_UPDATE', 'MathJax typeset error (loss):', elementId, err);
                    } else {
                        console.error('MathJax typeset error (loss):', elementId, err);
                    }
                });
            }
        }
    }
};
