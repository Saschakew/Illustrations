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
    getStandardLayout: function(title, xAxisTitle, yAxisTitle) {
        return {
            title: { text: title, font: this.FONTS.TITLE },
            xaxis: {
                title: { text: xAxisTitle, font: this.FONTS.AXIS_LABEL },
                zeroline: true, zerolinecolor: this.COLORS.ZERO_LINE,
                gridcolor: this.COLORS.GRID, tickfont: this.FONTS.TICK_LABEL
            },
            yaxis: {
                title: { text: yAxisTitle, font: this.FONTS.AXIS_LABEL },
                zeroline: true, zerolinecolor: this.COLORS.ZERO_LINE,
                gridcolor: this.COLORS.GRID, tickfont: this.FONTS.TICK_LABEL
            },
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: this.COLORS.WHITE,
            plot_bgcolor: this.COLORS.WHITE,
            transition: { duration: 500, easing: 'cubic-in-out' }
        };
    },

    // Enhanced scatter plot configuration
    getScatterTrace: function(x, y, color, hoverTemplate) {
        return {
            x: x, y: y, mode: 'markers', type: 'scatter',
            marker: {
                size: 6, color: color, opacity: 0.7,
                line: { width: 1, color: this.COLORS.TEXT }
            },
            hoverinfo: 'x+y',
            hovertemplate: hoverTemplate || 'X: %{x:.3f}<br>Y: %{y:.3f}<extra></extra>',
            animation: { duration: 1000, easing: 'cubic-in-out' }
        };
    },

    updateSvarSetupPlots: function(epsilon_1t, epsilon_2t, u_1t, u_2t) {
        const shocksScatterPlotDiv = document.getElementById('shocksScatterPlot');
        const reducedShocksPlotDiv = document.getElementById('reducedShocksScatterPlot');

        if (!shocksScatterPlotDiv || !reducedShocksPlotDiv) return;
        if (!epsilon_1t || !u_1t || epsilon_1t.length === 0) return;

        const traceEpsilon = this.getScatterTrace(epsilon_1t, epsilon_2t, this.COLORS.PRIMARY, 'ε₁: %{x:.3f}<br>ε₂: %{y:.3f}<extra></extra>');
        const layoutEpsilon = this.getStandardLayout('Structural Shocks (ε₁ vs ε₂)', 'ε₁', 'ε₂', shocksScatterPlotDiv);
        Plotly.newPlot(shocksScatterPlotDiv, [traceEpsilon], layoutEpsilon, { responsive: true, displayModeBar: false, displaylogo: false });

        const traceU = this.getScatterTrace(u_1t, u_2t, this.COLORS.ACCENT, 'u₁: %{x:.3f}<br>u₂: %{y:.3f}<extra></extra>');
        const layoutU = this.getStandardLayout('Reduced-Form Shocks (u₁ vs u₂)', 'u₁', 'u₂', reducedShocksPlotDiv);
        Plotly.newPlot(reducedShocksPlotDiv, [traceU], layoutU, { responsive: true, displayModeBar: false, displaylogo: false });
    },

    updateEstimationRestrictionPlots: function(plotData) {
        const {
            innovationsPlotId, e1Data, e2Data,
            correlationPlotId, correlationData, currentPhi, phiTrue
        } = plotData;

        const innovationsPlotDiv = document.getElementById(innovationsPlotId);
        const correlationPlotDiv = document.getElementById(correlationPlotId);

        if (!innovationsPlotDiv || !correlationPlotDiv) return;
        if (!e1Data || !correlationData || !correlationData.phis || correlationData.phis.length === 0) return;

        // 1. Innovations Scatter Plot
        const traceInnovations = this.getScatterTrace(e1Data, e2Data, this.COLORS.PRIMARY, 'ε̂₁: %{x:.3f}<br>ε̂₂: %{y:.3f}<extra></extra>');
        const layoutInnovations = this.getStandardLayout('Estimated Structural Shocks (ε̂)', 'ε̂₁', 'ε̂₂', innovationsPlotDiv);
        layoutInnovations.xaxis.range = [-4, 4];
        layoutInnovations.yaxis.range = [-4, 4];
        Plotly.newPlot(innovationsPlotDiv, [traceInnovations], layoutInnovations, { responsive: true, displayModeBar: false, displaylogo: false });

        // 2. Correlation Plot
        const traceCorrelation = {
            x: correlationData.phis, y: correlationData.corrs, mode: 'lines', type: 'scatter',
            name: 'Corr(ε̂₁, ε̂₂)', line: { color: this.COLORS.PRIMARY, width: 2 }
        };
        const layoutCorrelation = this.getStandardLayout('Correlation of Estimated Shocks vs. Rotation Angle φ', 'Rotation Angle φ', 'Corr(ε̂₁, ε̂₂)', correlationPlotDiv);
        
        // Set fixed y-axis range for correlation
        const yAxisRange = [-1, 1];

        layoutCorrelation.shapes = [
            { type: 'line', x0: currentPhi, x1: currentPhi, y0: yAxisRange[0], y1: yAxisRange[1], line: { color: this.COLORS.ACCENT, width: 2, dash: 'dash' } },
            { type: 'line', x0: phiTrue, x1: phiTrue, y0: yAxisRange[0], y1: yAxisRange[1], line: { color: this.COLORS.SPECIAL, width: 2, dash: 'dot' } }
        ];
        
        layoutCorrelation.annotations = [{
            x: phiTrue,
            y: 0,
            xref: 'x',
            yref: 'y',
            text: 'True φ',
            showarrow: true,
            arrowhead: 2,
            ax: -25,
            ay: -40,
            font: { color: this.COLORS.SPECIAL }
        }];

        layoutCorrelation.xaxis.range = [-Math.PI / 2, Math.PI / 2];
        layoutCorrelation.yaxis.range = yAxisRange;

        Plotly.newPlot(correlationPlotDiv, [traceCorrelation], layoutCorrelation, { responsive: true, displayModeBar: false, displaylogo: false });
    }
}; 