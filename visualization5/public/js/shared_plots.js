// Enhanced shared functions for creating and managing plots with improved styling and animations
window.SVARPlots = {
    // Color constants based on style guide
    COLORS: {
        PRIMARY: '#00ADB5',    // Teal
        ACCENT: '#ff7f0e',     // Orange
        SPECIAL: 'rgb(252, 81, 133)', // Pink
        TEXT: '#222831',       // Dark gray
        WHITE: '#ffffff',      // White
        ZERO_LINE: '#DDDDDD',  // Zero line
        GRID: '#EEEEEE'        // Grid lines
    },

    // Typography constants
    FONTS: {
        TITLE: { size: 18, color: '#222831' },
        AXIS_LABEL: { size: 14, color: '#222831' },
        TICK_LABEL: { size: 12, color: '#222831' }
    },

    // Get responsive plot size
    getPlotSize: function(plotDivElement) {
        if (!plotDivElement) {
            console.warn("getPlotSize called with null or undefined plotDivElement. Returning default size.");
            return { width: 600, height: 400 };
        }
        
        // Get the parent container width instead of the plot div width
        const parentContainer = plotDivElement.parentElement;
        if (!parentContainer) {
            console.warn("Could not find parent container. Using plot div width.");
            return { width: plotDivElement.offsetWidth, height: plotDivElement.offsetWidth * 0.6 };
        }
        
        const containerWidth = parentContainer.offsetWidth;
        const isLargeScreen = containerWidth >= 1200; // Bootstrap's lg breakpoint
        
        // For large screens, plots take up roughly half the container width
        // For small screens, plots take up full width
        const width = isLargeScreen ? (containerWidth - 40) / 2 : containerWidth; // 40px total gap
        const height = width * 0.6; // Maintain a 5:3 aspect ratio
        
        return { width, height };
    },

    // Standard layout configuration
    getStandardLayout: function(title, xAxisTitle, yAxisTitle, plotDivElement) {
        const { width, height } = this.getPlotSize(plotDivElement);
        return {
            title: { 
                text: title,
                font: this.FONTS.TITLE
            },
            xaxis: {
                title: { text: xAxisTitle, font: this.FONTS.AXIS_LABEL },
                zeroline: true,
                zerolinecolor: this.COLORS.ZERO_LINE,
                gridcolor: this.COLORS.GRID,
                tickfont: this.FONTS.TICK_LABEL
            },
            yaxis: {
                title: { text: yAxisTitle, font: this.FONTS.AXIS_LABEL },
                zeroline: true,
                zerolinecolor: this.COLORS.ZERO_LINE,
                gridcolor: this.COLORS.GRID,
                tickfont: this.FONTS.TICK_LABEL
            },
            width: width,
            height: height,
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: this.COLORS.WHITE,
            plot_bgcolor: this.COLORS.WHITE,
            transition: {
                duration: 500,
                easing: 'cubic-in-out'
            }
        };
    },

    // Enhanced scatter plot configuration
    getScatterTrace: function(x, y, color, hoverTemplate) {
        return {
            x: x,
            y: y,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 6,
                color: color,
                opacity: 0.7,
                line: {
                    width: 1,
                    color: this.COLORS.TEXT
                }
            },
            hoverinfo: 'x+y',
            hovertemplate: hoverTemplate || 'X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>',
            animation: {
                duration: 1000,
                easing: 'cubic-in-out'
            }
        };
    },

    updateSvarSetupPlots: function(epsilon_1t, epsilon_2t, u_1t, u_2t) {
        const shocksScatterPlotDiv = document.getElementById('shocksScatterPlot');
        const reducedShocksPlotDiv = document.getElementById('reducedShocksScatterPlot');

        if (!shocksScatterPlotDiv || !reducedShocksPlotDiv) {
            console.error("Plot div(s) for SVAR setup not found!");
            return;
        }

        if (!epsilon_1t || !epsilon_2t || !u_1t || !u_2t || epsilon_1t.length === 0) {
            console.warn("Data for plotting (epsilon_t or u_t) is not ready yet.");
            return;
        }

        // Plot 1: Structural Shocks (ε_t)
        const traceEpsilon = this.getScatterTrace(
            epsilon_1t,
            epsilon_2t,
            this.COLORS.PRIMARY,
            'ε₁: %{x:.3f}<br>ε₂: %{y:.3f}<extra></extra>'
        );

        const layoutEpsilon = this.getStandardLayout(
            'Structural Shocks (ε₁ vs ε₂)',
            'ε₁',
            'ε₂',
            shocksScatterPlotDiv
        );

        Plotly.newPlot(shocksScatterPlotDiv, [traceEpsilon], layoutEpsilon, {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        });

        // Plot 2: Reduced-Form Shocks (u_t)
        const traceU = this.getScatterTrace(
            u_1t,
            u_2t,
            this.COLORS.ACCENT,
            'u₁: %{x:.3f}<br>u₂: %{y:.3f}<extra></extra>'
        );

        const layoutU = this.getStandardLayout(
            'Reduced-Form Shocks (u₁ vs u₂)',
            'u₁',
            'u₂',
            reducedShocksPlotDiv
        );

        Plotly.newPlot(reducedShocksPlotDiv, [traceU], layoutU, {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        });
    },

    updateInnovationsScatterPlotER: function(plotDivId, e1Data, e2Data) {
        const plotDiv = document.getElementById(plotDivId);
        if (!plotDiv) {
            console.error(`Plot container with id ${plotDivId} not found.`);
            return;
        }

        const trace = this.getScatterTrace(
            e1Data,
            e2Data,
            this.COLORS.PRIMARY,
            'e₁(φ): %{x:.3f}<br>e₂(φ): %{y:.3f}<extra></extra>'
        );

        const layout = this.getStandardLayout(
            'Innovations e(φ)',
            'e₁(φ)',
            'e₂(φ)',
            plotDiv
        );

        // Add range constraints
        layout.xaxis.range = [-4, 4];
        layout.yaxis.range = [-4, 4];

        Plotly.newPlot(plotDiv, [trace], layout, {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        });
    },

    updateCorrelationPlotER: function(plotDivId, correlationData, currentPhi, phiTrueForPlot) {
        const plotDiv = document.getElementById(plotDivId);
        if (!plotDiv) {
            console.error(`Plot container with id ${plotDivId} not found.`);
            return;
        }

        const trace = {
            x: correlationData.phis,
            y: correlationData.corrs,
            mode: 'lines',
            type: 'scatter',
            line: {
                color: this.COLORS.PRIMARY,
                width: 2
            },
            animation: {
                duration: 1000,
                easing: 'cubic-in-out'
            }
        };

        const layout = this.getStandardLayout(
            'Sample Correlation of Innovations',
            'Rotation Angle φ (radians)',
            'corr(e₁, e₂)',
            plotDiv
        );

        // Add vertical lines for current and true phi
        layout.shapes = [
            {
                type: 'line',
                x0: currentPhi,
                x1: currentPhi,
                y0: Math.min(...correlationData.corrs),
                y1: Math.max(...correlationData.corrs),
                line: {
                    color: this.COLORS.TEXT,
                    width: 2,
                    dash: 'dash'
                }
            },
            {
                type: 'line',
                x0: phiTrueForPlot,
                x1: phiTrueForPlot,
                y0: Math.min(...correlationData.corrs),
                y1: Math.max(...correlationData.corrs),
                line: {
                    color: this.COLORS.ACCENT,
                    width: 2.5,
                    dash: 'dot'
                }
            }
        ];

        // Add annotation for true phi
        layout.annotations = [{
            x: phiTrueForPlot,
            y: Math.max(...correlationData.corrs),
            xref: 'x',
            yref: 'y',
            text: 'φ₀ (True)',
            showarrow: true,
            arrowhead: 2,
            ax: -20,
            ay: -30,
            font: { color: this.COLORS.ACCENT }
        }];

        Plotly.newPlot(plotDiv, [trace], layout, {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        });
    }
}; 