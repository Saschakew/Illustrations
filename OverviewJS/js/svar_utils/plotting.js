// js/svar_utils/plotting.js

const SvarPlotting = {
    // Store chart instances to manage them (e.g., update, destroy)
    charts: {},
    
    /**
     * Helper function to ensure consistent chart destruction
     * @param {string} chartId - The ID of the chart to destroy
     */
    destroyChart: function(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    },
    
    /**
     * Helper function to prepare canvas for high-DPI rendering
     * @param {string} canvasId - The ID of the canvas element
     * @returns {HTMLCanvasElement|null} - The prepared canvas element or null if not found
     */
    prepareCanvasForHighDPI: function(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return null;
        }
        
        // Fix for high-DPI displays - ensure canvas is rendered at proper resolution
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        return canvas;
    },

    /**
     * Plots time series data on a Chart.js line chart.
     * @param {string} canvasId The ID of the canvas element.
     * @param {string[]} labels Array of date/time labels for the x-axis.
     * @param {object[]} datasets Array of dataset objects for Chart.js.
     *                          Each object should have: { label: string, data: number[], borderColor: string, [other Chart.js options] }
     */
    plotTimeSeries: function(canvasId, labels, datasets, customScales = null) {
        const ctx = this.prepareCanvasForHighDPI(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }

        // If a chart already exists on this canvas, destroy it before creating a new one
        this.destroyChart(canvasId);

        const chartData = {
            labels: labels,
            datasets: datasets.map(ds => ({
                fill: false,
                tension: 0.1, // Makes lines slightly curved
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                ...ds // Spread the dataset-specific properties
            }))
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true, // Enforce aspect ratio
                aspectRatio: 2, // Width/height ratio
                devicePixelRatio: window.devicePixelRatio || 1, // For high-DPI displays
                scales: customScales ? customScales : {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 10, bottom: 0 }
                        },
                        ticks: {
                            maxRotation: 45, // Rotate labels to prevent overlap
                            minRotation: 45,
                            autoSkip: true, // Automatically skip labels that would overlap
                            maxTicksLimit: 15, // Limit the number of ticks to reduce crowding
                            padding: 5,
                            font: {
                                size: 11 // Slightly smaller font for dates
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)' // Lighter grid lines
                        }
                    },
                    y: { // Default single y-axis if no customScales provided
                        title: {
                            display: true,
                            text: 'Value',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 0, bottom: 10 }
                        },
                        beginAtZero: false,
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 0) {
                                    return 'rgba(0, 0, 0, 0.3)'; // Darker line for zero
                                }
                                return 'rgba(0, 0, 0, 0.05)'; // Lighter grid lines
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 0) {
                                    return 1.5; // Thicker zero line
                                }
                                return 0.5; // Thinner grid lines
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 13
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 10,
                        cornerRadius: 4
                    },
                    title: {
                        display: false // We'll use HTML headings instead
                    }
                },
                animation: {
                    duration: 1000, // Animation duration in milliseconds
                    easing: 'easeInOutQuart' // Easing function for animations
                },
                elements: {
                    point: {
                        radius: 2, // Smaller points to reduce clutter
                        hoverRadius: 5 // Larger on hover for better interaction
                    },
                    line: {
                        tension: 0.2 // Slightly smoother lines
                    }
                }
            }
        };

        try {
            this.charts[canvasId] = new Chart(ctx, config);
            console.log(`Chart created on canvas '${canvasId}'.`);
        } catch (error) {
            console.error(`Error creating chart on canvas '${canvasId}':`, error);
            const context = ctx.getContext('2d');
            context.font = '16px Arial';
            context.fillStyle = 'red';
            context.textAlign = 'center';
            context.fillText('Error creating chart. Check console.', ctx.width / 2, ctx.height / 2);
        }
    },

    /**
     * Example of a function to create an animated scatter plot for SVAR impulse responses.
     * This is a placeholder and would need actual data and SVAR logic.
     * @param {string} canvasId The ID of the canvas element.
     * @param {object} impulseResponseData Data for the impulse responses.
     */
    plotAnimatedImpulseResponse: function(canvasId, impulseResponseData) {
        // This would be a more complex function involving step-by-step animation
        // of how an impulse affects variables over time.
        // For example, data points could appear sequentially.
        console.warn('plotAnimatedImpulseResponse is a placeholder and not yet implemented.', canvasId, impulseResponseData);
        const ctx = document.getElementById(canvasId);
        if (ctx) {
            const context = ctx.getContext('2d');
            context.font = '16px Arial';
            context.fillStyle = 'blue';
            context.textAlign = 'center';
            context.fillText('Animated Impulse Response (Placeholder)', ctx.width / 2, ctx.height / 2);
        }
    },

    /**
     * Utility to draw a placeholder message on a canvas.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {string} message - The message to display.
     */
    drawPlaceholderMessage: function(canvasId, message = 'No data available') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#999';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    },

    /**
     * Creates a beautiful scatter plot for two sets of data points with professional styling
     * @param {string} canvasId The ID of the canvas element
     * @param {number[]} xData Array of x-coordinate values
     * @param {number[]} yData Array of y-coordinate values
     * @param {string} xLabel Label for the x-axis
     * @param {string} yLabel Label for the y-axis
     * @param {string} title Title for the chart
     * @param {object} options Optional configuration options to override defaults
     */
    plotScatter: function(canvasId, xData, yData, xLabel, yLabel, title, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }

        // If a chart already exists on this canvas, destroy it before creating a new one
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // Create data points array from x and y arrays
        const dataPoints = xData.map((x, i) => ({x: x, y: yData[i]}));
        
        // Calculate regression line (simple linear regression)
        let showRegressionLine = options.showRegressionLine !== undefined ? options.showRegressionLine : true;
        let regressionPoints = [];
        
        if (showRegressionLine && dataPoints.length > 1) {
            // Calculate means
            const n = dataPoints.length;
            const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
            const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
            const meanX = sumX / n;
            const meanY = sumY / n;
            
            // Calculate coefficients
            const numerator = dataPoints.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
            const denominator = dataPoints.reduce((sum, point) => sum + Math.pow(point.x - meanX, 2), 0);
            
            // Avoid division by zero
            const slope = denominator !== 0 ? numerator / denominator : 0;
            const intercept = meanY - slope * meanX;
            
            // Find min and max x values to draw the line
            const minX = Math.min(...dataPoints.map(point => point.x));
            const maxX = Math.max(...dataPoints.map(point => point.x));
            
            // Create regression line points
            regressionPoints = [
                { x: minX, y: slope * minX + intercept },
                { x: maxX, y: slope * maxX + intercept }
            ];
        }

        // Define color palette based on our design system
        const colors = {
            primary: '#3498db',    // Blue
            secondary: '#2ecc71',  // Green
            accent: '#f1c40f',     // Yellow
            text: '#333333',
            background: '#f9f9f9',
            grid: 'rgba(0, 0, 0, 0.05)',
            pointBorder: '#ffffff'
        };
        
        // Apply custom colors if provided
        if (options.colors) {
            Object.assign(colors, options.colors);
        }

        const chartData = {
            datasets: [
                {
                    label: title,
                    data: dataPoints,
                    backgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.7)`,
                    borderColor: colors.pointBorder,
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointStyle: 'circle',
                    pointBackgroundColor: `rgba(${hexToRgb(colors.primary)}, 0.8)`,
                    pointHoverBackgroundColor: colors.primary,
                    pointHoverBorderWidth: 2,
                    pointHoverBorderColor: '#ffffff'
                }
            ]
        };
        
        // Add regression line dataset if we have points
        if (regressionPoints.length > 0) {
            chartData.datasets.push({
                label: 'Regression Line',
                data: regressionPoints,
                type: 'line',
                borderColor: `rgba(${hexToRgb(colors.secondary)}, 0.8)`,
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                tension: 0
            });
        }

        // Add zero lines for reference
        const addZeroLines = options.showZeroLines !== undefined ? options.showZeroLines : true;
        if (addZeroLines) {
            // Find min/max values to ensure zero lines span the entire chart
            const allX = dataPoints.map(p => p.x);
            const allY = dataPoints.map(p => p.y);
            const minX = Math.min(...allX);
            const maxX = Math.max(...allX);
            const minY = Math.min(...allY);
            const maxY = Math.max(...allY);
            
            // Horizontal zero line (y = 0)
            if (minY < 0 && maxY > 0) {
                chartData.datasets.push({
                    label: 'Y = 0',
                    data: [{ x: minX, y: 0 }, { x: maxX, y: 0 }],
                    type: 'line',
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    pointRadius: 0
                });
            }
            
            // Vertical zero line (x = 0)
            if (minX < 0 && maxX > 0) {
                chartData.datasets.push({
                    label: 'X = 0',
                    data: [{ x: 0, y: minY }, { x: 0, y: maxY }],
                    type: 'line',
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    pointRadius: 0
                });
            }
        }

        // Fix for high-DPI displays - ensure canvas is rendered at proper resolution
        const dpr = window.devicePixelRatio || 1;
        // ctx is the canvas element ID, not the element itself
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx2d = canvas.getContext('2d');
            ctx2d.scale(dpr, dpr);
        }
        

        const config = {
            type: 'scatter',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow custom height via CSS or container
                aspectRatio: options.aspectRatio || 1, // Default to square if not overridden
                devicePixelRatio: dpr,
                layout: {
                    padding: options.padding || {
                        top: 20,    // Increased top padding
                        right: 30,  // Increased right padding
                        bottom: 30, // Increased bottom padding for x-axis label
                        left: 45    // Increased left padding for y-axis label (more space for rotation/KaTeX)
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: xLabel,
                            color: colors.text,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 15, bottom: 10 } // Increased padding for x-axis title
                        },
                        ticks: {
                            color: colors.text,
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 7, // Reduce tick density for clarity
                            callback: function(value) {
                                return parseFloat(value).toFixed(options.tickDecimalPlaces !== undefined ? options.tickDecimalPlaces : 2);
                            }
                        },
                        grid: {
                            color: colors.grid,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            tickColor: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: true
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: yLabel,
                            color: colors.text,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 10, bottom: 20 } // Increased padding for y-axis title
                        },
                        ticks: {
                            color: colors.text,
                            font: {
                                size: 12
                            },
                            maxTicksLimit: 7, // Reduce tick density for clarity
                            callback: function(value) {
                                return parseFloat(value).toFixed(options.tickDecimalPlaces !== undefined ? options.tickDecimalPlaces : 2);
                            }
                        },
                        grid: {
                            color: colors.grid,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            tickColor: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: true
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        titleFont: {
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 10,
                        cornerRadius: 5,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                const item = tooltipItems[0];
                                if (item.dataset.label === 'Regression Line' || item.dataset.label === 'Y = 0' || item.dataset.label === 'X = 0') {
                                    return item.dataset.label;
                                }
                                return 'Data Point'; // Generic title for scatter points
                            },
                            label: function(context) {
                                if (context.dataset.label === 'Regression Line' || context.dataset.label === 'Y = 0' || context.dataset.label === 'X = 0') {
                                    return ''; // No additional label for lines
                                }
                                // Attempt to strip LaTeX for cleaner tooltips
                                const cleanXLabel = xLabel.replace(/\$.*?\$/g, '').replace(/\(.*\)/g, '').replace(/_/g, ' ').replace(/\{/g, '').replace(/\}/g, '').trim();
                                const cleanYLabel = yLabel.replace(/\$.*?\$/g, '').replace(/\(.*\)/g, '').replace(/_/g, ' ').replace(/\{/g, '').replace(/\}/g, '').trim();
                                return [
                                    `${cleanXLabel || 'X'}: ${context.parsed.x.toFixed(4)}`,
                                    `${cleanYLabel || 'Y'}: ${context.parsed.y.toFixed(4)}`
                                ];
                            }
                        }
                    },
                    legend: {
                        display: (regressionPoints.length > 0 || addZeroLines) // Show legend only if regression or zero lines are present
                    },
                    title: {
                        display: false, // HTML heading is used for chart title
                    },
                    annotation: options.annotations || {}
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuad'
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        
        // Helper function to convert hex to RGB
        function hexToRgb(hex) {
            // Remove # if present
            hex = hex.replace(/^#/, '');
            
            // Parse hex values
            let bigint = parseInt(hex, 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            
            return `${r}, ${g}, ${b}`;
        }
    },

    /**
     * Plots actual vs. fitted values for a time series.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {string[]} timeLabels - Array of labels for the X-axis (e.g., dates).
     * @param {number[]} actualData - Array of actual data points.
     * @param {number[]} fittedData - Array of fitted data points.
     * @param {string} variableName - Name of the variable being plotted (for title and legend).
     */
    plotActualVsFitted: function(canvasId, timeLabels, actualData, fittedData, variableName) {
        const ctx = this.prepareCanvasForHighDPI(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID ${canvasId} not found for actual vs. fitted plot.`);
            // Attempt to use the placeholder message function if canvasId itself is valid for a div wrapper
            this.drawPlaceholderMessage(canvasId, `Chart canvas for '${variableName}' (Actual vs. Fitted) not found.`);
            return;
        }
        
        // If a chart already exists on this canvas, destroy it before creating a new one
        this.destroyChart(canvasId);

        const datasets = [
            {
                label: `Actual ${variableName}`,
                data: actualData,
                borderColor: '#3498db', // Blue from our color palette
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.2,
                pointRadius: 1.5, // Smaller points to reduce clutter
                pointHoverRadius: 5 // Larger on hover for better interaction
            },
            {
                label: `Fitted ${variableName}`,
                data: fittedData,
                borderColor: '#f1c40f', // Yellow from our color palette
                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.2,
                pointRadius: 1.5, // Smaller points to reduce clutter
                pointHoverRadius: 5 // Larger on hover for better interaction
            }
        ];

        const config = {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5, // Adjusted for better view
                devicePixelRatio: window.devicePixelRatio || 1, // For high-DPI displays
                plugins: {
                    title: {
                        display: false // We'll use HTML headings instead
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 12
                            },
                            padding: 15,
                            usePointStyle: true // Use point style for cleaner legend
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 13
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 10,
                        cornerRadius: 4
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 10, bottom: 0 }
                        },
                        ticks: {
                            maxRotation: 45, // Rotate labels to prevent overlap
                            minRotation: 45,
                            autoSkip: true, // Automatically skip labels that would overlap
                            maxTicksLimit: 12, // Limit the number of ticks to reduce crowding
                            padding: 5,
                            font: {
                                size: 11 // Slightly smaller font for dates
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)' // Lighter grid lines
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: variableName,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 0, bottom: 10 }
                        },
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 0) {
                                    return 'rgba(0, 0, 0, 0.3)'; // Darker line for zero
                                }
                                return 'rgba(0, 0, 0, 0.05)'; // Lighter grid lines
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 0) {
                                    return 1.5; // Thicker zero line
                                }
                                return 0.5; // Thinner grid lines
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuad'
                }
            }
        };
        
        try {
            this.charts[canvasId] = new Chart(ctx, config);
            // console.log(`Actual vs. Fitted plot initialized for ${canvasId}`);
        } catch (error) {
            console.error(`Error creating Actual vs. Fitted chart on canvas '${canvasId}':`, error);
            this.drawPlaceholderMessage(canvasId, `Error creating chart for ${variableName}.`);
        }
    },

    /**
     * Plots residuals for a time series model.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {string[]} timeLabels - Array of labels for the X-axis (e.g., dates).
     * @param {number[]} residualsData - Array of residual data points.
     * @param {string} title - The title for the chart.
     */
    plotResiduals: function(canvasId, timeLabels, residualsData, title) {
        const ctx = this.prepareCanvasForHighDPI(canvasId);
        if (!ctx) {
            console.error(`Canvas element with ID ${canvasId} not found for residuals plot.`);
            this.drawPlaceholderMessage(canvasId, `Chart canvas for '${title}' not found.`);
            return;
        }
        
        // If a chart already exists on this canvas, destroy it
        this.destroyChart(canvasId);

        const datasets = [
            {
                label: 'Residuals',
                data: residualsData,
                borderColor: '#2ecc71', // Green from our color palette
                backgroundColor: 'rgba(46, 204, 113, 0.1)', // Lighter fill
                borderWidth: 1.5,
                fill: true,
                tension: 0.2,
                pointRadius: 1.5, // Smaller points to reduce clutter
                pointHoverRadius: 5 // Larger on hover for better interaction
            }
        ];

        const config = {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true, 
                aspectRatio: 2.5, // Adjusted for better view
                devicePixelRatio: window.devicePixelRatio || 1, // For high-DPI displays
                layout: {
                    padding: {
                        top: 15,    // Increased top padding
                        right: 25,  // Increased right padding
                        bottom: 25, // Increased bottom padding for rotated x-axis labels
                        left: 25    // Increased left padding
                    }
                },
                plugins: {
                    title: {
                        display: false, // Using HTML h3 for title
                    },
                    legend: {
                        display: false, // Legend is redundant for a single series residuals plot
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 5,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || 'Residual'; // Default to 'Residual'
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(4);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            font: { size: 14, weight: 'bold' },
                            padding: { top: 10, bottom: 5 } // Adjusted padding
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 18, // Increased slightly to allow more flexibility for autoSkip
                            padding: 15, // Increased padding between labels and axis
                            font: { size: 11 }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)' // Lighter grid lines
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Residual Value',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: { top: 0, bottom: 10 }
                        },
                        // Add a zero line for reference
                        grid: {
                            drawBorder: false,
                            color: function(context) {
                                if (context.tick.value === 0) {
                                    return 'rgba(0, 0, 0, 0.3)'; // Darker line for zero
                                }
                                return 'rgba(0, 0, 0, 0.05)'; // Lighter grid lines
                            },
                            lineWidth: function(context) {
                                if (context.tick.value === 0) {
                                    return 2; // Thicker zero line
                                }
                                return 0.5; // Thinner grid lines
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuad'
                }
            }
        };
        try {
            this.charts[canvasId] = new Chart(ctx, config);
            console.log(`Residuals plot initialized for ${canvasId}`);
        } catch (error) {
            console.error(`Error creating Residuals chart on canvas '${canvasId}':`, error);
            this.drawPlaceholderMessage(canvasId, `Error creating chart for ${title}.`);
        }
    },

    /**
     * Plots a scatter plot of residuals from two VAR equations.
     * @param {string} canvasId - The ID of the canvas element.
     * @param {number[]} residuals1 - Residuals from the first equation (x-axis).
     * @param {number[]} residuals2 - Residuals from the second equation (y-axis).
     * @param {object} options - Optional configuration options.
     */
    plotResidualScatter: function(canvasId, residuals1, residuals2, options = {}) {
        console.log('Plotting residual scatter plot...');
        
        if (!residuals1 || !residuals2 || residuals1.length === 0 || residuals2.length === 0) {
            console.error('Invalid residuals data for scatter plot');
            this.drawPlaceholderMessage(canvasId, 'Invalid residuals data');
            return;
        }
        
        // Default options
        const defaultOptions = {
            xLabel: 'Interest Rate Residuals',
            yLabel: 'Return Residuals',
            title: 'VAR Residual Scatter Plot',
            pointColor: '#3498db',
            pointBorderColor: '#2980b9',
            fitLine: true,
            showConfidenceBands: false
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        // Use the existing plotScatter method to create the scatter plot
        this.plotScatter(
            canvasId,
            residuals1,
            residuals2,
            mergedOptions.xLabel,
            mergedOptions.yLabel,
            mergedOptions.title,
            {
                pointBackgroundColor: mergedOptions.pointColor,
                pointBorderColor: mergedOptions.pointBorderColor,
                showRegressionLine: mergedOptions.fitLine,
                showConfidenceBands: mergedOptions.showConfidenceBands,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        );
    },
    
    // Add more plotting functions as needed for specific SVAR visualizations
};

// To make SvarPlotting globally available if not using ES6 modules:
window.SvarPlotting = SvarPlotting;
